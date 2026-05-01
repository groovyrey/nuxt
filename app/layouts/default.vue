<template>
  <div class="layout-wrapper">
    <Navbar />
    <slot />
  </div>
</template>

<style scoped>
.layout-wrapper {
  min-height: 100vh;
  background-color: var(--bg-app);
  color: var(--text-main);
  transition: background-color 0.3s ease, color 0.3s ease;
}
</style>
