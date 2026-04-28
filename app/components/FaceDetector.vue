<script setup lang="ts">
import * as faceapi from '@vladmandic/face-api';
import { ref, onMounted, onUnmounted } from 'vue';

const videoRef = ref<HTMLVideoElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);
const isCameraStarted = ref(false);

let detectionInterval: number | null = null;

const emit = defineEmits(['detected']);

const loadModels = async () => {
  try {
    const MODEL_URL = window.location.origin + '/models';
    console.log('Attempting to load models from:', MODEL_URL);
    
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
    await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
    await faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL);
    
    console.log('All models loaded successfully');
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
    error.value = 'Biometric sensor access denied. Check permissions.';
  }
};

const handleVideoPlay = () => {
  if (!videoRef.value || !canvasRef.value) return;

  const updateDimensions = () => {
    if (!videoRef.value || !canvasRef.value) return;
    const displaySize = {
      width: videoRef.value.offsetWidth,
      height: videoRef.value.offsetHeight,
    };
    faceapi.matchDimensions(canvasRef.value, displaySize);
    return displaySize;
  };

  let displaySize = updateDimensions();
  window.addEventListener('resize', () => { displaySize = updateDimensions(); });

  detectionInterval = window.setInterval(async () => {
    if (!videoRef.value || !canvasRef.value || !isCameraStarted.value) return;

    if (videoRef.value.offsetWidth !== displaySize?.width) {
      displaySize = updateDimensions();
    }

    const detections = await faceapi
      .detectAllFaces(videoRef.value, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }))
      .withFaceLandmarks()
      .withFaceExpressions()
      .withAgeAndGender();

    const resizedDetections = faceapi.resizeResults(detections, displaySize!);
    
    // Emit the most prominent face data to parent
    if (detections.length > 0) {
      const best = detections[0];
      const expression = Object.entries(best.expressions).reduce((a, b) => a[1] > b[1] ? a : b)[0];
      emit('detected', {
        age: Math.round(best.age),
        gender: best.gender,
        genderProbability: Math.round(best.genderProbability * 100),
        expression: expression
      });
    } else {
      emit('detected', null);
    }
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
      
      if (detections.length > 0) {
        // Custom drawing colors for dark theme
        faceapi.draw.drawDetections(canvasRef.value, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvasRef.value, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvasRef.value, resizedDetections);
      }
    }
  }, 100);
};

onMounted(async () => {
  await loadModels();
  isLoading.value = false;
});

onUnmounted(() => {
  if (detectionInterval) clearInterval(detectionInterval);
  if (videoRef.value && videoRef.value.srcObject) {
    const stream = videoRef.value.srcObject as MediaStream;
    stream.getTracks().forEach(track => track.stop());
  }
});
</script>

<template>
  <div class="face-detector-container">
    <div v-if="error" class="error-toast">
      <span class="warning-icon">⚠</span>
      {{ error }}
    </div>
    
    <div v-if="!isCameraStarted && !isLoading" class="setup-screen">
      <div class="scanner-rings">
        <div class="ring"></div>
        <div class="ring"></div>
      </div>
      <button @click="startVideo" class="start-btn">
        INITIALIZE SCANNER
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
}

.error-toast {
  position: absolute;
  top: 1rem;
  background: #ff0044;
  color: white;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.8rem;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 10px;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.setup-screen {
  text-align: center;
}

.scanner-rings {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 2rem;
}

.ring {
  position: absolute;
  inset: 0;
  border: 2px solid #00ff8833;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.ring:nth-child(2) {
  animation-delay: 1s;
}

@keyframes pulse {
  0% { transform: scale(0.8); opacity: 0.8; }
  100% { transform: scale(1.5); opacity: 0; }
}

.start-btn {
  background: transparent;
  color: #00ff88;
  border: 1px solid #00ff88;
  padding: 1rem 2.5rem;
  font-size: 0.9rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.start-btn:hover {
  background: #00ff88;
  color: #000;
  box-shadow: 0 0 30px #00ff8866;
}

.hint {
  color: #444;
  font-size: 0.7rem;
  margin-top: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.video-container {
  position: relative;
  width: 100%;
  max-width: 640px;
  line-height: 0;
}

.corner {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid #00ff88;
  z-index: 5;
}

.tl { top: -10px; left: -10px; border-right: none; border-bottom: none; }
.tr { top: -10px; right: -10px; border-left: none; border-bottom: none; }
.bl { bottom: -10px; left: -10px; border-right: none; border-top: none; }
.br { bottom: -10px; right: -10px; border-left: none; border-top: none; }

video {
  width: 100%;
  border-radius: 4px;
  filter: grayscale(0.2) contrast(1.1);
}

canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.scanning-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00ff88, transparent);
  animation: scan 3s linear infinite;
  z-index: 4;
  box-shadow: 0 0 15px #00ff88;
}

@keyframes scan {
  0% { top: 0%; }
  100% { top: 100%; }
}
</style>
