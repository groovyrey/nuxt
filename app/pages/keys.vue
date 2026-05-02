<template>
  <div v-if="user" class="min-h-screen app-container">
    <div class="page-title-area">
      <div class="title-with-back">
        <NuxtLink to="/" class="back-link">
          <ChevronLeftIcon :size="20" />
        </NuxtLink>
        <h2>API <span class="accent">MANAGEMENT</span></h2>
      </div>
      <p class="subtitle">Configure your access keys, monitoring, and webhooks.</p>
    </div>

    <main class="keys-layout">
      <div class="manager-wrapper">
        <ApiKeyManager />
      </div>
    </main>
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
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
}

.page-title-area {
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-dim);
}

.title-with-back {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 0.5rem;
}

.back-link {
  color: var(--text-dim);
  display: flex;
  align-items: center;
  transition: color 0.2s;
  background: var(--glass);
  padding: 6px;
  border-radius: 8px;
  border: 1px solid var(--border-dim);
}

.back-link:hover {
  color: var(--accent-green);
  border-color: var(--accent-green);
  background: rgba(var(--accent-green-rgb), 0.05);
}

.page-title-area h2 {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.01em;
}

.subtitle {
  color: var(--text-dim);
  font-size: 0.85rem;
  margin: 0;
}

.keys-layout {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.manager-wrapper {
  background: var(--card-black);
  border: 1px solid var(--border-dim);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px var(--shadow-color);
}

@media (max-width: 600px) {
  .app-container {
    padding: 1rem;
  }
  
  .manager-wrapper {
    padding: 1.25rem;
    border-radius: 12px;
  }

  .page-title-area {
    margin-bottom: 1.5rem;
  }

  .page-title-area h2 {
    font-size: 1.25rem;
  }
}
</style>
