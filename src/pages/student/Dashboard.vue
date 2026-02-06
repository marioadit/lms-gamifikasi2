<script setup>
import { ref, onMounted, computed } from "vue";
import { useAuthStore } from "../../store/authStore";
import { useQuizStore } from "../../store/users/QuizStore";
import { useLessonStore } from "../../store/users/lessonsStore";
import { useClassesStore } from "../../store/users/classesStore";
import { Vue3Lottie } from 'vue3-lottie';

const authStore = useAuthStore();
const quizStore = useQuizStore();
const lessonStore = useLessonStore();
const classesStore = useClassesStore();

const isLoading = ref(true);

// Computed properties for dashboard stats
const completedLessonsCount = computed(() => {
  return lessonStore.lessons?.length || 0;
});

const currentClass = computed(() => {
  return classesStore.classes?.[0] || null;
});

const quizResults = computed(() => {
  return quizStore.quizResults || [];
});

// Load all necessary data
const loadDashboardData = async () => {
  try {
    isLoading.value = true;
    await Promise.all([
      classesStore.getClassUser(),
      lessonStore.getUserLessons(),
      quizStore.getAllQuizResults()
    ]);
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadDashboardData();
});
</script>

<template>
  <div class="p-4 bg-blue-50 min-h-screen">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center min-h-[400px]">
      <Vue3Lottie
        animation-link="https://assets1.lottiefiles.com/packages/lf20_xyadoh9h.json"
        :height="200"
        :width="200"
      />
      <p class="mt-4 text-lg text-gray-600">Memuat data...</p>
    </div>

    <div v-else>
      <!-- Header dengan Salam dan Info Kelas -->
      <div class="bg-white p-6 rounded-3xl shadow-md mb-6">
        <div class="flex flex-col md:flex-row items-center justify-between mb-4">
          <div class="text-center md:text-left mb-4 md:mb-0">
            <h1 class="text-3xl font-bold text-purple-600 mb-2">
              Halo, {{ authStore.name || "Teman" }}! 👋
            </h1>
            <p class="text-xl text-gray-800">Siap belajar hari ini?</p>
          </div>
          <Vue3Lottie
            animation-link="https://assets8.lottiefiles.com/packages/lf20_w5hernhv.json"
            :height="150"
            :width="150"
          />
        </div>

        <!-- Class Info -->
        <div v-if="currentClass" class="mt-4 p-4 bg-purple-50 rounded-2xl">
          <div class="flex items-center justify-center gap-3 text-gray-700">
            <span class="flex items-center gap-2">
              <span class="text-xl">🏫</span>
              <span class="font-semibold">{{ currentClass.name }}</span>
            </span>
            <span class="text-gray-400">|</span>
            <span class="flex items-center gap-2">
              <span class="text-gray-700">Wali Kelas:</span>
              <span class="font-semibold text-purple-600">{{ currentClass.teacher.name }}</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        <!-- Lessons Progress Card -->
        <div class="card bg-white shadow-md hover:shadow-lg transition-shadow">
          <div class="card-body">
            <div class="flex justify-between items-center">
              <h2 class="card-title text-gray-800">Daftar Pelajaran</h2>
              <div class="text-2xl">
                <font-awesome-icon class="text-purple-500" :icon="['fas', 'book']" />
              </div>
            </div>
            <p class="text-4xl font-bold mt-2 text-purple-600">
              {{ completedLessonsCount }}
            </p>
            <p class="text-sm text-gray-600">Total Pelajaran yang Kamu Miliki</p>
          </div>
        </div>

        <!-- Quiz Results Card -->
        <div class="card bg-white shadow-md hover:shadow-lg transition-shadow">
          <div class="card-body">
            <div class="flex justify-between items-center">
              <h2 class="card-title text-gray-800">Hasil Kuis</h2>
              <div class="text-2xl">
                <font-awesome-icon class="text-purple-500" :icon="['fas', 'star']" />
              </div>
            </div>
            <p class="text-4xl font-bold mt-2 text-purple-600">
              {{ quizResults.length }}
            </p>
            <p class="text-sm text-gray-600">Kuis yang Sudah Dikerjakan</p>
          </div>
        </div>

        <!-- Recent Activity Card -->
        <div class="card bg-white shadow-md hover:shadow-lg transition-shadow md:col-span-2">
          <div class="card-body">
            <h2 class="card-title text-gray-800 mb-4">
              <span class="text-xl">📚</span> Pelajaran Tersedia
            </h2>
            <div v-if="lessonStore.lessons && lessonStore.lessons.length > 0" 
                 class="space-y-4">
              <div v-for="lesson in lessonStore.lessons" 
                   :key="lesson.id"
                   class="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div class="flex items-center gap-3">
                  <div class="text-xl">📖</div>
                  <div>
                    <h3 class="font-semibold text-gray-800">{{ lesson.title }}</h3>
                    <p class="text-sm text-gray-600">{{ lesson.description }}</p>
                  </div>
                </div>
                <router-link 
                  :to="`/pelajaran/${lesson.id}`"
                  class="btn btn-sm btn-primary">
                  Lihat
                </router-link>
              </div>
            </div>
            <div v-else class="text-center py-6">
              <Vue3Lottie
                animation-link="https://assets10.lottiefiles.com/packages/lf20_ydo1amjm.json"
                :height="200"
                :width="200"
              />
              <p class="text-gray-500 mt-4">Belum ada pelajaran tersedia</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
