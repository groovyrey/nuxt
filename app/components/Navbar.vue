<template>
  <nav class="navbar">
    <div class="nav-container">
      <NuxtLink to="/" class="nav-logo">
        <h1>LU<span class="accent">FACE</span></h1>
      </NuxtLink>

      <!-- Desktop Links -->
      <div class="nav-links desktop-only">
        <NuxtLink to="/docs" class="nav-item" active-class="active">DOCS</NuxtLink>
        <template v-if="user">
          <NuxtLink to="/" class="nav-item" active-class="active">DASHBOARD</NuxtLink>
          <div class="nav-divider"></div>
          <div class="user-menu">
            <span class="nav-username">{{ user.username }}</span>
            <button @click="logout" class="nav-logout">
              <LogOutIcon :size="14" />
              <span>LOGOUT</span>
            </button>
          </div>
        </template>
        <template v-else>
          <NuxtLink to="/login" class="nav-item" active-class="active">LOGIN</NuxtLink>
          <NuxtLink to="/register" class="nav-btn">GET STARTED</NuxtLink>
        </template>
        <ThemeToggle />
      </div>

      <!-- Mobile Menu Toggle -->
      <div class="mobile-controls">
        <ThemeToggle />
        <button @click="isMenuOpen = !isMenuOpen" class="menu-toggle">
          <MenuIcon :size="20" />
        </button>
      </div>
    </div>
  </nav>

  <!-- Mobile Sidebar Backdrop -->
  <Transition name="fade">
    <div v-if="isMenuOpen" class="mobile-backdrop" @click="isMenuOpen = false"></div>
  </Transition>

  <!-- Mobile Sidebar -->
  <Transition name="slide">
    <div v-if="isMenuOpen" class="mobile-menu">
      <button @click="isMenuOpen = false" class="mobile-close-btn">
        <XIcon :size="24" />
      </button>
      <div class="mobile-menu-content">
        <NuxtLink to="/docs" class="mobile-nav-item" @click="isMenuOpen = false">DOCS</NuxtLink>
        
        <template v-if="user">
          <NuxtLink to="/" class="mobile-nav-item" @click="isMenuOpen = false">DASHBOARD</NuxtLink>
          <div class="mobile-user-info">
            <span class="mobile-username">SIGNED IN AS: {{ user.username }}</span>
            <button @click="handleLogout" class="mobile-logout-btn">
              <LogOutIcon :size="16" />
              LOGOUT
            </button>
          </div>
        </template>
        
        <template v-else>
          <NuxtLink to="/login" class="mobile-nav-item" @click="isMenuOpen = false">LOGIN</NuxtLink>
          <NuxtLink to="/register" class="mobile-nav-btn" @click="isMenuOpen = false">GET STARTED</NuxtLink>
        </template>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { 
  LogOut as LogOutIcon, 
  Menu as MenuIcon, 
  X as XIcon 
} from 'lucide-vue-next';

const { user, logout } = useAuth();
const isMenuOpen = ref(false);

const handleLogout = async () => {
  isMenuOpen.value = false;
  await logout();
};

// Close menu on route change
const route = useRoute();
watch(() => route.path, () => {
  isMenuOpen.value = false;
});
</script>

<style scoped>
.navbar {
  background: var(--card-black);
  border-bottom: 1px solid var(--border-color);
  padding: 0.75rem 1.5rem;
  position: sticky;
  top: 0;
  z-index: 1000;
  backdrop-filter: blur(12px);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-logo {
  text-decoration: none;
  color: inherit;
  z-index: 1001;
}

.nav-logo h1 {
  font-size: 1.1rem;
  margin: 0;
  letter-spacing: 0.1em;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-item {
  text-decoration: none;
  color: var(--text-dim);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  transition: color 0.2s;
}

.nav-item:hover, .nav-item.active {
  color: var(--accent-green);
}

.nav-divider {
  width: 1px;
  height: 16px;
  background: var(--border-color);
}

.nav-btn {
  background: var(--accent-green);
  color: var(--bg-black);
  text-decoration: none;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  letter-spacing: 0.05em;
  transition: transform 0.2s;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-username {
  font-size: 0.7rem;
  color: var(--text-dim);
  font-weight: 600;
}

.nav-logout {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-main);
  padding: 0.4rem 0.7rem;
  border-radius: 4px;
  font-size: 0.6rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

.mobile-controls {
  display: none;
  align-items: center;
  gap: 10px;
}

.menu-toggle {
  background: transparent;
  border: none;
  color: var(--text-main);
  cursor: pointer;
  padding: 5px;
}

.mobile-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 2000;
}

.mobile-menu {
  position: fixed;
  top: 0;
  right: 0;
  width: 280px;
  height: 100vh;
  background: var(--card-black);
  border-left: 1px solid var(--border-color);
  padding: 2rem;
  padding-top: 5rem;
  z-index: 2001;
  box-shadow: -20px 0 60px rgba(0,0,0,0.5);
}

.mobile-close-btn {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  background: var(--glass);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.mobile-menu-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.mobile-nav-item {
  text-decoration: none;
  color: var(--text-main);
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: 0.05em;
}

.mobile-nav-btn {
  background: var(--accent-green);
  color: var(--bg-black);
  text-decoration: none;
  padding: 1rem;
  border-radius: 10px;
  text-align: center;
  font-weight: 900;
  font-size: 0.9rem;
  margin-top: 1rem;
}

.mobile-user-info {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.mobile-username {
  font-size: 0.65rem;
  color: var(--text-dim);
  font-weight: 800;
  letter-spacing: 0.1em;
}

.mobile-logout-btn {
  background: rgba(255, 68, 68, 0.1);
  border: 1px solid rgba(255, 68, 68, 0.2);
  color: #ff4444;
  padding: 0.8rem;
  border-radius: 8px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
}

@media (max-width: 850px) {
  .desktop-only { display: none; }
  .mobile-controls { display: flex; }
}

/* Transitions */
.slide-enter-active, .slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-enter-from, .slide-leave-to {
  transform: translateX(100%);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
