<template>
  <div v-if="user" class="app-container">
    <header class="page-header">
      <div class="header-main">
        <div class="status-indicator">
          <div class="status-dot" :class="{ 'active': isOnline }"></div>
          <span class="status-text">{{ isOnline ? 'SYSTEM ACTIVE' : 'SYSTEM OFFLINE' }}</span>
        </div>
        <h1>OPERATOR <span class="accent">DASHBOARD</span></h1>
      </div>
      <p class="subtitle">Secure biometric interface • {{ user.username.toUpperCase() }}</p>
    </header>
    
    <main class="dashboard-grid">
      <section class="main-card">
        <div class="profile-summary">
          <div class="profile-header">
            <div class="avatar-box">
              <span class="initials">{{ user.username.charAt(0).toUpperCase() }}</span>
              <ShieldCheckIcon class="shield-overlay" :size="24" />
            </div>
            <div class="profile-info">
              <h2>{{ user.username }}</h2>
              <p class="email">{{ user.email }}</p>
            </div>
          </div>
          
          <div class="profile-stats">
            <div class="stat-box">
              <label><FingerprintIcon :size="12" /> BIO-ID</label>
              <span class="value">{{ user.username.toUpperCase() }}-NX</span>
            </div>
            <div class="stat-box">
              <label><CalendarIcon :size="12" /> AGE</label>
              <span class="value">{{ user.age || '—' }}</span>
            </div>
            <div class="stat-box">
              <label><UserIcon :size="12" /> GENDER</label>
              <span class="value">{{ user.gender?.toUpperCase() || '—' }}</span>
            </div>
          </div>
        </div>
      </section>

      <aside class="sidebar-info">
        <div class="info-card highlight">
          <label><LockIcon :size="12" /> STATUS</label>
          <span class="status-badge">AUTHORIZED</span>
        </div>
        
        <div class="info-card">
          <label><ActivityIcon :size="12" /> SYSTEM</label>
          <span class="value">OPERATIONAL</span>
        </div>

        <div class="info-card api-card">
          <div class="card-content">
            <label><KeyIcon :size="12" /> API ACCESS</label>
            <p>Manage keys and webhooks.</p>
          </div>
          <NuxtLink to="/keys" class="action-btn">
            MANAGE <ArrowRightIcon :size="14" />
          </NuxtLink>
        </div>

        <div class="info-card danger-card">
          <label><Trash2Icon :size="12" /> DANGER ZONE</label>
          <div v-if="!confirmDeletion">
            <button @click="confirmDeletion = true" class="text-btn">DELETE PROFILE</button>
          </div>
          <div v-else class="confirm-group">
            <button @click="handleDeleteAccount" class="confirm-btn" :disabled="deleting">
              {{ deleting ? '...' : 'CONFIRM' }}
            </button>
            <button @click="confirmDeletion = false" class="cancel-btn" :disabled="deleting">CANCEL</button>
          </div>
        </div>
      </aside>
    </main>
  </div>
  <div v-else-if="!isLoading" class="loading-overlay">
    <div class="loader"></div>
  </div>
</template>

<script setup>
import { 
  User as UserIcon, 
  ShieldCheck as ShieldCheckIcon,
  Fingerprint as FingerprintIcon,
  Calendar as CalendarIcon,
  Lock as LockIcon,
  Activity as ActivityIcon,
  Trash2 as Trash2Icon,
  Key as KeyIcon,
  ArrowRight as ArrowRightIcon
} from 'lucide-vue-next';

const { user, isLoading } = useAuth();
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
  padding: 2rem 1.5rem;
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
}

.page-header {
  margin-bottom: 3rem;
}

.header-main {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--glass);
  padding: 4px 12px;
  border-radius: 20px;
  border: 1px solid var(--border-dim);
}

.status-dot {
  width: 8px;
  height: 8px;
  background: var(--text-dim);
  border-radius: 50%;
}

.status-dot.active {
  background: var(--accent-green);
  box-shadow: 0 0 10px var(--accent-green);
}

.status-text {
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: var(--text-dim);
}

.page-header h1 {
  font-size: 1.75rem;
  font-weight: 900;
  margin: 0;
  letter-spacing: -0.02em;
}

.subtitle {
  color: var(--text-dim);
  font-size: 0.9rem;
  margin: 0;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
}

.main-card {
  background: var(--bg-card);
  border: 1px solid var(--border-dim);
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 4px 24px var(--shadow-color);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.avatar-box {
  width: 80px;
  height: 80px;
  background: var(--accent-green);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.initials {
  font-size: 2rem;
  font-weight: 900;
  color: #000;
}

.shield-overlay {
  position: absolute;
  bottom: -8px;
  right: -8px;
  background: var(--bg-card);
  padding: 4px;
  border-radius: 8px;
  color: var(--accent-green);
  border: 1px solid var(--border-dim);
}

.profile-info h2 {
  font-size: 1.5rem;
  margin: 0 0 4px;
}

.profile-info .email {
  color: var(--text-dim);
  font-size: 0.9rem;
  margin: 0;
}

.profile-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1.5rem;
}

.stat-box {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat-box label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.65rem;
  font-weight: 800;
  color: var(--text-dim);
  letter-spacing: 0.05em;
}

.stat-box .value {
  font-size: 1.1rem;
  font-weight: 700;
}

.sidebar-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-card {
  background: var(--bg-card);
  border: 1px solid var(--border-dim);
  padding: 1.25rem;
  border-radius: 12px;
}

.info-card.highlight {
  border-color: var(--accent-green);
  background: rgba(var(--accent-green-rgb), 0.02);
}

.info-card label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.6rem;
  font-weight: 800;
  color: var(--text-dim);
  margin-bottom: 8px;
}

.status-badge {
  font-size: 0.75rem;
  font-weight: 900;
  color: var(--accent-green);
}

.info-card .value {
  font-size: 0.85rem;
  font-weight: 700;
}

.api-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.api-card p {
  font-size: 0.75rem;
  color: var(--text-dim);
  margin: 0;
}

.action-btn {
  background: var(--glass);
  border: 1px solid var(--border-dim);
  color: var(--text-main);
  text-decoration: none;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  transition: all 0.2s;
}

.action-btn:hover {
  background: var(--border-dim);
  border-color: var(--accent-green);
  color: var(--accent-green);
}

.danger-card {
  margin-top: auto;
  border-color: rgba(var(--error-red-rgb), 0.2);
}

.text-btn {
  background: transparent;
  border: none;
  color: var(--error-red);
  font-size: 0.65rem;
  font-weight: 800;
  cursor: pointer;
  padding: 0;
  opacity: 0.7;
}

.text-btn:hover { opacity: 1; }

.confirm-group {
  display: flex;
  gap: 8px;
}

.confirm-btn {
  flex: 1;
  background: var(--error-red);
  color: #000;
  border: none;
  padding: 0.4rem;
  border-radius: 4px;
  font-size: 0.6rem;
  font-weight: 900;
  cursor: pointer;
}

.cancel-btn {
  flex: 1;
  background: var(--glass);
  color: var(--text-main);
  border: 1px solid var(--border-dim);
  padding: 0.4rem;
  border-radius: 4px;
  font-size: 0.6rem;
  font-weight: 900;
  cursor: pointer;
}

.loading-overlay {
  height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loader {
  width: 24px;
  height: 24px;
  border: 2px solid var(--border-dim);
  border-top-color: var(--accent-green);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 900px) {
  .dashboard-grid { grid-template-columns: 1fr; }
  .sidebar-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  }
  .danger-card { margin-top: 0; }
}

@media (max-width: 600px) {
  .app-container { padding: 1.5rem 1rem; }
  .page-header h1 { font-size: 1.5rem; }
  .main-card { padding: 1.5rem; }
  .profile-header { margin-bottom: 2rem; }
  .avatar-box { width: 64px; height: 64px; }
  .initials { font-size: 1.5rem; }
  .sidebar-info { grid-template-columns: 1fr; }
}
</style>