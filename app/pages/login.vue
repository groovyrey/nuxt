<template>
  <div class="auth-container">
    <div class="auth-card">
      <header class="auth-header">
        <div class="auth-logo">
          <ShieldAlertIcon :size="40" class="accent" />
        </div>
        <h1>LU<span class="accent">FACE</span></h1>
        <p class="subtitle">System Authentication Required</p>
      </header>

      <!-- Step Indicator -->
      <div class="step-progress">
        <div class="step-item" :class="{ 'active': loginStep === 'password', 'completed': loginStep !== 'password' }">
          <div class="step-number">
            <CheckIcon v-if="loginStep !== 'password'" :size="14" />
            <span v-else>1</span>
          </div>
          <span class="step-text">IDENTITY</span>
        </div>
        <div class="step-item" :class="{ 'active': loginStep === 'biometric' }">
          <div class="step-number">2</div>
          <span class="step-text">BIOMETRICS</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" :style="{ width: loginStep === 'password' ? '0%' : '100%' }"></div>
        </div>
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
import { toast } from 'vue-sonner';
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
      toast.success('Identity Verified', { description: 'Please complete biometric scan' });
    } else {
      // Fallback if 2FA is disabled for some reason
      toast.success('Access Granted');
      await fetchUser();
      navigateTo('/');
    }
  } catch (err) {
    error.value = err.data?.statusMessage || 'Authentication failed';
    toast.error('Access Denied', { description: error.value });
  } finally {
    loading.value = false;
  }
};

const handleFaceDetection = async (data) => {
  if (data && data.descriptor && !loading.value) {
    loading.value = true;
    error.value = '';
    try {
      console.log('Initiating biometric handshake...');
      await $fetch('/api/auth/face-login', {
        method: 'POST',
        body: { 
          faceDescriptor: data.descriptor,
          faceImage: data.image,
          username: loginForm.value.username 
        }
      });
      
      // Success: Stop camera and navigate
      if (detectorRef.value) detectorRef.value.stopCamera();
      toast.success('Access Granted', { description: 'Biometric profile verified' });
      await fetchUser();
      navigateTo('/');
    } catch (err) {
      console.error('Biometric verification error:', err);
      error.value = err.data?.statusMessage || 'Verification failed. Please try again.';
      
      // Allow retry by resetting sampling
      if (detectorRef.value) detectorRef.value.resetSampling();
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
  background: var(--bg-app);
}

.auth-card {
  width: 100%;
  max-width: 440px;
  background: var(--card-black);
  border: 1px solid var(--border-color);
  border-radius: 24px;
  padding: 2.5rem;
  box-shadow: 0 40px 100px var(--shadow-color);
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

/* Step Progress */
.step-progress {
  display: flex;
  justify-content: space-between;
  margin-bottom: 3rem;
  position: relative;
  padding: 0 10px;
}

.progress-bar-bg {
  position: absolute;
  top: 15px;
  left: 30px;
  right: 30px;
  height: 2px;
  background: var(--border-color);
  z-index: 1;
}

.progress-bar-fill {
  height: 100%;
  background: var(--accent-green);
  transition: width 0.4s ease;
  box-shadow: 0 0 10px var(--accent-green);
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  z-index: 2;
  position: relative;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--card-black);
  border: 2px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--text-dim);
  transition: all 0.3s ease;
}

.step-item.active .step-number {
  border-color: var(--accent-green);
  color: var(--accent-green);
  box-shadow: 0 0 20px rgba(var(--accent-green-rgb), 0.2);
}

.step-item.completed .step-number {
  background: var(--accent-green);
  border-color: var(--accent-green);
  color: var(--bg-black);
}

.step-text {
  font-size: 0.55rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: var(--text-dim);
  text-transform: uppercase;
}

.step-item.active .step-text {
  color: var(--text-main);
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
  background: var(--input-bg);
  border: 1px solid var(--border-color);
  padding: 0.85rem 1rem;
  border-radius: 10px;
  color: var(--text-main);
  font-size: 0.9rem;
  transition: all 0.3s;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: var(--accent-green);
  background: rgba(var(--accent-green-rgb), 0.05);
}

.submit-btn {
  background: var(--accent-green);
  color: var(--bg-black);
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
  box-shadow: 0 0 30px rgba(var(--accent-green-rgb), 0.4);
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
  background: rgba(var(--accent-green-rgb), 0.1);
  border: 1px solid rgba(var(--accent-green-rgb), 0.2);
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
  color: var(--text-main);
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
  border: 1px solid var(--border-color);
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
  border-top: 1px solid var(--border-color);
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
