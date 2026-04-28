<script setup lang="ts">
import * as faceapi from '@vladmandic/face-api';
import { ref, onMounted, onUnmounted } from 'vue';

const videoRef = ref<HTMLVideoElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);

let detectionInterval: number | null = null;

const loadModels = async () => {
  try {
    const MODEL_URL = '/models';
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
    ]);
    console.log('Models loaded');
  } catch (err) {
    console.error('Error loading models:', err);
    error.value = 'Failed to load face detection models.';
  }
};

const isCameraStarted = ref(false);

const startVideo = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    if (videoRef.value) {
      videoRef.value.srcObject = stream;
      isCameraStarted.value = true;
      error.value = null;
    }
  } catch (err) {
    console.error('Error starting video:', err);
    error.value = 'Could not access camera. Please ensure you have granted permission in your browser settings.';
  }
};

const handleVideoPlay = () => {
  if (!videoRef.value || !canvasRef.value) return;

  // Use the actual displayed size of the video element
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

  // Re-sync dimensions if window resizes
  window.addEventListener('resize', () => {
    displaySize = updateDimensions();
  });

  detectionInterval = window.setInterval(async () => {
    if (!videoRef.value || !canvasRef.value || !isCameraStarted.value) return;

    // Ensure we use the latest dimensions
    if (videoRef.value.offsetWidth !== displaySize?.width) {
      displaySize = updateDimensions();
    }

    const detections = await faceapi
      .detectAllFaces(videoRef.value, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }))
      .withFaceLandmarks()
      .withFaceExpressions();

    const resizedDetections = faceapi.resizeResults(detections, displaySize!);
    
    const ctx = canvasRef.value.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
      
      if (detections.length > 0) {
        // Explicitly set drawing options for visibility
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
  if (detectionInterval) {
    clearInterval(detectionInterval);
  }
  if (videoRef.value && videoRef.value.srcObject) {
    const stream = videoRef.value.srcObject as MediaStream;
    stream.getTracks().forEach(track => track.stop());
  }
});
</script>

<template>
  <div class="face-detector-container">
    <div v-if="isLoading" class="status">Loading AI Models...</div>
    <div v-if="error" class="status error">{{ error }}</div>
    
    <div v-if="!isCameraStarted && !isLoading" class="controls">
      <button @click="startVideo" class="start-btn">Enable Camera</button>
      <p class="hint">Click to request camera permission</p>
    </div>

    <div class="video-wrapper" v-show="isCameraStarted">
      <video
        ref="videoRef"
        autoplay
        muted
        playsinline
        @play="handleVideoPlay"
      ></video>
      <canvas ref="canvasRef"></canvas>
    </div>
  </div>
</template>

<style scoped>
.face-detector-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
}

.status {
  padding: 1rem 2rem;
  background: #333;
  border-radius: 8px;
  color: #42b883;
  font-weight: bold;
}

.error {
  background: #4a1a1a;
  color: #ff6b6b;
  border: 1px solid #ff6b6b;
}

.controls {
  text-align: center;
  padding: 2rem;
}

.start-btn {
  background: #42b883;
  color: white;
  border: none;
  padding: 1rem 2rem;
  font-size: 1.2rem;
  font-weight: bold;
  border-radius: 50px;
  cursor: pointer;
  transition: transform 0.2s, background 0.2s;
  box-shadow: 0 4px 15px rgba(66, 184, 131, 0.4);
}

.start-btn:hover {
  background: #3aa675;
  transform: translateY(-2px);
}

.start-btn:active {
  transform: translateY(0);
}

.hint {
  margin-top: 1rem;
  color: #888;
  font-size: 0.9rem;
}

.video-wrapper {
  position: relative;
  display: inline-block;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  line-height: 0; /* Remove extra space below video */
}

video {
  width: 100%;
  max-width: 640px;
  height: auto;
  display: block;
}

canvas {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
}
</style>
