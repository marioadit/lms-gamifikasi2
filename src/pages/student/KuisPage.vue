<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Vue3Lottie } from 'vue3-lottie';

const router = useRouter();
const route = useRoute();

// Data dummy kuis yang sedang dibuka
// Dalam implementasi sebenarnya, ini akan diambil dari API berdasarkan ID dari URL
const quizId = ref(101);

// Data dummy kuis (dari model Quiz)
const quiz = ref({
  id: 101,
  lesson_id: 1,
  title: 'Latihan Penjumlahan',
  description: 'Jawab soal penjumlahan berikut dengan benar',
  is_active: true,
  questions: [
    {
      id: 1001,
      quiz_id: 101,
      type: 'multiple_choice',
      question_text: 'Berapa hasil dari 5 + 3?',
      question_image: null,
      order: 1,
      score: 10,
      options: [
        { id: 10001, option_text: '7', is_correct: false },
        { id: 10002, option_text: '8', is_correct: true },
        { id: 10003, option_text: '9', is_correct: false },
        { id: 10004, option_text: '10', is_correct: false }
      ]
    },
    {
      id: 1002,
      quiz_id: 101,
      type: 'multiple_choice',
      question_text: 'Berapa hasil dari 10 + 15?',
      question_image: null,
      order: 2,
      score: 10,
      options: [
        { id: 10005, option_text: '20', is_correct: false },
        { id: 10006, option_text: '25', is_correct: true },
        { id: 10007, option_text: '30', is_correct: false },
        { id: 10008, option_text: '35', is_correct: false }
      ]
    },
    {
      id: 1003,
      quiz_id: 101,
      type: 'match_image',
      question_text: 'Pasangkan jumlah dengan angka yang tepat!',
      question_image: null,
      order: 3,
      score: 20,
      matchPairs: [
        { id: 20001, left_text: '🍎🍎🍎', right_text: '3' },
        { id: 20002, left_text: '🍊🍊🍊🍊', right_text: '4' },
        { id: 20003, left_text: '🍌🍌', right_text: '2' }
      ]
    }
  ]
});

// Data jawaban siswa
const studentAnswers = ref({});
const showCorrectAnimation = ref(false);

// Current question index
const currentQuestionIndex = ref(0);

// Computed property untuk pertanyaan saat ini
const currentQuestion = computed(() => {
  return quiz.value.questions[currentQuestionIndex.value];
});

// Memeriksa apakah ada jawaban untuk pertanyaan saat ini
const hasCurrentAnswer = computed(() => {
  return !!studentAnswers.value[currentQuestion.value.id];
});

// Menangani pemilihan jawaban
const selectOption = (questionId, optionId) => {
  studentAnswers.value[questionId] = optionId;
  showCorrectAnimation.value = true;
  setTimeout(() => {
    showCorrectAnimation.value = false;
  }, 1500);
};

// Menangani pasangan jawaban
const selectMatchPair = (questionId, pairId, value) => {
  if (!studentAnswers.value[questionId]) {
    studentAnswers.value[questionId] = {};
  }
  studentAnswers.value[questionId][pairId] = value;
};

// Fungsi untuk pindah ke pertanyaan berikutnya
const nextQuestion = () => {
  if (currentQuestionIndex.value < quiz.value.questions.length - 1) {
    currentQuestionIndex.value++;
  } else {
    // Jika sudah di pertanyaan terakhir, kirim jawaban
    submitQuiz();
  }
};

// Fungsi untuk kembali ke pertanyaan sebelumnya
const prevQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--;
  }
};

// Fungsi untuk kirim semua jawaban
const submitQuiz = () => {
  // Dalam implementasi sebenarnya, ini akan mengirim jawaban ke API
  console.log('Jawaban:', studentAnswers.value);
  router.push('/kuis/hasil/101');
};
</script>

<template>
  <div class="p-4 bg-blue-50 min-h-screen">
    <!-- Header kuis -->
    <div class="bg-white p-6 rounded-3xl shadow-md mb-6">
      <div class="flex items-center gap-3 mb-2">
        <button @click="router.push('/pelajaran')" class="text-2xl hover:scale-110 transition-transform">
          <Vue3Lottie
            animation-link="https://assets10.lottiefiles.com/packages/lf20_ydo1amjm.json"
            :height="40"
            :width="40"
          />
        </button>
        <h1 class="text-2xl font-bold text-slate-900">{{ quiz.title }}</h1>
      </div>
      <p class="text-purple-600">{{ quiz.description }}</p>
      
      <!-- Progres kuis -->
      <div class="mt-4">
        <div class="flex justify-between mb-2">
          <span class="text-sm font-medium">Soal {{ currentQuestionIndex + 1 }} dari {{ quiz.questions.length }}</span>
          <span class="text-sm font-bold">{{ Math.round(((currentQuestionIndex + 1) / quiz.questions.length) * 100) }}%</span>
        </div>
        <div class="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
          <div class="h-full bg-purple-500 rounded-full transition-all duration-500" 
            :style="`width: ${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%`">
          </div>
        </div>
      </div>
    </div>
    
    <!-- Pertanyaan saat ini -->
    <div class="bg-white p-6 rounded-3xl shadow-md mb-6">
      <!-- Nomor dan Teks Pertanyaan -->
      <div class="mb-6">
        <div class="bg-purple-100 text-purple-600 px-4 py-2 rounded-xl inline-block mb-2">
          Soal {{ currentQuestionIndex + 1 }}
        </div>
        <h2 class="text-xl font-bold">{{ currentQuestion.question_text }}</h2>
      </div>
      
      <!-- Gambar pertanyaan jika ada -->
      <div v-if="currentQuestion.question_image" class="mb-6">
        <img :src="currentQuestion.question_image" alt="Gambar Soal" class="rounded-xl mx-auto max-h-40 object-contain">
      </div>

      <!-- Animation for correct answer -->
      <div v-if="showCorrectAnimation" class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
        <Vue3Lottie
          animation-link="https://assets10.lottiefiles.com/packages/lf20_ydo1amjm.json"
          :height="200"
          :width="200"
        />
      </div>
      
      <!-- Pilihan jawaban untuk tipe multiple choice -->
      <div v-if="currentQuestion.type === 'multiple_choice'" class="space-y-4 mb-6">
        <div v-for="option in currentQuestion.options" :key="option.id"
          class="border-2 rounded-xl p-4 cursor-pointer transition-all transform hover:scale-102"
          :class="studentAnswers[currentQuestion.id] === option.id ? 
            'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-200'"
          @click="selectOption(currentQuestion.id, option.id)">
          <div class="flex items-center gap-3">
            <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center"
              :class="studentAnswers[currentQuestion.id] === option.id ? 
                'border-purple-500 bg-purple-500' : 'border-gray-300'">
              <Vue3Lottie
                v-if="studentAnswers[currentQuestion.id] === option.id"
                animation-link="https://assets10.lottiefiles.com/packages/lf20_ydo1amjm.json"
                :height="20"
                :width="20"
              />
            </div>
            <span class="text-lg">{{ option.option_text }}</span>
          </div>
        </div>
      </div>
      
      <!-- Matching pairs untuk tipe match_image -->
      <div v-if="currentQuestion.type === 'match_image'" class="mb-6">
        <div v-for="pair in currentQuestion.matchPairs" :key="pair.id" class="mb-4">
          <div class="flex items-center gap-4">
            <div class="bg-blue-100 p-3 rounded-xl text-xl text-center w-1/2">
              {{ pair.left_text }}
            </div>
            <Vue3Lottie
              animation-link="https://assets10.lottiefiles.com/packages/lf20_ydo1amjm.json"
              :height="40"
              :width="40"
            />
            <div class="bg-green-100 p-3 rounded-xl text-xl text-center w-1/2">
              {{ pair.right_text }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Navigasi antar pertanyaan -->
      <div class="flex justify-between">
        <button v-if="currentQuestionIndex > 0"
          @click="prevQuestion"
          class="bg-gray-200 hover:bg-gray-300 px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition-transform hover:scale-105">
          <Vue3Lottie
            animation-link="https://assets10.lottiefiles.com/packages/lf20_ydo1amjm.json"
            :height="30"
            :width="30"
          />
          <span>Soal Sebelumnya</span>
        </button>
        <div v-else></div>
        
        <button 
          @click="nextQuestion"
          class="bg-purple-500 hover:bg-purple-600 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition-all hover:scale-105">
          <span v-if="currentQuestionIndex < quiz.questions.length - 1">Soal Berikutnya</span>
          <span v-else>Selesai</span>
          <Vue3Lottie
            v-if="currentQuestionIndex < quiz.questions.length - 1"
            animation-link="https://assets10.lottiefiles.com/packages/lf20_ydo1amjm.json"
            :height="30"
            :width="30"
          />
          <Vue3Lottie
            v-else
            animation-link="https://assets10.lottiefiles.com/packages/lf20_ydo1amjm.json"
            :height="30"
            :width="30"
          />
        </button>
      </div>
    </div>
  </div>
</template> 