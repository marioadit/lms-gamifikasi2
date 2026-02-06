<script setup>
import { ref, onMounted } from "vue";
import { useQuizStore } from "../../store/users/QuizStore";
import { useRoute } from "vue-router";

const route = useRoute();
const quizStore = useQuizStore();
const isLoading = ref(true);
const errorMessage = ref(null);
const quizData = ref(null);

onMounted(async () => {
  try {
    isLoading.value = true;
    const quizId = route.params.id || 2;
    const response = await quizStore.getQuizResultsById(quizId);
    
    if (response.status === 200) {
      quizData.value = response.data;
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
  const date = new Date(dateString);
  return date.toLocaleString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const parseMatchPairs = (answerText) => {
  try {
    return JSON.parse(answerText);
  } catch {
    return [];
  }
};

const getEmoji = (isCorrect) => {
  if (isCorrect === true) return '✨';
  if (isCorrect === false) return '❌';
  return '🤔';
};

const getAnswerEmoji = (type) => {
  switch(type) {
    case 'essay': return '📝';
    case 'choice_image': return '🖼️';
    case 'match_image': return '🔄';
    default: return '📋';
  }
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-4">
    <!-- Header -->
    <div class="my-6 text-center">
      <h1 class="text-3xl font-bold text-purple-600 flex items-center justify-center gap-2 flex-wrap">
        <span class="text-4xl">📚</span>
        Hasil Kuis
        <span class="text-4xl">✨</span>
      </h1>
      <p v-if="quizData" class="mt-2 text-xl text-purple-500 font-semibold">
        {{ quizData.quiz_title }}
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
    <div v-else-if="quizData" class="max-w-4xl mx-auto space-y-6">
      <!-- Score Card -->
      <div class="bg-white p-6 rounded-3xl shadow-lg">
        <div class="relative">
          <!-- Circular Progress -->
          <div class="flex justify-center mb-6">
            <div class="relative w-32 h-32">
              <svg class="transform -rotate-90 w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="60"
                  stroke="#E2E8F0"
                  stroke-width="8"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="60"
                  :stroke="quizData.percentage_score >= 70 ? '#10B981' : quizData.percentage_score >= 50 ? '#FBBF24' : '#EF4444'"
                  stroke-width="8"
                  fill="none"
                  :stroke-dasharray="`${quizData.percentage_score * 3.77}, 377`"
                />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="text-center">
                  <div class="text-3xl font-bold text-purple-600">
                    {{ Math.round(quizData.percentage_score) }}%
                  </div>
                  <div class="text-sm text-purple-400">Nilai Kamu</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Stats Grid -->
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="bg-purple-50 rounded-2xl p-4 text-center">
              <div class="text-2xl mb-1">✅</div>
              <div class="text-lg font-bold text-purple-600">
                {{ quizData.correct_answers }}/{{ quizData.total_questions }}
              </div>
              <div class="text-sm text-purple-400">Jawaban Benar</div>
            </div>
            <div class="bg-purple-50 rounded-2xl p-4 text-center">
              <div class="text-2xl mb-1">🎯</div>
              <div class="text-lg font-bold text-purple-600">
                {{ quizData.total_score }}/{{ quizData.max_possible_score }}
              </div>
              <div class="text-sm text-purple-400">Total Skor</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Questions List -->
      <div class="space-y-4">
        <div v-for="question in quizData.questions" 
             :key="question.question_id" 
             class="bg-white rounded-3xl p-5 shadow-lg border-2"
             :class="{
               'border-green-400': question.student_answer.is_correct,
               'border-red-400': question.student_answer.is_correct === false,
               'border-purple-200': question.student_answer.is_correct === null
             }">
          
          <!-- Question Header -->
          <div class="flex items-center gap-3 mb-4">
            <div class="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-lg font-bold">
              #{{ question.question_id }}
            </div>
            <div class="text-2xl">{{ getEmoji(question.student_answer.is_correct) }}</div>
          </div>

          <!-- Question Text -->
          <div class="text-gray-700 text-lg mb-4">
            {{ question.question_text }}
          </div>

          <!-- Answer Section -->
          <div class="bg-purple-50 rounded-2xl p-4 mb-4">
            <div class="flex items-center gap-2 mb-3">
              <span class="text-xl">{{ getAnswerEmoji(question.question_type) }}</span>
              <span class="font-semibold text-purple-600">Jawaban Kamu:</span>
            </div>
            
            <!-- Essay Answer -->
            <div v-if="question.question_type === 'essay'" 
                 class="bg-white rounded-xl p-3 text-gray-700">
              {{ question.student_answer.answer_text }}
            </div>

            <!-- Choice Image Answer -->
            <div v-else-if="question.question_type === 'choice_image'" 
                 class="bg-white rounded-xl p-3 text-gray-700">
              Pilihan: {{ question.student_answer.answer_option_id }}
            </div>

            <!-- Match Image Answer -->
            <div v-else-if="question.question_type === 'match_image'" 
                 class="bg-white rounded-xl p-3">
              <div v-for="(pair, index) in parseMatchPairs(question.student_answer.answer_text)" 
                   :key="index" 
                   class="flex items-center gap-2 mb-2">
                <span class="text-purple-500">🔗</span>
                <span class="text-gray-700">
                  Pasangan {{ index + 1 }}: Kiri {{ pair.left_id }} - Kanan {{ pair.right_id }}
                </span>
              </div>
            </div>
          </div>

          <!-- Score and Feedback -->
          <div class="space-y-3">
            <div class="inline-block px-4 py-2 rounded-full font-bold"
                 :class="{
                   'bg-green-100 text-green-700': question.student_answer.is_correct,
                   'bg-red-100 text-red-700': question.student_answer.is_correct === false,
                   'bg-gray-100 text-gray-700': question.student_answer.is_correct === null
                 }">
              Nilai: {{ question.student_answer.score || 0 }}/{{ question.max_score }}
            </div>

            <div v-if="question.student_answer.feedback" 
                 class="bg-yellow-50 rounded-2xl p-4">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-xl">👨‍🏫</span>
                <span class="font-semibold text-yellow-700">Catatan Guru:</span>
              </div>
              <p class="text-gray-700">{{ question.student_answer.feedback }}</p>
            </div>
          </div>
        </div>
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
          Yuk mulai belajar dan kerjakan kuis! 🚀
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

circle {
  transition: stroke-dasharray 1s ease-in-out;
}
</style>
