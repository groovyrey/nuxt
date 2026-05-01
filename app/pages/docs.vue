<template>
  <div class="docs-page">
    <header class="docs-header">
      <div class="header-content">
        <div class="logo">
          <ShieldCheckIcon :size="32" class="accent" />
          <h1>LU<span class="accent">FACE</span> <span class="version">V1.0</span></h1>
        </div>
        <p>Biometric-as-a-Service Documentation</p>
      </div>
    </header>

    <nav class="docs-nav">
      <div class="nav-content">
        <a href="#overview">OVERVIEW</a>
        <a href="#hosted-ui">HOSTED UI</a>
        <a href="#api-v1">API V1</a>
        <a href="#errors">ERRORS</a>
        <a href="#example">EXAMPLE</a>
      </div>
    </nav>

    <main class="docs-main">
      <!-- Overview -->
      <section id="overview">
        <h2><TerminalIcon :size="20" /> SYSTEM OVERVIEW</h2>
        <p>
          Luface provides secure facial biometric authentication scoped to your application. 
          All external users are isolated in a dedicated <code>external_users</code> vault, 
          identified by <code>email</code> and your <code>X-API-Key</code>.
        </p>
      </section>

      <!-- Hosted UI -->
      <section id="hosted-ui">
        <h2><LayoutIcon :size="20" /> HOSTED UI (No-Code Integration)</h2>
        <p>The easiest way to integrate biometrics. Redirect users to our hosted scanner.</p>
        
        <div class="endpoint-item">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <code>/setup-face</code>
          </div>
          <span class="endpoint-desc">Enroll a user's face for the first time</span>
          <div class="code-block">
            <pre><code class="language-yaml"># URL Parameters
api_key      : Your Luface API Key (Required)
email        : User's email (Unique ID for your app)
username     : User's display name
redirect_url : Where to return after enrollment success</code></pre>
          </div>
        </div>

        <div class="endpoint-item">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <code>/verify</code>
          </div>
          <span class="endpoint-desc">Authenticate an existing user via face scan</span>
          <div class="code-block">
            <pre><code class="language-yaml"># URL Parameters
api_key      : Your Luface API Key (Required)
email        : User's email to verify against (Required)
redirect_url : Where to return after verification success</code></pre>
          </div>
        </div>
      </section>

      <!-- API V1 -->
      <section id="api-v1">
        <h2><CpuIcon :size="20" /> API V1 (Server-to-Server)</h2>
        
        <div class="endpoint-item">
          <div class="endpoint-header">
            <span class="method post">POST</span>
            <code>/api/v1/identify</code>
          </div>
          <span class="endpoint-desc">Targeted biometric identification</span>
          <div class="code-block">
            <pre><code class="language-json">// Request Header
X-API-Key: lf_...

// Request Body
{
  "email": "user@example.com",
  "faceDescriptor": [0.12, -0.05, 0.88, ...]
}</code></pre>
          </div>
        </div>

        <div class="endpoint-item">
          <div class="endpoint-header">
            <span class="method post">POST</span>
            <code>/api/v1/verify-session</code>
          </div>
          <span class="endpoint-desc">Verify a captured face descriptor against a specific email</span>
          <div class="code-block">
            <pre><code class="language-json">// Request Header
X-API-Key: lf_...

// Request Body
{
  "email": "user@example.com",
  "faceDescriptor": [0.12, -0.05, 0.88, ...]
}</code></pre>
          </div>
        </div>
      </section>

      <!-- Errors -->
      <section id="errors">
        <h2><AlertTriangleIcon :size="20" /> ERROR CODES</h2>
        <div class="table-wrapper">
          <table class="error-table">
            <thead>
              <tr>
                <th>CODE</th>
                <th>MESSAGE</th>
                <th>DESCRIPTION</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>401</td>
                <td>Invalid API Key</td>
                <td>The X-API-Key header or api_key param is missing/incorrect.</td>
              </tr>
              <tr>
                <td>400</td>
                <td>Face data missing</td>
                <td>The faceDescriptor or required biometric data was not provided.</td>
              </tr>
              <tr>
                <td>409</td>
                <td>Conflict</td>
                <td>Biometrics already registered for this email on your account.</td>
              </tr>
              <tr>
                <td>200</td>
                <td>No match found</td>
                <td>Scan completed successfully but biometrics did not match the user.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Code Example -->
      <section id="example">
        <h2><CodeIcon :size="20" /> INTEGRATION EXAMPLE</h2>
        <p>Example using Next.js Server Actions to trigger the biometric challenge:</p>
        <div class="code-block">
          <pre><code class="language-typescript">// app/lib/actions.ts
export async function loginAction(formData: FormData) {
  const email = formData.get('email');
  
  // 1. Verify password locally...
  // ...
  
  // 2. Redirect to Luface for biometric challenge
  const lufaceUrl = new URL("https://luface.vercel.app/verify");
  lufaceUrl.searchParams.set("api_key", process.env.LUFACE_KEY);
  lufaceUrl.searchParams.set("email", email);
  lufaceUrl.searchParams.set("redirect_url", "https://yourapp.com/api/auth/face-callback");

  return redirect(lufaceUrl.toString());
}</code></pre>
        </div>
      </section>

      <div class="docs-footer-actions">
        <button @click="navigateTo('/')" class="btn-exit">
          <LogOutIcon :size="16" />
          EXIT TO DASHBOARD
        </button>
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
  Code as CodeIcon,
  LogOut as LogOutIcon
} from 'lucide-vue-next';
import hljs from 'highlight.js';
import 'highlight.js/styles/tokyo-night-dark.css';

onMounted(() => {
  document.querySelectorAll('pre code').forEach((block) => {
    hljs.highlightElement(block);
  });
});
</script>

<style scoped>
.docs-page {
  min-height: 100vh;
  background: var(--bg-app);
  color: var(--text-main);
  overflow-x: hidden;
}

.docs-header {
  background: var(--bg-black);
  border-bottom: 1px solid var(--border-dim);
  padding: 3rem 1rem;
}

.header-content {
  max-width: 1000px;
  margin: 0 auto;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 0.75rem;
}

.logo h1 {
  font-size: 1.75rem;
  letter-spacing: 0.15em;
  font-weight: 950;
  margin: 0;
}

@media (min-width: 768px) {
  .docs-header { padding: 4rem 1.5rem; }
  .logo h1 { font-size: 2.5rem; letter-spacing: 0.25em; }
  .logo { gap: 16px; }
}

.version {
  font-size: 0.6rem;
  background: var(--accent-green);
  color: #000;
  padding: 2px 8px;
  border-radius: 4px;
  vertical-align: middle;
  letter-spacing: normal;
}

.docs-header p {
  color: var(--text-dim);
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  font-weight: 800;
  margin: 0;
}

@media (min-width: 768px) {
  .docs-header p { font-size: 1rem; letter-spacing: 0.1em; }
}

.docs-nav {
  position: sticky;
  top: 0;
  background: var(--bg-black);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-dim);
  z-index: 100;
}

.nav-content {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  gap: 1.5rem;
  padding: 1rem;
  overflow-x: auto;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
}

@media (min-width: 768px) {
  .nav-content { gap: 2.5rem; padding: 1.25rem 1.5rem; overflow-x: visible; }
}

.nav-content::-webkit-scrollbar {
  display: none;
}

.docs-nav a {
  font-size: 0.7rem;
  font-weight: 900;
  color: var(--text-dim);
  text-decoration: none;
  letter-spacing: 0.1em;
  transition: all 0.2s;
}

@media (min-width: 768px) {
  .docs-nav a { font-size: 0.75rem; letter-spacing: 0.15em; }
}

.docs-nav a:hover {
  color: var(--accent-green);
}

.docs-main {
  max-width: 1000px;
  margin: 0 auto;
  padding: 3rem 1rem 6rem;
  display: flex;
  flex-direction: column;
  gap: 4rem;
}

@media (min-width: 768px) {
  .docs-main { padding: 4rem 1.5rem 8rem; gap: 6rem; }
}

section h2 {
  font-size: 1rem;
  letter-spacing: 0.1em;
  color: var(--accent-green);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 900;
}

@media (min-width: 768px) {
  section h2 { font-size: 1.1rem; letter-spacing: 0.15em; gap: 12px; margin-bottom: 2rem; }
}

p {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--text-dim);
  margin-bottom: 1.5rem;
}

@media (min-width: 768px) {
  p { font-size: 1.05rem; line-height: 1.7; margin-bottom: 2rem; }
}

.endpoint-item {
  margin-bottom: 2.5rem;
}

.endpoint-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.method {
  font-size: 0.6rem;
  font-weight: 950;
  padding: 4px 8px;
  border-radius: 4px;
  letter-spacing: 0.05em;
}

.method.get { background: #61affe; color: #fff; }
.method.post { background: #49cc90; color: #fff; }

.endpoint-header code {
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--text-main);
  background: var(--input-bg);
  padding: 3px 8px;
  border-radius: 6px;
}

@media (min-width: 768px) {
  .endpoint-header { gap: 12px; margin-bottom: 0.5rem; }
  .endpoint-header code { font-size: 1.1rem; padding: 4px 10px; }
  .method { font-size: 0.65rem; padding: 5px 10px; }
}

.endpoint-desc {
  display: block;
  color: var(--text-dim);
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 1rem;
  font-style: italic;
}

@media (min-width: 768px) {
  .endpoint-desc { font-size: 0.9rem; margin-bottom: 1.25rem; }
}

.code-block {
  background: var(--card-black);
  padding: 0;
  border-radius: 12px;
  border: 1px solid var(--border-dim);
  overflow: hidden;
  box-shadow: 0 10px 30px var(--shadow-color);
}

.code-block pre {
  margin: 0;
  padding: 1rem;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.8rem;
  line-height: 1.5;
  overflow-x: auto;
}

@media (min-width: 768px) {
  .code-block { border-radius: 16px; }
  .code-block pre { padding: 1.5rem; font-size: 0.9rem; line-height: 1.6; }
}

.code-block code {
  background: transparent !important;
  padding: 0 !important;
}

.table-wrapper {
  border: 1px solid var(--border-dim);
  border-radius: 12px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

@media (min-width: 768px) {
  .table-wrapper { border-radius: 16px; }
}

.error-table {
  width: 100%;
  min-width: 500px;
  border-collapse: collapse;
  font-size: 0.8rem;
  background: var(--glass);
}

@media (min-width: 768px) {
  .error-table { font-size: 0.9rem; }
}

.error-table th, .error-table td {
  text-align: left;
  padding: 1rem;
  border-bottom: 1px solid var(--border-dim);
}

@media (min-width: 768px) {
  .error-table th, .error-table td { padding: 1.25rem; }
}

.error-table th {
  background: var(--glass);
  color: var(--text-dim);
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.7rem;
}

.docs-footer-actions {
  padding-top: 3rem;
  border-top: 1px solid var(--border-dim);
  display: flex;
  justify-content: center;
}

@media (min-width: 768px) {
  .docs-footer-actions { padding-top: 4rem; }
}

.btn-exit {
  background: var(--text-main);
  color: var(--bg-app);
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 10px;
  font-weight: 900;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  letter-spacing: 0.05em;
  font-size: 0.75rem;
}

@media (min-width: 768px) {
  .btn-exit { padding: 1rem 2.5rem; border-radius: 12px; gap: 10px; font-size: 0.8rem; }
}

.btn-exit:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(255,255,255,0.1);
}
</style>
