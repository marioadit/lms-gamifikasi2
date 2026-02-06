<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from "../../store/authStore";
import Swal from 'sweetalert2';
import { onMounted, ref } from 'vue';

const router = useRouter();

const navigateToHome = () => {
  router.push('/');
};

const navigateToLogin = () => {
  router.push('/login');
};

const navigateToRegister = () => {
  router.push('/register');
};

const useUser = useAuthStore();

const handleLogout = () => {
  Swal.fire({
    title: "Apakah kamu yakin ingin keluar dari akunmu?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Ya, keluar!",
  }).then(async (result) => {
    if (result.isConfirmed) {
      await useUser.logout();
    } else {
      Swal.fire({
        title: "Kamu tidak keluar dari akunmu",
        icon: "warning",
      });
    }
  });
};

const isAuthenticated = ref(false);
const userName = ref(null);
const userRole = ref(null);

onMounted(() => {
  if(useUser.token) {
    isAuthenticated.value = true;
    userName.value = useUser.name;
    userRole.value = useUser.role;
  } else {
    isAuthenticated.value = false;
    userName.value = null;
    userRole.value = null;
  }

  console.log("User authentication status:", isAuthenticated.value);
  console.log("User name:", useUser.name);
  console.log("User role:", useUser.role);

});
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header Section -->
    <div class="bg-primary text-white py-16">
      <div class="container mx-auto px-4">
        <h1 class="text-4xl font-bold text-center">Layanan Kami</h1>
        <p class="text-xl text-center mt-4 max-w-3xl mx-auto">Menawarkan pengalaman belajar interaktif yang disesuaikan untuk setiap siswa</p>
      </div>
    </div>

    <!-- Services Content -->
    <div class="container mx-auto px-4 py-16">
      <!-- Main Services -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-10 mb-20">
        <!-- Service 1 -->
        <div class="card bg-base-100 shadow-xl">
          <figure class="px-10 pt-10">
            <div class="w-20 h-20 rounded-full bg-primary-focus flex items-center justify-center">
              <span class="text-3xl text-white">🎮</span>
            </div>
          </figure>
          <div class="card-body items-center text-center">
            <h2 class="card-title text-2xl font-bold">Platform Pembelajaran Berbasis Game</h2>
            <p class="text-gray-700">Transformasi pembelajaran menjadi pengalaman yang menyenangkan melalui gamifikasi dan konten interaktif.</p>
            <div class="mt-4">
              <!-- <router-link to="/register" class="btn btn-primary">Coba Sekarang</router-link> -->
            </div>
          </div>
        </div>

        <!-- Service 2 -->
        <div class="card bg-base-100 shadow-xl">
          <figure class="px-10 pt-10">
            <div class="w-20 h-20 rounded-full bg-primary-focus flex items-center justify-center">
              <span class="text-3xl text-white">📊</span>
            </div>
          </figure>
          <div class="card-body items-center text-center">
            <h2 class="card-title text-2xl font-bold">Analytics & Perkembangan</h2>
            <p class="text-gray-700">Pantau dan analisis perkembangan belajar siswa dengan metrik komprehensif dan laporan yang detail.</p>
            <div class="mt-4">
              <!-- <router-link to="/register" class="btn btn-primary">Lihat Demo</router-link> -->
            </div>
          </div>
        </div>

        <!-- Service 3 -->
        <div class="card bg-base-100 shadow-xl">
          <figure class="px-10 pt-10">
            <div class="w-20 h-20 rounded-full bg-primary-focus flex items-center justify-center">
              <span class="text-3xl text-white">👨‍👩‍👧‍👦</span>
            </div>
          </figure>
          <div class="card-body items-center text-center">
            <h2 class="card-title text-2xl font-bold">Portal Orang Tua & Guru</h2>
            <p class="text-gray-700">Akses khusus bagi orang tua dan guru untuk memantau dan mendukung perjalanan belajar siswa.</p>
            <div class="mt-4">
              <!-- <router-link to="/register" class="btn btn-primary">Pelajari Lebih Lanjut</router-link> -->
            </div>
          </div>
        </div>
      </div>

      <!-- How It Works Section -->
      <div class="mb-20">
        <h2 class="text-3xl font-bold text-center mb-12">Bagaimana Ini Bekerja</h2>
        
        <div class="flex flex-col md:flex-row items-center justify-between mb-16">
          <div class="md:w-1/2 mb-8 md:mb-0 md:pr-8">
            <img src="https://placehold.co/600x400/3b82f6/FFFFFF?text=Step+1" alt="Step 1" class="rounded-lg shadow-xl" />
          </div>
          <div class="md:w-1/2">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold mr-4">1</div>
              <h3 class="text-2xl font-bold">Daftar Akun</h3>
            </div>
            <p class="text-gray-700 mb-4">
              Buat akun baru dalam hitungan menit. Isi informasi dasar dan pilih jenis akun yang sesuai untuk Anda - siswa, orang tua, atau pendidik.
            </p>
            <p class="text-gray-700">
              Setelah mendaftar, Anda dapat menyesuaikan profil dan preferensi belajar untuk pengalaman yang lebih personal.
            </p>
          </div>
        </div>

        <div class="flex flex-col md:flex-row-reverse items-center justify-between mb-16">
          <div class="md:w-1/2 mb-8 md:mb-0 md:pl-8">
            <img src="https://placehold.co/600x400/3b82f6/FFFFFF?text=Step+2" alt="Step 2" class="rounded-lg shadow-xl" />
          </div>
          <div class="md:w-1/2">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold mr-4">2</div>
              <h3 class="text-2xl font-bold">Pilih Pembelajaran</h3>
            </div>
            <p class="text-gray-700 mb-4">
              Jelajahi berbagai mata pelajaran dan game pembelajaran yang tersedia. Pilih berdasarkan mata pelajaran, tingkat kesulitan, atau rekomendasi personal.
            </p>
            <p class="text-gray-700">
              Konten kami disesuaikan dengan kurikulum nasional dan dibuat dengan bantuan ahli pendidikan terkemuka.
            </p>
          </div>
        </div>

        <div class="flex flex-col md:flex-row items-center justify-between">
          <div class="md:w-1/2 mb-8 md:mb-0 md:pr-8">
            <img src="https://placehold.co/600x400/3b82f6/FFFFFF?text=Step+3" alt="Step 3" class="rounded-lg shadow-xl" />
          </div>
          <div class="md:w-1/2">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold mr-4">3</div>
              <h3 class="text-2xl font-bold">Belajar & Dapatkan Hadiah</h3>
            </div>
            <p class="text-gray-700 mb-4">
              Mulai perjalanan belajar Anda dengan bermain game pendidikan yang menyenangkan. Dapatkan poin, lencana, dan pencapaian saat Anda maju.
            </p>
            <p class="text-gray-700">
              Pantau kemajuan Anda melalui dasbor interaktif dan lihat bagaimana Anda tumbuh dari waktu ke waktu.
            </p>
          </div>
        </div>
      </div>

      <!-- Pricing Section -->

      <!-- CTA Section -->
      <div class="text-center py-10 px-4 bg-base-200 rounded-xl">
        <h2 class="text-3xl font-bold mb-6">Siap Untuk Merevolusi Cara Belajar?</h2>
        <p class="text-gray-700 mb-8 max-w-3xl mx-auto">
          Bergabunglah dengan ribuan siswa, orang tua, dan pendidik yang telah mengubah pengalaman belajar mereka dengan Sinau Matika.
        </p>
        <div class="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <router-link to="/register" class="btn btn-primary btn-lg">Daftar Sekarang</router-link>
          <!-- <router-link to="/kontak" class="btn btn-outline btn-lg">Bicara Dengan Tim Kami</router-link> -->
        </div>
      </div>
    </div>
  </div>
</template> 