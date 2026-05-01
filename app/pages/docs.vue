<template>
  <div class="docs-container">
    <aside class="docs-sidebar">
      <div class="sidebar-section">
        <label>GETTING STARTED</label>
        <ul>
          <li><a href="#introduction">Introduction</a></li>
          <li><a href="#authentication">Authentication</a></li>
        </ul>
      </div>
      <div class="sidebar-section">
        <label>INTEGRATION</label>
        <ul>
          <li><a href="#hosted-ui">Hosted UI (Redirect)</a></li>
          <li><a href="#headless-api">Headless API</a></li>
        </ul>
      </div>
      <div class="sidebar-section">
        <label>ENDPOINTS</label>
        <ul>
          <li><a href="#endpoint-verify">POST /identify</a></li>
          <li><a href="#endpoint-register">POST /register</a></li>
        </ul>
      </div>
    </aside>

    <main class="docs-content">
      <section id="introduction">
        <h1>Developer Documentation</h1>
        <p class="lead">Integrate Luface's neural biometric verification into your own applications with just a few lines of code.</p>
        
        <div class="info-card">
          <InfoIcon :size="18" />
          <span>All API requests must be made over HTTPS. The base URL is <code>https://luface.app/api/v1</code></span>
        </div>
      </section>

      <section id="authentication">
        <h2>Authentication</h2>
        <p>Luface uses API Keys to authenticate requests. You can generate and manage your keys in the <NuxtLink to="/">Dashboard</NuxtLink>.</p>
        <p>Include your API key in the <code>X-API-Key</code> header for all headless API requests.</p>
        
        <div class="code-example">
          <div class="code-header">HTTP HEADER</div>
          <pre><code>X-API-Key: lf_7a2b...9f1e</code></pre>
        </div>
      </section>

      <section id="hosted-ui">
        <h2>Hosted UI (Redirect Flow)</h2>
        <p>The easiest way to integrate Luface. Redirect your users to our secure scanning page, and we'll handle the biometric capture and verification.</p>
        
        <div class="step">
          <div class="step-num">1</div>
          <div class="step-text">
            <strong>Redirect User</strong>
            <p>Send users to the following URL:</p>
            <div class="code-example">
              <pre><code>GET https://luface.app/verify?api_key=YOUR_KEY&redirect_url=YOUR_APP_URL</code></pre>
            </div>
          </div>
        </div>

        <div class="step">
          <div class="step-num">2</div>
          <div class="step-text">
            <strong>Handle Callback</strong>
            <p>After verification, Luface redirects back to your <code>redirect_url</code> with result parameters:</p>
            <ul>
              <li><code>status</code>: "success" or "error"</li>
              <li><code>username</code>: The identified user's handle</li>
              <li><code>ts</code>: ISO Timestamp of verification</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="headless-api">
        <h2>Headless API</h2>
        <p>For applications that require full control over the user interface. You capture the face descriptor and send it to Luface for processing.</p>
        
        <h3 id="endpoint-verify">Identify User</h3>
        <p>Find a matching user profile from a facial signature.</p>
        <div class="code-example">
          <div class="code-header">POST /api/v1/identify</div>
          <pre><code>{
  "faceDescriptor": [0.12, -0.05, ...]
}</code></pre>
        </div>

        <h3 id="endpoint-register">Register User</h3>
        <p>Create a new Luface profile programmatically.</p>
        <div class="code-example">
          <div class="code-header">POST /api/v1/register</div>
          <pre><code>{
  "username": "operator_zero",
  "email": "zero@system.com",
  "password": "SecurePassword123",
  "faceDescriptor": [...]
}</code></pre>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { Info as InfoIcon } from 'lucide-vue-next';

useHead({
  title: 'Developer Docs | Luface'
});
</script>

<style scoped>
.docs-container {
  display: grid;
  grid-template-columns: 280px 1fr;
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
  gap: 4rem;
}

.docs-sidebar {
  position: sticky;
  top: 100px;
  height: fit-content;
}

.sidebar-section {
  margin-bottom: 2rem;
}

.sidebar-section label {
  font-size: 0.6rem;
  font-weight: 800;
  color: var(--text-dim);
  letter-spacing: 0.1em;
  display: block;
  margin-bottom: 0.75rem;
}

.sidebar-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-section li {
  margin-bottom: 0.5rem;
}

.sidebar-section a {
  text-decoration: none;
  color: var(--text-main);
  font-size: 0.85rem;
  font-weight: 500;
  transition: color 0.2s;
}

.sidebar-section a:hover {
  color: var(--accent-green);
}

.docs-content {
  max-width: 800px;
  min-width: 0;
}

section {
  margin-bottom: 4rem;
  scroll-margin-top: 120px;
  min-width: 0;
}

h1 { font-size: 2.5rem; margin-bottom: 1rem; word-break: break-word; }
h2 { font-size: 1.75rem; margin: 2.5rem 0 1rem; color: var(--accent-green); word-break: break-word; }
h3 { font-size: 1.25rem; margin: 2rem 0 1rem; word-break: break-word; }

p { color: var(--text-dim); line-height: 1.6; margin-bottom: 1.25rem; word-break: break-word; }
.lead { font-size: 1.1rem; color: var(--text-main); }

.info-card {
  background: rgba(var(--accent-green-rgb), 0.05);
  border: 1px solid rgba(var(--accent-green-rgb), 0.2);
  padding: 1rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-main);
  font-size: 0.85rem;
  word-break: break-all;
}

.code-example {
  background: #000;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  margin: 1.5rem 0;
  max-width: 100%;
}

.code-header {
  background: var(--glass);
  padding: 0.5rem 1rem;
  font-size: 0.6rem;
  font-weight: 800;
  color: var(--text-dim);
  border-bottom: 1px solid var(--border-color);
}

pre {
  padding: 1rem;
  margin: 0;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
  color: #00ff88;
  word-break: break-all;
}

.step {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.step-num {
  width: 28px;
  height: 28px;
  background: var(--accent-green);
  color: #000;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 0.8rem;
  flex-shrink: 0;
}

@media (max-width: 900px) {
  .docs-container { 
    grid-template-columns: 1fr; 
    padding: 2rem 1.5rem;
    gap: 2rem;
  }
  .docs-sidebar { display: none; }
  h1 { font-size: 2rem; }
  h2 { font-size: 1.5rem; }
}

@media (max-width: 600px) {
  .step {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
