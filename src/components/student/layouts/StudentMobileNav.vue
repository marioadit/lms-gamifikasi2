<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

// Menentukan apakah menu aktif berdasarkan path
const isActive = (path) => {
  return route.path.includes(path);
};
</script>

<template>
  <div class="fixed bottom-0 left-0 right-0 lg:hidden z-50">
    <!-- Bottom navigation bar untuk mobile -->
    <div class="bg-slate-100 shadow-lg rounded-t-3xl p-2 pb-safe">
      <div class="flex justify-around items-center">
        <!-- Beranda -->
        <router-link to="/dashboard" class="flex flex-col items-center p-3 w-20">
          <div class="text-2xl mb-1" :class="isActive('/dashboard') ? 'text-purple-600' : 'text-gray-600'">
            <font-awesome-icon :icon="['fas', 'house']" />
          </div>
          <span class="text-xs font-medium" :class="isActive('/dashboard') ? 'text-purple-600' : 'text-gray-600'">
            Beranda
          </span>
          <div v-if="isActive('/dashboard')" class="absolute -top-1 w-6 h-1 bg-purple-600 rounded-full"></div>
        </router-link>

        <!-- Kelas -->
        <router-link to="/kelas" class="flex flex-col items-center p-3 w-20">
          <div class="text-2xl mb-1" :class="isActive('/kelas') ? 'text-purple-600' : 'text-gray-600'">
            <font-awesome-icon :icon="['fas', 'school']" />
          </div>
          <span class="text-xs font-medium" :class="isActive('/kelas') ? 'text-purple-600' : 'text-gray-600'">
            Kelasku
          </span>
          <div v-if="isActive('/kelas')" class="absolute -top-1 w-6 h-1 bg-purple-600 rounded-full"></div>
        </router-link>

        <!-- Kuis -->
        <router-link to="/kuis/results" class="flex flex-col items-center p-3 w-20">
          <div class="text-2xl mb-1" :class="isActive('/kuis') ? 'text-purple-600' : 'text-gray-600'">
             <font-awesome-icon :icon="['fas', 'book-open-reader']" />
          </div>
          <span class="text-xs font-medium" :class="isActive('/kuis') ? 'text-purple-600' : 'text-gray-600'">
            Kuis
          </span>
          <div v-if="isActive('/kuis')" class="absolute -top-1 w-6 h-1 bg-purple-600 rounded-full"></div>
        </router-link>

        <!-- Profil -->
        <router-link to="/profil" class="flex flex-col items-center p-3 w-20">
          <div class="text-2xl mb-1" :class="isActive('/profil') ? 'text-purple-600' : 'text-gray-600'">
            <font-awesome-icon :icon="['fas', 'user']" />
          </div>
          <span class="text-xs font-medium" :class="isActive('/profil') ? 'text-purple-600' : 'text-gray-600'">
            Profil
          </span>
          <div v-if="isActive('/profil')" class="absolute -top-1 w-6 h-1 bg-purple-600 rounded-full"></div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.router-link-active {
  position: relative;
}

/* Animasi hover */
.flex-col:hover {
  transform: translateY(-2px);
  transition: all 0.2s ease;
}

/* Mendukung safe area pada iPhone */
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 1rem);
}
</style> 