<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useQuizStore } from '../../../store/quizStore.js';

const route = useRoute();
const quizStore = useQuizStore();
const quizResult = ref(null);

onMounted(async () => {
  const quizId = route.params.id;
  try {
    const response = await quizStore.getQuizResultsById(quizId);
    quizResult.value = response.data;
  } catch (error) {
    console.error('Error fetching quiz details:', error);
  }
});
</script>

<template>
  <div class="p-6" v-if="quizResult">
    <!-- Quiz Header Information -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold mb-2">{{ quizResult.quiz_title }}</h1>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Overall Score Card -->
        <div class="bg-blue-50 p-4 rounded-lg">
          <h3 class="font-semibold mb-2">Skor Total</h3>
          <div class="text-3xl font-bold text-blue-600">{{ quizResult.percentage_score }}%</div>
          <p class="text-sm text-gray-600">{{ quizResult.total_score }} / {{ quizResult.max_possible_score }} poin</p>
        </div>

        <!-- Questions Stats Card -->
        <div class="bg-green-50 p-4 rounded-lg">
          <h3 class="font-semibold mb-2">Jawaban Benar</h3>
          <div class="text-3xl font-bold text-green-600">{{ quizResult.correct_answers }}</div>
          <p class="text-sm text-gray-600">dari {{ quizResult.total_questions }} pertanyaan</p>
        </div>

        <!-- Completion Rate Card -->
        <div class="bg-purple-50 p-4 rounded-lg">
          <h3 class="font-semibold mb-2">Tingkat Penyelesaian</h3>
          <div class="text-3xl font-bold text-purple-600">{{ quizResult.completion_rate }}%</div>
          <p class="text-sm text-gray-600">{{ quizResult.answered_questions }} / {{ quizResult.total_questions }} pertanyaan dijawab</p>
        </div>
      </div>
    </div>

    <!-- Questions List -->
    <div class="space-y-6">
      <h2 class="text-xl font-bold mb-4">Daftar Pertanyaan</h2>
      
      <div v-for="(question, index) in quizResult.questions" :key="question.question_id" 
           class="bg-white rounded-lg shadow-lg p-6">
        <div class="flex items-start gap-4">
          <!-- Question Number -->
          <div class="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-semibold">
            {{ parseInt(index) + 1 }}
          </div>
          
          <!-- Question Content -->
          <div class="flex-grow">
            <div class="mb-4">
              <h3 class="font-semibold mb-2">{{ question.question_text }}</h3>
              <div class="flex items-center gap-3 text-sm text-gray-600">
                <span class="px-2 py-1 bg-gray-100 rounded-full">
                  {{ question.question_type === 'essay' ? 'Esai' : 
                     question.question_type === 'match_image' ? 'Mencocokkan Gambar' : 
                     question.question_type === 'choice_image' ? 'Pilihan Gambar' : 
                     question.question_type }}
                </span>
                <span>Nilai Maksimal: {{ question.max_score }}</span>
              </div>
            </div>

            <!-- Student Answer Section -->
            <div class="mt-4 p-4 bg-gray-50 rounded-lg">
              <p class="font-medium mb-2">Jawaban Siswa:</p>
              <p class="text-gray-700">
                {{ question.student_answer ? question.student_answer : 'Belum dijawab' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Loading State -->
  <div v-else class="p-6">
    <div class="text-center">
      <div class="loading loading-spinner loading-lg"></div>
      <p class="mt-4">Memuat detail kuis...</p>
    </div>
  </div>
</template>