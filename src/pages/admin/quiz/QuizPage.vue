<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { useQuizStore } from "../../../store/quizStore";
import { useLessonsStore } from "../../../store/lessonsStore";
import Swal from "sweetalert2";
import { Vue3Lottie } from 'vue3-lottie';

const route = useRoute();
const quizStore = useQuizStore();
const lessonsStore = useLessonsStore();

const isLoading = ref(false);
const errorMessage = ref(null);
const searchQuery = ref("");
const selectedLessonId = ref("");

const loadQuizzes = async () => {
  isLoading.value = true;
  errorMessage.value = null;
  try {
    await Promise.all([
      quizStore.getQuizzes(),
      lessonsStore.getLessons().catch(() => null)
    ]);
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    isLoading.value = false;
  }
};

const lessonsList = computed(() => lessonsStore.lessons || []);

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
        console.error("Error loading quizzes:", error);
      }
    }
  },
  { immediate: true }
);

const filteredQuizzes = computed(() => {
  return (quizStore.quizzes || []).filter((quiz) => {
    const qTitle = (quiz.title || "").toLowerCase();
    const qDesc = (quiz.description || "").toLowerCase();
    const qLessonTitle = (quiz.lesson?.title || "").toLowerCase();
    const query = searchQuery.value.toLowerCase().trim();

    const matchesSearch = !query || qTitle.includes(query) || qDesc.includes(query) || qLessonTitle.includes(query);
    const matchesLesson = !selectedLessonId.value || Number(quiz.lesson_id) === Number(selectedLessonId.value);

    return matchesSearch && matchesLesson;
  });
});

const deleteQuiz = async (id) => {
  Swal.fire({
    title: "Apakah Anda yakin ingin menghapus kuis ini?",
    text: "Kuis yang dihapus tidak dapat dikembalikan",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ya, Hapus",
    cancelButtonText: "Batal",
    confirmButtonColor: "#ef4444"
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await quizStore.deleteQuiz(id);
        Swal.fire("Berhasil", "Kuis berhasil dihapus", "success");
        await loadQuizzes();
      } catch (err) {
        Swal.fire("Gagal", err.message || "Gagal menghapus kuis", "error");
      }
    }
  });
};
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Kelola Kuis 📝</h1>
        <p class="text-gray-500">Buat dan kelola kuis untuk berbagai pelajaran</p>
      </div>

      <router-link to="/admin/kuis/tambah" class="btn btn-primary text-white">
        <span class="mr-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-5"
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
    <div class="bg-white p-4 rounded-xl shadow border border-gray-100 flex flex-col md:flex-row gap-4 justify-between">
      <div class="w-full md:w-1/2">
        <label for="search" class="block text-xs font-semibold text-gray-500 mb-1"
          >Cari Kuis</label
        >
        <input
          type="text"
          id="search"
          v-model="searchQuery"
          placeholder="Cari berdasarkan judul, deskripsi, atau pelajaran..."
          class="input input-bordered w-full"
        />
      </div>

      <div class="w-full md:w-1/3">
        <label for="lessonFilter" class="block text-xs font-semibold text-gray-500 mb-1"
          >Filter Pelajaran</label
        >
        <select id="lessonFilter" v-model="selectedLessonId" class="select select-bordered w-full">
          <option value="">Semua Pelajaran</option>
          <option v-for="les in lessonsList" :key="les.id" :value="les.id">
            {{ les.title }} ({{ les.class?.name || 'Mata Pelajaran' }})
          </option>
        </select>
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
      class="alert alert-error text-white shadow"
    >
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Quiz Table -->
    <div v-else-if="filteredQuizzes.length > 0" class="overflow-x-auto bg-white rounded-xl shadow border border-gray-100">
      <table class="table table-zebra w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th>Judul Kuis</th>
            <th>Mata Pelajaran</th>
            <th>Deskripsi</th>
            <th>Waktu Mulai</th>
            <th>Waktu Selesai</th>
            <th>Status</th>
            <th class="text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="quiz in filteredQuizzes" :key="quiz.id" class="hover:bg-gray-50">
            <td class="font-bold text-gray-900">{{ quiz.title }}</td>
            <td>
              <span class="badge badge-primary badge-sm font-semibold">
                {{ quiz.lesson?.title || 'Umum' }}
              </span>
            </td>
            <td class="max-w-xs truncate" :title="quiz.description">
              {{ quiz.description && quiz.description.length > 35 ? quiz.description.substring(0, 35) + '...' : quiz.description || '-' }}
            </td>
            <td class="text-xs">
              {{
                quiz.start_time ? new Date(quiz.start_time).toLocaleString("id-ID", {
                  dateStyle: "short",
                  timeStyle: "short",
                }) : '-'
              }}
            </td>
            <td class="text-xs">
              {{
                quiz.end_time ? new Date(quiz.end_time).toLocaleString("id-ID", {
                  dateStyle: "short",
                  timeStyle: "short",
                }) : '-'
              }}
            </td>
            <td>
              <span 
                :class="quiz.is_active ? 'badge-success text-white' : 'badge-ghost text-gray-400'"
                class="badge badge-sm font-semibold"
              >
                {{ quiz.is_active ? "Aktif" : "Tidak Aktif" }}
              </span>
            </td>
            <td>
              <div class="flex gap-1 justify-center flex-wrap">
                <router-link
                  :to="`/admin/kuis/${quiz.id}`"
                  class="btn btn-xs btn-primary text-white"
                >
                  Lihat
                </router-link>

                <router-link
                  :to="`/admin/kuis/${quiz.id}/pertanyaan`"
                  class="btn btn-xs btn-info text-white"
                >
                  Soal
                </router-link>

                <router-link
                  :to="`/admin/kuis/${quiz.id}/edit`"
                  class="btn btn-xs btn-warning text-white"
                >
                  Edit
                </router-link>

                <button class="btn btn-xs btn-error text-white" @click="deleteQuiz(quiz.id)">
                  Hapus
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="bg-white rounded-2xl shadow border border-gray-100 p-8 text-center"
    >
      <Vue3Lottie
        animation-link="https://assets9.lottiefiles.com/packages/lf20_hl5n0bwb.json"
        :height="250"
        :width="250"
      />
      <h3 class="text-lg font-bold text-gray-900 mb-1">
        Belum Ada Kuis
      </h3>
      <p class="text-gray-500 mb-6 text-sm">
        Tidak ditemukan kuis untuk kriteria pencarian ini. Tambahkan kuis baru untuk siswa.
      </p>
      <router-link
        to="/admin/kuis/tambah"
        class="btn btn-primary text-white"
      >
        ➕ Tambah Kuis Baru
      </router-link>
    </div>
  </div>
</template>
