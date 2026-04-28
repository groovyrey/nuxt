<template>
  <div class="auth-container">
    <div class="auth-card">
      <header class="auth-header">
        <div class="auth-logo">
          <ShieldAlertIcon :size="40" class="accent" />
        </div>
        <h1>NEURAL<span class="accent">ACCESS</span></h1>
        <p class="subtitle">System Authentication Required</p>
      </header>

      <div class="auth-tabs">
        <button 
          :class="{ active: authMode === 'password' }" 
          @click="authMode = 'password'"
        >
          <KeyboardIcon :size="14" />
          <span>KEYBOARD</span>
        </button>
        <button 
          :class="{ active: authMode === 'face' }" 
          @click="authMode = 'face'"
        >
          <ScanFaceIcon :size="14" />
          <span>BIOMETRIC</span>
        </button>
      </div>

      <div class="auth-content">
        <!-- Password Mode -->
        <form v-if="authMode === 'password'" @submit.prevent="handlePasswordLogin" class="auth-form">
          <div class="form-group">
            <label><UserIcon :size="10" /> USERNAME</label>
            <div class="input-wrapper">
              <input v-model="loginForm.username" type="text" placeholder="Identity Handle" required />
            </div>
          </div>
          <div class="form-group">
            <label><LockIcon :size="10" /> PASSWORD</label>
            <div class="input-wrapper">
              <input v-model="loginForm.password" type="password" placeholder="••••••••" required />
            </div>
          </div>
          
          <div v-if="error" class="error-msg">
            <AlertCircleIcon :size="14" />
            <span>{{ error }}</span>
          </div>

          <button type="submit" class="submit-btn" :disabled="loading">
            <Loader2Icon v-if="loading" class="spin" :size="18" />
            <span>{{ loading ? 'VERIFYING...' : 'AUTHORIZE ACCESS' }}</span>
          </button>
        </form>

        <!-- Face Mode -->
        <div v-else class="face-auth-section">
          <div class="face-scanner-wrapper">
            <ClientOnly>
              <FaceDetector ref="detectorRef" @detected="handleFaceDetection" />
            </ClientOnly>
            <div class="scan-overlay">
              <div class="scan-line"></div>
            </div>
          </div>
          <p class="scan-hint">
            <InfoIcon :size="12" />
            Align face within markers for biometric verification
          </p>
          <div v-if="error" class="error-msg">
            <AlertCircleIcon :size="14" />
            <span>{{ error }}</span>
          </div>
        </div>
      </div>

      <div class="auth-footer">
        <p class="auth-link">
          NEW OPERATOR? <NuxtLink to="/register">CREATE PROFILE</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { 
  ShieldAlert as ShieldAlertIcon,
  Keyboard as KeyboardIcon,
  ScanFace as ScanFaceIcon,
  User as UserIcon,
  Lock as LockIcon,
  AlertCircle as AlertCircleIcon,
  Loader2 as Loader2Icon,
  Info as InfoIcon
} from 'lucide-vue-next';

const { fetchUser } = useAuth();
const detectorRef = ref(null);
const authMode = ref('password');
const loading = ref(false);
const error = ref('');

const loginForm = ref({
  username: '',
  password: ''
});

const handlePasswordLogin = async () => {
  loading.value = true;
  error.value = '';
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: loginForm.value
    });
    await fetchUser();
    navigateTo('/');
  } catch (err) {
    error.value = err.data?.statusMessage || 'Authentication failed';
  } finally {
    loading.value = false;
  }
};

const handleFaceDetection = async (data) => {
  if (data && data.descriptor && !loading.value) {
    loading.value = true;
    error.value = '';
    try {
      await $fetch('/api/auth/face-login', {
        method: 'POST',
        body: { faceDescriptor: data.descriptor }
      });
      
      if (detectorRef.value) {
        detectorRef.value.stopCamera();
      }

      await fetchUser();
      navigateTo('/');
    } catch (err) {
      if (err.statusCode !== 401) {
        error.value = err.data?.statusMessage || 'Face recognition error';
      }
    } finally {
      loading.value = false;
    }
  }
};
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: var(--bg-black);
}

.auth-card {
  width: 100%;
  max-width: 440px;
  background: var(--card-black);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  padding: 2.5rem;
  box-shadow: 0 40px 100px rgba(0,0,0,0.5);
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-logo {
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
}

.subtitle {
  color: var(--text-dim);
  font-size: 0.8rem;
  margin-top: 0.5rem;
  letter-spacing: 0.05em;
}

.auth-tabs {
  display: flex;
  background: rgba(255, 255, 255, 0.03);
  padding: 4px;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.auth-tabs button {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-dim);
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.auth-tabs button.active {
  background: rgba(255, 255, 255, 0.07);
  color: var(--accent-green);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-size: 0.6rem;
  color: var(--text-dim);
  font-weight: 700;
  letter-spacing: 0.1em;
  display: flex;
  align-items: center;
  gap: 6px;
}

input {
  width: 100%;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.85rem 1rem;
  border-radius: 10px;
  color: #fff;
  font-size: 0.9rem;
  transition: all 0.3s;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: var(--accent-green);
  background: rgba(255, 255, 255, 0.05);
}

.submit-btn {
  background: var(--accent-green);
  color: #000;
  border: none;
  padding: 1rem;
  border-radius: 10px;
  font-weight: 800;
  letter-spacing: 0.1em;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.submit-btn:hover:not(:disabled) {
  box-shadow: 0 0 30px rgba(0, 255, 136, 0.4);
  transform: translateY(-1px);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.face-auth-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}

.face-scanner-wrapper {
  width: 100%;
  aspect-ratio: 1;
  background: #000;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(0, 255, 136, 0.2);
  position: relative;
}

.scan-hint {
  font-size: 0.65rem;
  color: var(--text-dim);
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 6px;
}

.error-msg {
  color: #ff4444;
  font-size: 0.75rem;
  text-align: center;
  background: rgba(255, 68, 68, 0.08);
  padding: 0.75rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.auth-footer {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.auth-link {
  text-align: center;
  font-size: 0.65rem;
  color: var(--text-dim);
  margin: 0;
}

.auth-link a {
  color: var(--accent-green);
  text-decoration: none;
  font-weight: 700;
  margin-left: 4px;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 480px) {
  .auth-card {
    padding: 1.5rem;
    border-radius: 0;
    border: none;
    background: transparent;
    box-shadow: none;
  }
  .auth-container {
    padding: 0;
  }
}
</style>
