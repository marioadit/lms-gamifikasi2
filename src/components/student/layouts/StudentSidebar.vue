<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../../store/authStore";
const router = useRouter();
const authStore = useAuthStore();

const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  router.push("/login");
};
</script>

<template>
  <div class="bg-white w-64 min-h-full p-4 flex flex-col space-y-4">
    <!-- Logo/App Title dan Tombol Tutup (pada Mobile) -->
    <div class="flex justify-between items-center mb-4">
      <div class="p-4 flex items-center gap-2">
        <div
          class="w-12 h-12 bg-purple-100 rounded-full grid place-items-center"
        >
          <span class="text-2xl">🎓</span>
        </div>
        <h1 class="text-xl font-bold text-slate-900">Petualangan Belajar</h1>
      </div>

      <!-- Tombol Tutup (hanya muncul di mobile) -->
      <label
        for="student-drawer"
        class="lg:hidden btn btn-circle btn-ghost text-2xl"
      >
        <div class="flex items-center justify-center">
          <span>✖️</span>
        </div>
      </label>
    </div>

    <!-- Navigation Links - Dikelompokkan untuk anak SD -->
    <div class="space-y-2">
      <!-- Beranda -->
      <div class="px-4 py-2 text-sm font-semibold text-purple-600">UTAMA</div>
      <router-link
        to="/dashboard"
        class="flex items-center gap-3 p-4 rounded-xl hover:bg-purple-50 transition-colors duration-200 text-gray-600"
      >
        <div class="text-2xl">
          <font-awesome-icon :icon="['fas', 'house']" />
        </div>
        <span class="text-lg font-medium">Beranda</span>
      </router-link>

      <!-- Kelas -->
      <div class="px-4 py-2 text-sm font-semibold text-purple-600">BELAJAR</div>
      <router-link
        to="/kelas"
        class="flex items-center gap-3 p-4 rounded-xl hover:bg-purple-50 transition-colors duration-200 text-gray-600"
      >
        <div class="text-2xl">
          <font-awesome-icon :icon="['fas', 'school']" />
        </div>
        <span class="text-lg font-medium">Kelasku</span>
      </router-link>

      <router-link
        to="/kuis/results"
        class="flex items-center gap-3 p-4 rounded-xl hover:bg-purple-50 transition-colors duration-200 text-gray-600"
      >
        <div class="text-2xl">
          <font-awesome-icon :icon="['fas', 'book-open-reader']" />
        </div>
        <span class="text-lg font-medium">Hasil Kuis</span>
      </router-link>

      <!-- Pencapaian -->
      <!-- <div class="px-4 py-2 text-sm font-semibold text-purple-600">
        PENCAPAIAN
      </div>
      <router-link
        to="/nilai"
        class="flex items-center gap-3 p-4 rounded-xl hover:bg-purple-50 transition-colors duration-200 text-gray-600"
      >
        <div class="text-2xl">
          <font-awesome-icon :icon="['fas', 'rectangle-list']" />
        </div>
        <span class="text-lg font-medium">Nilaiku</span>
      </router-link> -->

      <!-- <router-link
        to="/lencana"
        class="flex items-center gap-3 p-4 rounded-xl hover:bg-purple-50 transition-colors duration-200 text-gray-600"
      >
        <div class="text-2xl">
          <font-awesome-icon :icon="['fas', 'certificate']" />
        </div>
        <span class="text-lg font-medium">Lencana</span>
      </router-link> -->
    </div>

    <!-- User Profile Section at Bottom -->
    <div class="mt-auto p-4 border-t border-gray-200">
      <div class="flex items-center gap-3 p-2 rounded-xl mb-4">
        <div
          class="w-12 h-12 bg-purple-100 rounded-full grid place-items-center"
        >
          <span class="text-xl">👨</span>
        </div>
        <div>
          <h3 class="font-bold text-lg">{{ authStore.name }}</h3>
          <p class="text-sm text-gray-500">Siswa</p>
        </div>
      </div>

      <router-link
        to="/profil"
        class="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 transition-colors duration-200"
      >
        <div class="text-xl">
          <font-awesome-icon :icon="['fas', 'user']" />
        </div>
        <span class="text-base font-medium">Profil Saya</span>
      </router-link>

      <button
        @click="handleLogout"
        class="flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 text-red-600 transition-colors duration-200 w-full"
      >
        <div class="text-xl">
          <font-awesome-icon :icon="['fas', 'right-from-bracket']" />
        </div>
        <span class="text-base font-medium">Keluar</span>
      </button>
    </div>
  </div>
</template>
