<template>
  <nav class="navbar">
    <div class="nav-container">
      <NuxtLink to="/" class="nav-logo">
        <h1>LU<span class="accent">FACE</span></h1>
      </NuxtLink>

      <!-- Desktop -->
      <div class="nav-desktop">
        <NuxtLink to="/docs" class="nav-link">DOCS</NuxtLink>
        <template v-if="user">
          <NuxtLink to="/keys" class="nav-link">API KEYS</NuxtLink>
          <div class="divider"></div>
          <button @click="logout" class="logout-btn">
            <LogOutIcon :size="14" /> LOGOUT
          </button>
        </template>
        <template v-else>
          <NuxtLink to="/login" class="nav-link">LOGIN</NuxtLink>
          <NuxtLink to="/register" class="signup-btn">GET STARTED</NuxtLink>
        </template>
        <ThemeToggle />
      </div>

      <!-- Mobile -->
      <div class="nav-mobile">
        <ThemeToggle />
        <button @click="isMenuOpen = !isMenuOpen" class="menu-btn">
          <MenuIcon v-if="!isMenuOpen" :size="20" />
          <XIcon v-else :size="20" />
        </button>
      </div>
    </div>

    <!-- Mobile Menu Overlay -->
    <Transition name="fade">
      <div v-if="isMenuOpen" class="mobile-overlay" @click="isMenuOpen = false">
        <div class="mobile-content" @click.stop>
          <NuxtLink to="/docs" class="m-link">DOCS</NuxtLink>
          <template v-if="user">
            <NuxtLink to="/keys" class="m-link">API KEYS</NuxtLink>
            <button @click="handleLogout" class="m-logout">
              <LogOutIcon :size="16" /> LOGOUT
            </button>
          </template>
          <template v-else>
            <NuxtLink to="/login" class="m-link">LOGIN</NuxtLink>
            <NuxtLink to="/register" class="m-signup">GET STARTED</NuxtLink>
          </template>
        </div>
      </div>
    </Transition>
  </nav>
</template>

<script setup>
import { LogOut as LogOutIcon, Menu as MenuIcon, X as XIcon } from 'lucide-vue-next';
const { user, logout } = useAuth();
const isMenuOpen = ref(false);

const handleLogout = async () => {
  isMenuOpen.value = false;
  await logout();
};

const route = useRoute();
watch(() => route.path, () => isMenuOpen.value = false);
</script>

<style scoped>
.navbar {
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-dim);
  padding: 0.75rem 0;
  position: sticky;
  top: 0;
  z-index: 1000;
  backdrop-filter: blur(12px);
}

.nav-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-logo {
  text-decoration: none;
  color: inherit;
}

.nav-logo h1 {
  font-size: 1.1rem;
  margin: 0;
  letter-spacing: 0.1em;
}

.nav-desktop {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-link {
  text-decoration: none;
  color: var(--text-dim);
  font-size: 0.7rem;
  font-weight: 800;
  transition: color 0.2s;
}

.nav-link:hover, .router-link-active {
  color: var(--accent-green);
}

.divider {
  width: 1px;
  height: 16px;
  background: var(--border-dim);
}

.logout-btn {
  background: transparent;
  border: 1px solid var(--border-dim);
  color: var(--text-main);
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.65rem;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

.signup-btn {
  background: var(--accent-green);
  color: #000;
  text-decoration: none;
  font-size: 0.65rem;
  font-weight: 900;
  padding: 0.5rem 1rem;
  border-radius: 6px;
}

.nav-mobile {
  display: none;
  align-items: center;
  gap: 12px;
}

.menu-btn {
  background: transparent;
  border: none;
  color: var(--text-main);
  cursor: pointer;
  padding: 4px;
}

.mobile-overlay {
  position: fixed;
  inset: 60px 0 0 0;
  background: rgba(0,0,0,0.8);
  backdrop-filter: blur(8px);
  z-index: 999;
}

.mobile-content {
  background: var(--bg-card);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  border-bottom: 1px solid var(--border-dim);
}

.m-link {
  text-decoration: none;
  color: var(--text-main);
  font-size: 1.1rem;
  font-weight: 900;
}

.m-signup {
  background: var(--accent-green);
  color: #000;
  text-decoration: none;
  padding: 1rem;
  border-radius: 12px;
  text-align: center;
  font-weight: 900;
}

.m-logout {
  background: rgba(var(--error-red-rgb), 0.1);
  border: 1px solid rgba(var(--error-red-rgb), 0.2);
  color: var(--error-red);
  padding: 1rem;
  border-radius: 12px;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

@media (max-width: 850px) {
  .nav-desktop { display: none; }
  .nav-mobile { display: flex; }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

