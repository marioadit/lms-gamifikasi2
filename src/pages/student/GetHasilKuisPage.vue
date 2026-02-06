<script setup>
import { ref, onMounted } from "vue";
import { useQuizStore } from "../../store/users/QuizStore";
import { useRouter } from "vue-router";

const router = useRouter();
const quizStore = useQuizStore();
const isLoading = ref(true);
const errorMessage = ref(null);
const quizResults = ref([]);

onMounted(async () => {
  try {
    isLoading.value = true;
    const response = await quizStore.getAllQuizResults();
    
    if (response.status === 200) {
      quizResults.value = response.data;
    } else {
      errorMessage.value = response.message || "Gagal mengambil data kuis";
    }
  } catch (error) {
    console.error('Error fetching results:', error);
    errorMessage.value = "Maaf, ada masalah saat mengambil hasil kuis 😥";
  } finally {
    isLoading.value = false;
  }
});

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const viewQuizDetail = (quizId) => {
  router.push(`/kuis/results/${quizId}`);
};

const getEmoji = (score) => {
  if (score >= 80) return '🌟';
  if (score >= 70) return '😊';
  if (score >= 50) return '🙂';
  return '🤔';
};

const getScoreColor = (score) => {
  if (score >= 80) return 'bg-green-500';
  if (score >= 70) return 'bg-blue-500';
  if (score >= 50) return 'bg-yellow-500';
  return 'bg-red-500';
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-4">
    <!-- Header -->
    <div class="my-6 text-center">
      <h1 class="text-3xl font-bold text-purple-600 flex items-center justify-center gap-2 flex-wrap">
        <span class="text-4xl">🎯</span>
        Hasil Kuis Kamu
        <span class="text-4xl">📚</span>
      </h1>
      <p class="mt-2 text-purple-500 text-lg">
        Yuk lihat hasil belajarmu! 🌈
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center h-64">
      <div class="animate-bounce text-6xl mb-4">🎮</div>
      <p class="text-xl font-semibold text-purple-600">
        Tunggu sebentar ya...
      </p>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMessage" class="mx-auto max-w-md p-6 bg-white rounded-3xl shadow-lg text-center">
      <p class="text-5xl mb-4">😅</p>
      <p class="text-xl font-bold text-purple-600 mb-2">Ups! Ada masalah:</p>
      <p class="text-gray-600">{{ errorMessage }}</p>
    </div>

    <!-- Results Display -->
    <div v-else-if="quizResults.length > 0" class="space-y-4">
      <div v-for="quiz in quizResults" :key="quiz.quiz_id" 
           class="bg-white rounded-3xl p-5 shadow-lg border-2 border-purple-200">
        <!-- Quiz Header -->
        <div class="flex items-start justify-between mb-4">
          <div>
            <h3 class="text-xl font-bold text-purple-600 mb-1">
              {{ quiz.quiz_title }}
            </h3>
            <p class="text-purple-400 text-sm">
              {{ quiz.lesson.title }}
            </p>
          </div>
          <span class="text-4xl">{{ getEmoji(quiz.percentage_score) }}</span>
        </div>

        <!-- Score Circle -->
        <div class="flex justify-center mb-4">
          <div class="relative w-24 h-24">
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="text-center">
                <div class="text-2xl font-bold text-purple-600">
                  {{ Math.round(quiz.percentage_score) }}%
                </div>
                <div class="text-xs text-purple-400">Nilai Kamu</div>
              </div>
            </div>
            <svg class="transform -rotate-90 w-24 h-24">
              <circle
                cx="48"
                cy="48"
                r="45"
                stroke="#E2E8F0"
                stroke-width="6"
                fill="none"
              />
              <circle
                cx="48"
                cy="48"
                r="45"
                :stroke="getScoreColor(quiz.percentage_score).replace('bg-', 'text-')"
                stroke-width="6"
                fill="none"
                :stroke-dasharray="`${quiz.percentage_score * 2.827}, 282.7`"
              />
            </svg>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="mb-4">
          <div class="flex justify-between text-sm mb-1">
            <span class="text-purple-600">Progress</span>
            <span class="text-purple-600 font-bold">
              {{ quiz.answered_questions }}/{{ quiz.total_questions }} Soal
            </span>
          </div>
          <div class="h-3 bg-purple-100 rounded-full overflow-hidden">
            <div class="h-full bg-purple-500 rounded-full transition-all duration-500"
                 :style="{ width: `${quiz.completion_rate}%` }">
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 gap-2 mb-4 text-center">
          <div class="bg-purple-50 rounded-xl p-2">
            <div class="text-sm text-purple-400">Jawaban Benar</div>
            <div class="text-lg font-bold text-purple-600">{{ quiz.correct_answers }}</div>
          </div>
          <div class="bg-purple-50 rounded-xl p-2">
            <div class="text-sm text-purple-400">Total Nilai</div>
            <div class="text-lg font-bold text-purple-600">{{ quiz.total_score }}/{{ quiz.max_possible_score }}</div>
          </div>
        </div>

        <!-- Time Info -->
        <div class="text-sm text-purple-400 space-y-1 mb-4">
          <div>Mulai: {{ formatDate(quiz.start_time) }}</div>
          <div>Selesai: {{ formatDate(quiz.submitted_at) }}</div>
        </div>

        <!-- Action Button -->
        <button @click="viewQuizDetail(quiz.quiz_id)"
                class="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-bold text-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200">
          Lihat Detail ✨
        </button>
      </div>
    </div>

    <!-- No Results -->
    <div v-else class="text-center py-12">
      <div class="bg-white p-8 rounded-3xl shadow-lg max-w-sm mx-auto">
        <p class="text-6xl mb-4">🎨</p>
        <h2 class="text-2xl font-bold text-purple-600 mb-2">
          Belum Ada Hasil
        </h2>
        <p class="text-purple-400">
          Yuk mulai belajar dan kerjakan kuis pertamamu! 🚀
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bg-gradient-to-b {
  background-size: 100% 100%;
  background-position: 0 0;
}
</style>