<script setup lang="ts">
import * as faceapi from '@vladmandic/face-api';
import { ref, onMounted, onUnmounted } from 'vue';
import { 
  AlertTriangle as AlertTriangleIcon, 
  Camera as CameraIcon, 
  Scan as ScanIcon,
  Loader2 as Loader2Icon,
  XCircle as XCircleIcon
} from 'lucide-vue-next';

const props = defineProps({
  minimal: {
    type: Boolean,
    default: false
  }
});

const videoRef = ref<HTMLVideoElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);
const isCameraStarted = ref(false);
const isErrorState = ref(false);

const emit = defineEmits(['detected']);

const loadModels = async () => {
  try {
    const MODEL_URL = window.location.origin + '/models';
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
    
    if (!props.minimal) {
      await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
      await faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL);
    }
  } catch (err: any) {
    console.error('Error loading models:', err);
    error.value = 'Neural Engine initialization failed.';
  }
};

const startVideo = async () => {
  try {
    isErrorState.value = false;
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: 'user',
        width: { ideal: 640 }, 
        height: { ideal: 480 }
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

const triggerError = () => {
  isErrorState.value = true;
  // Keep the last frame visible for a moment but stop processing
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

  const detect = async () => {
    if (!videoRef.value || !canvasRef.value || !isCameraStarted.value || isDetecting || isErrorState.value) {
      requestAnimationFrame(detect);
      return;
    }

    isDetecting = true;
    frameCount++;

    try {
      if (videoRef.value.offsetWidth !== displaySize?.width) {
        displaySize = updateDimensions();
      }

      const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 160, scoreThreshold: 0.5 });
      let task: any = faceapi.detectSingleFace(videoRef.value, options).withFaceLandmarks().withFaceDescriptor();

      if (!props.minimal) {
        task = task.withFaceExpressions().withAgeAndGender();
      }

      const detection = await task;

      if (detection) {
        const resizedDetection = faceapi.resizeResults(detection, displaySize!);
        const ctx = canvasRef.value.getContext('2d', { alpha: true });

        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
          faceapi.draw.drawFaceLandmarks(canvasRef.value, resizedDetection);
          
          if (!props.minimal) {
            faceapi.draw.drawDetections(canvasRef.value, resizedDetection);
            faceapi.draw.drawFaceExpressions(canvasRef.value, resizedDetection);
          }

          if (detection.descriptor) {
            const payload: any = { descriptor: Array.from(detection.descriptor) };
            if (!props.minimal && (detection as any).age) {
              payload.age = Math.round((detection as any).age);
              payload.gender = (detection as any).gender;
              payload.expression = Object.entries((detection as any).expressions).reduce((a: any, b: any) => a[1] > b[1] ? a : b)[0];
            }
            emit('detected', payload);
          }
        }
      } else {
        if (frameCount % 10 === 0) emit('detected', null);
        canvasRef.value.getContext('2d')?.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
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

const stopCamera = () => {
  if (videoRef.value && videoRef.value.srcObject) {
    const stream = videoRef.value.srcObject as MediaStream;
    stream.getTracks().forEach(track => track.stop());
    videoRef.value.srcObject = null;
    isCameraStarted.value = false;
  }
};

defineExpose({ stopCamera, triggerError });
onUnmounted(() => stopCamera());
</script>

<template>
  <div class="face-detector-container" :class="{ 'is-error': isErrorState }">
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
      <div class="corner tl"></div>
      <div class="corner tr"></div>
      <div class="corner bl"></div>
      <div class="corner br"></div>

      <video ref="videoRef" autoplay muted playsinline @play="handleVideoPlay"></video>
      <canvas ref="canvasRef"></canvas>
      
      <div class="scanning-line" v-if="!isErrorState"></div>
      
      <div v-if="isErrorState" class="error-overlay">
        <XCircleIcon :size="48" color="#ff4444" />
        <p>ACCESS DENIED</p>
        <span class="sub">IDENTITY MISMATCH</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
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

.is-error .corner { border-color: #ff4444; }

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

.error-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 20;
  backdrop-filter: saturate(0.5);
  animation: blink 0.5s step-end 2;
}

@keyframes blink {
  50% { background: rgba(255, 0, 0, 0.3); }
}

.error-overlay p {
  color: #ff4444;
  font-weight: 900;
  letter-spacing: 0.3em;
  font-size: 1.2rem;
  margin: 1rem 0 0.2rem;
}

.error-overlay .sub {
  color: #ff4444;
  font-size: 0.6rem;
  letter-spacing: 0.1em;
  font-weight: 700;
  opacity: 0.8;
}

.spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.accent { color: var(--accent-green); }
.hint { color: #444; font-size: 0.6rem; letter-spacing: 0.1em; }
</style>