<template>
  <div class="auth-container">
    <div class="auth-card">
      <!-- Step Indicator -->
      <div class="step-progress">
        <div 
          v-for="step in 3" 
          :key="step" 
          class="step-item"
          :class="{ 
            'active': currentStep === step, 
            'completed': currentStep > step 
          }"
        >
          <div class="step-number">
            <CheckIcon v-if="currentStep > step" :size="14" />
            <span v-else>{{ step }}</span>
          </div>
          <span class="step-text">{{ stepLabels[step-1] }}</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" :style="{ width: `${(currentStep - 1) * 50}%` }"></div>
        </div>
      </div>

      <header class="auth-header">
        <h1>NEURAL<span class="accent">REGISTRY</span></h1>
        <p class="subtitle">{{ stepSubtitles[currentStep-1] }}</p>
      </header>

      <div class="auth-content">
        <Transition name="fade-slide" mode="out-in">
          <!-- STEP 1: BIOMETRIC SCAN -->
          <div v-if="currentStep === 1" key="step1" class="step-container">
            <div class="scanner-wrapper">
              <ClientOnly>
                <FaceDetector ref="detectorRef" show-guide @detected="handleDetection" />
              </ClientOnly>
              <div v-if="faceCaptured" class="capture-overlay">
                <div class="success-circle">
                  <CheckCircleIcon :size="48" class="accent" />
                </div>
                <p>BIOMETRICS VERIFIED</p>
                <button @click="faceCaptured = false" class="retry-link">RE-SCAN</button>
              </div>
            </div>
            
            <div class="action-bar">
              <button 
                class="next-btn" 
                :disabled="!faceCaptured" 
                @click="currentStep++"
              >
                CONTINUE TO PROFILE <ArrowRightIcon :size="18" />
              </button>
            </div>
          </div>

          <!-- STEP 2: PROFILE DETAILS -->
          <div v-else-if="currentStep === 2" key="step2" class="step-container">
            <div class="auth-form">
              <div class="form-group" :class="{ 'has-error': touched.username && !validation.username.valid }">
                <label><UserIcon :size="10" /> USERNAME</label>
                <div class="input-wrapper">
                  <input v-model="form.username" type="text" placeholder="Identity Handle" @blur="touch('username')" />
                  <AlertCircleIcon v-if="touched.username && !validation.username.valid" class="error-icon" :size="16" />
                </div>
                <Transition name="fade-in">
                  <span v-if="touched.username && !validation.username.valid" class="field-error">{{ validation.username.message }}</span>
                </Transition>
              </div>
              <div class="form-group" :class="{ 'has-error': touched.email && !validation.email.valid }">
                <label><MailIcon :size="10" /> EMAIL ADDRESS</label>
                <div class="input-wrapper">
                  <input v-model="form.email" type="email" placeholder="operator@neural.sys" @blur="touch('email')" />
                  <AlertCircleIcon v-if="touched.email && !validation.email.valid" class="error-icon" :size="16" />
                </div>
                <Transition name="fade-in">
                  <span v-if="touched.email && !validation.email.valid" class="field-error">{{ validation.email.message }}</span>
                </Transition>
              </div>
              <div class="form-row">
                <div class="form-group half" :class="{ 'has-error': touched.age && !validation.age.valid }">
                  <label><CalendarIcon :size="10" /> AGE</label>
                  <input v-model.number="form.age" type="number" @blur="touch('age')" />
                  <Transition name="fade-in">
                    <span v-if="touched.age && !validation.age.valid" class="field-error">{{ validation.age.message }}</span>
                  </Transition>
                </div>
                <div class="form-group half">
                  <label><UsersIcon :size="10" /> GENDER</label>
                  <select v-model="form.gender">
                    <option value="male">MALE</option>
                    <option value="female">FEMALE</option>
                    <option value="other">OTHER</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div class="action-bar">
              <button class="back-btn" @click="currentStep--">BACK</button>
              <button 
                class="next-btn" 
                :disabled="!isStep2Valid" 
                @click="currentStep++"
              >
                SECURITY SETUP <ArrowRightIcon :size="18" />
              </button>
            </div>
          </div>

          <!-- STEP 3: SECURITY -->
          <div v-else-if="currentStep === 3" key="step3" class="step-container">
            <div class="auth-form">
              <div class="form-group" :class="{ 'has-error': touched.password && !validation.password.valid }">
                <label><LockIcon :size="10" /> ACCESS PASSWORD</label>
                <div class="input-wrapper">
                  <input v-model="form.password" type="password" placeholder="••••••••" @blur="touch('password')" />
                  <AlertCircleIcon v-if="touched.password && !validation.password.valid" class="error-icon" :size="16" />
                </div>
                <Transition name="fade-in">
                  <span v-if="touched.password && !validation.password.valid" class="field-error">{{ validation.password.message }}</span>
                </Transition>
              </div>
              <div class="form-group" :class="{ 'has-error': touched.confirmPassword && !validation.confirmPassword.valid }">
                <label><ShieldCheckIcon :size="10" /> CONFIRM PASSWORD</label>
                <div class="input-wrapper">
                  <input v-model="confirmPassword" type="password" placeholder="••••••••" @blur="touch('confirmPassword')" />
                  <AlertCircleIcon v-if="touched.confirmPassword && !validation.confirmPassword.valid" class="error-icon" :size="16" />
                </div>
                <Transition name="fade-in">
                  <span v-if="touched.confirmPassword && !validation.confirmPassword.valid" class="field-error">{{ validation.confirmPassword.message }}</span>
                </Transition>
              </div>

              <div v-if="error" class="error-msg">
                <AlertCircleIcon :size="14" />
                <span>{{ error }}</span>
              </div>
            </div>
            
            <div class="action-bar">
              <button class="back-btn" @click="currentStep--" :disabled="loading">BACK</button>
              <button 
                class="submit-btn" 
                :disabled="loading || !isStep3Valid" 
                @click="handleRegister"
              >
                <Loader2Icon v-if="loading" class="spin" :size="18" />
                <span>{{ loading ? 'INITIALIZING...' : 'COMPLETE REGISTRATION' }}</span>
              </button>
            </div>
          </div>
        </Transition>
      </div>

      <div class="auth-footer">
        <p class="auth-link">
          ALREADY HAVE A PROFILE? <NuxtLink to="/login">ACCESS TERMINAL</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { toast } from 'vue-sonner';
import { 
  Check as CheckIcon,
  CheckCircle as CheckCircleIcon,
  ArrowRight as ArrowRightIcon,
  User as UserIcon,
  Mail as MailIcon,
  Calendar as CalendarIcon,
  Users as UsersIcon,
  Lock as LockIcon,
  ShieldCheck as ShieldCheckIcon,
  AlertCircle as AlertCircleIcon,
  Loader2 as Loader2Icon
} from 'lucide-vue-next';

const { fetchUser } = useAuth();
const currentStep = ref(1);
const loading = ref(false);
const error = ref('');
const detectorRef = ref(null);

const stepLabels = ['BIOMETRICS', 'IDENTITY', 'SECURITY'];
const stepSubtitles = [
  'Registering neural facial signature',
  'Establishing operator identification',
  'Configuring secure access credentials'
];

const faceCaptured = ref(false);
const capturedDescriptor = ref(null);
const capturedImage = ref(null);
const confirmPassword = ref('');

const form = ref({
  username: '',
  email: '',
  password: '',
  age: null,
  gender: 'other'
});

const touched = ref({
  username: false,
  email: false,
  age: false,
  password: false,
  confirmPassword: false
});

const touch = (field) => {
  touched.value[field] = true;
};

const validation = computed(() => {
  const usernameRegex = /^[a-zA-Z](?:[a-zA-Z0-9._](?![._])){1,18}[a-zA-Z0-9]$/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;

  return {
    username: {
      valid: usernameRegex.test(form.value.username),
      message: '3-20 chars, start with letter, no consecutive symbols'
    },
    email: {
      valid: emailRegex.test(form.value.email),
      message: 'Enter a valid neural-link address'
    },
    age: {
      valid: form.value.age >= 13 && form.value.age <= 120,
      message: 'Age must be between 13 and 120'
    },
    password: {
      valid: passwordRegex.test(form.value.password),
      message: 'Min 8 chars, must include letter and number'
    },
    confirmPassword: {
      valid: form.value.password === confirmPassword.value && confirmPassword.value !== '',
      message: 'Passwords must match exactly'
    }
  };
});

const isStep2Valid = computed(() => {
  return validation.value.username.valid && 
         validation.value.email.valid && 
         validation.value.age.valid;
});

const isStep3Valid = computed(() => {
  return validation.value.password.valid && 
         validation.value.confirmPassword.valid;
});

const handleDetection = (data) => {
  if (data && data.descriptor && data.isFinal && !faceCaptured.value) {
    capturedDescriptor.value = data.descriptor;
    capturedImage.value = data.image;
    faceCaptured.value = true;
    toast.success('Biometrics Captured', { description: 'Facial signature verified' });
    
    if (detectorRef.value) {
      detectorRef.value.stopCamera();
    }

    if (!form.value.age) form.value.age = data.age;
    if (form.value.gender === 'other') form.value.gender = data.gender;
  }
};

const handleRegister = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: {
        ...form.value,
        faceDescriptor: capturedDescriptor.value,
        faceImage: capturedImage.value
      }
    });
    
    toast.success('Profile Created', { description: 'Welcome to Neural Systems' });
    await fetchUser();
    navigateTo('/');
  } catch (err) {
    error.value = err.data?.statusMessage || 'Registration failed';
    toast.error('Registration Failed', { description: error.value });
  } finally {
    loading.value = false;
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
  max-width: 480px;
  background: var(--card-black);
  border: 1px solid var(--border-color);
  border-radius: 32px;
  padding: 3rem;
  box-shadow: 0 40px 100px var(--shadow-color);
  position: relative;
  overflow: hidden;
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

/* Header */
.auth-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.auth-header h1 {
  font-size: 1.5rem;
  margin: 0;
}

.subtitle {
  color: var(--text-dim);
  font-size: 0.75rem;
  margin-top: 0.5rem;
  letter-spacing: 0.05em;
}

/* Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Scanner Step */
.scanner-wrapper {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  position: relative;
  background: #000;
}

.capture-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  z-index: 10;
}

.success-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: rgba(0, 255, 136, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: scaleUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes scaleUp {
  from { transform: scale(0); }
  to { transform: scale(1); }
}

.capture-overlay p {
  color: var(--accent-green);
  font-weight: 800;
  letter-spacing: 0.2em;
  font-size: 0.8rem;
}

.retry-link {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-dim);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.6rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-link:hover {
  border-color: var(--text-main);
  color: var(--text-main);
}

/* Form Styles */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.half { flex: 1; }

label {
  font-size: 0.6rem;
  color: var(--text-dim);
  font-weight: 700;
  letter-spacing: 0.1em;
  display: flex;
  align-items: center;
  gap: 8px;
}

input, select {
  width: 100%;
  background: var(--input-bg);
  border: 1px solid var(--border-color);
  padding: 1rem;
  border-radius: 12px;
  color: var(--text-main);
  font-size: 0.9rem;
  transition: all 0.3s;
  box-sizing: border-box;
}

input:focus, select:focus {
  outline: none;
  border-color: var(--accent-green);
  background: rgba(var(--accent-green-rgb), 0.05);
}

/* Action Bar */
.action-bar {
  display: flex;
  gap: 1rem;
  margin-top: 2.5rem;
}

.next-btn, .submit-btn {
  flex: 2;
  background: var(--accent-green);
  color: var(--bg-black);
  border: none;
  padding: 1.1rem;
  border-radius: 14px;
  font-weight: 800;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.next-btn:disabled, .submit-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  filter: grayscale(1);
}

.back-btn {
  flex: 1;
  background: var(--glass);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  padding: 1.1rem;
  border-radius: 14px;
  font-weight: 800;
  letter-spacing: 0.1em;
  cursor: pointer;
}

.back-btn:hover:not(:disabled) {
  background: var(--border-color);
}

.error-msg {
  color: #ff4444;
  font-size: 0.75rem;
  background: rgba(255, 68, 68, 0.08);
  padding: 1rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.auth-footer {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
  text-align: center;
}

.auth-link {
  font-size: 0.65rem;
  color: var(--text-dim);
}

.auth-link a {
  color: var(--accent-green);
  text-decoration: none;
  font-weight: 800;
  margin-left: 5px;
}

.spin { animation: spin 1s linear infinite; }
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.error-icon {
  position: absolute;
  right: 12px;
  color: #ff4444;
  animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
}

.field-error {
  font-size: 0.6rem;
  color: #ff4444;
  font-weight: 600;
  margin-top: 4px;
}

.form-group.has-error input {
  border-color: rgba(255, 68, 68, 0.5);
  background: rgba(255, 68, 68, 0.02);
}

.form-group.has-error input:focus {
  border-color: #ff4444;
  box-shadow: 0 0 10px rgba(255, 68, 68, 0.1);
}

.fade-in-enter-active {
  transition: all 0.2s ease-out;
}
.fade-in-enter-from {
  opacity: 0;
  transform: translateY(-5px);
}

@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}

@media (max-width: 480px) {
  .auth-card {
    padding: 2rem 1.5rem;
    border-radius: 0;
    border: none;
    background: transparent;
  }
}
</style>