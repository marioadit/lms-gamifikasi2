<script setup>
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  HomeIcon,
  AcademicCapIcon,
  BookOpenIcon,
  PencilSquareIcon,
  UserGroupIcon,
  UserIcon,
  TrophyIcon,
  StarIcon,
  ChartBarIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/vue/24/outline";
import Swal from "sweetalert2";

const route = useRoute();
const isUserMenuOpen = ref(false);
const isQuizMenuOpen = ref(false);

const userRole = computed(() => localStorage.getItem("role") || "");

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value;
};

const toggleQuizMenu = () => {
  isQuizMenuOpen.value = !isQuizMenuOpen.value;
};

const logout = () => {
  Swal.fire({
    title: "Apakah Anda yakin ingin keluar?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.location.href = "/login"; // because RouterLink is not used in logout
    }
  });
};
</script>

<template>
  <div class="bg-base-200 w-64 min-h-full p-4 flex flex-col space-y-2">
    <!-- Logo/App Title -->
    <div class="p-4 mb-6 flex items-center gap-2">
      <div class="w-10 h-10 bg-neutral rounded-full grid place-items-center">
        <span class="text-neutral-content text-xl">🎓</span>
      </div>
      <h1 class="text-xl font-bold">Sinau Matika</h1>
    </div>

    <!-- Navigation Links -->
    <ul class="menu menu-md p-0 [&_li>*]:rounded-lg w-full space-y-2">
      <li>
        <router-link to="/admin" :class="{ active: $route.path === '/admin' }">
          <HomeIcon class="w-5 h-5" />
          <span>Dashboard</span>
        </router-link>
      </li>
      <li>
        <router-link
          to="/admin/kelas"
          :class="{ active: $route.path.includes('/admin/kelas') }"
        >
          <AcademicCapIcon class="w-5 h-5" />
          <span>Kelola Kelas</span>
        </router-link>
      </li>
      <li>
        <router-link
          to="/admin/pelajaran"
          :class="{ active: $route.path.includes('/admin/pelajaran') }"
        >
          <BookOpenIcon class="w-5 h-5" />
          <span>Kelola Pelajaran</span>
        </router-link>
      </li>
      <li>
        <div
          @click="toggleQuizMenu"
          class="flex items-center justify-between p-3 hover:bg-base-300 cursor-pointer"
          :class="{
            'bg-base-300':
              isQuizMenuOpen || $route.path.includes('/admin/kuis'),
          }"
        >
          <div class="flex items-center gap-2">
            <PencilSquareIcon class="w-5 h-5" />
            <span>Kelola Kuis</span>
          </div>
          <ChevronDownIcon v-if="!isQuizMenuOpen" class="w-4 h-4" />
          <ChevronUpIcon v-else class="w-4 h-4" />
        </div>

        <!-- Submenu -->
        <ul v-show="isQuizMenuOpen" class="pl-4 mt-1 space-y-1">
          <li>
            <router-link
              to="/admin/kuis"
              class="flex items-center gap-2 p-2 rounded-md hover:bg-base-300"
              :class="{
                'bg-primary text-white': $route.path === '/admin/kuis',
              }"
            >
              <UserIcon class="w-4 h-4" />
              <span>Daftar Kuis</span>
            </router-link>
          </li>
          <li>
            <router-link
              to="/admin/kuis/hasil"
              class="flex items-center gap-2 p-2 rounded-md hover:bg-base-300"
              :class="{
                'bg-primary text-white': $route.path.includes('/admin/kuis/hasil'),
              }"
            >
              <UserIcon class="w-4 h-4" />
              <span>Hasil Kuis</span>
            </router-link>
          </li>
        </ul>
      </li>

      <!-- Collapsible User Management Menu -->
      <li>
        <div
          @click="toggleUserMenu"
          class="flex items-center justify-between p-3 hover:bg-base-300 cursor-pointer"
          :class="{
            'bg-base-300':
              isUserMenuOpen ||
              $route.path.includes('/admin/users/siswa') ||
              $route.path.includes('/admin/users/guru'),
          }"
        >
          <div class="flex items-center gap-2">
            <UserGroupIcon class="w-5 h-5" />
            <span>Kelola Users</span>
          </div>
          <ChevronDownIcon v-if="!isUserMenuOpen" class="w-4 h-4" />
          <ChevronUpIcon v-else class="w-4 h-4" />
        </div>

        <!-- Submenu -->
        <ul v-show="isUserMenuOpen" class="pl-4 mt-1 space-y-1">
          <li>
            <router-link
              to="/admin/users/siswa"
              class="flex items-center gap-2 p-2 rounded-md hover:bg-base-300"
              :class="{
                'bg-primary text-white': $route.path.includes('/admin/users/siswa'),
              }"
            >
              <UserIcon class="w-4 h-4" />
              <span>Kelola Siswa</span>
            </router-link>
          </li>
          <li v-if="userRole === 'admin'">
            <router-link
              to="/admin/users/guru"
              class="flex items-center gap-2 p-2 rounded-md hover:bg-base-300"
              :class="{
                'bg-primary text-white': $route.path.includes('/admin/users/guru'),
              }"
            >
              <UserIcon class="w-4 h-4" />
              <span>Kelola Guru</span>
            </router-link>
          </li>
        </ul>
      </li>

      <!-- <li>
        <router-link
          to="/admin/badges"
          :class="{ active: $route.path.includes('/admin/badges') }"
        >
          <TrophyIcon class="w-5 h-5" />
          <span>Kelola Lencana</span>
        </router-link>
      </li>
      <li>
        <router-link
          to="/admin/achievements"
          :class="{ active: $route.path.includes('/admin/achievements') }"
        >
          <StarIcon class="w-5 h-5" />
          <span>Kelola Pencapaian</span>
        </router-link>
      </li>
      <li>
        <router-link
          to="/admin/laporan"
          :class="{ active: $route.path.includes('/admin/laporan') }"
        >
          <ChartBarIcon class="w-5 h-5" />
          <span>Laporan & Progres</span>
        </router-link>
      </li> -->
    </ul>

    <!-- User Profile Section at Bottom -->
    <div class="mt-auto">
      <router-link
        to="/admin/profile"
        class="p-3 flex items-center gap-3 hover:bg-base-300 rounded-xl cursor-pointer transition-colors"
        :class="{ 'bg-base-300 font-bold': $route.path === '/admin/profile' }"
      >
        <div class="avatar">
          <div class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
            👤
          </div>
        </div>
        <div>
          <h3 class="font-semibold text-sm">Profil Saya ⚙️</h3>
          <p class="text-xs text-gray-500">Edit Nama & Password</p>
        </div>
      </router-link>

      <button
        @click="logout"
        class="w-full menu-item flex items-center gap-2 p-3 hover:bg-base-300 rounded-xl cursor-pointer text-red-600 font-semibold mt-1"
      >
        <ArrowRightOnRectangleIcon class="w-5 h-5" />
        <span>Keluar</span>
      </button>
    </div>
  </div>
</template>
