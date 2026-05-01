<template>
  <div class="verify-container">
    <div class="verify-card">
      <header class="verify-header">
        <div class="logo">
          <h1>LU<span class="accent">FACE</span></h1>
          <div class="badge">SECURE VERIFY</div>
        </div>
        <p v-if="!error">Biometric verification requested</p>
      </header>

      <div class="verify-content">
        <div v-if="loading && !faceCaptured" class="loading-overlay">
          <Loader2Icon class="spin" :size="32" />
          <p>Initializing Secure Link...</p>
        </div>

        <div v-else-if="error" class="error-state">
          <AlertCircleIcon :size="48" color="#ff4444" />
          <h3>VERIFICATION ERROR</h3>
          <p>{{ error }}</p>
          <button @click="goBack" class="btn-primary">RETURN TO APPLICATION</button>
        </div>

        <div v-else class="scanner-section">
          <div class="scanner-wrapper">
            <ClientOnly>
              <FaceDetector ref="detectorRef" show-guide @detected="handleDetection" />
            </ClientOnly>
            
            <div v-if="verifying" class="verifying-overlay">
              <Loader2Icon class="spin" :size="40" />
              <p>ANALYZING BIOMETRICS...</p>
            </div>

            <div v-if="success" class="success-overlay">
              <CheckCircleIcon :size="64" class="accent" />
              <h3>IDENTITY VERIFIED</h3>
              <p>Redirecting back to app...</p>
            </div>
          </div>
          
          <div class="scanner-footer">
            <ScanFaceIcon :size="16" />
            <span>Position your face within the frame</span>
          </div>
        </div>
      </div>

      <footer class="verify-footer">
        <ShieldCheckIcon :size="14" />
        <span>Powered by Luface Neural Engine</span>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { 
  Loader2 as Loader2Icon, 
  AlertCircle as AlertCircleIcon,
  CheckCircle as CheckCircleIcon,
  ScanFace as ScanFaceIcon,
  ShieldCheck as ShieldCheckIcon
} from 'lucide-vue-next';
import { toast } from 'vue-sonner';

const route = useRoute();
const apiKey = route.query.api_key;
const redirectUrl = route.query.redirect_url;
const email = route.query.email;

const loading = ref(true);
const verifying = ref(false);
const error = ref('');
const success = ref(false);
const faceCaptured = ref(false);
const detectorRef = ref(null);

onMounted(() => {
  if (!apiKey || !redirectUrl) {
    error.value = 'Invalid verification request. Missing API Key or Redirect URL.';
    loading.value = false;
    return;
  }
  
  // Simulate some initial check if needed, otherwise just start
  loading.value = false;
});

const handleDetection = async (data) => {
  if (data && data.descriptor && !verifying.value && !success.value) {
    verifying.value = true;
    try {
      const result = await $fetch('/api/v1/verify-session', {
        method: 'POST',
        body: {
          apiKey,
          email,
          faceDescriptor: data.descriptor
        }
      });

      if (result.success) {
        success.value = true;
        if (detectorRef.value) detectorRef.value.stopCamera();
        
        toast.success('Identity Confirmed');
        
        // Redirect back after a short delay
        setTimeout(() => {
          const url = new URL(redirectUrl);
          url.searchParams.append('status', 'success');
          url.searchParams.append('username', result.username);
          url.searchParams.append('ts', result.timestamp);
          window.location.href = url.toString();
        }, 2000);
      } else {
        toast.error('Identity not recognized');
        if (detectorRef.value) detectorRef.value.resetSampling();
      }
    } catch (err) {
      toast.error('Verification failed');
      if (detectorRef.value) detectorRef.value.resetSampling();
    } finally {
      verifying.value = false;
    }
  }
};

const goBack = () => {
  if (redirectUrl) {
    const url = new URL(redirectUrl);
    url.searchParams.append('status', 'error');
    url.searchParams.append('message', error.value || 'Verification failed');
    window.location.href = url.toString();
  } else {
    window.history.back();
  }
};
</script>

<style scoped>
.verify-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-app);
  padding: 1rem;
}

.verify-card {
  width: 100%;
  max-width: 480px;
  background: var(--card-black);
  border: 1px solid var(--border-color);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 40px 100px var(--shadow-color);
}

@media (max-width: 480px) {
  .verify-card {
    border-radius: 0;
    border: none;
    box-shadow: none;
    background: transparent;
  }
  .verify-container {
    padding: 0;
    align-items: flex-start;
  }
  .verify-header {
    padding: 3rem 1.5rem 1.5rem;
  }
  .verify-content {
    padding: 1.5rem;
  }
  .scanner-wrapper {
    aspect-ratio: auto;
    min-height: 300px;
  }
}

.verify-header {
  padding: 2rem;
  text-align: center;
  border-bottom: 1px solid var(--border-dim);
}

.logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.logo h1 {
  margin: 0;
  font-size: 1.5rem;
  letter-spacing: 0.1em;
}

.badge {
  background: var(--accent-green);
  color: var(--bg-black);
  font-size: 0.6rem;
  font-weight: 900;
  padding: 2px 8px;
  border-radius: 4px;
  letter-spacing: 0.05em;
}

.verify-header p {
  color: var(--text-dim);
  font-size: 0.8rem;
  margin: 0;
}

.verify-content {
  padding: 2rem;
  min-height: 350px;
  display: flex;
  flex-direction: column;
}

.loading-overlay, .error-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 1.5rem;
}

.error-state h3 {
  margin: 0;
  color: #ff4444;
}

.scanner-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.scanner-wrapper {
  width: 100%;
  aspect-ratio: 1;
  background: #000;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  position: relative;
}

.verifying-overlay, .success-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.8);
  backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  z-index: 10;
}

.success-overlay h3 {
  color: var(--accent-green);
  margin: 0;
}

.scanner-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--text-dim);
  font-size: 0.75rem;
}

.verify-footer {
  padding: 1.5rem;
  background: rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--text-dim);
  font-size: 0.65rem;
  font-weight: 600;
}

.btn-primary {
  background: var(--accent-green);
  color: var(--bg-black);
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-weight: 800;
  cursor: pointer;
}

.spin { animation: spin 1s linear infinite; }
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
