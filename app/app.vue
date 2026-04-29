<template>
  <Toaster position="top-center" :theme="theme" rich-colors />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
import { Toaster } from 'vue-sonner';
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
  --text-dim: #888;
  --glass: rgba(255, 255, 255, 0.03);
  --text-main: #ffffff;
  --border-color: rgba(255, 255, 255, 0.1);
  --border-dim: rgba(255, 255, 255, 0.05);
  --bg-black: #050505;
  --card-black: #0c0c0c;
  --shadow-color: rgba(0, 0, 0, 0.5);
  --input-bg: rgba(255, 255, 255, 0.03);
}

:root.light-theme {
  --bg-app: #f0f2f5;
  --bg-card: #ffffff;
  --accent-green: #00a854;
  --accent-green-rgb: 0, 168, 84;
  --text-dim: #666;
  --glass: rgba(0, 0, 0, 0.03);
  --text-main: #1a1a1a;
  --border-color: rgba(0, 0, 0, 0.1);
  --border-dim: rgba(0, 0, 0, 0.05);
  --bg-black: #f0f2f5;
  --card-black: #ffffff;
  --shadow-color: rgba(0, 0, 0, 0.05);
  --input-bg: #f9f9f9;
}

body {
  margin: 0;
  padding: 0;
  background-color: var(--bg-app);
  color: var(--text-main);
  font-family: 'Inter', -apple-system, system-ui, sans-serif;
  letter-spacing: -0.02em;
  overflow-x: hidden;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.text-uppercase { text-transform: uppercase; }
</style>
