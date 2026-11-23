<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { useQuizStore } from "../../../store/quizStore";
import { useLessonsStore } from "../../../store/lessonsStore";
import { getClasses } from "../../../api/classesApi";
import Swal from "sweetalert2";

import { useClassesStore } from "../../../store/classesStore";
import { useAuthStore } from "../../../store/authStore";

const route = useRoute();
const quizStore = useQuizStore();
const lessonsStore = useLessonsStore();
const classesStore = useClassesStore();
const authStore = useAuthStore();

const userRole = computed(() => authStore.userRole);
const currentUserId = computed(() => authStore.currentUserId);

const isLoading = ref(false);
const errorMessage = ref(null);
const searchQuery = ref("");
const selectedLessonId = ref("");

const myClassIds = computed(() => {
  if (userRole.value !== 'guru') return null;
  return (classesStore.classes || [])
    .filter(cls => Number(cls.teacher_id || cls.teacher?.id || 0) === currentUserId.value)
    .map(cls => cls.id);
});

const loadQuizzes = async (force = false) => {
  if (isLoading.value && !force) return;
  isLoading.value = true;
  errorMessage.value = null;
  try {
    const fetchPromises = [
      quizStore.getQuizzes(),
      lessonsStore.getLessons().catch(() => null)
    ];

    // Ambil data kelas langsung secara ringkas hanya jika user adalah guru
    // Hindari N+1 loop getClassStudents yang lambat di classesStore
    if (userRole.value === 'guru' && (!classesStore.classes || classesStore.classes.length === 0 || force)) {
      fetchPromises.push(
        getClasses()
          .then((res) => {
            const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            classesStore.classes = list;
          })
          .catch((err) => {
            console.error("Error fetching classes directly:", err);
          })
      );
    }

    await Promise.all(fetchPromises);
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    isLoading.value = false;
  }
};

const lessonsList = computed(() => {
  const allLessons = lessonsStore.lessons || [];
  if (userRole.value === 'guru' && myClassIds.value) {
    return allLessons.filter(l => myClassIds.value.includes(l.class_id));
  }
  return allLessons;
});

onMounted(async () => {
  await loadQuizzes();
});

watch(
  () => route.fullPath,
  async (newPath, oldPath) => {
    if (newPath === "/admin/kuis" && oldPath && oldPath !== "/admin/kuis") {
      try {
        await loadQuizzes();
      } catch (error) {
        console.error("Error loading quizzes:", error);
      }
    }
  }
);

const getLessonTitle = (quiz) => {
  if (quiz.lesson?.title) return quiz.lesson.title;
  if (quiz.lesson_title) return quiz.lesson_title;
  const found = (lessonsStore.lessons || []).find((l) => Number(l.id) === Number(quiz.lesson_id));
  return found ? found.title : null;
};

const filteredQuizzes = computed(() => {
  return (quizStore.quizzes || []).filter((quiz) => {
    if (userRole.value === 'guru' && myClassIds.value) {
      const quizLesson = (lessonsStore.lessons || []).find(l => Number(l.id) === Number(quiz.lesson_id));
      const classId = quiz.class_id || quiz.lesson?.class_id || quizLesson?.class_id;
      if (!classId || !myClassIds.value.includes(classId)) {
        return false;
      }
    }

    const qTitle = (quiz.title || "").toLowerCase();
    const qDesc = (quiz.description || "").toLowerCase();
    const qLessonTitle = (getLessonTitle(quiz) || "").toLowerCase();
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
    <div v-if="isLoading" class="flex justify-center my-16 flex-col items-center">
      <div class="loading loading-spinner loading-lg text-primary"></div>
      <p class="text-gray-500 mt-4 text-sm font-medium">Memuat data kuis...</p>
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
              {{ getLessonTitle(quiz) || '-' }}
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
      class="bg-white rounded-2xl shadow border border-gray-100 p-12 text-center"
    >
      <div class="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      </div>
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
