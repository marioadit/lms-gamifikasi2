<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuizStore } from "../../../store/quizStore";
import { useLessonsStore } from "../../../store/lessonsStore";
import { getCurrentInstance } from "vue";
import Swal from "sweetalert2";

const { proxy } = getCurrentInstance();
const base_url = proxy?.$base_url || import.meta.env.VITE_API_URL || "";

const route = useRoute();
const router = useRouter();
const quizStore = useQuizStore();
const lessonsStore = useLessonsStore();

const quizId = ref(parseInt(route.params.id));
const isLoading = ref(true);
const errorMessage = ref("");

// Search query
const searchQuery = ref("");

// Image Lightbox preview
const previewImage = ref(null);

const selectedQuiz = computed(() => quizStore.quiz);
const selectedLesson = computed(() => lessonsStore.selectedLesson);

// Safe question list
const questionsList = computed(() => {
  if (quizStore.quizQuestions?.questions && Array.isArray(quizStore.quizQuestions.questions)) {
    return quizStore.quizQuestions.questions;
  }
  if (Array.isArray(quizStore.quizQuestions)) {
    return quizStore.quizQuestions;
  }
  if (selectedQuiz.value?.questions && Array.isArray(selectedQuiz.value.questions)) {
    return selectedQuiz.value.questions;
  }
  return [];
});

// Stats calculations
const totalQuestions = computed(() => questionsList.value.length);
const totalScore = computed(() => {
  return questionsList.value.reduce((sum, q) => sum + (Number(q.score) || 0), 0);
});
const averageScore = computed(() => {
  if (totalQuestions.value === 0) return 0;
  return (totalScore.value / totalQuestions.value).toFixed(1);
});

// Filtered questions based on search query
const filteredQuestions = computed(() => {
  if (!searchQuery.value) return questionsList.value;
  const qLower = searchQuery.value.toLowerCase();
  return questionsList.value.filter((q) => {
    return q.question_text && q.question_text.toLowerCase().includes(qLower);
  });
});

// Quiz schedule status computation
const quizScheduleStatus = computed(() => {
  if (!selectedQuiz.value) return { text: "-", badgeClass: "badge-ghost" };
  if (!selectedQuiz.value.is_active) {
    return {
      text: "Nonaktif",
      badgeClass: "bg-gray-100 text-gray-600 border border-gray-300",
      dotClass: "bg-gray-400",
      description: "Kuis sedang tidak aktif untuk siswa",
    };
  }

  const now = new Date();
  const startTime = selectedQuiz.value.start_time
    ? new Date(selectedQuiz.value.start_time)
    : null;
  const endTime = selectedQuiz.value.end_time
    ? new Date(selectedQuiz.value.end_time)
    : null;

  if (startTime && now < startTime) {
    return {
      text: "Belum Dimulai",
      badgeClass: "bg-amber-50 text-amber-700 border border-amber-200",
      dotClass: "bg-amber-500",
      description: "Akan dimulai sesuai jadwal",
    };
  }

  if (endTime && now > endTime) {
    return {
      text: "Telah Berakhir",
      badgeClass: "bg-red-50 text-red-700 border border-red-200",
      dotClass: "bg-red-500",
      description: "Batas waktu pengerjaan telah lewat",
    };
  }

  if (startTime && endTime) {
    return {
      text: "Sedang Berlangsung",
      badgeClass: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      dotClass: "bg-emerald-500 animate-pulse",
      description: "Siswa dapat mengerjakan kuis ini sekarang",
    };
  }

  return {
    text: "Aktif (Fleksibel)",
    badgeClass: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    dotClass: "bg-emerald-500",
    description: "Kuis aktif tanpa batas waktu tertentu",
  };
});

// Helper for images
const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  return `${base_url}/${path}`;
};

// Date formatting
const formatDateTime = (dateString) => {
  if (!dateString) return "-";
  try {
    return new Date(dateString).toLocaleString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }) + " WIB";
  } catch (e) {
    return dateString;
  }
};

const formatDateOnly = (dateString) => {
  if (!dateString) return "-";
  try {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch (e) {
    return dateString;
  }
};

// Type badge helper
const getTypeMeta = (type) => {
  switch (type) {
    case "multiple_choice":
      return {
        label: "Pilihan Ganda",
        badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
        icon: "🔘",
      };
    case "match_image":
      return {
        label: "Pasangkan Gambar",
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
        icon: "🧩",
      };
    case "guess_image":
      return {
        label: "Tebak Gambar",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: "🖼️",
      };
    case "essay":
      return {
        label: "Essay",
        badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
        icon: "✍️",
      };
    default:
      return {
        label: type || "Pertanyaan",
        badgeClass: "bg-gray-50 text-gray-700 border-gray-200",
        icon: "❓",
      };
  }
};

// Delete question with SweetAlert
const deleteQuestion = async (questionId) => {
  const result = await Swal.fire({
    title: "Hapus Pertanyaan?",
    text: "Pertanyaan yang dihapus tidak dapat dipulihkan!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#ef4444",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Ya, Hapus!",
    cancelButtonText: "Batal",
    customClass: {
      popup: "rounded-2xl",
      confirmButton: "btn btn-error text-white",
      cancelButton: "btn btn-ghost",
    },
  });

  if (result.isConfirmed) {
    try {
      await quizStore.deleteQuestion(questionId);

      await Swal.fire({
        title: "Berhasil!",
        text: "Pertanyaan berhasil dihapus.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        customClass: { popup: "rounded-2xl" },
      });
    } catch (err) {
      console.error("Error deleting question:", err);
      Swal.fire({
        title: "Gagal!",
        text: err.message || "Gagal menghapus pertanyaan.",
        icon: "error",
        customClass: { popup: "rounded-2xl" },
      });
    }
  }
};

// Image modal preview
const openImageModal = (imageUrl, title = "Pratinjau Gambar") => {
  previewImage.value = {
    url: imageUrl,
    title,
  };
};

const closeImageModal = () => {
  previewImage.value = null;
};

// Navigation
const goBack = () => {
  router.push("/admin/kuis");
};

// Load initial data
const loadData = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    await quizStore.getQuizById(quizId.value);
    if (!quizStore.quiz) {
      router.push("/admin/kuis");
      return;
    }
    const promises = [quizStore.getQuizByQuestions(quizId.value)];
    if (quizStore.quiz.lesson_id) {
      promises.push(lessonsStore.getLessonsById(quizStore.quiz.lesson_id));
    }
    await Promise.all(promises);
  } catch (error) {
    console.error("Error loading quiz detail:", error);
    errorMessage.value =
      error?.response?.data?.message ||
      error?.message ||
      "Gagal memuat data detail kuis";
  } finally {
    isLoading.value = false;
  }
};

onMounted(loadData);
</script>

<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
    <!-- Breadcrumb -->
    <nav class="flex items-center text-xs sm:text-sm text-gray-500 gap-2">
      <router-link to="/admin" class="hover:text-primary transition-colors flex items-center gap-1">
        <span>🏠</span>
        <span>Dashboard</span>
      </router-link>
      <span>/</span>
      <router-link to="/admin/kuis" class="hover:text-primary transition-colors">
        Kelola Kuis
      </router-link>
      <span>/</span>
      <span class="text-gray-800 font-semibold truncate max-w-xs sm:max-w-md">
        {{ selectedQuiz?.title || 'Detail Kuis' }}
      </span>
    </nav>

    <!-- Header Banner -->
    <div
      class="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
      <!-- Background subtle decorative pattern -->
      <div class="absolute -right-10 -bottom-10 w-56 h-56 bg-primary/5 rounded-full pointer-events-none blur-2xl"></div>
      <div class="absolute -left-10 -top-10 w-44 h-44 bg-purple-500/5 rounded-full pointer-events-none blur-2xl"></div>

      <div class="relative z-10 space-y-2">
        <div class="flex flex-wrap items-center gap-3">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
            :class="quizScheduleStatus.badgeClass">
            <span class="w-2 h-2 rounded-full" :class="quizScheduleStatus.dotClass"></span>
            {{ quizScheduleStatus.text }}
          </span>

          <span v-if="selectedLesson"
            class="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-1">
            📚 {{ selectedLesson.title }}
          </span>

          <span v-if="selectedLesson?.class?.name"
            class="px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
            🏫 {{ selectedLesson.class.name }}
          </span>
        </div>

        <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
          <span>📝</span>
          <span>{{ selectedQuiz?.title || 'Detail Kuis' }}</span>
        </h1>

        <p class="text-gray-500 text-sm sm:text-base max-w-2xl line-clamp-2">
          {{ selectedQuiz?.description || 'Tidak ada deskripsi untuk kuis ini.' }}
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="relative z-10 flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
        <button @click="goBack"
          class="btn btn-outline btn-sm sm:btn-md rounded-xl text-gray-700 hover:bg-gray-100 border-gray-300">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali
        </button>

        <router-link :to="`/admin/kuis/${quizId}/edit`"
          class="btn btn-warning btn-sm sm:btn-md rounded-xl text-white shadow-sm hover:shadow">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          Edit Kuis
        </router-link>

        <router-link :to="`/admin/kuis/${quizId}/pertanyaan/tambah`"
          class="btn btn-primary btn-sm sm:btn-md rounded-xl text-white shadow-sm hover:shadow">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Tambah Soal
        </router-link>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading"
      class="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 flex flex-col items-center justify-center space-y-4">
      <div class="loading loading-spinner loading-lg text-primary"></div>
      <p class="text-gray-500 font-medium">Memuat data kuis & daftar pertanyaan...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMessage"
      class="bg-red-50 border border-red-200 text-red-800 p-6 rounded-3xl shadow-sm flex items-start gap-4">
      <div class="text-2xl">⚠️</div>
      <div class="space-y-1">
        <h3 class="font-bold">Terjadi Kesalahan</h3>
        <p class="text-sm text-red-700">{{ errorMessage }}</p>
        <button @click="loadData" class="btn btn-xs btn-outline btn-error mt-2 rounded-lg">
          Coba Lagi
        </button>
      </div>
    </div>

    <!-- Main Content when loaded -->
    <div v-else-if="selectedQuiz" class="space-y-6">
      <!-- 4 Top KPI Stat Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <!-- Stat 1: Total Soal -->
        <div
          class="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div
            class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl shrink-0">
            📋
          </div>
          <div>
            <p class="text-xs sm:text-sm font-medium text-gray-500">Total Soal</p>
            <h3 class="text-xl sm:text-2xl font-black text-gray-900 mt-0.5">
              {{ totalQuestions }}
              <span class="text-xs sm:text-sm font-semibold text-gray-500">Soal</span>
            </h3>
            <p class="text-[11px] text-gray-400 mt-0.5">
              Pertanyaan kuis
            </p>
          </div>
        </div>

        <!-- Stat 2: Total Skor -->
        <div
          class="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div
            class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl shrink-0">
            ⭐
          </div>
          <div>
            <p class="text-xs sm:text-sm font-medium text-gray-500">Skor Maksimal</p>
            <h3 class="text-xl sm:text-2xl font-black text-gray-900 mt-0.5">
              {{ totalScore }}
              <span class="text-xs sm:text-sm font-semibold text-gray-500">Poin</span>
            </h3>
            <p class="text-[11px] text-gray-400 mt-0.5">
              Rata-rata: {{ averageScore }} poin/soal
            </p>
          </div>
        </div>

        <!-- Stat 3: Pelajaran & Kelas -->
        <div
          class="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div
            class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl shrink-0">
            📖
          </div>
          <div class="min-w-0">
            <p class="text-xs sm:text-sm font-medium text-gray-500">Mata Pelajaran</p>
            <h3 class="text-base sm:text-lg font-bold text-gray-900 mt-0.5 truncate" :title="selectedLesson?.title">
              {{ selectedLesson?.title || 'Tidak Terkait' }}
            </h3>
            <p class="text-[11px] text-blue-600 font-medium mt-0.5 truncate">
              {{ selectedLesson?.class?.name || 'Semua Kelas' }}
            </p>
          </div>
        </div>

        <!-- Stat 4: Status Pelaksanaan -->
        <div
          class="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div
            class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl shrink-0">
            ⏱️
          </div>
          <div class="min-w-0">
            <p class="text-xs sm:text-sm font-medium text-gray-500">Jadwal Kuis</p>
            <h3 class="text-base sm:text-lg font-bold text-gray-900 mt-0.5 truncate">
              {{ quizScheduleStatus.text }}
            </h3>
            <p class="text-[11px] text-gray-400 mt-0.5 truncate">
              {{ selectedQuiz.is_active ? 'Siap digunakan' : 'Ditutup sementara' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Main Layout: 2 Columns (Left: Detail Kuis, Right: Pertanyaan) -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <!-- LEFT COLUMN: Informasi Detail Kuis -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Card: Info Kuis -->
          <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-5">
            <div class="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span>ℹ️</span>
                <span>Informasi Kuis</span>
              </h2>
              <router-link :to="`/admin/kuis/${quizId}/edit`"
                class="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                ✏️ Edit
              </router-link>
            </div>

            <!-- Quiz Thumbnail or Subject Banner -->
            <div v-if="selectedLesson?.thumbnail"
              class="relative rounded-2xl overflow-hidden border border-gray-100 group">
              <img :src="getImageUrl(selectedLesson.thumbnail)" :alt="selectedLesson.title"
                class="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300" />
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3">
                <span class="text-white text-xs font-semibold">
                  Mata Pelajaran: {{ selectedLesson.title }}
                </span>
              </div>
            </div>

            <!-- Info Rows List -->
            <div class="space-y-3.5 text-sm">
              <!-- Judul -->
              <div>
                <span class="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-0.5">
                  Judul Kuis
                </span>
                <p class="font-bold text-gray-800 text-base">
                  {{ selectedQuiz.title }}
                </p>
              </div>

              <!-- Deskripsi -->
              <div>
                <span class="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-0.5">
                  Deskripsi
                </span>
                <div
                  class="p-3 bg-gray-50 rounded-xl text-gray-700 text-xs sm:text-sm border border-gray-100 whitespace-pre-wrap leading-relaxed">
                  {{ selectedQuiz.description || 'Tidak ada deskripsi.' }}
                </div>
              </div>

              <!-- Mata Pelajaran -->
              <div class="flex items-center justify-between pt-2 border-t border-gray-100">
                <span class="text-gray-500 text-xs">Pelajaran</span>
                <router-link v-if="selectedLesson?.id" :to="`/admin/pelajaran/${selectedLesson.id}`"
                  class="font-semibold text-primary hover:underline text-xs flex items-center gap-1">
                  {{ selectedLesson.title }} ↗
                </router-link>
                <span v-else class="text-gray-400 text-xs">-</span>
              </div>

              <!-- Kelas -->
              <div class="flex items-center justify-between">
                <span class="text-gray-500 text-xs">Kelas / Rombel</span>
                <span class="font-semibold text-gray-800 text-xs">
                  {{ selectedLesson?.class?.name || '-' }}
                </span>
              </div>

              <!-- Status Kuis -->
              <div class="flex items-center justify-between">
                <span class="text-gray-500 text-xs">Status Kuis</span>
                <span class="badge badge-sm font-semibold"
                  :class="selectedQuiz.is_active ? 'badge-success text-white' : 'badge-ghost text-gray-400'">
                  {{ selectedQuiz.is_active ? 'Aktif' : 'Tidak Aktif' }}
                </span>
              </div>

              <!-- Waktu Mulai -->
              <div class="flex items-start justify-between">
                <span class="text-gray-500 text-xs">Waktu Mulai</span>
                <span class="font-medium text-gray-800 text-xs text-right">
                  {{ formatDateTime(selectedQuiz.start_time) }}
                </span>
              </div>

              <!-- Waktu Selesai -->
              <div class="flex items-start justify-between">
                <span class="text-gray-500 text-xs">Waktu Selesai</span>
                <span class="font-medium text-gray-800 text-xs text-right">
                  {{ formatDateTime(selectedQuiz.end_time) }}
                </span>
              </div>

              <!-- Tanggal Dibuat -->
              <div class="flex items-center justify-between pt-2 border-t border-gray-100 text-[11px] text-gray-400">
                <span>Dibuat:</span>
                <span>{{ formatDateOnly(selectedQuiz.created_at) }}</span>
              </div>
            </div>
          </div>

          <!-- Card: Navigasi Cepat Terkait -->
          <div
            class="bg-gradient-to-br from-primary/10 via-white to-purple-500/10 rounded-3xl p-6 shadow-sm border border-primary/20 space-y-3">
            <h3 class="text-sm font-bold text-gray-800">
              Aksi Cepat Kuis ⚡
            </h3>
            <p class="text-xs text-gray-500">
              Tinjau hasil pengerjaan kuis atau rekap nilai siswa.
            </p>
            <div class="space-y-2 pt-2">
              <router-link to="/admin/kuis/hasil"
                class="btn btn-outline btn-primary btn-sm w-full rounded-xl justify-start font-medium">
                🏆 Hasil Kuis
              </router-link>
              <router-link to="/admin/rekap-nilai"
                class="btn btn-outline btn-neutral btn-sm w-full rounded-xl justify-start font-medium">
                📊 Rekap Nilai Siswa
              </router-link>
            </div>
          </div>
        </div>

        <!-- RIGHT COLUMN: Daftar Pertanyaan & Kontrol -->
        <div class="lg:col-span-2 space-y-4">
          <!-- Card Header & Filter Bar -->
          <div class="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 class="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <span>Pertanyaan Kuis</span>
                  <span class="badge badge-primary badge-sm text-white font-bold">
                    {{ filteredQuestions.length }} / {{ totalQuestions }}
                  </span>
                </h2>
                <p class="text-xs text-gray-500 mt-0.5">
                  Daftar butir soal yang diujikan dalam kuis ini
                </p>
              </div>

              <!-- Action buttons -->
              <div class="flex items-center gap-2">
                <router-link :to="`/admin/kuis/${quizId}/pertanyaan/tambah`"
                  class="btn btn-primary btn-sm rounded-xl text-white shadow-sm hover:shadow">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Tambah Soal
                </router-link>
              </div>
            </div>

            <!-- Search box -->
            <div class="pt-2 border-t border-gray-100">
              <div class="relative w-full">
                <input v-model="searchQuery" type="text" placeholder="Cari teks pertanyaan..."
                  class="input input-sm input-bordered w-full rounded-xl pl-9 bg-gray-50/50 focus:bg-white text-xs sm:text-sm" />
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3 top-2 text-gray-400" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <button v-if="searchQuery" @click="searchQuery = ''"
                  class="absolute right-3 top-2 text-xs text-gray-400 hover:text-gray-600">
                  ✕
                </button>
              </div>
            </div>
          </div>

          <!-- Questions List -->
          <div v-if="filteredQuestions.length > 0" class="space-y-4">
            <div v-for="(question, index) in filteredQuestions" :key="question.id"
              class="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all space-y-3">
              <!-- Question Header -->
              <div
                class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                <div class="flex items-center flex-wrap gap-2">
                  <!-- Number badge -->
                  <span
                    class="w-7 h-7 rounded-xl bg-gray-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    #{{ question.order || index + 1 }}
                  </span>

                  <!-- Type Badge -->
                  <span class="px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5"
                    :class="getTypeMeta(question.type).badgeClass">
                    <span>{{ getTypeMeta(question.type).icon }}</span>
                    <span>{{ getTypeMeta(question.type).label }}</span>
                  </span>

                  <!-- Score Badge -->
                  <span
                    class="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                    ⭐ {{ question.score }} Poin
                  </span>
                </div>

                <!-- Action buttons -->
                <div class="flex items-center gap-1.5 self-end sm:self-auto">
                  <router-link :to="`/admin/kuis/${quizId}/pertanyaan/${question.id}/edit`"
                    class="btn btn-xs btn-warning text-white rounded-lg flex items-center gap-1"
                    title="Edit Pertanyaan">
                    ✏️ Edit
                  </router-link>

                  <button @click="deleteQuestion(question.id)" class="btn btn-xs btn-error text-white rounded-lg"
                    title="Hapus Pertanyaan">
                    🗑️
                  </button>
                </div>
              </div>

              <!-- Question Text & Image preview -->
              <div class="space-y-3">
                <p class="text-gray-800 text-sm sm:text-base font-medium leading-relaxed">
                  {{ question.question_text }}
                </p>

                <!-- Question Image Thumbnail (if present) -->
                <div v-if="question.question_image"
                  class="flex items-center gap-3 p-2 bg-gray-50 rounded-2xl border border-gray-100 max-w-sm">
                  <img :src="getImageUrl(question.question_image)" alt="Gambar Pertanyaan"
                    class="w-20 h-20 object-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity border border-gray-200"
                    @click="openImageModal(getImageUrl(question.question_image), `Pertanyaan #${question.order || index + 1}`)" />
                  <div class="space-y-1">
                    <p class="text-xs font-semibold text-gray-700">Lampiran Gambar</p>
                    <button
                      @click="openImageModal(getImageUrl(question.question_image), `Pertanyaan #${question.order || index + 1}`)"
                      class="btn btn-xs btn-ghost text-primary text-[11px] p-0 h-auto hover:bg-transparent hover:underline">
                      🔍 Perbesar Gambar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty Questions State -->
          <div v-else class="bg-white rounded-3xl p-10 sm:p-14 text-center shadow-sm border border-gray-100 space-y-4">
            <div class="text-5xl">📝</div>
            <div class="max-w-md mx-auto space-y-1">
              <h3 class="text-lg font-bold text-gray-800">
                {{ searchQuery ? 'Pertanyaan Tidak Ditemukan' : 'Belum Ada Pertanyaan' }}
              </h3>
              <p class="text-sm text-gray-500">
                {{
                  searchQuery
                    ? `Tidak ada pertanyaan yang sesuai dengan kata kunci "${searchQuery}".`
                    : 'Kuis ini belum memiliki pertanyaan. Tambahkan pertanyaan pertama untuk memulai.'
                }}
              </p>
            </div>

            <div class="pt-2 flex justify-center gap-2">
              <button v-if="searchQuery" @click="searchQuery = ''" class="btn btn-outline btn-sm rounded-xl">
                Reset Pencarian
              </button>
              <router-link :to="`/admin/kuis/${quizId}/pertanyaan/tambah`"
                class="btn btn-primary btn-sm rounded-xl text-white shadow-sm">
                ➕ Tambah Pertanyaan Pertama
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Lightbox Modal -->
    <div v-if="previewImage"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
      @click.self="closeImageModal">
      <div class="bg-white rounded-3xl p-4 sm:p-6 max-w-2xl w-full shadow-2xl space-y-4 relative overflow-hidden">
        <div class="flex items-center justify-between pb-2 border-b border-gray-100">
          <h3 class="font-bold text-gray-800 text-sm sm:text-base flex items-center gap-2">
            <span>🖼️</span>
            <span>{{ previewImage.title }}</span>
          </h3>
          <button @click="closeImageModal" class="btn btn-sm btn-circle btn-ghost text-gray-500 hover:text-gray-800">
            ✕
          </button>
        </div>

        <div class="flex justify-center bg-gray-50 rounded-2xl p-2 border border-gray-100 max-h-[70vh] overflow-auto">
          <img :src="previewImage.url" :alt="previewImage.title" class="rounded-xl max-h-[65vh] object-contain" />
        </div>

        <div class="flex justify-end">
          <button @click="closeImageModal" class="btn btn-sm btn-neutral text-white rounded-xl">
            Tutup
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.2s ease-out forwards;
}
</style>
