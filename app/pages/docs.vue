<template>
  <div class="app-container">
    <header class="page-header">
      <div class="header-main">
        <ShieldCheckIcon class="accent" :size="32" />
        <h1>DEVELOPER <span class="accent">RESOURCES</span></h1>
        <span class="badge">V1.0.4</span>
      </div>
      <p class="subtitle">Complete technical reference for Luface biometric integration.</p>
    </header>

    <nav class="sticky-nav">
      <div class="nav-links">
        <a href="#auth">AUTH</a>
        <a href="#hosted">HOSTED UI</a>
        <a href="#api">REST API</a>
        <a href="#webhooks">WEBHOOKS</a>
        <a href="#errors">ERRORS</a>
      </div>
    </nav>

    <main class="docs-content">
      <!-- Authentication Section -->
      <section id="auth">
        <h2><LockIcon :size="18" /> AUTHENTICATION</h2>
        <p>
          All API requests must include your unique API key in the <code>X-API-Key</code> header. 
          For Hosted UI redirects, use the <code>api_key</code> query parameter.
        </p>
        <div class="code-box" v-html="authCodeHtml" />
      </section>

      <!-- Hosted UI Section -->
      <section id="hosted">
        <h2><LayoutIcon :size="18" /> HOSTED UI (REDIRECT FLOW)</h2>
        <p>The Hosted UI is the recommended way to integrate. It handles camera access, liveness detection, and biometric processing automatically.</p>
        
        <div class="endpoint">
          <h3>Enrollment Flow</h3>
          <p class="desc">Redirect users here to register their face. If successful, they will be sent back to your <code>redirect_url</code> with a <code>success=true</code> parameter.</p>
          <div class="endpoint-header">
            <span class="badge get">GET</span>
            <code>/setup-face</code>
          </div>
          <div class="table-box">
            <table>
              <thead><tr><th>PARAM</th><th>TYPE</th><th>DESCRIPTION</th></tr></thead>
              <tbody>
                <tr><td><code>api_key</code></td><td>String</td><td>Required. Your Luface API key.</td></tr>
                <tr><td><code>email</code></td><td>String</td><td>Required. Unique user identifier.</td></tr>
                <tr><td><code>username</code></td><td>String</td><td>Optional. Display name for the UI.</td></tr>
                <tr><td><code>redirect_url</code></td><td>String</td><td>Required. Where to send user after success.</td></tr>
              </tbody>
            </table>
          </div>
          <div class="example-box">
            <label>EXAMPLE URL</label>
            <code>https://luface.app/setup-face?api_key=lf_live_xxxx&email=user@domain.com&redirect_url=https://your-app.com/callback</code>
          </div>
        </div>

        <div class="endpoint">
          <h3>Verification Flow</h3>
          <p class="desc">Redirect users here to authenticate. Luface will compare their face against the stored template for that email.</p>
          <div class="endpoint-header">
            <span class="badge get">GET</span>
            <code>/verify</code>
          </div>
          <div class="table-box">
            <table>
              <thead><tr><th>PARAM</th><th>TYPE</th><th>DESCRIPTION</th></tr></thead>
              <tbody>
                <tr><td><code>api_key</code></td><td>String</td><td>Required.</td></tr>
                <tr><td><code>email</code></td><td>String</td><td>Required. Email to verify against.</td></tr>
                <tr><td><code>redirect_url</code></td><td>String</td><td>Required.</td></tr>
              </tbody>
            </table>
          </div>
          <div class="example-box">
            <label>EXAMPLE URL</label>
            <code>https://luface.app/verify?api_key=lf_live_xxxx&email=user@domain.com&redirect_url=https://your-app.com/callback</code>
          </div>
        </div>
      </section>

      <!-- REST API Section -->
      <section id="api">
        <h2><CpuIcon :size="18" /> REST API (SERVER-TO-SERVER)</h2>
        <p>Use the REST API for custom integrations where you capture face descriptors on your own client.</p>

        <div class="endpoint">
          <div class="endpoint-header">
            <span class="badge post">POST</span>
            <code>/api/v1/identify</code>
          </div>
          <p class="desc">Compare a face descriptor against all users in your application vault.</p>
          <div class="code-grid">
            <div class="code-group">
              <label>REQUEST BODY</label>
              <div class="code-box small" v-html="requestBodyHtml" />
            </div>
            <div class="code-group">
              <label>RESPONSE (200)</label>
              <div class="code-box small" v-html="responseBodyHtml" />
            </div>
          </div>
        </div>
      </section>

      <!-- Webhooks Section -->
      <section id="webhooks">
        <h2><WebhookIcon :size="18" /> WEBHOOKS</h2>
        <p>Receive real-time notifications for system events. Configure endpoints in the Dashboard.</p>
        <div class="endpoint">
          <h3>Events Supported</h3>
          <div class="table-box">
            <table>
              <thead><tr><th>EVENT</th><th>DESCRIPTION</th></tr></thead>
              <tbody>
                <tr><td><code>face.identified</code></td><td>Triggered on successful server-side identification.</td></tr>
                <tr><td><code>face.enrolled</code></td><td>Triggered when a new user completes Hosted UI setup.</td></tr>
                <tr><td><code>face.verified</code></td><td>Triggered on successful Hosted UI verification.</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- Errors Section -->
      <section id="errors">
        <h2><AlertTriangleIcon :size="18" /> ERROR CODES</h2>
        <div class="table-box">
          <table>
            <thead>
              <tr><th>CODE</th><th>STATUS</th><th>REASON</th></tr>
            </thead>
            <tbody>
              <tr><td>401</td><td>Unauthorized</td><td>Missing or invalid X-API-Key.</td></tr>
              <tr><td>400</td><td>Bad Request</td><td>Invalid face descriptor or missing parameters.</td></tr>
              <tr><td>404</td><td>Not Found</td><td>User not enrolled or key invalid.</td></tr>
              <tr><td>409</td><td>Conflict</td><td>User already exists for this application.</td></tr>
              <tr><td>429</td><td>Rate Limit</td><td>API request threshold exceeded.</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <div class="docs-footer">
        <NuxtLink to="/" class="exit-btn">
          <LogOutIcon :size="16" /> EXIT TO DASHBOARD
        </NuxtLink>
      </div>
    </main>
  </div>
</template>

<script setup>
import { 
  ShieldCheck as ShieldCheckIcon,
  Terminal as TerminalIcon,
  Layout as LayoutIcon,
  Cpu as CpuIcon,
  AlertTriangle as AlertTriangleIcon,
  LogOut as LogOutIcon,
  Lock as LockIcon,
  Webhook as WebhookIcon
} from 'lucide-vue-next';

const { data: highlightedSnippets } = await useFetch('/api/docs-highlights', {
  key: 'docs-highlights',
});

const authCodeHtml = computed(() => highlightedSnippets.value?.auth ?? '');
const requestBodyHtml = computed(() => highlightedSnippets.value?.requestBody ?? '');
const responseBodyHtml = computed(() => highlightedSnippets.value?.responseBody ?? '');
</script>

<style scoped>
.app-container {
  padding: 3rem 1.5rem;
  max-width: 900px;
  margin: 0 auto;
  min-width: 0;
}

.page-header {
  margin-bottom: 3rem;
}

.header-main {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.header-main h1 {
  font-size: 2rem;
  font-weight: 900;
  margin: 0;
  letter-spacing: -0.02em;
}

.badge {
  font-size: 0.65rem;
  font-weight: 900;
  background: var(--accent-green);
  color: #000;
  padding: 3px 8px;
  border-radius: 6px;
}

.badge.get { background: #61affe; color: #fff; }
.badge.post { background: #49cc90; color: #fff; }

.subtitle {
  color: var(--text-dim);
  font-size: 1rem;
  margin: 0;
}

.sticky-nav {
  position: sticky;
  top: 60px;
  background: var(--bg-app);
  padding: 1rem 0;
  border-bottom: 1px solid var(--border-dim);
  z-index: 100;
  margin-bottom: 4rem;
}

.nav-links {
  display: flex;
  gap: 2rem;
  overflow-x: auto;
  scrollbar-width: none;
  max-width: 100%;
  -webkit-overflow-scrolling: touch;
}

.nav-links a {
  text-decoration: none;
  color: var(--text-dim);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  transition: all 0.2s;
}

.nav-links a:hover { color: var(--accent-green); }

.docs-content {
  display: flex;
  flex-direction: column;
  gap: 5rem;
  min-width: 0;
}

section {
  min-width: 0;
}

section h2 {
  font-size: 1rem;
  font-weight: 950;
  color: var(--accent-green);
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 2rem;
  letter-spacing: 0.1em;
}

section h3 {
  font-size: 0.9rem;
  font-weight: 800;
  margin: 2rem 0 1rem;
  color: var(--text-main);
}

section p {
  color: var(--text-dim);
  line-height: 1.7;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

code {
  font-family: 'JetBrains Mono', monospace;
  background: var(--glass);
  padding: 2px 6px;
  border-radius: 4px;
  color: var(--accent-green);
  font-size: 0.9em;
}

.endpoint {
  background: var(--glass);
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid var(--border-dim);
  margin-bottom: 2.5rem;
  min-width: 0;
}

.endpoint-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 1.5rem 0;
  min-width: 0;
}

.endpoint-header code {
  font-weight: 800;
  font-size: 1.1rem;
  color: var(--text-main);
  overflow-wrap: anywhere;
}

.desc {
  font-size: 0.9rem;
  color: var(--text-dim);
}

.code-box {
  background: #000;
  border: 1px solid var(--border-dim);
  border-radius: 12px;
  overflow-x: auto;
  overflow-y: hidden;
  margin: 1.5rem 0;
  max-width: 100%;
  min-width: 0;
  -webkit-overflow-scrolling: touch;
}

.code-box.small { padding: 0; }

.code-box :deep(pre.shiki) {
  margin: 0;
  padding: 1.25rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
  line-height: 1.6;
  background: transparent !important;
  overflow: visible;
  width: max-content;
  min-width: 100%;
}

.code-box :deep(code) {
  background: transparent !important;
  padding: 0 !important;
  color: inherit !important;
}

.code-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 1.5rem;
  margin-top: 1.5rem;
  min-width: 0;
}

.code-group {
  min-width: 0;
}

.code-group label {
  font-size: 0.6rem;
  font-weight: 900;
  color: var(--text-dim);
  margin-bottom: 8px;
  display: block;
  letter-spacing: 0.05em;
}

.table-box {
  border: 1px solid var(--border-dim);
  border-radius: 12px;
  overflow-x: auto;
  overflow-y: hidden;
  margin: 1.5rem 0;
  max-width: 100%;
  -webkit-overflow-scrolling: touch;
}

table {
  width: 100%;
  min-width: 560px;
  border-collapse: collapse;
  font-size: 0.85rem;
}

th, td {
  padding: 1rem 1.25rem;
  text-align: left;
  border-bottom: 1px solid var(--border-dim);
}

th {
  background: var(--glass);
  color: var(--text-dim);
  font-weight: 900;
  font-size: 0.65rem;
  letter-spacing: 0.05em;
}

td { color: var(--text-dim); }
td code { color: var(--text-main); }

.example-box {
  min-width: 0;
}

.example-box code {
  display: block;
  max-width: 100%;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.docs-footer {
  margin-top: 4rem;
  padding-top: 4rem;
  border-top: 1px solid var(--border-dim);
  display: flex;
  justify-content: center;
}

.exit-btn {
  background: var(--text-main);
  color: var(--bg-app);
  text-decoration: none;
  padding: 1rem 2.5rem;
  border-radius: 12px;
  font-weight: 900;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: transform 0.2s;
}

.exit-btn:hover { transform: translateY(-4px); }

@media (max-width: 800px) {
  .code-grid { grid-template-columns: 1fr; }
  .endpoint { padding: 1.25rem; }
}

@media (max-width: 600px) {
  .app-container { padding: 2rem 1rem; }
  .header-main h1 { font-size: 1.6rem; }
  .docs-content { gap: 4rem; }
  .sticky-nav { top: 50px; }
  .endpoint-header { align-items: flex-start; }
  table { min-width: 480px; }
}
</style>
