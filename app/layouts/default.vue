<template>
  <div class="layout-wrapper">
    <Navbar v-if="showNavbar" />
    <slot />
    
    <footer v-if="showNavbar" class="system-footer">
      <div class="max-width-container">
        <div class="footer-line"></div>
        <div class="footer-content">
          <p>&copy; 2024 LUFACE SYSTEM • SECURE ACCESS ONLY</p>
          <div class="footer-icons">
            <GithubIcon :size="16" />
            <TwitterIcon :size="16" />
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { Github as GithubIcon, Twitter as TwitterIcon } from 'lucide-vue-next';
const route = useRoute();
const standaloneRoutes = ['/verify', '/setup-face', '/login', '/register'];
const showNavbar = computed(() => !standaloneRoutes.includes(route.path));
</script>

<style scoped>
.layout-wrapper {
  min-height: 100vh;
  background-color: var(--bg-app);
  color: var(--text-main);
  transition: background-color 0.3s ease, color 0.3s ease;
  display: flex;
  flex-direction: column;
}

.max-width-container {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 0 1.5rem;
  box-sizing: border-box;
}

.system-footer {
  margin-top: auto;
  padding: 3rem 0 1.5rem;
}

.footer-line {
  height: 1px;
  background: linear-gradient(90deg, var(--accent-green), transparent);
  margin-bottom: 1.5rem;
  opacity: 0.2;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
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
</style>
