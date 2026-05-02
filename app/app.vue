<template>
  <Toaster position="top-center" :theme="theme" rich-colors />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
import { Toaster } from 'vue-sonner';
import 'vue-sonner/style.css';
const { fetchUser } = useAuth();
const { theme, initTheme } = useTheme();

onMounted(() => {
  fetchUser();
  initTheme();
});
</script>

<style>
:root {
  --bg-app: #050505;
  --bg-card: #0c0c0c;
  --accent-green: #00ff88;
  --accent-green-rgb: 0, 255, 136;
  --error-red: #ff4444;
  --error-red-rgb: 255, 68, 68;
  --text-main: #ffffff;
  --text-dim: #888;
  --border-color: rgba(255, 255, 255, 0.1);
  --border-dim: rgba(255, 255, 255, 0.05);
  --glass: rgba(255, 255, 255, 0.03);
  --shadow-color: rgba(0, 0, 0, 0.5);
}

:root.light-theme {
  --bg-app: #f5f5f7;
  --bg-card: #ffffff;
  --accent-green: #00a854;
  --accent-green-rgb: 0, 168, 84;
  --text-main: #1d1d1f;
  --text-dim: #86868b;
  --border-color: rgba(0, 0, 0, 0.1);
  --border-dim: rgba(0, 0, 0, 0.05);
  --glass: rgba(0, 0, 0, 0.02);
  --shadow-color: rgba(0, 0, 0, 0.05);
}

body {
  margin: 0;
  padding: 0;
  background-color: var(--bg-app);
  color: var(--text-main);
  font-family: 'Inter', -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.app-container {
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
  padding: 0 1.5rem;
  box-sizing: border-box;
}

.accent {
  color: var(--accent-green);
}

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Custom Sonner Styles */
[data-sonner-toast] {
  background: var(--bg-card) !important;
  border: 1px solid var(--border-color) !important;
  color: var(--text-main) !important;
  border-radius: 12px !important;
  box-shadow: 0 10px 40px var(--shadow-color) !important;
}

[data-sonner-toast][data-type='success'] { border-left: 4px solid var(--accent-green) !important; }
[data-sonner-toast][data-type='error'] { border-left: 4px solid var(--error-red) !important; }
</style>

