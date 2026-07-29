<script setup>
import { onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useLessonStore } from "../../store/users/lessonsStore";
import { getCurrentInstance } from 'vue';

const { proxy } = getCurrentInstance();
const base_url = proxy?.$base_url || import.meta.env.VITE_API_URL || "";

const router = useRouter();
const lessonsStore = useLessonStore();

const loadLessons = async () => {
  await lessonsStore.getUserLessons();
};

onMounted(async () => {
  await loadLessons();
});

const isLoading = computed(() => lessonsStore.loading);
const errorMessage = computed(() => lessonsStore.error);

const openLesson = (lessonId) => {
  router.push(`/pelajaran/${lessonId}`);
};

const startQuiz = (quizId) => {
  router.push(`/kuis/${quizId}`);
};
</script>

<template>
  <div class="p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
    <!-- Header -->
    <div class="bg-white p-6 rounded-3xl shadow-lg my-6 max-w-4xl mx-auto border border-blue-100 flex justify-between items-center flex-wrap gap-4">
      <div>
        <h1 class="text-3xl font-extrabold text-blue-600 flex items-center gap-2">
          <span>📚</span> Daftar Pelajaran
        </h1>
        <p class="text-sm text-gray-500 mt-1">Pilih pelajaran dan kerjakan kuis seru!</p>
      </div>
      <router-link to="/kelas" class="btn btn-outline border-blue-500 text-blue-600 rounded-2xl btn-sm">
        👈 Kembali ke Kelas
      </router-link>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center my-12">
      <div class="loading loading-spinner loading-lg text-blue-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMessage" class="max-w-4xl mx-auto">
      <div class="alert alert-error text-white shadow-lg rounded-2xl">
        <span>{{ errorMessage }}</span>
      </div>
    </div>

    <!-- Lessons List -->
    <div v-else class="max-w-4xl mx-auto space-y-6">
      <div
        v-for="lesson in lessonsStore.lessons"
        :key="lesson.id"
        class="bg-white p-6 rounded-3xl shadow-md border border-blue-100 space-y-4 hover:shadow-lg transition-shadow"
      >
        <!-- Lesson Header Info -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div class="flex items-center gap-4">
            <img
              v-if="lesson.thumbnail"
              class="w-20 h-20 rounded-2xl object-cover border shadow-sm"
              :src="lesson.thumbnail.startsWith('http') ? lesson.thumbnail : `${base_url}/${lesson.thumbnail}`"
              :alt="lesson.title"
            />
            <div v-else class="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center text-3xl">
              📚
            </div>

            <div>
              <h2 class="text-xl font-bold text-gray-800">{{ lesson.title }}</h2>
              <p class="text-xs text-gray-500 line-clamp-2 mt-1">{{ lesson.description || '-' }}</p>
              <div class="mt-2 flex items-center gap-2">
                <span class="badge badge-primary badge-sm font-semibold">
                  {{ lesson.class?.name || 'Pelajaran' }}
                </span>
                <span class="badge badge-secondary badge-sm font-semibold">
                  {{ lesson.quizzes?.length || 0 }} Kuis Tersedia
                </span>
              </div>
            </div>
          </div>

          <!-- Open Lesson Button -->
          <button
            @click="openLesson(lesson.id)"
            class="btn btn-primary text-white rounded-2xl px-5 shadow-sm hover:scale-105 transition-transform"
          >
            <span>Buka Pelajaran 📚</span>
          </button>
        </div>

        <!-- Quizzes Preview list per lesson -->
        <div v-if="lesson.quizzes && lesson.quizzes.length > 0" class="border-t border-gray-100 pt-3 space-y-2">
          <h3 class="font-bold text-xs text-purple-700 uppercase tracking-wider">
            🎮 Kuis untuk {{ lesson.title }}:
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div 
              v-for="quiz in lesson.quizzes" 
              :key="quiz.id"
              class="bg-purple-50/80 p-3 rounded-xl border border-purple-100 flex justify-between items-center gap-2"
            >
              <div class="truncate text-xs font-semibold text-gray-800">
                📝 {{ quiz.title }}
              </div>
              <button 
                @click="startQuiz(quiz.id)" 
                :disabled="!quiz.is_active"
                class="btn btn-xs btn-primary text-white rounded-lg"
              >
                Kerjakan 🎯
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!lessonsStore.lessons || lessonsStore.lessons.length === 0" class="bg-white p-8 rounded-3xl text-center shadow border border-gray-100">
        <p class="text-4xl mb-2">📚</p>
        <p class="font-bold text-gray-800">Belum ada pelajaran tersedia.</p>
      </div>
    </div>
  </div>
</template>
