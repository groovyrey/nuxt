<template>
  <div class="api-key-manager">
    <div class="section-header">
      <div class="header-actions">
        <button v-if="activeTab === 'keys'" @click="showCreate = !showCreate" class="btn-sm">
          {{ showCreate ? 'CANCEL' : 'GENERATE NEW KEY' }}
        </button>
        <button v-if="activeTab === 'webhooks'" @click="showWebhooks = !showWebhooks" class="btn-sm">
          {{ showWebhooks ? 'CANCEL' : 'ADD WEBHOOK' }}
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs-nav">
      <button @click="activeTab = 'keys'" :class="{ active: activeTab === 'keys' }">
        <KeyIcon :size="12" /> KEYS
      </button>
      <button @click="activeTab = 'usage'" :class="{ active: activeTab === 'usage' }">
        <ActivityIcon :size="12" /> USAGE
      </button>
      <button @click="activeTab = 'webhooks'" :class="{ active: activeTab === 'webhooks' }">
        <WebhookIcon :size="12" /> WEBHOOKS
      </button>
      <button @click="activeTab = 'audit'" :class="{ active: activeTab === 'audit' }">
        <HistoryIcon :size="12" /> AUDIT
      </button>
    </div>

    <div class="tab-content">
      <!-- API KEYS TAB -->
      <div v-if="activeTab === 'keys'" class="tab-pane">
        <!-- Create Key Form -->
        <Transition name="fade-slide">
          <div v-if="showCreate" class="create-form">
            <div class="form-group">
              <label>KEY NAME</label>
              <div class="input-with-action">
                <input v-model="newKeyName" type="text" placeholder="e.g., Production App" :disabled="creating" />
                <button @click="createKey" :disabled="creating || !newKeyName" class="btn-create">
                  <PlusIcon v-if="!creating" :size="16" />
                  <Loader2Icon v-else class="spin" :size="16" />
                </button>
              </div>
            </div>
          </div>
        </Transition>

        <!-- New Key Reveal -->
        <Transition name="fade-slide">
          <div v-if="revealedKey" class="reveal-box">
            <div class="reveal-header">
              <AlertTriangleIcon :size="14" />
              <span>COPY THIS KEY NOW. IT WON'T BE SHOWN AGAIN.</span>
            </div>
            <div class="key-display">
              <code>{{ revealedKey }}</code>
              <button @click="copyKey(revealedKey)" class="copy-btn">
                <CopyIcon :size="14" v-if="!copied" />
                <CheckIcon :size="14" v-else />
              </button>
            </div>
          </div>
        </Transition>

        <div class="keys-list">
          <div v-if="loading" class="loading-state">
            <Loader2Icon class="spin" :size="24" />
          </div>
          <div v-else-if="keys.length === 0" class="empty-state">NO ACTIVE API KEYS</div>
          <div v-for="key in keys" :key="key.id" class="key-item">
            <div class="key-info">
              <div class="key-main">
                <span class="key-name">{{ key.name }}</span>
                <span class="key-prefix"><code>{{ key.key_prefix }}••••••••</code></span>
              </div>
              <div class="key-settings">
                <label>THRESHOLD: </label>
                <select :value="key.threshold" @change="updateThreshold(key.id, $event.target.value)">
                  <option :value="0.35">Strict (0.35)</option>
                  <option :value="0.45">Standard (0.45)</option>
                  <option :value="0.55">Relaxed (0.55)</option>
                </select>
              </div>
            </div>
            <button @click="deleteKey(key.id)" class="delete-btn"><Trash2Icon :size="14" /></button>
          </div>
        </div>
      </div>

      <!-- USAGE TAB -->
      <div v-else-if="activeTab === 'usage'" class="tab-pane">
        <div v-if="loadingUsage" class="loading-state"><Loader2Icon class="spin" :size="24" /></div>
        <div v-else-if="usage.length === 0" class="empty-state">NO RECENT ACTIVITY</div>
        <div v-else class="usage-stats">
          <div v-for="(stat, index) in usage" :key="index" class="usage-item">
            <div class="usage-date">{{ new Date(stat.date).toLocaleDateString() }}</div>
            <div class="usage-bar-wrapper">
              <div class="usage-bar" :style="{ width: Math.min((stat.count / 100) * 100, 100) + '%' }"></div>
            </div>
            <div class="usage-count">{{ stat.count }} REQS ({{ stat.key_name }})</div>
          </div>
        </div>
      </div>

      <!-- WEBHOOKS TAB -->
      <div v-else-if="activeTab === 'webhooks'" class="tab-pane">
        <Transition name="fade-slide">
          <div v-if="showWebhooks" class="create-form">
            <div class="form-group">
              <label>TARGET URL</label>
              <input v-model="newWebhook.url" type="url" placeholder="https://api.yourdomain.com/webhook" />
            </div>
            <button @click="createWebhook" :disabled="creatingWebhook || !newWebhook.url" class="btn-create-full">
              {{ creatingWebhook ? 'SAVING...' : 'ADD WEBHOOK' }}
            </button>
          </div>
        </Transition>

        <div class="webhooks-list">
          <div v-for="wh in webhooks" :key="wh.id" class="webhook-item">
            <div class="webhook-info">
              <div class="webhook-url">{{ wh.url }}</div>
              <div class="webhook-events">{{ typeof wh.events === 'string' ? JSON.parse(wh.events).join(', ') : (Array.isArray(wh.events) ? wh.events.join(', ') : wh.events) }}</div>
            </div>
            <button @click="deleteWebhook(wh.id)" class="delete-btn"><Trash2Icon :size="14" /></button>
          </div>
        </div>
      </div>

      <!-- AUDIT LOGS TAB -->
      <div v-else-if="activeTab === 'audit'" class="tab-pane">
        <div class="audit-list">
          <div v-for="log in auditLogs" :key="log.id" class="audit-item">
            <div class="audit-dot"></div>
            <div class="audit-main">
              <div class="audit-action">{{ log.action }}</div>
              <div class="audit-time">{{ formatDate(log.timestamp) }}</div>
            </div>
            <div v-if="log.ip_address" class="audit-ip">{{ log.ip_address }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { 
  Key as KeyIcon, 
  Plus as PlusIcon, 
  Loader2 as Loader2Icon, 
  Copy as CopyIcon, 
  Check as CheckIcon,
  Trash2 as Trash2Icon,
  AlertTriangle as AlertTriangleIcon,
  Cpu as CpuIcon,
  Activity as ActivityIcon,
  Webhook as WebhookIcon,
  Shield as ShieldIcon,
  History as HistoryIcon
} from 'lucide-vue-next';
import { toast } from 'vue-sonner';

const keys = ref([]);
const webhooks = ref([]);
const usage = ref([]);
const auditLogs = ref([]);
const loading = ref(true);
const loadingWebhooks = ref(false);
const loadingUsage = ref(false);
const creating = ref(false);
const showCreate = ref(false);
const showWebhooks = ref(false);
const newKeyName = ref('');
const revealedKey = ref(null);
const copied = ref(false);
const activeTab = ref('keys');

const newWebhook = ref({ url: '', events: ['face.identified'] });
const creatingWebhook = ref(false);

const fetchKeys = async () => {
  loading.value = true;
  try {
    const data = await $fetch('/api/keys');
    keys.value = data.map(k => ({
      ...k,
      threshold: k.threshold ? Math.round(parseFloat(k.threshold) * 100) / 100 : 0.45
    }));
  } catch (err) {
    toast.error('Failed to load API keys');
  } finally {
    loading.value = false;
  }
};

const fetchWebhooks = async () => {
  loadingWebhooks.value = true;
  try {
    webhooks.value = await $fetch('/api/keys/webhooks');
  } catch (err) {
    toast.error('Failed to load webhooks');
  } finally {
    loadingWebhooks.value = false;
  }
};

const fetchUsage = async () => {
  loadingUsage.value = true;
  try {
    usage.value = await $fetch('/api/keys/usage');
  } catch (err) {
    toast.error('Failed to load usage data');
  } finally {
    loadingUsage.value = false;
  }
};

const fetchAuditLogs = async () => {
  try {
    auditLogs.value = await $fetch('/api/auth/audit');
  } catch (err) {
    console.error('Failed to load audit logs');
  }
};

const createWebhook = async () => {
  if (!newWebhook.value.url) return;
  creatingWebhook.value = true;
  try {
    await $fetch('/api/keys/webhooks', {
      method: 'POST',
      body: newWebhook.value
    });
    newWebhook.value = { url: '', events: ['face.identified'] };
    await fetchWebhooks();
    toast.success('Webhook created');
  } catch (err) {
    toast.error('Failed to create webhook');
  } finally {
    creatingWebhook.value = false;
  }
};

const deleteWebhook = async (id) => {
  try {
    await $fetch(`/api/keys/webhooks/${id}`, { method: 'DELETE' });
    await fetchWebhooks();
    toast.success('Webhook deleted');
  } catch (err) {
    toast.error('Failed to delete webhook');
  }
};

const updateThreshold = async (keyId, threshold) => {
  try {
    const val = parseFloat(threshold);
    await $fetch(`/api/keys/${keyId}`, {
      method: 'PATCH',
      body: { threshold: val }
    });
    // Update local state
    const key = keys.value.find(k => k.id === keyId);
    if (key) key.threshold = val;
    toast.success('Threshold updated');
  } catch (err) {
    toast.error('Failed to update threshold');
  }
};

const createKey = async () => {
  if (!newKeyName.value) return;
  creating.value = true;
  try {
    const res = await $fetch('/api/keys', {
      method: 'POST',
      body: { name: newKeyName.value }
    });
    revealedKey.value = res.apiKey;
    newKeyName.value = '';
    showCreate.value = false;
    await fetchKeys();
    toast.success('API Key Generated');
  } catch (err) {
    toast.error('Failed to generate key');
  } finally {
    creating.value = false;
  }
};

const deleteKey = async (id) => {
  if (!confirm('Are you sure? This will immediately revoke all access using this key.')) return;
  try {
    await $fetch(`/api/keys/${id}`, { method: 'DELETE' });
    await fetchKeys();
    toast.success('Key Revoked');
  } catch (err) {
    toast.error('Failed to revoke key');
  }
};

const copyKey = (text) => {
  navigator.clipboard.writeText(text);
  copied.value = true;
  setTimeout(() => copied.value = false, 2000);
  toast.success('Copied to clipboard');
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

onMounted(() => {
  fetchKeys();
  fetchWebhooks();
  fetchUsage();
  fetchAuditLogs();
});
</script>

<style scoped>
.api-key-manager {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.tabs-nav {
  display: flex;
  gap: 10px;
  border-bottom: 1px solid var(--border-dim);
  margin-bottom: 1.5rem;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding-bottom: 2px;
}

.tabs-nav::-webkit-scrollbar {
  display: none;
}

.tabs-nav button {
  background: transparent;
  border: none;
  color: var(--text-dim);
  padding: 0.8rem 1rem;
  font-size: 0.65rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  white-space: nowrap;
}

.tabs-nav button.active {
  color: var(--accent-green);
  border-bottom-color: var(--accent-green);
}

.key-settings {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.key-settings label {
  font-size: 0.55rem;
  font-weight: 800;
  color: var(--text-dim);
}

.key-settings select {
  background: var(--bg-app);
  border: 1px solid var(--border-dim);
  color: var(--text-main);
  font-size: 0.6rem;
  border-radius: 4px;
  padding: 2px 4px;
}

.usage-stats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.usage-item {
  display: grid;
  grid-template-columns: 80px 1fr 120px;
  align-items: center;
  gap: 15px;
}

.usage-date {
  font-size: 0.6rem;
  font-weight: 700;
  color: var(--text-dim);
}

.usage-bar-wrapper {
  height: 6px;
  background: var(--glass);
  border-radius: 3px;
  overflow: hidden;
}

.usage-bar {
  height: 100%;
  background: var(--accent-green);
  box-shadow: 0 0 10px var(--accent-green);
}

.usage-count {
  font-size: 0.6rem;
  font-family: monospace;
  text-align: right;
}

.btn-create-full {
  width: 100%;
  background: var(--accent-green);
  color: var(--bg-black);
  border: none;
  padding: 0.8rem;
  border-radius: 8px;
  font-weight: 800;
  cursor: pointer;
  margin-top: 1rem;
}

.webhook-item {
  background: var(--glass);
  border: 1px solid var(--border-dim);
  padding: 1rem;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.webhook-url {
  font-weight: 700;
  font-size: 0.75rem;
  word-break: break-all;
  flex: 1;
  padding-right: 1rem;
}

.webhook-events {
  font-size: 0.55rem;
  color: var(--text-dim);
  margin-top: 4px;
}

.audit-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.audit-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 0.8rem;
  background: var(--glass);
  border-radius: 8px;
}

.audit-dot {
  width: 6px;
  height: 6px;
  background: var(--accent-green);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--accent-green);
  flex-shrink: 0;
}

.audit-main {
  flex: 1;
}

.audit-action {
  font-size: 0.75rem;
  font-weight: 700;
}

.audit-time {
  font-size: 0.55rem;
  color: var(--text-dim);
}

.audit-ip {
  font-family: monospace;
  font-size: 0.6rem;
  color: var(--text-dim);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-with-icon {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-with-icon h3 {
  margin: 0;
  font-size: 0.85rem;
  letter-spacing: 0.1em;
  font-weight: 800;
}

.btn-sm {
  background: var(--glass);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.6rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-sm:hover {
  background: var(--border-color);
}

.create-form {
  background: rgba(var(--accent-green-rgb), 0.03);
  border: 1px dashed var(--accent-green);
  padding: 1.25rem;
  border-radius: 12px;
}

.form-group label {
  font-size: 0.55rem;
  color: var(--text-dim);
  font-weight: 800;
  margin-bottom: 8px;
  display: block;
}

.input-with-action {
  display: flex;
  gap: 10px;
}

@media (max-width: 480px) {
  .input-with-action {
    flex-direction: column;
  }
  .btn-create {
    padding: 0.8rem;
    justify-content: center;
  }
  
  .usage-item {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .usage-count {
    text-align: left;
  }

  .webhook-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .webhook-item .delete-btn {
    align-self: flex-end;
  }
}

.input-with-action input {
  flex: 1;
  background: var(--bg-app);
  border: 1px solid var(--border-color);
  padding: 0.6rem 0.8rem;
  border-radius: 8px;
  color: var(--text-main);
  font-size: 0.8rem;
}

.btn-create {
  background: var(--accent-green);
  color: var(--bg-black);
  border: none;
  padding: 0 1rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.reveal-box {
  background: #1a1500;
  border: 1px solid #3d3400;
  padding: 1rem;
  border-radius: 12px;
}

.reveal-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ffcc00;
  font-size: 0.6rem;
  font-weight: 800;
  margin-bottom: 10px;
}

.key-display {
  display: flex;
  gap: 10px;
  background: rgba(0,0,0,0.3);
  padding: 0.75rem;
  border-radius: 6px;
  align-items: center;
}

.key-display code {
  flex: 1;
  font-family: monospace;
  font-size: 0.8rem;
  color: #fff;
  word-break: break-all;
}

.copy-btn {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.1);
  color: #fff;
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
}

.keys-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.key-item {
  background: var(--glass);
  border: 1px solid var(--border-dim);
  padding: 1rem;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;
  gap: 1rem;
  flex-wrap: wrap;
}

.key-item:hover {
  border-color: var(--border-color);
}

.key-info {
  flex: 1;
  min-width: 200px;
}

.key-main {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.key-name {
  font-weight: 700;
  font-size: 0.85rem;
}

.key-prefix code {
  font-size: 0.7rem;
  color: var(--text-dim);
  background: rgba(255,255,255,0.05);
  padding: 2px 6px;
  border-radius: 4px;
}

.key-meta {
  display: flex;
  gap: 15px;
  font-size: 0.55rem;
  color: var(--text-dim);
  font-weight: 600;
}

.delete-btn {
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-dim);
  padding: 6px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.delete-btn:hover {
  background: rgba(var(--error-red-rgb), 0.1);
  color: var(--error-red);
  border-color: rgba(var(--error-red-rgb), 0.2);
}

.loading-state, .empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-dim);
  font-size: 0.7rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.spin { animation: spin 1s linear infinite; }
@keyframes spin {
  to { transform: rotate(360deg); }
}

.integration-guide {
  background: var(--bg-app);
  border: 1px solid var(--border-dim);
  border-radius: 12px;
  overflow: hidden;
}

.guide-header {
  background: var(--glass);
  padding: 0.6rem 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.6rem;
  font-weight: 800;
  border-bottom: 1px solid var(--border-dim);
  color: var(--accent-green);
}

.guide-body {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.method label {
  font-size: 0.55rem;
  color: var(--text-dim);
  font-weight: 700;
  margin-bottom: 6px;
  display: block;
}

.code-block {
  background: rgba(0,0,0,0.2);
  padding: 0.6rem;
  border-radius: 6px;
  border: 1px solid var(--border-dim);
}

.code-block code {
  font-family: monospace;
  font-size: 0.7rem;
  color: var(--text-main);
  word-break: break-all;
}

.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
