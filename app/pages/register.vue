<template>
  <div class="auth-container">
    <div class="auth-card">
      <header class="auth-header">
        <h1>NEURAL<span class="accent">REGISTRY</span></h1>
        <p class="subtitle">Create New Biometric Profile</p>
      </header>

      <div class="auth-content">
        <div class="scanner-section">
          <div class="face-preview">
            <ClientOnly>
              <FaceDetector @detected="handleDetection" />
            </ClientOnly>
            <div v-if="faceCaptured" class="capture-badge">FACE CAPTURED</div>
            <div v-else class="capture-badge scanning">SCANNING...</div>
          </div>
        </div>

        <form @submit.prevent="handleRegister" class="auth-form">
          <div class="form-group">
            <label>USERNAME</label>
            <input v-model="form.username" type="text" placeholder="Identity Handle" required />
          </div>
          <div class="form-group">
            <label>EMAIL</label>
            <input v-model="form.email" type="email" placeholder="comm-link@network.sys" required />
          </div>
          <div class="form-group">
            <label>PASSWORD</label>
            <input v-model="form.password" type="password" placeholder="••••••••" required />
          </div>
          
          <div class="form-row">
            <div class="form-group half">
              <label>AGE</label>
              <input v-model.number="form.age" type="number" placeholder="24" />
            </div>
            <div class="form-group half">
              <label>GENDER</label>
              <select v-model="form.gender">
                <option value="male">MALE</option>
                <option value="female">FEMALE</option>
                <option value="other">OTHER</option>
              </select>
            </div>
          </div>

          <div v-if="error" class="error-msg">{{ error }}</div>

          <button type="submit" class="submit-btn" :disabled="loading">
            {{ loading ? 'PROCESSING...' : 'INITIALIZE PROFILE' }}
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
const { fetchUser } = useAuth();
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

const handleDetection = (data) => {
  if (data && data.descriptor) {
    console.log('Biometric data received by Registry');
    capturedDescriptor.value = data.descriptor;
    faceCaptured.value = true;
    // Only auto-fill if the user hasn't touched these fields
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
  padding: 2rem;
  background: var(--bg-black);
}

.auth-card {
  width: 100%;
  max-width: 900px;
  background: var(--card-black);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 32px;
  padding: 3rem;
  box-shadow: 0 40px 100px rgba(0,0,0,0.5);
}

.auth-header {
  text-align: center;
  margin-bottom: 3rem;
}

.auth-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
}

.scanner-section {
  position: relative;
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
  border-radius: 4px;
  letter-spacing: 0.1em;
  z-index: 10;
}

.capture-badge.scanning {
  background: #ffaa00;
  animation: blink 1s infinite;
}

@keyframes blink {
  50% { opacity: 0.5; }
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.half { flex: 1; }

label {
  font-size: 0.65rem;
  color: var(--text-dim);
  font-weight: 700;
  letter-spacing: 0.1em;
}

input, select {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 12px;
  color: #fff;
  font-size: 0.9rem;
  transition: all 0.3s;
}

input:focus, select:focus {
  outline: none;
  border-color: var(--accent-green);
  background: rgba(255, 255, 255, 0.05);
}

.submit-btn {
  background: var(--accent-green);
  color: #000;
  border: none;
  padding: 1.2rem;
  border-radius: 12px;
  font-weight: 800;
  letter-spacing: 0.1em;
  cursor: pointer;
  margin-top: 1rem;
  transition: all 0.3s;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.submit-btn:not(:disabled):hover {
  box-shadow: 0 0 30px rgba(0, 255, 136, 0.4);
  transform: translateY(-2px);
}

.error-msg {
  color: #ff4444;
  font-size: 0.8rem;
  text-align: center;
  background: rgba(255, 68, 68, 0.1);
  padding: 0.8rem;
  border-radius: 8px;
}

.auth-link {
  text-align: center;
  font-size: 0.7rem;
  color: var(--text-dim);
  margin-top: 1rem;
}

.auth-link a {
  color: var(--accent-green);
  text-decoration: none;
  font-weight: 700;
}

@media (max-width: 800px) {
  .auth-content { grid-template-columns: 1fr; }
  .auth-card { padding: 2rem; }
}
</style>
