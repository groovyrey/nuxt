<template>
  <div v-if="user" class="min-h-screen app-container">
    <header class="glass-header">
      <div class="logo-area">
        <div class="status-dot" :class="{ 'active': isOnline }"></div>
        <h1>NEURAL<span class="accent">VISION</span></h1>
      </div>
      <div class="user-controls">
        <span class="username">{{ user.username }}</span>
        <button @click="logout" class="logout-btn">LOGOUT</button>
      </div>
    </header>
    
    <main class="content-grid">
      <div class="vision-card">
        <div class="user-profile-display">
          <div class="profile-header">
            <div class="avatar-placeholder">
              <span class="initials">{{ user.username.charAt(0).toUpperCase() }}</span>
            </div>
            <div class="profile-info">
              <h2>{{ user.username }}</h2>
              <p class="email">{{ user.email }}</p>
            </div>
          </div>
          
          <div class="profile-details">
            <div class="detail-item">
              <label>BIO-METRIC ID</label>
              <span>{{ user.username.toUpperCase() }}-NX-{{ Math.floor(Math.random() * 10000) }}</span>
            </div>
            <div class="detail-item">
              <label>AGE</label>
              <span>{{ user.age || 'NOT RECORDED' }} YEARS</span>
            </div>
            <div class="detail-item">
              <label>GENDER</label>
              <span>{{ user.gender?.toUpperCase() || 'NOT RECORDED' }}</span>
            </div>
            <div class="detail-item">
              <label>CLEARANCE LEVEL</label>
              <span class="accent">LEVEL 4 OPERATOR</span>
            </div>
          </div>
        </div>
      </div>

      <div class="info-sidebar">
        <div class="status-item highlight">
          <label>ACCESS STATUS</label>
          <span class="value">AUTHORIZED</span>
        </div>
        
        <div class="status-item">
          <label>SYSTEM STATUS</label>
          <span class="value">OPERATIONAL</span>
        </div>

        <div class="status-item">
          <label>NETWORK</label>
          <span class="value">ENCRYPTED GRID</span>
        </div>
      </div>
    </main>

    <footer class="system-footer">
      <div class="footer-line"></div>
      <p>&copy; 2024 NEURAL VISION SYSTEM • SECURE ACCESS ONLY</p>
    </footer>
  </div>
  <div v-else-if="!isLoading" class="redirecting">
    Redirecting to login...
  </div>
</template>

<script setup>
const { user, isLoading, logout } = useAuth();
const isOnline = ref(true)

watch(isLoading, (loading) => {
  if (!loading && !user.value) {
    navigateTo('/login');
  }
}, { immediate: true });
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.user-profile-display {
  width: 100%;
  max-width: 600px;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.avatar-placeholder {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, var(--accent-green), #00aadd);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 30px rgba(0, 255, 136, 0.3);
}

.initials {
  font-size: 2.5rem;
  font-weight: 800;
  color: #000;
}

.profile-info h2 {
  margin: 0;
  font-size: 2rem;
  letter-spacing: -0.02em;
}

.profile-info .email {
  color: var(--text-dim);
  margin: 4px 0 0;
  font-size: 0.9rem;
}

.profile-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item label {
  font-size: 0.65rem;
  color: var(--text-dim);
  font-weight: 700;
  letter-spacing: 0.1em;
}

.detail-item span {
  font-family: monospace;
  font-size: 1rem;
}

.glass-header {
  padding: 2rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #333;
  border-radius: 50%;
}

.status-dot.active {
  background: var(--accent-green);
  box-shadow: 0 0 15px var(--accent-green);
}

h1 {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: 0.1em;
}

.accent { color: var(--accent-green); }

.user-controls {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.username {
  color: var(--text-dim);
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.logout-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
}

.logout-btn:hover {
  border-color: var(--accent-green);
  color: var(--accent-green);
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 2rem;
  flex: 1;
}

.vision-card {
  background: var(--card-black);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 500px;
  position: relative;
  overflow: hidden;
}

.info-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.biometrics {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border-left: 2px solid var(--accent-green);
  padding-left: 1rem;
  margin-bottom: 1rem;
}

.status-item {
  background: var(--card-black);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 1.2rem;
  border-radius: 16px;
  transition: all 0.3s ease;
}

.status-item.highlight {
  border-color: var(--accent-green);
}

.status-item label {
  display: block;
  font-size: 0.65rem;
  color: var(--text-dim);
  margin-bottom: 4px;
  font-weight: 600;
}

.status-item .value {
  font-family: monospace;
  font-size: 0.9rem;
  color: #fff;
}

.scanning {
  color: var(--accent-green) !important;
  animation: blink 1s infinite;
}

@keyframes blink {
  50% { opacity: 0.3; }
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: var(--text-dim);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-top-color: var(--accent-green);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.system-footer {
  margin-top: 4rem;
  padding-bottom: 2rem;
}

.footer-line {
  height: 1px;
  background: linear-gradient(90deg, var(--accent-green), transparent);
  margin-bottom: 1.5rem;
  opacity: 0.3;
}

.system-footer p {
  color: #444;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.1em;
}

.redirecting {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  color: var(--text-dim);
}

@media (max-width: 900px) {
  .content-grid { grid-template-columns: 1fr; }
  .info-sidebar { order: 2; }
}
</style>
