<template>
  <div class="layout-wrapper">
    <Navbar v-if="showNavbar" />
    <slot />
    
    <footer v-if="showNavbar" class="app-footer">
      <div class="app-container">
        <div class="footer-content">
          <p>&copy; 2024 LUFACE • SECURE ACCESS</p>
          <div class="footer-links">
            <GithubIcon :size="14" />
            <TwitterIcon :size="14" />
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
  display: flex;
  flex-direction: column;
}

.app-footer {
  margin-top: auto;
  padding: 4rem 0 2rem;
  border-top: 1px solid var(--border-dim);
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.app-footer p {
  color: var(--text-dim);
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  margin: 0;
}

.footer-links {
  display: flex;
  gap: 1.25rem;
  color: var(--text-dim);
}
</style>

