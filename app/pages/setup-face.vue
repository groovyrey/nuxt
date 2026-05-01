<template>
  <div class="setup-container">
    <div class="setup-card">
      <header class="setup-header">
        <div class="logo">
          <h1>LU<span class="accent">FACE</span></h1>
          <div class="badge">BIOMETRIC SETUP</div>
        </div>
        <p>Registering face for: <span class="username">{{ identifier }}</span></p>
      </header>

      <div class="setup-content">
        <div v-if="error" class="error-state">
          <AlertCircleIcon :size="48" color="#ff4444" />
          <h3>SETUP ERROR</h3>
          <p>{{ error }}</p>
          <button @click="goBack" class="btn-primary">RETURN TO APP</button>
        </div>

        <div v-else class="scanner-section">
          <div class="scanner-wrapper">
            <ClientOnly>
              <FaceDetector ref="detectorRef" show-guide @detected="handleDetection" />
            </ClientOnly>
            
            <div v-if="registering" class="registering-overlay">
              <Loader2Icon class="spin" :size="40" />
              <p>ENCRYPTING BIOMETRICS...</p>
            </div>

            <div v-if="success" class="success-overlay">
              <CheckCircleIcon :size="64" class="accent" />
              <h3>FACE REGISTERED</h3>
              <p>Redirecting back...</p>
            </div>
          </div>
          
          <div class="scanner-footer">
            <ScanFaceIcon :size="16" />
            <span>Center your face and look at the camera</span>
          </div>
        </div>
      </div>

      <footer class="setup-footer">
        <ShieldCheckIcon :size="14" />
        <span>Secure Biometric Enrollment</span>
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
const identifier = route.query.username || email;

const registering = ref(false);
const error = ref('');
const success = ref(false);
const detectorRef = ref(null);

onMounted(() => {
  if (!apiKey || !redirectUrl || !email) {
    error.value = 'Invalid request. Missing API Key, Email, or Redirect URL.';
    return;
  }
});

const handleDetection = async (data) => {
  if (data && data.descriptor && data.isFinal && !registering.value && !success.value) {
    registering.value = true;
    try {
      // Use the streamlined V1 API to register the face
      await $fetch('/api/v1/register', {
        method: 'POST',
        headers: { 'X-API-Key': apiKey },
        body: {
          email: email,
          faceDescriptor: data.descriptor
        }
      });

      success.value = true;
      if (detectorRef.value) detectorRef.value.stopCamera();
      toast.success('Biometrics Enrolled');
      
      setTimeout(() => {
        const url = new URL(redirectUrl);
        url.searchParams.append('status', 'success');
        window.location.href = url.toString();
      }, 2000);
    } catch (err) {
      console.error('Registration error:', err);
      const msg = err.data?.statusMessage || 'Registration failed';
      error.value = msg;
      toast.error(msg);
      if (detectorRef.value) detectorRef.value.resetSampling();
    } finally {
      registering.value = false;
    }
  }
};

const goBack = () => {
  if (redirectUrl) window.location.href = redirectUrl;
  else window.history.back();
};
</script>

<style scoped>
.setup-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-app);
  padding: 1rem;
}

.setup-card {
  width: 100%;
  max-width: 440px;
  background: var(--card-black);
  border: 1px solid var(--border-color);
  border-radius: 24px;
  overflow: hidden;
}

.setup-header {
  padding: 2rem;
  text-align: center;
  border-bottom: 1px solid var(--border-dim);
}

.logo h1 { margin: 0; font-size: 1.25rem; letter-spacing: 0.1em; }
.badge {
  background: var(--accent-green);
  color: var(--bg-black);
  font-size: 0.55rem;
  font-weight: 900;
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-block;
  margin-top: 4px;
}

.setup-header p { color: var(--text-dim); font-size: 0.75rem; margin-top: 1rem; }
.username { color: var(--accent-green); font-weight: 700; }

.setup-content { padding: 1.5rem; min-height: 300px; }

.scanner-wrapper {
  width: 100%;
  aspect-ratio: 1;
  background: #000;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  position: relative;
}

.registering-overlay, .success-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  z-index: 10;
  text-align: center;
  padding: 2rem;
}

.success-overlay h3 { color: var(--accent-green); margin: 0; }
.scanner-footer { display: flex; align-items: center; justify-content: center; gap: 8px; color: var(--text-dim); font-size: 0.7rem; margin-top: 1rem; }

.setup-footer {
  padding: 1.25rem;
  background: rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--text-dim);
  font-size: 0.6rem;
}

.btn-primary {
  background: var(--accent-green);
  color: var(--bg-black);
  border: none;
  padding: 0.7rem 1.2rem;
  border-radius: 8px;
  font-weight: 800;
  cursor: pointer;
  margin-top: 1rem;
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 100%;
}

.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
