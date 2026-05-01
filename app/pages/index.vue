<template>
  <div v-if="user" class="min-h-screen app-container">
    <header class="glass-header">
      <div class="logo-area">
        <div class="status-dot" :class="{ 'active': isOnline }"></div>
        <h1>LU<span class="accent">FACE</span></h1>
      </div>
      <div class="user-controls">
        <span class="username-wrapper">
          <UserIcon :size="14" class="icon-dim" />
          <span class="username">{{ user.username }}</span>
        </span>
      </div>
    </header>
    
    <main class="content-grid">
      <div class="luface-card">
        <div class="user-profile-display">
          <div class="profile-header">
            <div class="avatar-placeholder">
              <span class="initials">{{ user.username.charAt(0).toUpperCase() }}</span>
              <div class="avatar-overlay">
                <ShieldCheckIcon :size="32" color="black" />
              </div>
            </div>
            <div class="profile-info">
              <h2>{{ user.username }}</h2>
              <p class="email">
                <MailIcon :size="12" class="inline-icon" />
                {{ user.email }}
              </p>
            </div>
          </div>
          
          <div class="profile-details">
            <div class="detail-item">
              <label><FingerprintIcon :size="10" /> BIO-METRIC ID</label>
              <span>{{ user.username.toUpperCase() }}-NX-{{ Math.floor(Math.random() * 10000) }}</span>
            </div>
            <div class="detail-item">
              <label><CalendarIcon :size="10" /> AGE</label>
              <span>{{ user.age || 'NOT RECORDED' }} YEARS</span>
            </div>
            <div class="detail-item">
              <label><UserIcon :size="10" /> GENDER</label>
              <span>{{ user.gender?.toUpperCase() || 'NOT RECORDED' }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="info-sidebar">
        <div class="status-item highlight">
          <label><LockIcon :size="10" /> ACCESS STATUS</label>
          <span class="value">AUTHORIZED</span>
        </div>
        
        <div class="status-item">
          <label><ActivityIcon :size="10" /> SYSTEM STATUS</label>
          <span class="value">OPERATIONAL</span>
        </div>

        <div class="status-item">
          <label><CpuIcon :size="10" /> NETWORK</label>
          <span class="value">ENCRYPTED GRID</span>
        </div>

        <!-- API Key Management -->
        <div class="status-item api-section">
          <ApiKeyManager />
        </div>

        <!-- Danger Zone -->
        <div class="status-item danger-zone">
          <label><Trash2Icon :size="10" /> DANGER ZONE</label>
          <div v-if="!confirmDeletion">
            <button @click="confirmDeletion = true" class="delete-btn-trigger">
              DELETE PROFILE
            </button>
          </div>
          <div v-else class="confirmation-box">
            <p>IRREVERSIBLE ACTION</p>
            <div class="confirm-actions">
              <button @click="handleDeleteAccount" class="delete-btn-confirm" :disabled="deleting">
                {{ deleting ? 'DELETING...' : 'CONFIRM' }}
              </button>
              <button @click="confirmDeletion = false" class="delete-btn-cancel" :disabled="deleting">
                CANCEL
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <footer class="system-footer">
      <div class="footer-line"></div>
      <div class="footer-content">
        <p>&copy; 2024 LUFACE SYSTEM • SECURE ACCESS ONLY</p>
        <div class="footer-icons">
          <GithubIcon :size="16" />
          <TwitterIcon :size="16" />
        </div>
      </div>
    </footer>
  </div>
  <div v-else-if="!isLoading" class="redirecting">
    <div class="spinner"></div>
    <span>Redirecting to login...</span>
  </div>
</template>

<script setup>
import { 
  User as UserIcon, 
  Mail as MailIcon, 
  ShieldCheck as ShieldCheckIcon,
  Fingerprint as FingerprintIcon,
  Calendar as CalendarIcon,
  Lock as LockIcon,
  Activity as ActivityIcon,
  Cpu as CpuIcon,
  Github as GithubIcon,
  Twitter as TwitterIcon,
  Trash2 as Trash2Icon,
  LogOut as LogOutIcon
} from 'lucide-vue-next';

const { user, isLoading, logout } = useAuth();
const isOnline = ref(true)
const confirmDeletion = ref(false)
const deleting = ref(false)

const handleDeleteAccount = async () => {
  deleting.value = true;
  try {
    await $fetch('/api/auth/me', { method: 'DELETE' });
    user.value = null;
    navigateTo('/login');
  } catch (e) {
    console.error('Failed to delete account:', e);
    alert('Failed to delete account. Please try again.');
    deleting.value = false;
    confirmDeletion.value = false;
  }
};

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
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
}

.user-profile-display {
  width: 100%;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--border-dim);
}

.avatar-placeholder {
  position: relative;
  width: 80px;
  height: 80px;
  min-width: 80px;
  background: linear-gradient(135deg, var(--accent-green), #00aadd);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 30px rgba(var(--accent-green-rgb), 0.2);
}

.avatar-overlay {
  position: absolute;
  bottom: -5px;
  right: -5px;
  background: var(--accent-green);
  border-radius: 50%;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid var(--card-black);
}

.initials {
  font-size: 2rem;
  font-weight: 800;
  color: #000;
}

.profile-info h2 {
  margin: 0;
  font-size: 1.75rem;
  letter-spacing: -0.02em;
}

.profile-info .email {
  color: var(--text-dim);
  margin: 4px 0 0;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 6px;
}

.inline-icon {
  opacity: 0.6;
}

.profile-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  background: var(--glass);
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid var(--border-dim);
}

.detail-item label {
  font-size: 0.6rem;
  color: var(--text-dim);
  font-weight: 700;
  letter-spacing: 0.1em;
  display: flex;
  align-items: center;
  gap: 6px;
}

.detail-item span {
  font-family: monospace;
  font-size: 0.95rem;
  word-break: break-all;
}

.glass-header {
  padding: 1.5rem 0;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: var(--text-dim);
  border-radius: 50%;
}

.status-dot.active {
  background: var(--accent-green);
  box-shadow: 0 0 15px var(--accent-green);
}

h1 {
  font-size: 1.25rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: 0.1em;
}

.accent { color: var(--accent-green); }

.user-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.username-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
}

.icon-dim { opacity: 0.5; }

.username {
  color: var(--text-dim);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.logout-btn {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-main);
  padding: 0.5rem 0.8rem;
  border-radius: 6px;
  font-size: 0.65rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.logout-btn:hover {
  border-color: #ff4444;
  color: #ff4444;
  background: rgba(255, 68, 68, 0.05);
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 1.5rem;
  flex: 1;
}

.luface-card {
  background: var(--card-black);
  border: 1px solid var(--border-dim);
  border-radius: 20px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  min-height: 400px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px var(--shadow-color);
}

.info-sidebar {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.status-item {
  background: var(--card-black);
  border: 1px solid var(--border-dim);
  padding: 1rem;
  border-radius: 12px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px var(--shadow-color);
}

.status-item.highlight {
  border-color: var(--accent-green);
  background: rgba(var(--accent-green-rgb), 0.02);
}

.status-item label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.6rem;
  color: var(--text-dim);
  margin-bottom: 4px;
  font-weight: 600;
}

.status-item .value {
  font-family: monospace;
  font-size: 0.85rem;
  color: var(--text-main);
}

.danger-zone {
  border-color: rgba(255, 68, 68, 0.2);
  margin-top: auto;
}

.delete-btn-trigger {
  width: 100%;
  background: transparent;
  border: 1px solid rgba(255, 68, 68, 0.3);
  color: #ff4444;
  padding: 0.6rem;
  border-radius: 8px;
  font-size: 0.65rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s;
}

.delete-btn-trigger:hover {
  background: rgba(255, 68, 68, 0.1);
  border-color: #ff4444;
}

.confirmation-box {
  text-align: center;
}

.confirmation-box p {
  color: #ff4444;
  font-size: 0.6rem;
  font-weight: 900;
  margin: 0.5rem 0;
  letter-spacing: 0.1em;
}

.confirm-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.delete-btn-confirm {
  flex: 1;
  background: #ff4444;
  color: #000;
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  font-size: 0.6rem;
  font-weight: 800;
  cursor: pointer;
}

.delete-btn-cancel {
  flex: 1;
  background: var(--glass);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  padding: 0.5rem;
  border-radius: 6px;
  font-size: 0.6rem;
  font-weight: 800;
  cursor: pointer;
}

.system-footer {
  margin-top: 3rem;
  padding-bottom: 1.5rem;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.footer-line {
  height: 1px;
  background: linear-gradient(90deg, var(--accent-green), transparent);
  margin-bottom: 1rem;
  opacity: 0.2;
}

.system-footer p {
  color: var(--text-dim);
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  margin: 0;
}

.footer-icons {
  display: flex;
  gap: 1rem;
  color: var(--text-dim);
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--border-color);
  border-top-color: var(--accent-green);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.redirecting {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  height: 100vh;
  color: var(--text-dim);
  font-size: 0.8rem;
}

@media (max-width: 900px) {
  .content-grid { grid-template-columns: 1fr; }
  .info-sidebar { 
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }
}

@media (max-width: 600px) {
  .app-container { padding: 1rem; }
  .profile-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  .profile-info .email { justify-content: center; }
  .logo-area h1 { font-size: 1.1rem; }
  .user-controls { width: 100%; justify-content: space-between; }
  .luface-card { padding: 1.5rem; }
  .profile-details { grid-template-columns: 1fr; }
}
</style>>