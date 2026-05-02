<template>
  <div v-if="user" class="app-container">
    <header class="page-header">
      <div class="header-main">
        <NuxtLink to="/" class="back-link">
          <ChevronLeftIcon :size="20" />
        </NuxtLink>
        <h1>API <span class="accent">MANAGEMENT</span></h1>
      </div>
      <p class="subtitle">Configure keys, monitoring, and webhooks.</p>
    </header>

    <main class="manager-card">
      <ApiKeyManager />
    </main>
  </div>
</template>

<script setup>
import { ChevronLeft as ChevronLeftIcon } from 'lucide-vue-next';
const { user, isLoading } = useAuth();

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
  gap: 1.25rem;
  margin-bottom: 0.5rem;
}

.back-link {
  color: var(--text-dim);
  display: flex;
  align-items: center;
  background: var(--glass);
  padding: 8px;
  border-radius: 10px;
  border: 1px solid var(--border-dim);
  transition: all 0.2s;
}

.back-link:hover {
  color: var(--accent-green);
  border-color: var(--accent-green);
  background: rgba(var(--accent-green-rgb), 0.05);
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

.manager-card {
  background: var(--bg-card);
  border: 1px solid var(--border-dim);
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 4px 24px var(--shadow-color);
}

@media (max-width: 600px) {
  .app-container { padding: 1.5rem 1rem; }
  .page-header h1 { font-size: 1.5rem; }
  .manager-card { padding: 1.5rem; border-radius: 12px; }
}
</style>

