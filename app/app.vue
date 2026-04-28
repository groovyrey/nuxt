<template>
  <div class="min-h-screen app-container">
    <header class="glass-header">
      <div class="logo-area">
        <div class="status-dot" :class="{ 'active': isOnline }"></div>
        <h1>NEURAL<span class="accent">VISION</span></h1>
      </div>
      <p class="subtitle">Biometric Face Recognition Interface</p>
    </header>
    
    <main class="content-grid">
      <div class="vision-card">
        <ClientOnly>
          <FaceDetector @detected="handleDetection" />
          <template #fallback>
            <div class="loading-state">
              <div class="spinner"></div>
              <span>Initializing Neural Engine...</span>
            </div>
          </template>
        </ClientOnly>
      </div>

      <div class="info-sidebar">
        <div class="status-item highlight">
          <label>ANALYSIS</label>
          <span class="value" :class="{ 'scanning': !currentDetection }">
            {{ currentDetection ? 'TARGET IDENTIFIED' : 'SCANNING...' }}
          </span>
        </div>
        
        <div class="biometrics" v-if="currentDetection">
          <div class="status-item">
            <label>AGE EST.</label>
            <span class="value">{{ currentDetection.age }} YEARS</span>
          </div>
          <div class="status-item">
            <label>GENDER</label>
            <span class="value">{{ currentDetection.gender.toUpperCase() }} ({{ currentDetection.genderProbability }}%)</span>
          </div>
          <div class="status-item">
            <label>MOOD</label>
            <span class="value text-uppercase">{{ currentDetection.expression }}</span>
          </div>
        </div>

        <div class="status-item">
          <label>SYSTEM STATUS</label>
          <span class="value">OPERATIONAL</span>
        </div>
      </div>
    </main>

    <footer class="system-footer">
      <div class="footer-line"></div>
      <p>&copy; 2024 NEURAL VISION SYSTEM • SECURE ACCESS ONLY</p>
    </footer>
  </div>
</template>

<script setup>
const isOnline = ref(true)
const currentDetection = ref(null)

const handleDetection = (data) => {
  currentDetection.value = data
}
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

.min-h-screen { min-height: 100vh; }

.app-container {
  display: flex;
  flex-direction: column;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.glass-header {
  padding: 2rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 3rem;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #333;
  border-radius: 50%;
}

.status-dot.active {
  background: var(--accent-green);
  box-shadow: 0 0 15px var(--accent-green);
}

h1 {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: 0.1em;
}

.accent { color: var(--accent-green); }

.subtitle {
  color: var(--text-dim);
  font-size: 0.8rem;
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 2rem;
  flex: 1;
}

.vision-card {
  background: var(--card-black);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 500px;
  position: relative;
  overflow: hidden;
}

.info-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.biometrics {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border-left: 2px solid var(--accent-green);
  padding-left: 1rem;
  margin-bottom: 1rem;
}

.status-item {
  background: var(--card-black);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 1.2rem;
  border-radius: 16px;
  transition: all 0.3s ease;
}

.status-item.highlight {
  border-color: var(--accent-green);
}

.status-item label {
  display: block;
  font-size: 0.65rem;
  color: var(--text-dim);
  margin-bottom: 4px;
  font-weight: 600;
}

.status-item .value {
  font-family: monospace;
  font-size: 0.9rem;
  color: #fff;
}

.scanning {
  color: var(--accent-green) !important;
  animation: blink 1s infinite;
}

@keyframes blink {
  50% { opacity: 0.3; }
}

.text-uppercase { text-transform: uppercase; }

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: var(--text-dim);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-top-color: var(--accent-green);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.system-footer {
  margin-top: 4rem;
  padding-bottom: 2rem;
}

.footer-line {
  height: 1px;
  background: linear-gradient(90deg, var(--accent-green), transparent);
  margin-bottom: 1.5rem;
  opacity: 0.3;
}

.system-footer p {
  color: #444;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.1em;
}

@media (max-width: 900px) {
  .content-grid { grid-template-columns: 1fr; }
  .info-sidebar { order: 2; }
}

.text-xs { font-size: 0.7rem !important; }
</style>
