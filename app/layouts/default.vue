<template>
  <div class="layout-wrapper">
    <Navbar v-if="showNavbar" />
    <slot />
  </div>
</template>

<script setup>
const route = useRoute();
const standaloneRoutes = ['/verify', '/setup-face'];
const showNavbar = computed(() => !standaloneRoutes.includes(route.path));
</script>

<style scoped>
.layout-wrapper {
  min-height: 100vh;
  background-color: var(--bg-app);
  color: var(--text-main);
  transition: background-color 0.3s ease, color 0.3s ease;
}
</style>
