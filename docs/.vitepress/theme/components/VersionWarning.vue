<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vitepress'
import { versions, type DocVersion } from '../../versions'

const route = useRoute()

// Check if we're viewing a non-current version
const viewingVersion = computed<DocVersion | null>(() => {
  const path = route.path
  for (const version of versions) {
    if (!version.current && path.startsWith(version.path)) {
      return version
    }
  }
  return null
})

const currentVersion = computed(() => versions.find(v => v.current))
</script>

<template>
  <div v-if="viewingVersion" class="version-warning">
    <div class="warning-content">
      <span class="warning-icon">⚠️</span>
      <div class="warning-text">
        <strong>You're viewing documentation for {{ viewingVersion.label }}</strong>
        <span v-if="viewingVersion.status === 'deprecated'">
          This version is deprecated and no longer maintained.
        </span>
        <span v-else-if="viewingVersion.status === 'beta'">
          This version is in beta and may have breaking changes.
        </span>
      </div>
      <a 
        v-if="currentVersion" 
        :href="currentVersion.path + 'guide/getting-started'" 
        class="warning-link"
      >
        View {{ currentVersion.label }} docs →
      </a>
    </div>
  </div>
</template>

<style scoped>
.version-warning {
  position: sticky;
  top: var(--vp-nav-height);
  z-index: 20;
  background: linear-gradient(135deg, #ffc51720 0%, #ff575720 100%);
  border-bottom: 1px solid #ffc51740;
}

.warning-content {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: var(--vp-layout-max-width);
  margin: 0 auto;
  padding: 12px 24px;
}

.warning-icon {
  font-size: 20px;
}

.warning-text {
  flex: 1;
  font-size: 14px;
  color: var(--vp-c-text-1);
}

.warning-text strong {
  display: block;
  margin-bottom: 2px;
}

.warning-text span {
  color: var(--vp-c-text-2);
}

.warning-link {
  padding: 6px 12px;
  border-radius: 6px;
  background: var(--vp-c-brand-1);
  color: white;
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  white-space: nowrap;
  transition: background 0.2s ease;
}

.warning-link:hover {
  background: var(--vp-c-brand-2);
}

@media (max-width: 768px) {
  .warning-content {
    flex-wrap: wrap;
    padding: 12px 16px;
  }
  
  .warning-link {
    width: 100%;
    text-align: center;
    margin-top: 8px;
  }
}
</style>
