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
    
    // Core models always needed
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
    
    if (props.minimal) {
      // Light model for Login (High FPS)
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    } else {
      // Heavy models for Registration (High Accuracy)
      await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
      await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
      await faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL);
    }
    
    console.log(`Neural Engine: ${props.minimal ? 'Performance Mode' : 'Precision Mode'}`);
  } catch (err: any) {
    console.error('Error loading models:', err);
    error.value = 'Neural Engine initialization failed.';
  }
};

const startVideo = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: 'user',
        width: { ideal: 640 }, // Lower resolution for better performance on mobile
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
    if (!videoRef.value || !canvasRef.value || !isCameraStarted.value || isDetecting) {
      requestAnimationFrame(detect);
      return;
    }

    isDetecting = true;
    frameCount++;

    try {
      if (videoRef.value.offsetWidth !== displaySize?.width) {
        displaySize = updateDimensions();
      }

      // Optimization: use the lightweight detector for login
      const options = props.minimal 
        ? new faceapi.TinyFaceDetectorOptions({ inputSize: 160, scoreThreshold: 0.5 })
        : new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 });

      let task: any = faceapi.detectSingleFace(videoRef.value, options)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!props.minimal) {
        task = task.withFaceExpressions().withAgeAndGender();
      }

      const detection = await task;

      if (detection) {
        const resizedDetection = faceapi.resizeResults(detection, displaySize!);
        const ctx = canvasRef.value.getContext('2d', { alpha: true });

        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
          
          // The "Wire"
          faceapi.draw.drawFaceLandmarks(canvasRef.value, resizedDetection);
          
          if (!props.minimal) {
            faceapi.draw.drawDetections(canvasRef.value, resizedDetection);
            faceapi.draw.drawFaceExpressions(canvasRef.value, resizedDetection);
          }

          if (detection.descriptor) {
            const payload: any = { descriptor: Array.from(detection.descriptor) };
            if (!props.minimal) {
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

defineExpose({ stopCamera });
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
      <video ref="videoRef" autoplay muted playsinline @play="handleVideoPlay"></video>
      <canvas ref="canvasRef"></canvas>
      <div class="scanning-line"></div>
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
  font-size: 0.75rem;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 90%;
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

.scanning-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--accent-green);
  box-shadow: 0 0 15px var(--accent-green);
  animation: scan 3s linear infinite;
}

@keyframes scan {
  0% { top: 0%; }
  100% { top: 100%; }
}

.spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.accent { color: var(--accent-green); }
.hint { color: #444; font-size: 0.6rem; letter-spacing: 0.1em; }
</style>