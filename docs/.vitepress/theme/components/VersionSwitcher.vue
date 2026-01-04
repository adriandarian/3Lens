<script setup lang="ts">
import { ref, computed } from 'vue'
import { versions, statusColors, type DocVersion } from '../versions'

const isOpen = ref(false)
const currentVersion = computed(() => versions.find(v => v.current) || versions[0])

function getStatusBadge(status?: DocVersion['status']) {
  if (!status || status === 'stable') return ''
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function getStatusColor(status?: DocVersion['status']) {
  return statusColors[status || 'stable']
}

function toggleDropdown() {
  isOpen.value = !isOpen.value
}

function closeDropdown() {
  isOpen.value = false
}
</script>

<template>
  <div class="version-switcher" @mouseleave="closeDropdown">
    <button 
      class="version-button" 
      @click="toggleDropdown"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
    >
      <span class="version-label">{{ currentVersion.label }}</span>
      <svg 
        class="version-arrow" 
        :class="{ rotated: isOpen }"
        xmlns="http://www.w3.org/2000/svg" 
        width="12" 
        height="12" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2"
      >
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </button>
    
    <Transition name="dropdown">
      <div v-if="isOpen" class="version-dropdown" role="listbox">
        <a
          v-for="version in versions"
          :key="version.path"
          :href="version.path"
          class="version-item"
          :class="{ active: version.current }"
          role="option"
          :aria-selected="version.current"
          @click="closeDropdown"
        >
          <span class="version-item-label">{{ version.label }}</span>
          <span 
            v-if="getStatusBadge(version.status)" 
            class="version-badge"
            :style="{ backgroundColor: getStatusColor(version.status) + '20', color: getStatusColor(version.status) }"
          >
            {{ getStatusBadge(version.status) }}
          </span>
          <span v-if="version.current" class="current-badge">Latest</span>
        </a>
        
        <div class="version-divider"></div>
        
        <a href="/changelog" class="version-item version-link" @click="closeDropdown">
          <span>📋 Changelog</span>
        </a>
        <a href="/guide/migration" class="version-item version-link" @click="closeDropdown">
          <span>🔄 Migration Guide</span>
        </a>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.version-switcher {
  position: relative;
  display: inline-flex;
}

.version-button {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.version-button:hover {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-bg-mute);
}

.version-arrow {
  transition: transform 0.2s ease;
}

.version-arrow.rotated {
  transform: rotate(180deg);
}

.version-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 200px;
  padding: 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-elv);
  box-shadow: var(--vp-shadow-3);
  z-index: 100;
}

.version-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  color: var(--vp-c-text-1);
  text-decoration: none;
  font-size: 13px;
  transition: background 0.2s ease;
}

.version-item:hover {
  background: var(--vp-c-bg-soft);
}

.version-item.active {
  background: var(--vp-c-brand-soft);
}

.version-item-label {
  flex: 1;
}

.version-badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
}

.current-badge {
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--vp-c-brand-1);
  color: white;
  font-size: 10px;
  font-weight: 600;
}

.version-divider {
  height: 1px;
  margin: 8px 0;
  background: var(--vp-c-divider);
}

.version-link {
  color: var(--vp-c-text-2);
  font-size: 12px;
}

.version-link:hover {
  color: var(--vp-c-text-1);
}

/* Dropdown animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
