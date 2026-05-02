<template>
  <div class="app-container">
    <header class="about-hero">
      <div class="glow-orb"></div>
      <span class="badge">MISSION PROTOCOL</span>
      <h1>DECENTRALIZED <span class="accent">BIOMETRIC</span> INTELLIGENCE</h1>
      <p class="hero-subtitle">
        Luface is a high-performance, developer-first biometric infrastructure designed to secure the next generation of autonomous applications.
      </p>
    </header>

    <main class="about-grid">
      <!-- What is Luface -->
      <section class="info-card wide">
        <div class="card-content">
          <h2><ShieldCheckIcon :size="24" class="accent" /> THE CORE ARCHITECTURE</h2>
          <p>
            Unlike traditional facial recognition systems that store sensitive image data, Luface operates on <strong>Biometric Signatures</strong>. We convert facial geometry into 128-dimensional mathematical vectors—mathematical "maps" that can identify a user but never recreate their image.
          </p>
          <div class="tech-tags">
            <span class="tag">AES-256-GCM</span>
            <span class="tag">Neural Descriptors</span>
            <span class="tag">Zero-Image Storage</span>
          </div>
        </div>
      </section>

      <!-- Tech Stack -->
      <section class="info-card">
        <div class="card-content">
          <h3><CpuIcon :size="20" class="accent" /> THE ENGINE</h3>
          <p>Powered by <strong>SSD MobileNetV1</strong> neural networks for real-time edge detection and landmarks processing.</p>
        </div>
      </section>

      <section class="info-card">
        <div class="card-content">
          <h3><ZapIcon :size="20" class="accent" /> VECTOR SEARCH</h3>
          <p>Utilizing <strong>Milvus Cloud</strong> for sub-millisecond similarity matching across millions of biometric profiles.</p>
        </div>
      </section>

      <section class="info-card">
        <div class="card-content">
          <h3><DatabaseIcon :size="20" class="accent" /> EDGE DATA</h3>
          <p>Deployed on <strong>Turso (LibSQL)</strong> for global low-latency session management and developer identity storage.</p>
        </div>
      </section>

      <!-- Why Luface -->
      <section class="info-card wide highlight">
        <div class="card-content">
          <h2><LockIcon :size="24" class="accent" /> PRIVACY AS A SERVICE</h2>
          <div class="feature-list">
            <div class="feature">
              <strong>ANONYMOUS BY DESIGN</strong>
              <p>Biometrics are encrypted at the field level before hitting our clusters.</p>
            </div>
            <div class="feature">
              <strong>DEVELOPER AUTONOMY</strong>
              <p>Full control over matching thresholds and webhook orchestration.</p>
            </div>
            <div class="feature">
              <strong>AUDITABLE ACCESS</strong>
              <p>Every identify event is logged and visible in your console in real-time.</p>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer class="about-footer">
      <div class="cta-box">
        <h3>READY TO SECURE YOUR APP?</h3>
        <div class="cta-actions">
          <NuxtLink to="/register" class="btn-primary">GET API ACCESS</NuxtLink>
          <NuxtLink to="/docs" class="btn-secondary">READ THE SPECS</NuxtLink>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { 
  ShieldCheck as ShieldCheckIcon, 
  Cpu as CpuIcon, 
  Zap as ZapIcon, 
  Database as DatabaseIcon,
  Lock as LockIcon,
  Fingerprint as FingerprintIcon
} from 'lucide-vue-next';

useHead({
  title: 'About - Luface Biometric Intelligence',
  meta: [
    { name: 'description', content: 'Learn about the technology and mission behind Luface.' }
  ]
});
</script>

<style scoped>
.app-container {
  padding: 4rem 1.5rem;
  max-width: 1000px;
  margin: 0 auto;
  min-height: 90vh;
}

.about-hero {
  text-align: center;
  margin-bottom: 5rem;
  position: relative;
}

.glow-orb {
  position: absolute;
  top: -50%;
  left: 50%;
  transform: translateX(-50%);
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(var(--accent-green-rgb), 0.15) 0%, transparent 70%);
  z-index: -1;
  pointer-events: none;
}

.badge {
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  color: var(--accent-green);
  border: 1px solid rgba(var(--accent-green-rgb), 0.3);
  padding: 4px 12px;
  border-radius: 20px;
  background: rgba(var(--accent-green-rgb), 0.05);
  text-transform: uppercase;
}

.about-hero h1 {
  font-size: 3rem;
  font-weight: 900;
  margin: 1.5rem 0 1rem;
  letter-spacing: -0.03em;
  line-height: 1.1;
}

.hero-subtitle {
  color: var(--text-dim);
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.about-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.info-card {
  background: var(--bg-card);
  border: 1px solid var(--border-dim);
  border-radius: 20px;
  padding: 2rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.info-card:hover {
  border-color: rgba(var(--accent-green-rgb), 0.4);
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
}

.info-card.wide {
  grid-column: span 3;
}

.info-card h2 {
  font-size: 1.25rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 12px;
  letter-spacing: 0.05em;
}

.info-card h3 {
  font-size: 0.9rem;
  font-weight: 800;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 10px;
  letter-spacing: 0.05em;
}

.info-card p {
  color: var(--text-dim);
  line-height: 1.7;
  font-size: 0.9rem;
  margin: 0;
}

.tech-tags {
  display: flex;
  gap: 8px;
  margin-top: 1.5rem;
}

.tag {
  font-size: 0.6rem;
  font-weight: 700;
  background: rgba(255,255,255,0.05);
  padding: 4px 10px;
  border-radius: 4px;
  color: var(--text-dim);
}

.info-card.highlight {
  background: linear-gradient(145deg, var(--bg-card) 0%, rgba(var(--accent-green-rgb), 0.03) 100%);
  border-color: rgba(var(--accent-green-rgb), 0.2);
}

.feature-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-top: 1rem;
}

.feature strong {
  display: block;
  font-size: 0.7rem;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
  color: var(--text-main);
}

.about-footer {
  margin-top: 6rem;
  text-align: center;
}

.cta-box {
  background: var(--glass);
  border: 1px solid var(--border-dim);
  padding: 3rem;
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.cta-box h3 {
  font-size: 1.5rem;
  font-weight: 900;
  margin: 0;
}

.cta-actions {
  display: flex;
  gap: 1rem;
}

.btn-primary {
  background: var(--accent-green);
  color: #000;
  text-decoration: none;
  font-weight: 900;
  padding: 0.8rem 2rem;
  border-radius: 10px;
  font-size: 0.8rem;
  transition: all 0.2s;
}

.btn-secondary {
  background: transparent;
  border: 1px solid var(--border-dim);
  color: var(--text-main);
  text-decoration: none;
  font-weight: 800;
  padding: 0.8rem 2rem;
  border-radius: 10px;
  font-size: 0.8rem;
  transition: all 0.2s;
}

.btn-primary:hover {
  box-shadow: 0 0 30px rgba(var(--accent-green-rgb), 0.4);
  transform: translateY(-2px);
}

.btn-secondary:hover {
  background: var(--border-dim);
}

@media (max-width: 850px) {
  .about-hero h1 { font-size: 2.2rem; }
  .about-grid { grid-template-columns: 1fr; }
  .info-card.wide { grid-column: span 1; }
  .feature-list { grid-template-columns: 1fr; gap: 1.5rem; }
  .cta-box { padding: 2rem; }
  .cta-actions { flex-direction: column; width: 100%; }
}
</style>
