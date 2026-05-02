<template>
  <div class="about-page">
    <section class="hero-shell">
      <div class="hero-copy">
        <span class="eyebrow">BIOMETRIC INFRASTRUCTURE FOR BUILDERS</span>
        <h1>LU<span class="accent">FACE</span></h1>
        <p class="hero-subtitle">
          Face authentication that feels instant to users and operationally clear to teams. Luface turns facial geometry into encrypted vectors, then gives developers the APIs, hosted flows, and audit trails needed to ship identity checks with confidence.
        </p>
        <div class="hero-actions">
          <NuxtLink to="/register" class="btn-primary">
            START BUILDING <ArrowRightIcon :size="16" />
          </NuxtLink>
          <NuxtLink to="/docs" class="btn-secondary">
            VIEW DOCS <BookOpenIcon :size="16" />
          </NuxtLink>
        </div>
      </div>

      <div class="identity-panel" aria-hidden="true">
        <div class="panel-topline">
          <span>LIVE IDENTITY CHECK</span>
          <span class="signal">READY</span>
        </div>
        <div class="face-stage">
          <div class="scan-frame">
            <div class="corner corner-tl"></div>
            <div class="corner corner-tr"></div>
            <div class="corner corner-bl"></div>
            <div class="corner corner-br"></div>
            <FingerprintIcon class="face-mark" :size="86" />
            <div class="scan-line"></div>
            <span class="point point-a"></span>
            <span class="point point-b"></span>
            <span class="point point-c"></span>
            <span class="point point-d"></span>
          </div>
        </div>
        <div class="vector-strip">
          <span v-for="item in vectorRows" :key="item" :style="{ '--delay': `${item * 0.08}s` }"></span>
        </div>
        <div class="panel-metrics">
          <div>
            <strong>128D</strong>
            <span>VECTOR MAP</span>
          </div>
          <div>
            <strong>0</strong>
            <span>RAW IMAGES</span>
          </div>
          <div>
            <strong>AES</strong>
            <span>FIELD LOCK</span>
          </div>
        </div>
      </div>
    </section>

    <main class="content-stack">
      <section class="statement-band reveal-section">
        <span class="section-kicker">WHY IT EXISTS</span>
        <h2>Passwords prove what someone knows. Luface helps prove who is present.</h2>
        <p>
          Modern products need identity checks that are fast enough for daily use and strict enough for sensitive workflows. Luface focuses on the hard middle ground: developer-friendly integration, privacy-aware biometric handling, and enough operational visibility to trust what happened after every verification.
        </p>
      </section>

      <section class="feature-grid">
        <article class="info-card reveal-section">
          <ShieldCheckIcon :size="22" />
          <h3>Private By Construction</h3>
          <p>Descriptors are stored as encrypted mathematical signatures, not customer profile photos. The system is built around verification signals rather than image retention.</p>
        </article>
        <article class="info-card reveal-section">
          <WorkflowIcon :size="22" />
          <h3>Hosted Or Headless</h3>
          <p>Use the hosted setup and verification screens for fast rollout, or call the REST API directly when your product owns the capture experience.</p>
        </article>
        <article class="info-card reveal-section">
          <ActivityIcon :size="22" />
          <h3>Operational Evidence</h3>
          <p>API keys, webhook events, and audit trails make biometric checks observable. Teams can see which systems acted, when they acted, and what result was produced.</p>
        </article>
      </section>

      <section class="architecture-section reveal-section">
        <div class="section-copy">
          <span class="section-kicker">HOW IT WORKS</span>
          <h2>A clean pipeline from camera intent to application decision.</h2>
          <p>
            Luface separates user experience from biometric infrastructure. Your application requests enrollment or verification, Luface handles the sensitive identity workflow, and your product receives a simple result through redirects, API responses, or webhooks.
          </p>
        </div>
        <div class="pipeline">
          <div v-for="step in pipelineSteps" :key="step.title" class="pipeline-step">
            <component :is="step.icon" :size="20" />
            <div>
              <strong>{{ step.title }}</strong>
              <span>{{ step.text }}</span>
            </div>
          </div>
        </div>
      </section>

      <section class="detail-grid">
        <article class="detail-panel reveal-section">
          <span class="section-kicker">SECURITY MODEL</span>
          <h3>Built to reduce biometric blast radius.</h3>
          <ul>
            <li>Field-level encryption protects stored descriptors.</li>
            <li>API keys scope server access to registered applications.</li>
            <li>Threshold-based matching keeps verification decisions tunable.</li>
            <li>Webhook delivery lets teams respond immediately to identity events.</li>
          </ul>
        </article>
        <article class="detail-panel reveal-section">
          <span class="section-kicker">DEVELOPER EXPERIENCE</span>
          <h3>Integration paths for real product timelines.</h3>
          <ul>
            <li>Redirect users into hosted enrollment or verification.</li>
            <li>Call server-to-server identify endpoints for custom flows.</li>
            <li>Manage API keys and webhook destinations from the dashboard.</li>
            <li>Use clear docs and examples to avoid stitching the basics together.</li>
          </ul>
        </article>
      </section>

      <section class="metrics-band reveal-section">
        <div class="metric">
          <strong>Edge Ready</strong>
          <span>Optimized client-side face processing for responsive flows.</span>
        </div>
        <div class="metric">
          <strong>Vector Native</strong>
          <span>Similarity search designed for biometric descriptor matching.</span>
        </div>
        <div class="metric">
          <strong>Audit First</strong>
          <span>Events and usage trails made visible from day one.</span>
        </div>
      </section>
    </main>

    <footer class="about-footer reveal-section">
      <div>
        <span class="section-kicker">THE PROMISE</span>
        <h2>Identity checks should be calm, fast, and accountable.</h2>
        <p>Luface gives teams the biometric layer without forcing them to become biometric infrastructure teams.</p>
      </div>
      <NuxtLink to="/register" class="btn-primary">
        GET API ACCESS <ArrowRightIcon :size="16" />
      </NuxtLink>
    </footer>
  </div>
</template>

<script setup>
import {
  Activity as ActivityIcon,
  ArrowRight as ArrowRightIcon,
  BookOpen as BookOpenIcon,
  Camera as CameraIcon,
  Cpu as CpuIcon,
  Database as DatabaseIcon,
  Fingerprint as FingerprintIcon,
  KeyRound as KeyRoundIcon,
  ShieldCheck as ShieldCheckIcon,
  Webhook as WebhookIcon,
  Workflow as WorkflowIcon
} from 'lucide-vue-next';

const vectorRows = Array.from({ length: 28 }, (_, index) => index);

const pipelineSteps = [
  {
    title: 'Capture Intent',
    text: 'Your app starts enrollment or verification with an API key and user context.',
    icon: CameraIcon
  },
  {
    title: 'Descriptor Processing',
    text: 'The face is converted into a compact vector signature for matching.',
    icon: CpuIcon
  },
  {
    title: 'Encrypted Storage',
    text: 'Biometric signatures and app records are protected before persistence.',
    icon: DatabaseIcon
  },
  {
    title: 'Decision Delivery',
    text: 'Redirects, API responses, and webhooks return the result to your product.',
    icon: WebhookIcon
  },
  {
    title: 'Access Control',
    text: 'Keys and audit records keep production usage traceable.',
    icon: KeyRoundIcon
  }
];

useHead({
  title: 'About - Luface Biometric Infrastructure',
  meta: [
    {
      name: 'description',
      content: 'Learn how Luface provides privacy-aware face authentication, hosted biometric flows, REST APIs, webhooks, and audit-ready identity infrastructure.'
    }
  ]
});
</script>

<style scoped>
.about-page {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: 4rem 1.5rem 5rem;
  box-sizing: border-box;
  overflow: hidden;
}

.hero-shell {
  min-height: calc(100vh - 72px);
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(340px, 0.95fr);
  align-items: center;
  gap: 3rem;
  padding-bottom: 4rem;
}

.hero-copy,
.section-copy,
.about-footer > div {
  min-width: 0;
}

.eyebrow,
.section-kicker {
  display: inline-flex;
  color: var(--accent-green);
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0;
  text-transform: uppercase;
}

.hero-copy h1 {
  font-size: clamp(4.5rem, 12vw, 9rem);
  line-height: 0.9;
  margin: 1rem 0 1.5rem;
  font-weight: 950;
  letter-spacing: 0;
}

.hero-subtitle {
  max-width: 680px;
  color: var(--text-dim);
  font-size: 1.08rem;
  line-height: 1.75;
  margin: 0;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem;
  margin-top: 2rem;
}

.btn-primary,
.btn-secondary {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  border-radius: 8px;
  padding: 0.85rem 1.2rem;
  font-size: 0.76rem;
  font-weight: 900;
  text-decoration: none;
  box-sizing: border-box;
  max-width: 100%;
  min-width: 0;
  text-align: center;
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
}

.btn-primary {
  background: var(--accent-green);
  color: #000;
  border: 1px solid var(--accent-green);
}

.btn-secondary {
  background: var(--glass);
  color: var(--text-main);
  border: 1px solid var(--border-dim);
}

.btn-primary:hover,
.btn-secondary:hover {
  transform: translateY(-2px);
}

.btn-primary:hover {
  box-shadow: 0 16px 34px rgba(var(--accent-green-rgb), 0.18);
}

.btn-secondary:hover {
  border-color: rgba(var(--accent-green-rgb), 0.45);
}

.identity-panel {
  position: relative;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(var(--accent-green-rgb), 0.08), transparent 38%),
    linear-gradient(180deg, var(--bg-card), rgba(255, 255, 255, 0.02));
  padding: 1rem;
  box-shadow: 0 24px 70px var(--shadow-color);
  animation: panel-enter 0.7s ease both;
}

.panel-topline {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  color: var(--text-dim);
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0;
  margin-bottom: 1rem;
}

.signal {
  color: var(--accent-green);
}

.face-stage {
  min-height: 340px;
  display: grid;
  place-items: center;
  border: 1px solid var(--border-dim);
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
  background-size: 26px 26px;
  border-radius: 6px;
  overflow: hidden;
}

.scan-frame {
  width: min(78%, 270px);
  aspect-ratio: 1;
  position: relative;
  display: grid;
  place-items: center;
}

.face-mark {
  color: var(--accent-green);
  filter: drop-shadow(0 0 18px rgba(var(--accent-green-rgb), 0.24));
  animation: breathe 2.8s ease-in-out infinite;
}

.scan-line {
  position: absolute;
  left: 7%;
  right: 7%;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--accent-green), transparent);
  box-shadow: 0 0 18px rgba(var(--accent-green-rgb), 0.45);
  animation: scan 2.6s ease-in-out infinite;
}

.corner {
  position: absolute;
  width: 38px;
  height: 38px;
  border-color: var(--accent-green);
  opacity: 0.9;
}

.corner-tl {
  top: 0;
  left: 0;
  border-top: 2px solid;
  border-left: 2px solid;
}

.corner-tr {
  top: 0;
  right: 0;
  border-top: 2px solid;
  border-right: 2px solid;
}

.corner-bl {
  bottom: 0;
  left: 0;
  border-bottom: 2px solid;
  border-left: 2px solid;
}

.corner-br {
  right: 0;
  bottom: 0;
  border-right: 2px solid;
  border-bottom: 2px solid;
}

.point {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #7dd3fc;
  box-shadow: 0 0 16px rgba(125, 211, 252, 0.8);
  animation: pulse-point 2s ease-in-out infinite;
}

.point-a { top: 30%; left: 34%; }
.point-b { top: 31%; right: 34%; animation-delay: 0.2s; }
.point-c { top: 51%; left: 50%; animation-delay: 0.4s; }
.point-d { bottom: 28%; right: 39%; animation-delay: 0.6s; }

.vector-strip {
  display: grid;
  grid-template-columns: repeat(28, 1fr);
  gap: 4px;
  margin: 1rem 0;
}

.vector-strip span {
  height: 34px;
  border-radius: 3px;
  background: linear-gradient(180deg, rgba(var(--accent-green-rgb), 0.95), rgba(125, 211, 252, 0.35));
  transform-origin: bottom;
  animation: vector-rise 1.6s ease-in-out infinite;
  animation-delay: var(--delay);
}

.panel-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.65rem;
}

.panel-metrics div {
  border: 1px solid var(--border-dim);
  background: var(--glass);
  border-radius: 6px;
  padding: 0.85rem;
}

.panel-metrics strong {
  display: block;
  font-size: 1rem;
  color: var(--text-main);
}

.panel-metrics span {
  display: block;
  color: var(--text-dim);
  font-size: 0.62rem;
  font-weight: 800;
  margin-top: 0.2rem;
}

.content-stack {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.statement-band,
.architecture-section,
.metrics-band,
.about-footer {
  border: 1px solid var(--border-dim);
  border-radius: 8px;
  background: var(--bg-card);
  padding: 2.2rem;
}

.statement-band h2,
.architecture-section h2,
.about-footer h2 {
  font-size: clamp(1.7rem, 4vw, 3.2rem);
  line-height: 1.05;
  margin: 0.75rem 0 1rem;
  letter-spacing: 0;
}

.statement-band p,
.architecture-section p,
.about-footer p,
.info-card p,
.detail-panel li,
.metric span {
  color: var(--text-dim);
  line-height: 1.7;
}

.statement-band p,
.architecture-section p,
.about-footer p {
  max-width: 780px;
  margin: 0;
  font-size: 1rem;
}

.feature-grid,
.detail-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.detail-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.info-card,
.detail-panel {
  border: 1px solid var(--border-dim);
  background: var(--bg-card);
  border-radius: 8px;
  padding: 1.5rem;
  transition: transform 0.22s ease, border-color 0.22s ease, background 0.22s ease;
}

.info-card:hover,
.detail-panel:hover {
  transform: translateY(-4px);
  border-color: rgba(var(--accent-green-rgb), 0.34);
  background: rgba(var(--accent-green-rgb), 0.025);
}

.info-card svg,
.pipeline-step svg {
  color: var(--accent-green);
}

.info-card h3,
.detail-panel h3 {
  margin: 1rem 0 0.65rem;
  font-size: 1.05rem;
  letter-spacing: 0;
}

.info-card p {
  margin: 0;
  font-size: 0.92rem;
}

.architecture-section {
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(320px, 1.05fr);
  gap: 2rem;
  align-items: start;
}

.pipeline {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.pipeline-step {
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr);
  gap: 0.9rem;
  align-items: start;
  border: 1px solid var(--border-dim);
  border-radius: 8px;
  padding: 1rem;
  background: var(--glass);
  position: relative;
  overflow: hidden;
}

.pipeline-step::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(var(--accent-green-rgb), 0.08), transparent);
  transform: translateX(-100%);
  animation: sweep 4.2s ease-in-out infinite;
}

.pipeline-step strong,
.pipeline-step span {
  display: block;
  position: relative;
}

.pipeline-step strong {
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.pipeline-step span {
  color: var(--text-dim);
  font-size: 0.86rem;
  line-height: 1.55;
}

.detail-panel ul {
  margin: 1rem 0 0;
  padding-left: 1.1rem;
}

.detail-panel li + li {
  margin-top: 0.7rem;
}

.metrics-band {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  background:
    linear-gradient(90deg, rgba(var(--accent-green-rgb), 0.06), transparent),
    var(--bg-card);
}

.metric {
  padding: 1rem;
  border-left: 2px solid rgba(var(--accent-green-rgb), 0.6);
}

.metric strong,
.metric span {
  display: block;
}

.metric strong {
  margin-bottom: 0.4rem;
}

.about-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  margin-top: 1.5rem;
}

.about-footer .btn-primary {
  flex: 0 0 auto;
  white-space: normal;
}

.reveal-section {
  animation: reveal-up 0.65s ease both;
  animation-timeline: view();
  animation-range: entry 0% cover 28%;
}

@keyframes panel-enter {
  from {
    opacity: 0;
    transform: translateY(18px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes scan {
  0%, 100% { top: 12%; }
  50% { top: 88%; }
}

@keyframes breathe {
  0%, 100% { transform: scale(1); opacity: 0.86; }
  50% { transform: scale(1.04); opacity: 1; }
}

@keyframes pulse-point {
  0%, 100% { transform: scale(0.7); opacity: 0.4; }
  50% { transform: scale(1); opacity: 1; }
}

@keyframes vector-rise {
  0%, 100% { transform: scaleY(0.35); opacity: 0.45; }
  50% { transform: scaleY(1); opacity: 1; }
}

@keyframes sweep {
  0%, 35% { transform: translateX(-100%); }
  70%, 100% { transform: translateX(100%); }
}

@keyframes reveal-up {
  from {
    opacity: 0;
    transform: translateY(26px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 900px) {
  .about-page {
    padding-top: 3rem;
  }

  .hero-shell,
  .architecture-section {
    grid-template-columns: 1fr;
  }

  .hero-shell {
    min-height: auto;
  }

  .identity-panel {
    max-width: 560px;
  }

  .feature-grid,
  .detail-grid,
  .metrics-band {
    grid-template-columns: 1fr;
  }

  .about-footer {
    align-items: flex-start;
    flex-direction: column;
  }

  .about-footer .btn-primary {
    align-self: stretch;
  }
}

@media (max-width: 600px) {
  .about-page {
    padding: 2rem 1rem 4rem;
  }

  .hero-copy h1 {
    font-size: clamp(3.4rem, 18vw, 4.8rem);
  }

  .hero-subtitle,
  .statement-band p,
  .architecture-section p,
  .about-footer p {
    font-size: 0.95rem;
  }

  .identity-panel,
  .statement-band,
  .architecture-section,
  .metrics-band,
  .about-footer,
  .info-card,
  .detail-panel {
    padding: 1.15rem;
  }

  .face-stage {
    min-height: 270px;
  }

  .panel-metrics {
    grid-template-columns: 1fr;
  }

  .hero-actions,
  .hero-actions a,
  .about-footer .btn-primary {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.001ms !important;
  }
}
</style>
