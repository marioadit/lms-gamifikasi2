<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { useQuizStore } from "../../../store/quizStore";
import Swal from "sweetalert2";
import { Vue3Lottie } from 'vue3-lottie';

const route = useRoute();
const quizStore = useQuizStore();

const isLoading = ref(false);
const errorMessage = ref(null);
const searchQuery = ref("");

const loadQuizzes = async () => {
  isLoading.value = true;
  errorMessage.value = null;
  try {
    await quizStore.getQuizzes();
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  await loadQuizzes();
});

watch(
  () => route.fullPath,
  async (newPath) => {
    if (newPath === "/admin/kuis") {
      try {
        await loadQuizzes();
      } catch (error) {
        console.error("Error loading classes:", error);
      }
    }
  },
  { immediate: true }
);

const filteredQuizzes = computed(() => {
  return quizStore.quizzes.filter((quiz) => {
    return quiz.title.toLowerCase().includes(searchQuery.value.toLowerCase());
  });
});

const deleteQuiz = async (id) => {
  Swal.fire({
    title: "Apakah Anda yakin ingin menghapus kuis ini?",
    text: "Kuis yang dihapus tidak dapat dibatalkan",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ya, Hapus",
    cancelButtonText: "Batal",
    confirmButtonText: "OK",
  }).then(async (result) => {
    if (result.isConfirmed) {
      await quizStore.deleteQuiz(id);
      loadQuizzes();
    }
  });
};
</script>
<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold">Kelola Kuis</h1>
        <p class="text-gray-500">Buat dan kelola kuis untuk siswa</p>
      </div>

      <router-link to="/admin/kuis/tambah" class="btn btn-primary">
        <span class="mr-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        </span>
        Tambah Kuis Baru
      </router-link>
    </div>

    <!-- Filter and Search -->
    <div class="bg-white p-4 rounded-lg shadow mb-6">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="w-full md:w-1/2">
          <label for="search" class="block text-sm font-medium text-gray-700"
            >Cari Kuis</label
          >
          <input
            type="text"
            id="search"
            v-model="searchQuery"
            placeholder="Cari kuis berdasarkan judul atau deskripsi"
            class="input input-bordered w-full"
          />
        </div>
      </div>
    </div>

    <!-- Loading indicator -->
    <div v-if="isLoading" class="flex justify-center my-12 flex-col items-center">
      <Vue3Lottie
        animation-link="https://assets1.lottiefiles.com/packages/lf20_qjosmr4w.json"
        :height="200"
        :width="200"
      />
      <p class="text-gray-500 mt-4">Memuat data kuis...</p>
    </div>

    <!-- Error message -->
    <div
      v-else-if="errorMessage"
      class="bg-red-100 text-red-700 p-4 rounded-lg mb-6"
    >
      {{ errorMessage }}
    </div>

    <!-- Quiz Table -->
    <div v-else-if="filteredQuizzes.length > 0" class="overflow-x-auto bg-white rounded-lg shadow">
      <table class="table table-zebra w-full">
        <thead>
          <tr>
            <th>Judul Kuis</th>
            <th>Deskripsi</th>
            <th>Waktu Mulai</th>
            <th>Waktu Selesai</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="quiz in filteredQuizzes" :key="quiz.id">
            <td class="font-medium">{{ quiz.title }}</td>
            <td class="max-w-xs">
              {{ quiz.description.length > 30 ? quiz.description.substring(0, 30) + '...' : quiz.description }}
            </td>
            <td class="max-w-xs">
              {{
                new Date(quiz.start_time).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              }}
            </td>
            <td>
              {{
                new Date(quiz.end_time).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              }}
            </td>
            <td>
              <span>{{ quiz.is_active ? "Aktif" : "Tidak Aktif" }}</span>
            </td>
            <td class="flex gap-2">
              <router-link
                :to="`/admin/kuis/${quiz.id}`"
                class="btn btn-sm btn-primary"
              >
                Lihat
              </router-link>

               <router-link
                :to="`/admin/kuis/${quiz.id}/pertanyaan`"
                class="btn btn-sm btn-info"
              >
                Pertanyaan
              </router-link>

              <router-link
                :to="`/admin/kuis/${quiz.id}/edit`"
                class="btn btn-sm btn-warning"
              >
                Edit
              </router-link>

              <button class="btn btn-sm btn-error" @click="deleteQuiz(quiz.id)">
                Hapus
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="bg-white rounded-lg shadow-md p-8 text-center"
    >
      <Vue3Lottie
        animation-link="https://assets9.lottiefiles.com/packages/lf20_hl5n0bwb.json"
        :height="300"
        :width="300"
      />
      <h3 class="text-lg font-medium text-gray-900 mb-2">
        Belum ada kuis
      </h3>
      <p class="text-gray-500 mb-6">
        Mulai tambahkan kuis untuk siswa
      </p>
      <router-link
        to="/admin/kuis/tambah"
        class="btn btn-primary"
      >
        Tambah Kuis Baru
      </router-link>
    </div>
  </div>
</template>
