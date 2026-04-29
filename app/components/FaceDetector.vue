<script setup lang="ts">
import * as faceapi from '@vladmandic/face-api';
import { ref, onMounted, onUnmounted, computed } from 'vue';
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
  }
});

const videoRef = ref<HTMLVideoElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);
const isCameraStarted = ref(false);

const emit = defineEmits(['detected']);

const loadModels = async () => {
  try {
    const MODEL_URL = window.location.origin + '/models';
    console.log('Attempting to load models from:', MODEL_URL);
    
    await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
    
    if (!props.minimal) {
      await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
      await faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL);
    }
    
    console.log(`Neural Engine initialized (Mode: ${props.minimal ? 'Minimal' : 'Full'})`);
  } catch (err: any) {
    console.error('Error loading models:', err);
    error.value = `Neural Engine Error: ${err.message || 'Check network connection'}`;
  }
};

const startVideo = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: 'user',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      } 
    });
    if (videoRef.value) {
      videoRef.value.srcObject = stream;
      isCameraStarted.value = true;
      error.value = null;
    }
  } catch (err) {
    console.error('Error starting video:', err);
    error.value = 'Biometric sensor access denied.';
  }
};

const handleVideoPlay = () => {
  if (!videoRef.value || !canvasRef.value) return;

  const updateDimensions = () => {
    if (!videoRef.value || !canvasRef.value) return;
    
    // Use offsetDimensions of the video element for landmark mapping
    const displaySize = {
      width: videoRef.value.offsetWidth,
      height: videoRef.value.offsetHeight,
    };
    
    faceapi.matchDimensions(canvasRef.value, displaySize);
    return displaySize;
  };

  let isDetecting = false;
  let frameCount = 0;
  let displaySize = updateDimensions();

  const detect = async () => {
    if (!videoRef.value || !canvasRef.value || !isCameraStarted.value || isDetecting) {
      requestAnimationFrame(detect);
      return;
    }

    isDetecting = true;
    frameCount++;

    try {
      // Re-calculate if size changed (e.g. rotation)
      if (videoRef.value.offsetWidth !== displaySize?.width) {
        displaySize = updateDimensions();
      }

      let task: any = faceapi.detectSingleFace(
        videoRef.value,
        new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 })
      ).withFaceLandmarks().withFaceDescriptor();

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
            const payload: any = {
              descriptor: Array.from(detection.descriptor)
            };

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
        const ctx = canvasRef.value.getContext('2d');
        ctx?.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
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

defineExpose({ stopCamera });

onUnmounted(() => {
  stopCamera();
});
</script>

<template>
  <div class="face-detector-container">
    <div v-if="error" class="error-toast">
      <AlertTriangleIcon :size="18" />
      <span>{{ error }}</span>
    </div>
    
    <div v-if="isLoading" class="setup-screen">
      <Loader2Icon class="spin accent" :size="48" />
      <p class="hint">LOADING NEURAL ENGINE...</p>
    </div>

    <div v-else-if="!isCameraStarted" class="setup-screen">
      <div class="scanner-rings">
        <div class="ring"></div>
        <div class="ring"></div>
        <div class="center-icon">
          <CameraIcon :size="32" class="accent" />
        </div>
      </div>
      <button @click="startVideo" class="start-btn">
        <ScanIcon :size="18" />
        <span>INITIALIZE SCANNER</span>
      </button>
      <p class="hint">Biometric authentication required</p>
    </div>

    <div class="video-container" v-show="isCameraStarted">
      <div class="corner tl"></div>
      <div class="corner tr"></div>
      <div class="corner bl"></div>
      <div class="corner br"></div>
      
      <video
        ref="videoRef"
        autoplay
        muted
        playsinline
        @play="handleVideoPlay"
      ></video>
      <canvas ref="canvasRef"></canvas>
      
      <div class="scanning-line" v-if="isCameraStarted"></div>
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

.error-toast {
  position: absolute;
  top: 1rem;
  background: #ff0044;
  color: white;
  padding: 0.8rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.75rem;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 10px;
  animation: slideDown 0.3s ease;
  width: 90%;
  box-sizing: border-box;
}

@keyframes slideDown {
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.setup-screen {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
}

.scanner-rings {
  position: relative;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.center-icon {
  z-index: 2;
  opacity: 0.8;
}

.ring {
  position: absolute;
  inset: 0;
  border: 2px solid var(--accent-green);
  opacity: 0.2;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.ring:nth-child(2) {
  animation-delay: 1s;
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
  letter-spacing: 0.15em;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 10px;
}

.start-btn:hover {
  background: var(--accent-green);
  color: #000;
  box-shadow: 0 0 30px rgba(0, 255, 136, 0.4);
}

.hint {
  color: #444;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0;
}

.video-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
}

.corner {
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid var(--accent-green);
  z-index: 10;
}

.tl { top: 10px; left: 10px; border-right: none; border-bottom: none; }
.tr { top: 10px; right: 10px; border-left: none; border-bottom: none; }
.bl { bottom: 10px; left: 10px; border-right: none; border-top: none; }
.br { bottom: 10px; right: 10px; border-left: none; border-top: none; }

video {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Use cover to fill the square/circle portal */
  transform: scaleX(-1);
}

canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: scaleX(-1);
  pointer-events: none;
}

.scanning-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--accent-green), transparent);
  animation: scan 3s linear infinite;
  z-index: 5;
  box-shadow: 0 0 15px var(--accent-green);
}

@keyframes scan {
  0% { top: 0%; }
  100% { top: 100%; }
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.accent { color: var(--accent-green); }
</style>