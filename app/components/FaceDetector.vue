<script setup lang="ts">
import * as faceapi from '@vladmandic/face-api';
import { ref, onMounted, onUnmounted } from 'vue';
import { 
  AlertTriangle as AlertTriangleIcon, 
  Camera as CameraIcon, 
  Scan as ScanIcon,
  Loader2 as Loader2Icon
} from 'lucide-vue-next';

const props = defineProps({
  minimal: {
    type: Boolean,
    default: false
  },
  showGuide: {
    type: Boolean,
    default: false
  }
});

const videoRef = ref<HTMLVideoElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);
const isCameraStarted = ref(false);
const faceDetected = ref(false);
const faceTooFar = ref(false);

const emit = defineEmits(['detected', 'sampling-progress']);

const isSampling = ref(false);
const samples = ref<number[][]>([]);
const REQUIRED_SAMPLES = 12;

const averageDescriptors = (descriptors: number[][]) => {
  if (descriptors.length === 0) return null;
  const length = descriptors[0].length;
  const avg = new Array(length).fill(0);
  for (const d of descriptors) {
    for (let i = 0; i < length; i++) {
      avg[i] += d[i];
    }
  }
  return avg.map(v => v / descriptors.length);
};

const loadModels = async () => {
  try {
    // Skip if already loaded
    if (faceapi.nets.ssdMobilenetv1.params) {
      isLoading.value = false;
      return;
    }

    const MODEL_URL = window.location.origin + '/models';
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    ]);
    
    if (!props.minimal) {
      await Promise.all([
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL)
      ]);
    }
  } catch (err: any) {
    console.error('Error loading models:', err);
    error.value = 'Luface Engine initialization failed.';
  }
};

const startVideo = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: 'user',
        width: { ideal: 480 }, 
        height: { ideal: 360 }
      } 
    });
    if (videoRef.value) {
      videoRef.value.srcObject = stream;
      isCameraStarted.value = true;
      error.value = null;
    }
  } catch (err) {
    error.value = 'Camera access denied.';
  }
};

const handleVideoPlay = () => {
  if (!videoRef.value || !canvasRef.value) return;

  const updateDimensions = () => {
    if (!videoRef.value || !canvasRef.value) return;
    const size = { width: videoRef.value.offsetWidth, height: videoRef.value.offsetHeight };
    faceapi.matchDimensions(canvasRef.value, size);
    return size;
  };

  let isDetecting = false;
  let frameCount = 0;
  let displaySize = updateDimensions();
  let lastDetectionTime = 0;
  let lastSampleTime = 0;
  const DETECTION_THROTTLE = 100; // ms
  const SAMPLE_THROTTLE = 200; // ms

  const detect = async () => {
    if (!videoRef.value || !canvasRef.value || !isCameraStarted.value || isDetecting) {
      requestAnimationFrame(detect);
      return;
    }

    const now = Date.now();
    if (now - lastDetectionTime < DETECTION_THROTTLE) {
      requestAnimationFrame(detect);
      return;
    }

    isDetecting = true;
    lastDetectionTime = now;
    frameCount++;

    try {
      if (videoRef.value.offsetWidth !== displaySize?.width) {
        displaySize = updateDimensions();
      }

      const options = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 });
      let task: any = faceapi.detectSingleFace(videoRef.value, options).withFaceLandmarks().withFaceDescriptor();

      if (!props.minimal) {
        task = task.withFaceExpressions().withAgeAndGender();
      }

      const detection = await task;
      const ctx = canvasRef.value.getContext('2d', { alpha: true });
      if (ctx) ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);

      if (detection) {
        faceDetected.value = true;

        // Draw landmarks for "pro" look
        const resizedDetection = faceapi.resizeResults(detection, displaySize!);
        if (ctx) {
          ctx.fillStyle = 'rgba(0, 255, 136, 0.5)';
          resizedDetection.landmarks.positions.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 1, 0, 2 * Math.PI);
            ctx.fill();
          });
        }

        const box = detection.detection.box;
        const faceArea = box.width * box.height;
        const frameArea = displaySize!.width * displaySize!.height;
        const coverage = faceArea / frameArea;

        if (coverage < 0.1) {
          faceTooFar.value = true;
          if (frameCount % 10 === 0) emit('detected', null);
          return;
        }
        faceTooFar.value = false;

        if (detection.descriptor) {
          if (!isSampling.value && samples.value.length < REQUIRED_SAMPLES) {
            isSampling.value = true;
          }

          if (isSampling.value) {
            const now = Date.now();
            if (now - lastSampleTime >= SAMPLE_THROTTLE) {
              samples.value.push(Array.from(detection.descriptor));
              lastSampleTime = now;
              emit('sampling-progress', (samples.value.length / REQUIRED_SAMPLES) * 100);

              if (samples.value.length >= REQUIRED_SAMPLES) {
                isSampling.value = false;
                
                // We send multiple samples to server for multi-point matching
                // AND capture a high-quality frame for CompreFace
                const canvas = document.createElement('canvas');
                if (videoRef.value) {
                  canvas.width = videoRef.value.videoWidth;
                  canvas.height = videoRef.value.videoHeight;
                  const ctx = canvas.getContext('2d');
                  if (ctx) {
                    // Mirror if needed (video is mirrored in UI)
                    ctx.translate(canvas.width, 0);
                    ctx.scale(-1, 1);
                    ctx.drawImage(videoRef.value, 0, 0);
                  }
                }

                const payload: any = { 
                  descriptor: samples.value,
                  image: canvas.toDataURL('image/jpeg', 0.9),
                  isFinal: true
                };

                if (!props.minimal && (detection as any).age) {
                  payload.age = Math.round((detection as any).age);
                  payload.gender = (detection as any).gender;
                  payload.expression = Object.entries((detection as any).expressions).reduce((a: any, b: any) => a[1] > b[1] ? a : b)[0];
                }
                emit('detected', payload);
              }
            }
          } else if (samples.value.length === 0) {
            const payload: any = { descriptor: [Array.from(detection.descriptor)] };
            emit('detected', payload);
          }
        }
      } else {
        faceDetected.value = false;
        faceTooFar.value = false;
        if (frameCount % 10 === 0) emit('detected', null);
      }
    } catch (err) {
      console.error('Detection error:', err);
    } finally {
      isDetecting = false;
      requestAnimationFrame(detect);
    }
  };

  detect();
};

onMounted(async () => {
  await loadModels();
  isLoading.value = false;
});

const resetSampling = () => {
  samples.value = [];
  isSampling.value = false;
  faceDetected.value = false;
  faceTooFar.value = false;
  emit('sampling-progress', 0);
};

const stopCamera = () => {
  if (videoRef.value && videoRef.value.srcObject) {
    const stream = videoRef.value.srcObject as MediaStream;
    stream.getTracks().forEach(track => track.stop());
    videoRef.value.srcObject = null;
  }
  isCameraStarted.value = false;
  resetSampling();
};

defineExpose({ stopCamera, resetSampling, startVideo });
onUnmounted(() => stopCamera());
</script>

<template>
  <div class="face-detector-container">
    <div v-if="error" class="error-toast">
      <AlertTriangleIcon :size="18" />
      <span>{{ error }}</span>
    </div>
    
    <div v-if="isLoading" class="setup-screen">
      <Loader2Icon class="spin accent" :size="48" />
      <p class="hint">INITIALIZING AI...</p>
    </div>

    <div v-else-if="!isCameraStarted" class="setup-screen">
      <div class="scanner-rings">
        <div class="ring"></div>
        <div class="ring"></div>
        <div class="center-icon"><CameraIcon :size="32" class="accent" /></div>
      </div>
      <button @click="startVideo" class="start-btn">
        <ScanIcon :size="18" />
        <span>START SCANNER</span>
      </button>
    </div>

    <div class="video-container" v-show="isCameraStarted">
      <!-- High-Tech Corners -->
      <div class="corner tl"></div>
      <div class="corner tr"></div>
      <div class="corner bl"></div>
      <div class="corner br"></div>

      <!-- Alignment Guide Oval -->
      <div v-if="showGuide" class="face-guide">
        <div class="guide-oval"></div>
        <div class="guide-text">ALIGN FACE WITHIN PORTAL</div>
      </div>

      <div v-if="isCameraStarted" class="detection-status">
        <div v-if="!faceDetected && !isSampling" class="status-badge warning">
          FACE NOT DETECTED
        </div>
        <div v-else-if="faceTooFar" class="status-badge info">
          MOVE CLOSER
        </div>
      </div>

      <video ref="videoRef" autoplay muted playsinline @play="handleVideoPlay"></video>
      <canvas ref="canvasRef"></canvas>
      
      <!-- Sampling Progress Overlay -->
      <div v-if="isSampling" class="sampling-overlay">
        <div class="progress-ring">
          <svg viewBox="0 0 100 100">
            <circle class="bg" cx="50" cy="50" r="45"></circle>
            <circle class="fg" cx="50" cy="50" r="45" :style="{ strokeDashoffset: 283 - (283 * samples.length / REQUIRED_SAMPLES) }"></circle>
          </svg>
          <div class="sample-count">{{ samples.length }}/{{ REQUIRED_SAMPLES }}</div>
        </div>
        <div class="sampling-text">ANALYZING FACIAL GEOMETRY...</div>
      </div>

      <div class="scanning-line"></div>
    </div>
  </div>
</template>

<style scoped>
.sampling-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  z-index: 10;
  pointer-events: none;
}

.progress-ring {
  position: relative;
  width: 120px;
  height: 120px;
}

.progress-ring svg {
  transform: rotate(-90deg);
}

.progress-ring circle {
  fill: none;
  stroke-width: 4;
}

.progress-ring circle.bg {
  stroke: rgba(255, 255, 255, 0.1);
}

.progress-ring circle.fg {
  stroke: var(--accent-green);
  stroke-dasharray: 283;
  transition: stroke-dashoffset 0.3s ease;
  filter: drop-shadow(0 0 5px var(--accent-green));
}

.sample-count {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--accent-green);
}

.sampling-text {
  margin-top: 1rem;
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  color: var(--accent-green);
  text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
}

.detection-status {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.3s ease-out;
}

.status-badge.warning {
  background: rgba(255, 68, 68, 0.2);
  color: #ff4444;
  border: 1px solid rgba(255, 68, 68, 0.3);
}

.status-badge.info {
  background: rgba(0, 255, 136, 0.1);
  color: var(--accent-green);
  border: 1px solid rgba(0, 255, 136, 0.2);
}

.status-badge.success {
  background: rgba(0, 255, 136, 0.2);
  color: var(--accent-green);
  border: 1px solid var(--accent-green);
  box-shadow: 0 0 15px rgba(0, 255, 136, 0.3);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.face-detector-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  background: #000;
  overflow: hidden;
}

.setup-screen {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.scanner-rings {
  position: relative;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ring {
  position: absolute;
  inset: 0;
  border: 2px solid var(--accent-green);
  opacity: 0.2;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.8); opacity: 0.5; }
  100% { transform: scale(1.5); opacity: 0; }
}

.start-btn {
  background: transparent;
  color: var(--accent-green);
  border: 1px solid var(--accent-green);
  padding: 0.8rem 1.5rem;
  font-size: 0.8rem;
  font-weight: 800;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
}

.video-container {
  position: relative;
  width: 100%;
  height: 100%;
}

video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1);
}

canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: scaleX(-1);
  z-index: 2;
}

/* Face Guide Styles */
.face-guide {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 5;
  pointer-events: none;
}

.guide-oval {
  width: 60%;
  height: 70%;
  border: 2px dashed rgba(var(--accent-green-rgb), 0.4);
  border-radius: 50% / 45%;
  position: relative;
  box-shadow: 0 0 0 1000px rgba(0, 0, 0, 0.4);
  transition: all 0.3s ease;
}

.guide-text {
  margin-top: 1rem;
  color: var(--accent-green);
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.15em;
  text-shadow: 0 0 10px rgba(var(--accent-green-rgb), 0.5);
}

.corner {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid var(--accent-green);
  z-index: 10;
  transition: border-color 0.3s;
}

.tl { top: 15px; left: 15px; border-right: none; border-bottom: none; }
.tr { top: 15px; right: 15px; border-left: none; border-bottom: none; }
.bl { bottom: 15px; left: 15px; border-right: none; border-top: none; }
.br { bottom: 15px; right: 15px; border-left: none; border-top: none; }

.scanning-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--accent-green);
  box-shadow: 0 0 15px var(--accent-green);
  animation: scan 3s linear infinite;
  z-index: 5;
}

@keyframes scan {
  0% { top: 0%; }
  100% { top: 100%; }
}

.spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.accent { color: var(--accent-green); }
.hint { color: var(--text-dim); font-size: 0.6rem; letter-spacing: 0.1em; }
</style>