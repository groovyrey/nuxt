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

      <div class="auth-tabs" v-if="loginStep === 'password'">
        <div class="step-indicator">
          <span class="step active">1</span>
          <div class="step-line"></div>
          <span class="step">2</span>
        </div>
        <p class="step-label">STEP 1: IDENTITY VERIFICATION</p>
      </div>

      <div class="auth-tabs" v-else>
        <div class="step-indicator">
          <span class="step completed"><CheckIcon :size="10" /></span>
          <div class="step-line active"></div>
          <span class="step active">2</span>
        </div>
        <p class="step-label">STEP 2: BIOMETRIC AUTHORIZATION</p>
      </div>

      <div class="auth-content">
        <!-- Step 1: Password -->
        <form v-if="loginStep === 'password'" @submit.prevent="handlePasswordLogin" class="auth-form">
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
            <span>{{ loading ? 'VERIFYING...' : 'CONTINUE' }}</span>
          </button>
        </form>

        <!-- Step 2: Face 2FA -->
        <div v-else class="face-auth-section">
          <div class="user-context-badge">
            <UserIcon :size="12" />
            <span>OPERATOR: {{ loginForm.username }}</span>
            <button @click="resetLogin" class="reset-btn">CHANGE</button>
          </div>

          <div class="face-scanner-wrapper">
            <ClientOnly>
              <FaceDetector ref="detectorRef" minimal show-guide @detected="handleFaceDetection" />
            </ClientOnly>
            <div class="scan-overlay">
              <div class="scan-line"></div>
            </div>
          </div>
          <p class="scan-hint">
            <ScanFaceIcon :size="12" />
            Scanning for biometric signature...
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
  Info as InfoIcon,
  Check as CheckIcon
} from 'lucide-vue-next';

const { fetchUser } = useAuth();
const detectorRef = ref(null);
const loginStep = ref('password'); // 'password' or 'biometric'
const loading = ref(false);
const error = ref('');

const loginForm = ref({
  username: '',
  password: ''
});

const resetLogin = () => {
  loginStep.value = 'password';
  error.value = '';
};

const handlePasswordLogin = async () => {
  loading.value = true;
  error.value = '';
  try {
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: loginForm.value
    });
    
    if (response.requires2fa) {
      loginStep.value = 'biometric';
    } else {
      // Fallback if 2FA is disabled for some reason
      await fetchUser();
      navigateTo('/');
    }
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
      console.log('Sending biometric signature for verification...');
      await $fetch('/api/auth/face-login', {
        method: 'POST',
        body: { 
          faceDescriptor: data.descriptor,
          username: loginForm.value.username 
        }
      });
      
      // Success: Stop camera and navigate
      if (detectorRef.value) {
        detectorRef.value.stopCamera();
      }
      await fetchUser();
      navigateTo('/');
    } catch (err) {
      // Failure: Show visual error on frame and message
      console.warn('Biometric verification failed:', err);
      error.value = err.data?.statusMessage || 'Biometric verification failed';
      
      if (detectorRef.value) {
        detectorRef.value.triggerError();
        // Delay camera stop slightly so user sees the red error frame
        setTimeout(() => {
          if (detectorRef.value) detectorRef.value.stopCamera();
        }, 2000);
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
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  background: rgba(255, 255, 255, 0.02);
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.03);
}

.step-indicator {
  display: flex;
  align-items: center;
  gap: 12px;
}

.step {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  font-weight: 800;
  color: var(--text-dim);
}

.step.active {
  background: var(--accent-green);
  border-color: var(--accent-green);
  color: #000;
  box-shadow: 0 0 15px rgba(0, 255, 136, 0.3);
}

.step.completed {
  background: rgba(255, 255, 255, 0.1);
  color: var(--accent-green);
  border-color: transparent;
}

.step-line {
  width: 40px;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
}

.step-line.active {
  background: var(--accent-green);
}

.step-label {
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.15em;
  color: var(--text-dim);
  margin: 0;
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

.user-context-badge {
  background: rgba(0, 255, 136, 0.05);
  border: 1px solid rgba(0, 255, 136, 0.1);
  padding: 0.6rem 1rem;
  border-radius: 30px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--accent-green);
}

.reset-btn {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 0.55rem;
  text-decoration: underline;
  cursor: pointer;
  opacity: 0.6;
  padding: 0;
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
