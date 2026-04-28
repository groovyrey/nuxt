<template>
  <NuxtPage />
</template>

<script setup>
const { fetchUser } = useAuth();

onMounted(() => {
  fetchUser();
});
</script>

<style>
:root {
  --bg-black: #050505;
  --card-black: #0c0c0c;
  --accent-green: #00ff88;
  --text-dim: #888;
  --glass: rgba(255, 255, 255, 0.03);
}

body {
  margin: 0;
  padding: 0;
  background-color: var(--bg-black);
  color: #fff;
  font-family: 'Inter', -apple-system, system-ui, sans-serif;
  letter-spacing: -0.02em;
  overflow-x: hidden;
}

.text-uppercase { text-transform: uppercase; }
</style>
