<template>
  <div v-if="user" class="min-h-screen app-container">
    <header class="glass-header">
      <div class="logo-area">
        <NuxtLink to="/" class="back-link">
          <ChevronLeftIcon :size="20" />
        </NuxtLink>
        <h1>DEVELOPER <span class="accent">PORTAL</span></h1>
      </div>
      <div class="user-controls">
        <span class="username-wrapper">
          <UserIcon :size="14" class="icon-dim" />
          <span class="username">{{ user.username }}</span>
        </span>
      </div>
    </header>

    <main class="keys-layout">
      <div class="page-title">
        <h2>API MANAGEMENT</h2>
        <p>Configure your access keys, monitoring, and webhooks.</p>
      </div>

      <div class="manager-wrapper">
        <ApiKeyManager />
      </div>
    </main>

    <footer class="system-footer">
      <div class="footer-line"></div>
      <div class="footer-content">
        <p>&copy; 2024 LUFACE SYSTEM • SECURE ACCESS ONLY</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { 
  User as UserIcon,
  ChevronLeft as ChevronLeftIcon
} from 'lucide-vue-next';

const { user, isLoading } = useAuth();

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
  max-width: 1000px;
  margin: 0 auto;
  min-height: 100vh;
}

.glass-header {
  padding: 1.5rem 0;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 2.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 15px;
}

.back-link {
  color: var(--text-dim);
  display: flex;
  align-items: center;
  transition: color 0.2s;
}

.back-link:hover {
  color: var(--accent-green);
}

h1 {
  font-size: 1.1rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: 0.1em;
}

.accent { color: var(--accent-green); }

.user-controls {
  display: flex;
  align-items: center;
}

.username {
  color: var(--text-dim);
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 6px;
}

.keys-layout {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.page-title h2 {
  font-size: 1.5rem;
  margin: 0 0 0.5rem 0;
}

.page-title p {
  color: var(--text-dim);
  font-size: 0.85rem;
  margin: 0;
}

.manager-wrapper {
  background: var(--card-black);
  border: 1px solid var(--border-dim);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px var(--shadow-color);
}

.system-footer {
  margin-top: 4rem;
  padding-bottom: 1.5rem;
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
  text-align: center;
}
</style>
