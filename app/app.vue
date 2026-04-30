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

/* Custom Sonner Styles */
[data-sonner-toast] {
  background: var(--bg-card) !important;
  border: 1px solid var(--border-color) !important;
  color: var(--text-main) !important;
  font-family: 'Inter', sans-serif !important;
  backdrop-filter: blur(16px) saturate(180%);
  border-radius: 12px !important;
  padding: 14px 16px !important;
  box-shadow: 0 10px 40px var(--shadow-color) !important;
  overflow: hidden;
}

/* Pseudo-element for a subtle tech-line at the top */
[data-sonner-toast]::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border-color), transparent);
  opacity: 0.5;
}

[data-sonner-toast] [data-title] {
  font-family: 'Inter', sans-serif !important;
  font-weight: 700 !important;
  letter-spacing: -0.02em !important;
  font-size: 0.9rem !important;
  margin-bottom: 2px !important;
}

[data-sonner-toast] [data-description] {
  font-size: 0.75rem !important;
  color: var(--text-dim) !important;
  line-height: 1.5 !important;
  font-weight: 400 !important;
}

/* Success State */
[data-sonner-toast][data-type='success'] {
  border-bottom: 2px solid var(--accent-green) !important;
}

[data-sonner-toast][data-type='success'] [data-icon] {
  color: var(--accent-green) !important;
}

/* Error State */
[data-sonner-toast][data-type='error'] {
  border-bottom: 2px solid #ff4444 !important;
}

[data-sonner-toast][data-type='error'] [data-icon] {
  color: #ff4444 !important;
}

/* Theme specific overrides */
:root.light-theme [data-sonner-toast] {
  background: rgba(255, 255, 255, 0.85) !important;
  border: 1px solid rgba(0, 0, 0, 0.05) !important;
}

:root:not(.light-theme) [data-sonner-toast] {
  background: rgba(10, 10, 10, 0.8) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

/* Close button styling */
[data-sonner-toast] [data-close-button] {
  background: var(--bg-app) !important;
  border: 1px solid var(--border-color) !important;
  color: var(--text-main) !important;
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
