<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
  router.push('/dashboard');
};
</script>

<template>
  <div class="min-h-screen bg-blue-50 flex flex-col items-center justify-center p-6">
    <div class="max-w-lg w-full bg-white rounded-3xl shadow-lg p-8 text-center">
      <!-- Fun 404 illustration using emojis -->
      <div class="text-8xl mb-6 flex justify-center">
        <div class="relative">
          <div class="absolute -top-5 -right-5 text-4xl animate-bounce">❓</div>
          <div>🗺️</div>
        </div>
      </div>
      
      <!-- Child-friendly message -->
      <h1 class="text-3xl font-bold text-purple-600 mb-3">Waduh! Tersesat!</h1>
      <p class="text-lg text-gray-600 mb-8">
        Halaman yang kamu cari tidak ditemukan. Sepertinya kita tersesat di dunia digital! 🌍
      </p>
      
      <!-- Simple back button -->
      <button 
        @click="goHome"
        class="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl text-lg font-bold inline-flex items-center">
        <span class="mr-2">🏠</span>
        <span>Kembali ke Beranda</span>
      </button>
    </div>
  </div>
</template> 