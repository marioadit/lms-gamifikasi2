<script setup>
import { onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../../store/authStore";
import { useClassesStore } from "../../../store/users/classesStore";
import { useUserStore } from "../../../store/userStore";
import Swal from "sweetalert2";
const authStore = useAuthStore();
const router = useRouter();
const classesStore = useClassesStore();
const userStore = useUserStore();
// const notificationCount = ref(3);

// Compute current class and teacher info
const currentClass = computed(() => {
  if (classesStore.classes && classesStore.classes.length > 0) {
    return classesStore.classes[0];
  }
  return null;
});

const handleLogout = () => {
  Swal.fire({
    title: "Apakah kamu yakin ingin keluar dari akunmu?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Ya, keluar!",
  }).then((result) => {
    if (result.isConfirmed) {
      userStore.handleLogout();
      router.push("/login");
    } else {
      Swal.fire({
        title: "Kamu tidak keluar dari akunmu",
        icon: "warning",
      });
    }
  });
};

onMounted(() => {
  classesStore.getClassUser();
});
</script>

<template>
  <div class="navbar bg-white shadow-sm px-4 py-2">
    <!-- <div class="flex-none lg:hidden">
      <label for="student-drawer" class="btn btn-square btn-ghost">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          class="inline-block w-6 h-6 stroke-current"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          ></path>
        </svg>
      </label>
    </div> -->

    <div class="flex-1">
      <div class="flex flex-col">
        <h2 class="text-xl font-bold text-gray-800">
          Halo, {{ authStore.name || "Teman" }}
        </h2>
        <div v-if="currentClass" class="text-sm text-gray-600 flex items-center gap-2">
          <span class="flex items-center gap-1">
            <span class="text-gray-900">🏫</span>
            {{ currentClass.name }}
          </span>
          <span class="text-gray-400">|</span>
          <span class="flex items-center gap-1">
            <span class="text-gray-900 font-semibold">Wali Kelas: </span>
            {{ currentClass.teacher.name }}
          </span>
        </div>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <!-- <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
          <div class="indicator">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span
              class="badge badge-primary badge-sm indicator-item"
              v-if="notificationCount"
              >{{ notificationCount }}</span
            >
          </div>
        </div>
        <div
          tabindex="0"
          class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
        >
          <div class="p-2 font-semibold">Notifikasi</div>
          <div class="divider my-0"></div>
          <div class="p-2">
            <div class="text-sm mb-2">Kamu dapat lencana baru!</div>
            <div class="text-sm mb-2">Game matematika baru terbuka</div>
            <div class="text-sm">Laporan belajar mingguan siap</div>
          </div>
        </div>
      </div> -->

      <!-- Home link -->
      <button @click="router.push('/')" class="btn btn-ghost btn-sm">
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
            <router-link to="/profil"
              class="text-lg font-semibold flex items-center gap-2 hover:bg-base-200 rounded-lg p-2 text-gray-900 hover:text-gray-900"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="size-6"
              >
                <path
                  fillRule="evenodd"
                  d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Profil</span>
            </router-link>
          </li>
          <!-- <li>
            <router-link to="/profile"
              class="text-lg font-semibold flex items-center gap-2 hover:bg-base-200 rounded-lg p-2 text-gray-900 hover:text-gray-900"
            >
              <font-awesome-icon :icon="['fas', 'gear']" />
              Pengaturan</router-link
            >
          </li> -->
          <li>
            <button type="button" @click="handleLogout"
              class="text-lg font-semibold flex items-center gap-2 hover:bg-base-200 rounded-lg p-2 text-gray-900 hover:text-gray-900"
              ><font-awesome-icon :icon="['fas', 'right-from-bracket']" />
              Keluar</button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
