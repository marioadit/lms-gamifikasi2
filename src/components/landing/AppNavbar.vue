<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../store/authStore';
import Swal from 'sweetalert2';

const router = useRouter();
const authStore = useAuthStore();
const isMobileMenuOpen = ref(false);

// Computed properties from store
const isAuthenticated = computed(() => authStore.isAuthenticated);
const userName = computed(() => authStore.userName);
const userRole = computed(() => authStore.userRole);
const isLoading = computed(() => authStore.isLoading);

const navigateToLogin = () => {
  router.push('/login');
};

const navigateToRegister = () => {
  router.push('/register');
};

const navigateToDashboard = () => {
  if (userRole.value === 'siswa') {
    router.push('/dashboard');
  } else if (userRole.value === 'admin') {
    router.push('/admin');
  } else {
    Swal.fire({
      title: 'Akses tidak diizinkan',
      text: 'Hanya siswa dan admin yang dapat mengakses dashboard.',
      icon: 'error'
    });
  }
};

const handleLogout = async () => {
  try {
    const result = await Swal.fire({
      title: 'Apakah kamu yakin ingin keluar dari akunmu?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, keluar!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      // Show loading
      const loadingSwal = Swal.fire({
        title: 'Tunggu sebentar...',
        text: 'Sedang keluar dari akun',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Attempt logout
      await authStore.logout();
      
      // Close loading
      loadingSwal.close();

      // Close mobile menu
      isMobileMenuOpen.value = false;

      // Navigate to home page
      await router.push('/');

      // Show success message
      await Swal.fire({
        title: 'Berhasil Keluar',
        text: 'Sampai jumpa lagi!',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
    Swal.fire({
      title: 'Error',
      text: error.response?.data?.message || 'Terjadi kesalahan saat logout',
      icon: 'error'
    });
  }
};
</script>

<template>
  <!-- Navigation -->
  <nav class="bg-white shadow-sm">
    <div class="container mx-auto px-4 py-3 flex justify-between items-center">
      <!-- Logo -->
      <div class="flex items-center space-x-2">
        <img src="../../assets/images/sm.png" alt="Logo" class="w-10 h-10" />
        <span class="text-xl font-bold">Sinau Matika</span>
      </div>

      <!-- Hamburger Icon (mobile only) -->
      <div class="md:hidden">
        <button
          @click="isMobileMenuOpen = !isMobileMenuOpen"
          class="text-gray-700 focus:outline-none"
          :disabled="isLoading"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      <!-- Menu desktop -->
      <div class="hidden md:flex space-x-4 items-center">
        <router-link 
          to="/" 
          class="btn btn-ghost"
          :class="{ 'pointer-events-none': isLoading }"
        >
          Home
        </router-link>
        <router-link 
          to="/tentangkami" 
          class="btn btn-ghost"
          :class="{ 'pointer-events-none': isLoading }"
        >
          Tentang Kami
        </router-link>
        <router-link 
          to="/layanan" 
          class="btn btn-ghost"
          :class="{ 'pointer-events-none': isLoading }"
        >
          Layanan
        </router-link>

        <div v-if="!isAuthenticated" class="flex space-x-4">
          <button
            @click="navigateToLogin"
            class="btn border border-primary text-primary hover:bg-primary hover:text-white"
            :disabled="isLoading"
          >
            Login
          </button>
          <button 
            @click="navigateToRegister" 
            class="btn btn-primary"
            :disabled="isLoading"
          >
            Daftar
          </button>
        </div>

        <div v-else class="flex space-x-4 items-center">
          <!-- Avatar Dropdown -->
          <div class="dropdown dropdown-end">
            <div
              tabindex="0"
              role="button"
              class="btn btn-ghost btn-circle avatar"
              :class="{ 'pointer-events-none': isLoading }"
            >
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
                  :to="userRole === 'siswa' ? '/dashboard' : '/admin'"
                  class="text-lg font-semibold flex items-center gap-2 rounded-lg p-2 text-gray-900 w-full text-left"
                  :class="{ 'pointer-events-none': isLoading }"
                >
                  <span>{{ userName || "Dashboard" }}</span>
                </router-link>
              </li>
              <li>
                <button
                  @click="handleLogout"
                  class="text-lg font-semibold flex items-center gap-2 hover:bg-base-200 rounded-lg p-2 text-gray-900 hover:text-gray-900 w-full text-left"
                  :disabled="isLoading"
                >
                  Keluar
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    <div v-if="isMobileMenuOpen" class="md:hidden px-4 pb-4">
      <div class="flex flex-col space-y-2">
        <router-link 
          to="/" 
          class="btn btn-ghost w-full text-left"
          :class="{ 'pointer-events-none': isLoading }"
        >
          Home
        </router-link>
        <router-link 
          to="/tentangkami" 
          class="btn btn-ghost w-full text-left"
          :class="{ 'pointer-events-none': isLoading }"
        >
          Tentang Kami
        </router-link>
        <router-link 
          to="/layanan" 
          class="btn btn-ghost w-full text-left"
          :class="{ 'pointer-events-none': isLoading }"
        >
          Layanan
        </router-link>

        <div v-if="!isAuthenticated" class="flex flex-col space-y-2">
          <button
            @click="navigateToLogin"
            class="btn btn-ghost w-full text-left"
            :disabled="isLoading"
          >
            Login
          </button>
          <button
            @click="navigateToRegister"
            class="btn btn-primary w-full text-left"
            :disabled="isLoading"
          >
            Daftar
          </button>
        </div>

        <div v-else class="flex flex-col space-y-2">
          <router-link
            :to="userRole === 'siswa' ? '/dashboard' : '/admin'"
            class="btn btn-accent w-full text-left"
            :class="{ 'pointer-events-none': isLoading }"
          >
            {{ userName || "Dashboard" }}
          </router-link>
          <button
            @click="handleLogout"
            class="btn btn-ghost w-full text-left"
            :disabled="isLoading"
          >
            Keluar
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>
