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
    
    if (response) {
      if (Array.isArray(response.data)) {
        quizResults.value = response.data;
      } else if (Array.isArray(response)) {
        quizResults.value = response;
      } else if (response.data && Array.isArray(response.data.data)) {
        quizResults.value = response.data.data;
      }
    } else {
      errorMessage.value = response?.message || "Gagal mengambil data kuis";
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
  try {
    const date = new Date(dateString);
    return date.toLocaleString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return dateString;
  }
};

const viewQuizDetail = (quizId) => {
  router.push(`/kuis/results/${quizId}`);
};

const getEmoji = (score) => {
  const num = parseFloat(score || 0);
  if (num >= 80) return '🌟';
  if (num >= 70) return '😊';
  if (num >= 50) return '🙂';
  return '🤔';
};

const getScoreColor = (score) => {
  const num = parseFloat(score || 0);
  if (num >= 80) return '#10B981';
  if (num >= 70) return '#3B82F6';
  if (num >= 50) return '#F59E0B';
  return '#EF4444';
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-4">
    <!-- Header -->
    <div class="my-6 text-center max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
      <div class="text-left">
        <h1 class="text-3xl font-extrabold text-purple-600 flex items-center gap-2 flex-wrap">
          <span class="text-4xl">🎯</span>
          Hasil Kuis Kamu
          <span class="text-4xl">📚</span>
        </h1>
        <p class="mt-1 text-purple-500 text-base font-semibold">
          Yuk lihat hasil belajarmu! 🌈
        </p>
      </div>
      <router-link to="/kelas" class="btn btn-outline border-purple-500 text-purple-600 hover:bg-purple-600 hover:text-white rounded-2xl btn-sm">
        👈 Kembali ke Kelas
      </router-link>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center h-64">
      <div class="animate-bounce text-6xl mb-4">🎮</div>
      <p class="text-xl font-semibold text-purple-600">
        Tunggu sebentar ya...
      </p>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMessage" class="mx-auto max-w-md p-6 bg-white rounded-3xl shadow-lg text-center border border-purple-100">
      <p class="text-5xl mb-4">😅</p>
      <p class="text-xl font-bold text-purple-600 mb-2">Ups! Ada masalah:</p>
      <p class="text-gray-600">{{ errorMessage }}</p>
    </div>

    <!-- Results Display -->
    <div v-else-if="quizResults.length > 0" class="max-w-4xl mx-auto space-y-4">
      <div 
        v-for="quiz in quizResults" 
        :key="quiz.id || quiz.quiz_id" 
        class="bg-white rounded-3xl p-5 shadow-lg border-2 border-purple-100 space-y-4"
      >
        <!-- Quiz Header -->
        <div class="flex items-start justify-between">
          <div>
            <h3 class="text-xl font-bold text-purple-600 mb-1">
              {{ quiz.quiz_title || quiz.quiz?.title || 'Kuis' }}
            </h3>
            <p class="text-purple-400 text-sm font-semibold">
              Mata Pelajaran: {{ quiz.lesson_title || quiz.lesson?.title || '-' }}
            </p>
          </div>
          <span class="text-4xl">{{ getEmoji(quiz.percentage_score) }}</span>
        </div>

        <!-- Score Circle -->
        <div class="flex justify-center mb-2">
          <div class="relative w-24 h-24">
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="text-center">
                <div class="text-2xl font-extrabold text-purple-600">
                  {{ Math.round(quiz.percentage_score || 0) }}%
                </div>
                <div class="text-[10px] font-bold text-purple-400">Nilai Kamu</div>
              </div>
            </div>
            <svg class="transform -rotate-90 w-24 h-24">
              <circle
                cx="48"
                cy="48"
                r="42"
                stroke="#E2E8F0"
                stroke-width="6"
                fill="none"
              />
              <circle
                cx="48"
                cy="48"
                r="42"
                :stroke="getScoreColor(quiz.percentage_score)"
                stroke-width="6"
                fill="none"
                :stroke-dasharray="`${(quiz.percentage_score || 0) * 2.638}, 263.8`"
              />
            </svg>
          </div>
        </div>

        <!-- Progress Bar -->
        <div>
          <div class="flex justify-between text-xs mb-1 font-semibold">
            <span class="text-purple-600">Progress Pengerjaan</span>
            <span class="text-purple-600 font-bold">
              {{ quiz.answered_questions || 0 }}/{{ quiz.total_questions || 0 }} Soal
            </span>
          </div>
          <div class="h-3 bg-purple-100 rounded-full overflow-hidden">
            <div 
              class="h-full bg-purple-500 rounded-full transition-all duration-500"
              :style="{ width: `${quiz.completion_rate || 0}%` }"
            ></div>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 gap-2 text-center text-xs">
          <div class="bg-purple-50 rounded-2xl p-3">
            <div class="text-purple-400 font-semibold mb-1">Jawaban Benar</div>
            <div class="text-lg font-extrabold text-purple-600">{{ quiz.correct_answers || 0 }}</div>
          </div>
          <div class="bg-purple-50 rounded-2xl p-3">
            <div class="text-purple-400 font-semibold mb-1">Total Nilai</div>
            <div class="text-lg font-extrabold text-purple-600">{{ quiz.total_score || 0 }}/{{ quiz.max_possible_score || 0 }}</div>
          </div>
        </div>

        <!-- Time Info -->
        <div class="text-xs text-purple-400 flex justify-between items-center pt-1">
          <span>Dikumpulkan: <strong class="text-purple-600">{{ formatDate(quiz.submitted_at || quiz.created_at) }}</strong></span>
        </div>

        <!-- Action Button -->
        <button 
          @click="viewQuizDetail(quiz.quiz_id || quiz.id)"
          class="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-2xl font-bold text-base shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
        >
          Lihat Detail Soal & Jawaban ✨
        </button>
      </div>
    </div>

    <!-- No Results -->
    <div v-else class="text-center py-12">
      <div class="bg-white p-8 rounded-3xl shadow-lg max-w-sm mx-auto border border-purple-100">
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