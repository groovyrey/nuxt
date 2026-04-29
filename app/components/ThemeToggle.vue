<template>
  <button @click="toggleTheme" class="theme-toggle" :title="'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' mode'">
    <SunIcon v-if="theme === 'dark'" :size="20" />
    <MoonIcon v-else :size="20" />
  </button>
</template>

<script setup>
import { Sun as SunIcon, Moon as MoonIcon } from 'lucide-vue-next';
const { theme, toggleTheme } = useTheme();
</script>

<style scoped>
.theme-toggle {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 1000;
  background: var(--glass);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(8px);
}

.theme-toggle:hover {
  background: rgba(var(--accent-green-rgb), 0.1);
  border-color: var(--accent-green);
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.theme-toggle:active {
  transform: translateY(0);
}
</style>
