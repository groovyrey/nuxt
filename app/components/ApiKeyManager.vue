<template>
  <div class="api-key-manager">
    <div class="section-header">
      <div class="title-with-icon">
        <KeyIcon :size="18" class="accent" />
        <h3>DEVELOPER ACCESS</h3>
      </div>
      <button @click="showCreate = !showCreate" class="btn-sm">
        {{ showCreate ? 'CANCEL' : 'GENERATE NEW KEY' }}
      </button>
    </div>

    <!-- Create Key Form -->
    <Transition name="fade-slide">
      <div v-if="showCreate" class="create-form">
        <div class="form-group">
          <label>KEY NAME</label>
          <div class="input-with-action">
            <input 
              v-model="newKeyName" 
              type="text" 
              placeholder="e.g., Production App" 
              @keyup.enter="createKey"
              :disabled="creating"
            />
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

    <!-- Keys List -->
    <div class="keys-list">
      <div v-if="loading" class="loading-state">
        <Loader2Icon class="spin" :size="24" />
        <span>Syncing keys...</span>
      </div>
      
      <div v-else-if="keys.length === 0" class="empty-state">
        <p>NO ACTIVE API KEYS</p>
      </div>

      <div v-for="key in keys" :key="key.id" class="key-item">
        <div class="key-info">
          <div class="key-main">
            <span class="key-name">{{ key.name }}</span>
            <span class="key-prefix"><code>{{ key.key_prefix }}••••••••</code></span>
          </div>
          <div class="key-meta">
            <span>CREATED: {{ formatDate(key.created_at) }}</span>
            <span v-if="key.last_used_at">USED: {{ formatDate(key.last_used_at) }}</span>
            <span v-else>NEVER USED</span>
          </div>
        </div>
        <button @click="deleteKey(key.id)" class="delete-btn" title="Revoke Key">
          <Trash2Icon :size="14" />
        </button>
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
  Cpu as CpuIcon
} from 'lucide-vue-next';
import { toast } from 'vue-sonner';

const keys = ref([]);
const loading = ref(true);
const creating = ref(false);
const showCreate = ref(false);
const newKeyName = ref('');
const revealedKey = ref(null);
const copied = ref(false);

const fetchKeys = async () => {
  loading.value = true;
  try {
    keys.value = await $fetch('/api/keys');
  } catch (err) {
    toast.error('Failed to load API keys');
  } finally {
    loading.value = false;
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

onMounted(fetchKeys);
</script>

<style scoped>
.api-key-manager {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

@media (max-width: 400px) {
  .input-with-action {
    flex-direction: column;
  }
  .btn-create {
    padding: 0.8rem;
    justify-content: center;
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
}

.key-item:hover {
  border-color: var(--border-color);
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
}

.delete-btn:hover {
  background: rgba(255, 68, 68, 0.1);
  color: #ff4444;
  border-color: rgba(255, 68, 68, 0.2);
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
-border-dim);
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
 .fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
