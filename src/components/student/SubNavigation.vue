<script setup>
import { ref } from 'vue';

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  showBackButton: {
    type: Boolean,
    default: false
  },
  backRoute: {
    type: String,
    default: '/dashboard'
  },
  tabs: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['tab-change', 'back-clicked']);

const activeTab = ref(props.tabs.length > 0 ? props.tabs[0].id : null);

const changeTab = (tabId) => {
  activeTab.value = tabId;
  emit('tab-change', tabId);
};

const handleBack = () => {
  emit('back-clicked');
};
</script>

<template>
  <div class="bg-white p-6 rounded-3xl shadow-md mb-6">
    <div class="flex items-center gap-3 mb-2">
      <button v-if="showBackButton" 
        @click="handleBack" 
        class="text-2xl">⬅️</button>
      <h1 class="text-2xl font-bold text-slate-900">{{ title }}</h1>
    </div>
    <p v-if="subtitle" class="text-purple-600">{{ subtitle }}</p>
    
    <!-- Tabs -->
    <div v-if="tabs.length > 0" class="flex space-x-3 mt-4 overflow-x-auto pb-2">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="changeTab(tab.id)"
        class="px-4 py-2 rounded-xl text-center min-w-[80px] transition-all"
        :class="activeTab === tab.id ? 
          'bg-purple-100 text-purple-600 font-bold' : 
          'bg-gray-100 text-gray-500 hover:bg-gray-200'">
        <span v-if="tab.icon" class="mr-1">{{ tab.icon }}</span>
        <span>{{ tab.name }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Animasi hover */
button:hover {
  transform: translateY(-1px);
  transition: all 0.2s ease;
}
</style> 