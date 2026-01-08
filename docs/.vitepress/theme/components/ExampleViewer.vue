<template>
  <div class="example-viewer" :class="{ fullscreen: isFullscreen }">
    <!-- Header with controls -->
    <div class="viewer-header">
      <div class="viewer-title">
        <span class="title-text">{{ title }}</span>
        <span v-if="difficulty" class="difficulty" :class="difficultyClass">
          {{ difficulty }}
        </span>
      </div>
      <div class="viewer-controls">
        <button 
          v-if="sourceUrl" 
          class="control-btn"
          @click="showSource = !showSource"
          :title="showSource ? 'Show Demo' : 'View Source'"
        >
          <svg v-if="!showSource" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </button>
        <a 
          v-if="githubUrl"
          :href="githubUrl" 
          target="_blank"
          class="control-btn"
          title="View on GitHub"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        </a>
        <button 
          class="control-btn"
          @click="reloadIframe"
          title="Reload Example"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
        </button>
        <a 
          :href="src"
          target="_blank"
          class="control-btn"
          title="Open in New Tab"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </a>
        <button 
          class="control-btn"
          @click="toggleFullscreen"
          :title="isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'"
        >
          <svg v-if="!isFullscreen" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 3 21 3 21 9"></polyline>
            <polyline points="9 21 3 21 3 15"></polyline>
            <line x1="21" y1="3" x2="14" y2="10"></line>
            <line x1="3" y1="21" x2="10" y2="14"></line>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="4 14 10 14 10 20"></polyline>
            <polyline points="20 10 14 10 14 4"></polyline>
            <line x1="14" y1="10" x2="21" y2="3"></line>
            <line x1="3" y1="21" x2="10" y2="14"></line>
          </svg>
        </button>
      </div>
    </div>

    <!-- Main content area -->
    <div class="viewer-content">
      <!-- Loading state -->
      <div v-if="loading" class="loading-overlay">
        <div class="loading-spinner"></div>
        <span>Loading example...</span>
      </div>

      <!-- Error state -->
      <div v-if="error" class="error-overlay">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span class="error-title">Example Not Available</span>
        <span class="error-message">This example needs to be built first. Run:</span>
        <code class="error-command">pnpm build:examples</code>
        <div class="error-actions">
          <button class="retry-btn" @click="reloadIframe">Try Again</button>
          <a v-if="githubUrl" :href="githubUrl" target="_blank" class="github-btn">View Source on GitHub</a>
        </div>
      </div>

      <!-- Source code view -->
      <div v-if="showSource && sourceCode" class="source-view">
        <pre><code>{{ sourceCode }}</code></pre>
      </div>

      <!-- Example iframe -->
      <iframe
        v-show="!showSource"
        ref="iframeRef"
        :src="iframeSrc"
        :key="iframeKey"
        class="example-iframe"
        @load="onIframeLoad"
        @error="onIframeError"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; xr-spatial-tracking"
        allowfullscreen
        sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
      ></iframe>
    </div>

    <!-- Footer with description -->
    <div v-if="description" class="viewer-footer">
      <p>{{ description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Props {
  /** The URL of the example to embed */
  src: string
  /** Title displayed in the header */
  title?: string
  /** Description shown below the viewer */
  description?: string
  /** Difficulty level: beginner, intermediate, advanced */
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  /** GitHub URL for the example source */
  githubUrl?: string
  /** URL to fetch source code for display */
  sourceUrl?: string
  /** Initial height of the viewer */
  height?: string
  /** Aspect ratio (e.g., '16/9', '4/3') */
  aspectRatio?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Live Example',
  height: '500px',
  aspectRatio: '16/9'
})

const iframeRef = ref<HTMLIFrameElement | null>(null)
const loading = ref(true)
const error = ref(false)
const showSource = ref(false)
const sourceCode = ref('')
const isFullscreen = ref(false)
const iframeKey = ref(0)

const iframeSrc = computed(() => props.src)

const difficultyClass = computed(() => {
  switch (props.difficulty) {
    case 'beginner': return 'difficulty-beginner'
    case 'intermediate': return 'difficulty-intermediate'
    case 'advanced': return 'difficulty-advanced'
    default: return ''
  }
})

function onIframeLoad() {
  loading.value = false
  error.value = false
}

function onIframeError() {
  loading.value = false
  error.value = true
}

function reloadIframe() {
  loading.value = true
  error.value = false
  iframeKey.value++
}

function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
  if (isFullscreen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

// Fetch source code if URL provided
async function fetchSourceCode() {
  if (!props.sourceUrl) return
  try {
    const response = await fetch(props.sourceUrl)
    if (response.ok) {
      sourceCode.value = await response.text()
    }
  } catch (e) {
    console.warn('Failed to fetch source code:', e)
  }
}

// Handle escape key to exit fullscreen
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isFullscreen.value) {
    toggleFullscreen()
  }
}

onMounted(() => {
  fetchSourceCode()
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.example-viewer {
  --viewer-border-radius: 8px;
  --viewer-bg: var(--vp-c-bg-soft);
  --viewer-header-bg: var(--vp-c-bg-alt);
  --viewer-border: var(--vp-c-divider);
  
  border: 1px solid var(--viewer-border);
  border-radius: var(--viewer-border-radius);
  overflow: hidden;
  margin: 1.5rem 0;
  background: var(--viewer-bg);
}

.example-viewer.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  margin: 0;
  border-radius: 0;
  border: none;
}

.viewer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: var(--viewer-header-bg);
  border-bottom: 1px solid var(--viewer-border);
}

.viewer-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.title-text {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--vp-c-text-1);
}

.difficulty {
  font-size: 0.7rem;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.difficulty-beginner {
  background: rgba(52, 211, 153, 0.15);
  color: rgb(16, 185, 129);
}

.difficulty-intermediate {
  background: rgba(251, 191, 36, 0.15);
  color: rgb(245, 158, 11);
}

.difficulty-advanced {
  background: rgba(239, 68, 68, 0.15);
  color: rgb(239, 68, 68);
}

.viewer-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.control-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  color: var(--vp-c-text-2);
  transition: all 0.2s ease;
  text-decoration: none;
}

.control-btn:hover {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-brand-1);
}

.viewer-content {
  position: relative;
  width: 100%;
  aspect-ratio: v-bind('props.aspectRatio');
  min-height: 400px;
  background: #0a0a0f;
}

.fullscreen .viewer-content {
  aspect-ratio: auto;
  height: calc(100vh - 60px - 40px);
  min-height: auto;
}

.example-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

.loading-overlay,
.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background: var(--viewer-bg);
  color: var(--vp-c-text-2);
  z-index: 10;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--vp-c-divider);
  border-top-color: var(--vp-c-brand-1);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-overlay svg {
  color: var(--vp-c-warning-1);
}

.error-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.error-message {
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
}

.error-command {
  background: var(--vp-code-block-bg);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-family: var(--vp-font-family-mono);
  font-size: 0.85rem;
  color: var(--vp-c-brand-1);
}

.error-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.retry-btn,
.github-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  text-decoration: none;
}

.retry-btn:hover,
.github-btn:hover {
  background: var(--vp-c-brand-1);
  color: white;
}

.source-view {
  width: 100%;
  height: 100%;
  overflow: auto;
  background: var(--vp-code-block-bg);
}

.source-view pre {
  margin: 0;
  padding: 1rem;
  font-size: 0.85rem;
  line-height: 1.6;
}

.source-view code {
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-text-1);
}

.viewer-footer {
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--viewer-border);
  background: var(--viewer-header-bg);
}

.viewer-footer p {
  margin: 0;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .viewer-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .viewer-content {
    aspect-ratio: 4/3;
    min-height: 300px;
  }
}
</style>
