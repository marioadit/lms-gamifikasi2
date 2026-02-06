<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from "../../store/authStore";
import Swal from 'sweetalert2';
import { onMounted, ref } from 'vue';
import heroSection from "../../assets/images/hero-section.png";


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
        <h1 class="text-4xl font-bold text-center">Tentang Kami</h1>
        <p class="text-xl text-center mt-4 max-w-3xl mx-auto">Mengenal lebih dekat Sinau Matika dan misi kami untuk merevolusi pendidikan.</p>
      </div>
    </div>

    <!-- About Content -->
    <div class="container mx-auto px-4 py-16">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <h2 class="text-3xl font-bold mb-6">Cerita Kami</h2>
          <p class="text-gray-700 mb-4">
            Sinau Matika didirikan pada tahun 2025 dengan misi yang jelas: untuk membuat pendidikan lebih menyenangkan, interaktif dan efektif melalui gamifikasi.
          </p>
          <p class="text-gray-700 mb-4">
            Kami percaya bahwa setiap anak memiliki potensi untuk berprestasi tinggi dalam pendidikan ketika mereka terlibat dan termotivasi. Itulah mengapa kami menciptakan platform yang mengubah pembelajaran menjadi petualangan.
          </p>
          <p class="text-gray-700">
            Dengan tim ahli pendidikan dan pengembang teknologi, kami terus berinovasi dan mengembangkan cara-cara baru untuk membuat pembelajaran menjadi pengalaman yang menyenangkan untuk semua siswa.
          </p>
        </div>
        <div class="flex justify-center">
          <img :src="heroSection" alt="Our Story" class="rounded-lg shadow-xl image-white" />
        </div>
      </div>

      <!-- Vision & Mission -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div class="card bg-base-100 shadow-lg">
          <div class="card-body">
            <h3 class="text-2xl font-bold mb-4">Visi Kami</h3>
            <p class="text-gray-700">
              Menjadi platform pendidikan terdepan yang mengubah cara anak-anak belajar melalui gamifikasi dan konten interaktif, menciptakan generasi pembelajar yang termotivasi dan percaya diri.
            </p>
          </div>
        </div>
        <div class="card bg-base-100 shadow-lg">
          <div class="card-body">
            <h3 class="text-2xl font-bold mb-4">Misi Kami</h3>
            <ul class="space-y-2 text-gray-700">
              <li class="flex items-start">
                <span class="text-primary mr-2">✓</span>
                <span>Merancang pengalaman belajar yang menyenangkan dan memotivasi</span>
              </li>
              <li class="flex items-start">
                <span class="text-primary mr-2">✓</span>
                <span>Menyediakan konten pendidikan berkualitas tinggi yang sesuai dengan kurikulum nasional</span>
              </li>
              <li class="flex items-start">
                <span class="text-primary mr-2">✓</span>
                <span>Membantu siswa mengembangkan keterampilan abad ke-21 melalui pembelajaran berbasis permainan</span>
              </li>
              <li class="flex items-start">
                <span class="text-primary mr-2">✓</span>
                <span>Memberikan alat bagi guru dan orang tua untuk memantau dan mendukung perkembangan anak</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Team Section -->
      <div class="mb-16">
        <h2 class="text-3xl font-bold text-center mb-12">Tim Kami</h2>
        <div class="flex justify-center">
          <div class="grid grid-cols-1 gap-8 max-w-7xl">
            <!-- First Row - Members 1 & 2 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <!-- Team Member 1 -->
              <div class="card bg-base-100 shadow-lg">
                <div class="card-body items-center text-center">
                  <div class="avatar mb-4">
                    <div class="w-24 rounded-full">
                      <img src="../../assets/images/pargo.png" alt="Team Member" />
                    </div>
                  </div>
                  <h3 class="text-xl font-bold">Argo Wibowo, S.T., MT</h3>
                  <p class="text-gray-500">Project Manager</p>
                  <p class="text-gray-700 mt-4">
                    Dosen di bidang teknologi dengan pengalaman 6 tahun.
                  </p>
                </div>
              </div>
              
              <!-- Team Member 2 -->
              <div class="card bg-base-100 shadow-lg">
                <div class="card-body items-center text-center">
                  <div class="avatar mb-4">
                    <div class="w-24 rounded-full">
                      <img src="../../assets/images/bendang.png" alt="Team Member" />
                    </div>
                  </div>
                  <h3 class="text-xl font-bold">Dr. Fransisca Endang Lestariningsih, M.Hum.</h3>
                  <p class="text-gray-500">Kepala Pengembangan Kurikulum</p>
                  <p class="text-gray-700 mt-4">
                    Spesialis pendidikan dengan fokus pada pengembangan kurikulum interaktif.
                  </p>
                </div>
              </div>
            </div>
      
            <!-- Second Row - Members 3, 4, 5 & 6 -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <!-- Team Member 3 -->
              <div class="card bg-base-100 shadow-lg">
                <div class="card-body items-center text-center">
                  <div class="avatar mb-4">
                    <div class="w-24 rounded-full">
                      <img src="../../assets/images/wayan.jpeg" alt="Team Member" />
                    </div>
                  </div>
                  <h3 class="text-xl font-bold">Wayan Berdyanto</h3>
                  <p class="text-gray-500">Junior Developer</p>
                  <p class="text-gray-700 mt-4">
                    Junior developer dengan pengalaman 2 tahun.
                  </p>
                </div>
              </div>
              
              <!-- Team Member 4 -->
              <div class="card bg-base-100 shadow-lg">
                <div class="card-body items-center text-center">
                  <div class="avatar mb-4">
                    <div class="w-24 rounded-full">
                      <img src="../../assets/images/adit.png" alt="Team Member" />
                    </div>
                  </div>
                  <h3 class="text-xl font-bold">Mario Aditya Kurnianto</h3>
                  <p class="text-gray-500">Junior Developer</p>
                  <p class="text-gray-700 mt-4">
                    Developer dengan fokus pada pengembangan aplikasi.
                  </p>
                </div>
              </div>
      
              <!-- Team Member 5 -->
              <div class="card bg-base-100 shadow-lg">
                <div class="card-body items-center text-center">
                  <div class="avatar mb-4">
                    <div class="w-24 rounded-full">
                      <img src="../../assets/images/fani.jpg" alt="Team Member" />
                    </div>
                  </div>
                  <h3 class="text-xl font-bold">Fania Angel Keruxa Euanggelia Bowono</h3>
                  <p class="text-gray-500">UI/UX Designer</p>
                  <p class="text-gray-700 mt-4">
                    Desainer antarmuka dengan fokus pada pengalaman pengguna anak-anak.
                  </p>
                </div>
              </div>
              
              <!-- Team Member 6 -->
              <div class="card bg-base-100 shadow-lg">
                <div class="card-body items-center text-center">
                  <div class="avatar mb-4">
                    <div class="w-24 rounded-full">
                      <img src="../../assets/images/audy.jpg" alt="Team Member" />
                    </div>
                  </div>
                  <h3 class="text-xl font-bold">Stefanus Audy Advent Kristy</h3>
                  <p class="text-gray-500">Content Specialist</p>
                  <p class="text-gray-700 mt-4">
                    Ahli konten pendidikan dengan pengalaman mengajar.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div class="text-center">
        <h2 class="text-3xl font-bold mb-6">Bergabunglah dengan Petualangan Belajar</h2>
        <p class="text-gray-700 mb-8 max-w-3xl mx-auto">
          Menjadi bagian dari revolusi pendidikan bersama Sinau Matika dan bantu kami menciptakan pengalaman belajar yang menyenangkan untuk semua anak.
        </p>
        <div class="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <router-link to="/register" class="btn btn-primary btn-lg">Daftar Sekarang</router-link>
          <!-- <router-link to="/kontak" class="btn btn-outline btn-lg">Hubungi Kami</router-link> -->
        </div>
      </div>
    </div>
  </div>
</template> 