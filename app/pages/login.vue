<template>
  <div class="auth-container">
    <div class="auth-card">
      <header class="auth-header">
        <h1>NEURAL<span class="accent">ACCESS</span></h1>
        <p class="subtitle">System Authentication Required</p>
      </header>

      <div class="auth-tabs">
        <button 
          :class="{ active: authMode === 'password' }" 
          @click="authMode = 'password'"
        >KEYBOARD</button>
        <button 
          :class="{ active: authMode === 'face' }" 
          @click="authMode = 'face'"
        >BIOMETRIC</button>
      </div>

      <div class="auth-content">
        <!-- Password Mode -->
        <form v-if="authMode === 'password'" @submit.prevent="handlePasswordLogin" class="auth-form">
          <div class="form-group">
            <label>USERNAME</label>
            <input v-model="loginForm.username" type="text" placeholder="Identity Handle" required />
          </div>
          <div class="form-group">
            <label>PASSWORD</label>
            <input v-model="loginForm.password" type="password" placeholder="••••••••" required />
          </div>
          
          <div v-if="error" class="error-msg">{{ error }}</div>

          <button type="submit" class="submit-btn" :disabled="loading">
            {{ loading ? 'VERIFYING...' : 'AUTHORIZE ACCESS' }}
          </button>
        </form>

        <!-- Face Mode -->
        <div v-else class="face-auth-section">
          <div class="face-scanner-wrapper">
            <ClientOnly>
              <FaceDetector @detected="handleFaceDetection" />
            </ClientOnly>
            <div class="scan-overlay">
              <div class="scan-line"></div>
            </div>
          </div>
          <p class="scan-hint">Align face within markers for biometric verification</p>
          <div v-if="error" class="error-msg">{{ error }}</div>
        </div>
      </div>

      <p class="auth-link">
        NEW OPERATOR? <NuxtLink to="/register">CREATE PROFILE</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
const { fetchUser } = useAuth();
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
      await fetchUser();
      navigateTo('/');
    } catch (err) {
      // Don't show error immediately on every frame, maybe wait a bit
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
  padding: 2rem;
  background: var(--bg-black);
}

.auth-card {
  width: 100%;
  max-width: 450px;
  background: var(--card-black);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 32px;
  padding: 3rem;
  box-shadow: 0 40px 100px rgba(0,0,0,0.5);
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
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
  padding: 0.8rem;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: all 0.3s;
}

.auth-tabs button.active {
  background: rgba(255, 255, 255, 0.07);
  color: var(--accent-green);
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

label {
  font-size: 0.65rem;
  color: var(--text-dim);
  font-weight: 700;
  letter-spacing: 0.1em;
}

input {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 12px;
  color: #fff;
  font-size: 0.9rem;
  transition: all 0.3s;
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
  padding: 1.2rem;
  border-radius: 12px;
  font-weight: 800;
  letter-spacing: 0.1em;
  cursor: pointer;
  margin-top: 1rem;
  transition: all 0.3s;
}

.submit-btn:hover {
  box-shadow: 0 0 30px rgba(0, 255, 136, 0.4);
}

.face-auth-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.face-scanner-wrapper {
  width: 100%;
  aspect-ratio: 1;
  background: #000;
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid rgba(0, 255, 136, 0.2);
  position: relative;
}

.scan-hint {
  font-size: 0.7rem;
  color: var(--text-dim);
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.error-msg {
  color: #ff4444;
  font-size: 0.8rem;
  text-align: center;
  background: rgba(255, 68, 68, 0.1);
  padding: 0.8rem;
  border-radius: 8px;
  width: 100%;
}

.auth-link {
  text-align: center;
  font-size: 0.7rem;
  color: var(--text-dim);
  margin-top: 2rem;
}

.auth-link a {
  color: var(--accent-green);
  text-decoration: none;
  font-weight: 700;
}
</style>
