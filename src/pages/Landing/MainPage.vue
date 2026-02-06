<script setup>
import { Vue3Lottie } from "vue3-lottie";
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const navigateToRegister = () => {
  router.push("/register");
};
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Hero Section -->
    <section class="text-white py-20">
      <div class="container mx-auto px-4">
        <div class="flex flex-col md:flex-row items-center">
          <div class="md:w-1/2 mb-10 md:mb-0">
            <h1 class="text-slate-700 text-4xl md:text-5xl font-bold mb-6">
              Belajar itu <span class="text-primary">Menyenangkan</span>
            </h1>
            <p class="text-slate-600 text-lg mb-8">
              Nikmati pengalaman belajar dengan platform pendidikan gamifikasi
              kami. Pantau kemajuan, dapatkan hadiah, dan capai tujuan Anda.
            </p>
            <div class="flex justify-center md:justify-start mt-6">
              <button
                @click="navigateToRegister"
                class="flex w-full md:w-1/3 items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl hover:opacity-85 text-lg"
              >
                <span>Mulai Sekarang</span>
              </button>
            </div>
          </div>
          <div class="md:w-1/2 flex justify-end z-index">
            <Vue3Lottie
              animation-link="https://lottie.host/899dbca9-631c-416a-ae2f-20fcfbfa46a9/Bw6plokc5l.json"
              :height="400"
              :width="400"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-16 bg-base-100">
      <div class="container mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold mb-4">Mengapa Memilih Sinau Matika?</h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            Platform kami menggabungkan konten menarik dengan gamifikasi untuk
            membuat belajar menjadi pengalaman yang menyenangkan.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div
            class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div class="card-body items-center text-center">
              <Vue3Lottie
                animation-link="https://lottie.host/ae7edca3-a135-4a71-888c-7c6b236b40a4/mv24L0rUU3.json"
                :height="150"
                :width="150"
              />
              <h3 class="card-title text-xl font-bold">Belajar dengan Game</h3>
              <p class="text-gray-600">
                Ubah belajar menjadi permainan dengan poin, lencana, dan
                pencapaian yang membuat Anda termotivasi.
              </p>
            </div>
          </div>

          <!-- Feature 2 -->
          <div
            class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div class="card-body items-center text-center">
              <Vue3Lottie
                animation-link="https://lottie.host/cd5631a4-1add-42ad-be39-5fdd7fb8d19e/E6HFLGG5mX.json"
                :height="150"
                :width="150"
              />
              <h3 class="card-title text-xl font-bold">Pantau Kemajuan</h3>
              <p class="text-gray-600">
                Pantau peningkatan Anda dengan analitik detail dan wawasan yang
                dipersonalisasi.
              </p>
            </div>
          </div>

          <!-- Feature 3 -->
          <div
            class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div class="card-body items-center text-center">
              <Vue3Lottie
                animation-link="https://lottie.host/adc14812-9279-4436-8754-3ee1d23df76b/KoWjjRAwbT.json"
                :height="150"
                :width="150"
              />
              <h3 class="card-title text-xl font-bold">Konten Interaktif</h3>
              <p class="text-gray-600">
                Terlibat dengan pelajaran dinamis dan interaktif yang membuat
                subjek kompleks mudah dipahami.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Subject Categories -->
    <section class="py-16 bg-gray-50">
      <div class="container mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold mb-4">Jelajahi Mata Pelajaran Kami</h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            Temukan berbagai mata pelajaran dengan pelajaran interaktif yang
            menarik.
          </p>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div
            class="card bg-blue-100 hover:bg-blue-200 transition-all transform hover:scale-105 cursor-pointer"
          >
            <div class="card-body items-center text-center">
              <Vue3Lottie
                animation-link="https://lottie.host/a391320c-8e32-4434-8a08-88c7e697c37f/wVjp6w6GnG.json"
                :height="100"
                :width="100"
              />
              <h3 class="font-bold">Matematika</h3>
            </div>
          </div>

          <div
            class="card bg-green-100 hover:bg-green-200 transition-all transform hover:scale-105 cursor-pointer"
          >
            <div class="card-body items-center text-center">
              <Vue3Lottie
                animation-link="https://lottie.host/1cbd193f-b523-42f6-8fc1-a90538eb4fae/I3k5A6EFaO.json"
                :height="100"
                :width="100"
              />
              <h3 class="font-bold">Membaca</h3>
            </div>
          </div>

          <div
            class="card bg-yellow-100 hover:bg-yellow-200 transition-all transform hover:scale-105 cursor-pointer"
          >
            <div class="card-body items-center text-center">
              <Vue3Lottie
                animation-link="https://lottie.host/93f3addf-5cd1-4c26-85ec-c5d651939bb8/nEOBPbCDLl.json"
                :height="100"
                :width="100"
              />
              <h3 class="font-bold">Menulis</h3>
            </div>
          </div>

          <div
            class="card bg-purple-100 hover:bg-purple-200 transition-all transform hover:scale-105 cursor-pointer"
          >
            <div class="card-body items-center text-center">
              <Vue3Lottie
                animation-link="https://assets5.lottiefiles.com/packages/lf20_xyadoh9h.json"
                :height="100"
                :width="100"
              />
              <h3 class="font-bold">Sains</h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
