<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../../store/authStore";

const authStore = useAuthStore();
const router = useRouter();
const notificationCount = ref(3);

const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  router.push("/login");
};
const goToHomePage = () => {
  router.push("/");
};
</script>

<template>
  <div class="navbar bg-base-100 shadow-sm px-6 py-4 z-10">
    <div class="flex-1">
      <h2 class="text-2xl font-bold">Selamat Datang, {{ authStore.name }}!</h2>
    </div>
    <div class="flex items-center gap-4">
      <!-- Home Link -->
      <button @click="goToHomePage" class="btn btn-ghost btn-sm">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span class="ml-1">Beranda</span>
      </button>

    </div>
  </div>
</template>
