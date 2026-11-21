<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../../store/authStore";
import { ArrowRightOnRectangleIcon } from "@heroicons/vue/24/outline";
import Swal from "sweetalert2";

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  Swal.fire({
    title: "Apakah Anda yakin ingin keluar?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Ya, Keluar",
    cancelButtonText: "Batal",
  }).then(async (result) => {
    if (result.isConfirmed) {
      await authStore.logout();
      window.location.href = "/login";
    }
  });
};
</script>

<template>
  <div class="navbar bg-base-100 shadow-sm px-6 py-4 z-10">
    <div class="flex-1">
      <h2 class="text-2xl font-bold">Selamat Datang, {{ authStore.name }}!</h2>
    </div>
    <div class="flex items-center gap-4">
      <!-- Logout Button -->
      <button @click="handleLogout" class="btn btn-ghost btn-sm text-error hover:bg-error/10 flex items-center gap-1.5 font-semibold">
        <ArrowRightOnRectangleIcon class="w-5 h-5" />
        <span>Log out</span>
      </button>
    </div>
  </div>
</template>
