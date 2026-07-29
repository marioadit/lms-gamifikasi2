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
      <h2 class="text-2xl font-bold">Selamat Datang, {{authStore.name}}!</h2>
    </div>
    <div class="flex items-center gap-4">
      <!-- Home Link -->
      <button @click="goToHomePage" class="btn btn-ghost btn-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
        <span class="ml-1">Beranda</span>
      </button>

      <!-- User Profile Dropdown -->
      <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
          <div class="w-10 rounded-full">
            <img
              alt="User avatar"
              src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
            />
          </div>
        </div>
        <ul
          tabindex="0"
          class="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
        >
          <li>
            <router-link
              to="/admin/profile"
              class="text-base font-semibold flex items-center gap-2 hover:bg-base-200 rounded-lg p-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="w-5 h-5 text-primary"
              >
                <path
                  fillRule="evenodd"
                  d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Profil Saya</span>
            </router-link>
          </li>
          <!-- <li>
            <router-link
              class="text-lg font-semibold flex items-center gap-2 hover:bg-base-200 rounded-lg p-2"
              >⚙️ Pengaturan</router-link
            >
          </li> -->
          <li>
            <button
              class="text-lg font-semibold flex items-center gap-2 hover:bg-base-200 rounded-lg p-2"
              @click="handleLogout"
            >
              🚪 Keluar
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
