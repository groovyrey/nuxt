<template>
  <div class="app-container">
    <header class="page-header">
      <div class="header-main">
        <ShieldCheckIcon class="accent" :size="32" />
        <h1>SYSTEM <span class="accent">DOCS</span></h1>
        <span class="badge">V1.0</span>
      </div>
      <p class="subtitle">Biometric-as-a-Service • Technical Specifications</p>
    </header>

    <nav class="sticky-nav">
      <div class="nav-links">
        <a href="#overview">OVERVIEW</a>
        <a href="#hosted-ui">HOSTED UI</a>
        <a href="#api-v1">API V1</a>
        <a href="#errors">ERRORS</a>
        <a href="#example">EXAMPLE</a>
      </div>
    </nav>

    <main class="docs-content">
      <section id="overview">
        <h2><TerminalIcon :size="18" /> OVERVIEW</h2>
        <p>
          Luface provides facial biometric authentication for your application. 
          Users are identified by <code>email</code> and scoped to your <code>X-API-Key</code>.
        </p>
      </section>

      <section id="hosted-ui">
        <h2><LayoutIcon :size="18" /> HOSTED UI</h2>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="badge get">GET</span>
            <code>/setup-face</code>
          </div>
          <p class="desc">Enroll a user's face for the first time.</p>
          <div class="code-box">
<pre><code># Parameters
api_key      : Your API Key
email        : User unique ID
username     : Display name
redirect_url : Success callback</code></pre>
          </div>
        </div>

        <div class="endpoint">
          <div class="endpoint-header">
            <span class="badge get">GET</span>
            <code>/verify</code>
          </div>
          <p class="desc">Authenticate an existing user.</p>
          <div class="code-box">
<pre><code># Parameters
api_key      : Your API Key
email        : Target user email
redirect_url : Success callback</code></pre>
          </div>
        </div>
      </section>

      <section id="api-v1">
        <h2><CpuIcon :size="18" /> API V1</h2>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="badge post">POST</span>
            <code>/api/v1/identify</code>
          </div>
          <div class="code-box">
<pre><code>{
  "email": "user@example.com",
  "faceDescriptor": [...]
}</code></pre>
          </div>
        </div>
      </section>

      <section id="errors">
        <h2><AlertTriangleIcon :size="18" /> ERRORS</h2>
        <div class="table-box">
          <table>
            <thead>
              <tr><th>CODE</th><th>MESSAGE</th></tr>
            </thead>
            <tbody>
              <tr><td>401</td><td>Invalid API Key</td></tr>
              <tr><td>400</td><td>Face data missing</td></tr>
              <tr><td>409</td><td>Conflict / Already registered</td></tr>
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
  LogOut as LogOutIcon
} from 'lucide-vue-next';
</script>

<style scoped>
.app-container {
  padding: 2rem 1.5rem;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
}

.page-header {
  margin-bottom: 2rem;
}

.header-main {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.header-main h1 {
  font-size: 1.75rem;
  font-weight: 900;
  margin: 0;
}

.badge {
  font-size: 0.6rem;
  font-weight: 900;
  background: var(--accent-green);
  color: #000;
  padding: 2px 6px;
  border-radius: 4px;
}

.badge.get { background: #61affe; color: #fff; }
.badge.post { background: #49cc90; color: #fff; }

.subtitle {
  color: var(--text-dim);
  font-size: 0.9rem;
  margin: 0;
}

.sticky-nav {
  position: sticky;
  top: 60px;
  background: var(--bg-app);
  padding: 1rem 0;
  border-bottom: 1px solid var(--border-dim);
  z-index: 10;
  margin-bottom: 3rem;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  scrollbar-width: none;
}

.nav-links::-webkit-scrollbar { display: none; }

.nav-links a {
  text-decoration: none;
  color: var(--text-dim);
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  transition: color 0.2s;
  white-space: nowrap;
}

.nav-links a:hover { color: var(--accent-green); }

.docs-content {
  display: flex;
  flex-direction: column;
  gap: 4rem;
}

section h2 {
  font-size: 0.9rem;
  font-weight: 900;
  color: var(--accent-green);
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 1.5rem;
  letter-spacing: 0.05em;
}

section p {
  color: var(--text-dim);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

code {
  font-family: monospace;
  background: var(--glass);
  padding: 2px 6px;
  border-radius: 4px;
  color: var(--text-main);
}

.endpoint {
  margin-bottom: 2rem;
}

.endpoint-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 0.5rem;
}

.endpoint-header code {
  font-weight: 700;
  font-size: 1rem;
}

.desc {
  font-size: 0.85rem;
  margin-bottom: 1rem;
}

.code-box {
  background: var(--bg-card);
  border: 1px solid var(--border-dim);
  border-radius: 12px;
  padding: 1rem;
  overflow-x: auto;
}

.code-box pre {
  margin: 0;
  font-family: monospace;
  font-size: 0.85rem;
  line-height: 1.5;
}

.table-box {
  border: 1px solid var(--border-dim);
  border-radius: 12px;
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border-dim);
}

th {
  background: var(--glass);
  color: var(--text-dim);
  font-weight: 800;
  font-size: 0.7rem;
}

.docs-footer {
  margin-top: 2rem;
  padding-top: 3rem;
  border-top: 1px solid var(--border-dim);
  display: flex;
  justify-content: center;
}

.exit-btn {
  background: var(--text-main);
  color: var(--bg-app);
  text-decoration: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 900;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: transform 0.2s;
}

.exit-btn:hover { transform: translateY(-2px); }

@media (max-width: 600px) {
  .app-container { padding: 1.5rem 1rem; }
  .header-main h1 { font-size: 1.5rem; }
  .docs-content { gap: 3rem; }
}
</style>

