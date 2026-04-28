<template>
  <div class="auth-container">
    <div class="auth-card">
      <header class="auth-header">
        <div class="auth-logo">
          <UserPlusIcon :size="40" class="accent" />
        </div>
        <h1>NEURAL<span class="accent">REGISTRY</span></h1>
        <p class="subtitle">Create New Biometric Profile</p>
      </header>

      <div class="auth-content">
        <div class="scanner-section">
          <div class="face-preview">
            <ClientOnly>
              <FaceDetector ref="detectorRef" @detected="handleDetection" />
            </ClientOnly>
            <div v-if="faceCaptured" class="capture-badge">
              <CheckCircleIcon :size="12" />
              <span>FACE CAPTURED</span>
            </div>
            <div v-else class="capture-badge scanning">
              <Loader2Icon :size="12" class="spin" />
              <span>SCANNING...</span>
            </div>
          </div>
          <div class="scanner-info">
            <p><InfoIcon :size="12" /> Biometric data will be encrypted and stored securely.</p>
          </div>
        </div>

        <form @submit.prevent="handleRegister" class="auth-form">
          <div class="form-group" :class="{ 'has-error': fieldErrors.username }">
            <label><UserIcon :size="10" /> USERNAME</label>
            <input 
              v-model="form.username" 
              type="text" 
              placeholder="Identity Handle" 
              required 
              @blur="validateField('username')"
              @input="validateField('username')"
            />
            <span v-if="fieldErrors.username" class="field-error">{{ fieldErrors.username }}</span>
          </div>
          <div class="form-group" :class="{ 'has-error': fieldErrors.email }">
            <label><MailIcon :size="10" /> EMAIL</label>
            <input 
              v-model="form.email" 
              type="email" 
              placeholder="comm-link@network.sys" 
              required 
              @blur="validateField('email')"
              @input="validateField('email')"
            />
            <span v-if="fieldErrors.email" class="field-error">{{ fieldErrors.email }}</span>
          </div>
          <div class="form-group" :class="{ 'has-error': fieldErrors.password }">
            <label><LockIcon :size="10" /> PASSWORD</label>
            <input 
              v-model="form.password" 
              type="password" 
              placeholder="••••••••" 
              required 
              @blur="validateField('password')"
              @input="validateField('password')"
            />
            <span v-if="fieldErrors.password" class="field-error">{{ fieldErrors.password }}</span>
          </div>
          
          <div class="form-row">
            <div class="form-group half" :class="{ 'has-error': fieldErrors.age }">
              <label><CalendarIcon :size="10" /> AGE</label>
              <input 
                v-model.number="form.age" 
                type="number" 
                placeholder="24" 
                @blur="validateField('age')"
                @input="validateField('age')"
              />
              <span v-if="fieldErrors.age" class="field-error">{{ fieldErrors.age }}</span>
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

          <div v-if="error" class="error-msg">
            <AlertCircleIcon :size="14" />
            <span>{{ error }}</span>
          </div>

          <button type="submit" class="submit-btn" :disabled="loading || !isFormValid">
            <Loader2Icon v-if="loading" class="spin" :size="18" />
            <span>{{ loading ? 'PROCESSING...' : 'INITIALIZE PROFILE' }}</span>
          </button>

          <p class="auth-link">
            ALREADY REGISTERED? <NuxtLink to="/login">ACCESS TERMINAL</NuxtLink>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { 
  UserPlus as UserPlusIcon,
  CheckCircle as CheckCircleIcon,
  Loader2 as Loader2Icon,
  Info as InfoIcon,
  User as UserIcon,
  Mail as MailIcon,
  Lock as LockIcon,
  Calendar as CalendarIcon,
  Users as UsersIcon,
  AlertCircle as AlertCircleIcon
} from 'lucide-vue-next';

const { fetchUser } = useAuth();
const detectorRef = ref(null);
const loading = ref(false);
const error = ref('');
const faceCaptured = ref(false);
const capturedDescriptor = ref(null);

const form = ref({
  username: '',
  email: '',
  password: '',
  age: null,
  gender: 'other'
});

const fieldErrors = ref({
  username: '',
  email: '',
  password: '',
  age: ''
});

const validateField = (field) => {
  fieldErrors.value[field] = '';
  
  if (field === 'username') {
    if (!form.value.username) fieldErrors.value.username = 'Username is required';
    else if (!/^[a-zA-Z0-9_]{3,20}$/.test(form.value.username)) {
      fieldErrors.value.username = '3-20 alphanumeric characters or underscores';
    }
  }
  
  if (field === 'email') {
    if (!form.value.email) fieldErrors.value.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
      fieldErrors.value.email = 'Invalid email format';
    }
  }
  
  if (field === 'password') {
    if (!form.value.password) fieldErrors.value.password = 'Password is required';
    else if (form.value.password.length < 8) {
      fieldErrors.value.password = 'Minimum 8 characters required';
    }
  }

  if (field === 'age') {
    if (form.value.age && (form.value.age < 13 || form.value.age > 120)) {
      fieldErrors.value.age = 'Age must be between 13 and 120';
    }
  }
};

const isFormValid = computed(() => {
  return form.value.username && 
         form.value.email && 
         form.value.password && 
         !Object.values(fieldErrors.value).some(err => err !== '') &&
         faceCaptured.value;
});

const handleDetection = (data) => {
  if (data && data.descriptor && !faceCaptured.value) {
    console.log('Biometric data received by Registry');
    capturedDescriptor.value = data.descriptor;
    faceCaptured.value = true;
    
    if (detectorRef.value) {
      detectorRef.value.stopCamera();
    }

    if (!form.value.age) form.value.age = data.age;
    if (form.value.gender === 'other') form.value.gender = data.gender;
  }
};

const handleRegister = async () => {
  if (!faceCaptured.value) {
    error.value = 'Biometric scan incomplete. Please align face.';
    return;
  }
  
  loading.value = true;
  error.value = '';
  
  try {
    console.log('Submitting profile to Neural Grid...');
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: {
        ...form.value,
        faceDescriptor: capturedDescriptor.value
      }
    });
    
    await fetchUser();
    navigateTo('/');
  } catch (err) {
    console.error('Registration error:', err);
    error.value = err.data?.statusMessage || 'Registration failed';
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
  background: var(--bg-black);
}

.auth-card {
  width: 100%;
  max-width: 900px;
  background: var(--card-black);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  padding: 2.5rem;
  box-shadow: 0 40px 100px rgba(0,0,0,0.5);
}

.auth-header {
  text-align: center;
  margin-bottom: 2.5rem;
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

.auth-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2.5rem;
}

.scanner-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.face-preview {
  aspect-ratio: 1;
  background: #000;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(0, 255, 136, 0.2);
  position: relative;
}

.capture-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: var(--accent-green);
  color: #000;
  font-size: 0.6rem;
  font-weight: 800;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  letter-spacing: 0.1em;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 6px;
}

.capture-badge.scanning {
  background: #ffaa00;
}

.scanner-info {
  font-size: 0.65rem;
  color: #444;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scanner-info p {
  display: flex;
  align-items: center;
  gap: 6px;
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
  position: relative;
}

.field-error {
  color: #ff4444;
  font-size: 0.55rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  margin-top: 2px;
}

.form-group.has-error input {
  border-color: rgba(255, 68, 68, 0.4);
}

.form-group.has-error input:focus {
  border-color: #ff4444;
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
  gap: 6px;
}

input, select {
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

input:focus, select:focus {
  outline: none;
  border-color: var(--accent-green);
  background: rgba(255, 255, 255, 0.05);
}

select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
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

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.submit-btn:not(:disabled):hover {
  box-shadow: 0 0 30px rgba(0, 255, 136, 0.4);
  transform: translateY(-1px);
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

.auth-link {
  text-align: center;
  font-size: 0.65rem;
  color: var(--text-dim);
  margin-top: 0.5rem;
}

.auth-link a {
  color: var(--accent-green);
  text-decoration: none;
  font-weight: 700;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 800px) {
  .auth-content { grid-template-columns: 1fr; }
  .auth-card { padding: 2rem; max-width: 500px; }
  .face-preview { max-width: 300px; margin: 0 auto; }
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
