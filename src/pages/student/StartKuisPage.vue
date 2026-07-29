<script setup>
import { ref, onMounted, computed, watch, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useLessonStore } from "../../store/users/lessonsStore";
import { getCurrentInstance } from "vue";
import { useQuizStore } from "../../store/users/QuizStore";
import { useUserStore } from "../../store/userStore";
import Swal from "sweetalert2";
import KanbanMatch from "../../components/KanbanMatch.vue";

const { proxy } = getCurrentInstance();
const base_url = proxy.$base_url;
const route = useRoute();
const router = useRouter();
const lessonStore = useLessonStore();
const quizStore = useQuizStore();
const userStore = useUserStore();

const currentQuestionIndex = ref(0);
const answers = ref({});
const timeLeft = ref(600); // 10 minutes in seconds
const quizStartTime = ref(null);
const isSubmitting = ref(false);

const quiz = ref(null);
const loading = ref(true);
const error = ref(null);

// Add new refs for question data
const currentQuestion = ref(null);
const isLoadingQuestion = ref(false);

// Add new refs for match pairs
const matchPairAnswers = ref(new Map());
const draggedItem = ref(null);

const getFullImageUrl = (imagePath) => {
  if (!imagePath) return null;
  return `${base_url}/${imagePath}`;
};

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

const clearQuizStorage = () => {
  try {
    // Clear all quiz-related session storage
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.includes('quiz') || key.includes('Quiz')) {
        sessionStorage.removeItem(key);
      }
    });

    // Clear specific quiz items
    sessionStorage.removeItem("quizState");
    sessionStorage.removeItem("quizData");
    sessionStorage.removeItem("quizStartTime");

    // Clear all quiz-related local storage
    const localKeys = Object.keys(localStorage);
    localKeys.forEach(key => {
      if (key.includes('quiz') || key.includes('Quiz')) {
        localStorage.removeItem(key);
      }
    });
    localStorage.removeItem("quizPayload");

    // Reset component state
    answers.value = {};
    currentQuestionIndex.value = 0;
    timeLeft.value = 600;
    quizStartTime.value = null;
    matchPairAnswers.value.clear();
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
};

const loadQuizData = async () => {
  try {
    loading.value = true;
    error.value = null;

    // Check if we have a quiz ID
    if (!route.params.id) {
      clearQuizStorage(); // Clear storage if no quiz ID
      throw new Error("ID Kuis tidak ditemukan");
    }

    // Check if we have cached data
    const cachedData = sessionStorage.getItem("quizData");
    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
        if (parsedData && parsedData.id === parseInt(route.params.id)) {
          quiz.value = parsedData;
          loading.value = false;

          if (quiz.value.is_active && !quizStartTime.value) {
            startTimer();
          }
          return;
        } else {
          clearQuizStorage(); 
        }
      } catch (err) {
        console.error("Error parsing cached data:", err);
        clearQuizStorage(); 
      }
    }

    // Fetch quiz data
    const response = await lessonStore.getLessonQuestions(route.params.id);

    // Check if we have valid quiz data
    if (!response || !response.data) {
      clearQuizStorage(); 
      throw new Error("Data kuis tidak ditemukan");
    }

    // Cache the quiz data
    sessionStorage.setItem("quizData", JSON.stringify(response.data));

    // Set quiz data
    quiz.value = response.data;

    if (quiz.value.is_active && !quizStartTime.value) {
      startTimer();
    } else if (!quiz.value.is_active) {
      clearQuizStorage();
      error.value = "Kuis belum aktif";
    }
  } catch (err) {
    console.error("Error loading quiz:", err);
    error.value = err.message || "Maaf, terjadi kesalahan saat memuat kuis";
    clearQuizStorage(); // Clear storage on any error

    // Redirect to class page after 3 seconds
    setTimeout(() => {
      router.push("/kelas");
    }, 3000);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  //get user profile
  await userStore.getUserProfile();

  const savedState = sessionStorage.getItem("quizState");
  const savedStartTime = sessionStorage.getItem("quizStartTime");

  if (savedState) {
    try {
      const state = JSON.parse(savedState);
      if (state) {
        currentQuestionIndex.value = state.currentQuestionIndex || 0;
        answers.value = state.answers || {};
        quizStartTime.value = savedStartTime ? parseInt(savedStartTime) : null;

        // If we have a start time, calculate the current timeLeft
        if (quizStartTime.value) {
          const elapsedSeconds = Math.floor(
            (Date.now() - quizStartTime.value) / 1000
          );
          timeLeft.value = Math.max(600 - elapsedSeconds, 0);

          // If there's still time left, restart the timer
          if (timeLeft.value > 0) {
            startTimer();
          } else {
            // If time has run out, submit the quiz
            submitQuiz();
          }
        } else {
          timeLeft.value = state.timeLeft || 600;
        }
      }
    } catch (err) {
      console.error("Error restoring state:", err);
      sessionStorage.removeItem("quizState");
      sessionStorage.removeItem("quizStartTime");
    }
  }

  // Load quiz data after restoring state
  await loadQuizData();
});

// Add event listener for page reload
window.addEventListener("beforeunload", () => {
  if (quiz.value) {
    // Save quiz state
    sessionStorage.setItem(
      "quizState",
      JSON.stringify({
        currentQuestionIndex: currentQuestionIndex.value,
        answers: answers.value,
        timeLeft: timeLeft.value,
        quizStartTime: quizStartTime.value,
      })
    );
  }
});

const startTimer = () => {
  // If we don't have a start time, set it now
  if (!quizStartTime.value) {
    quizStartTime.value = Date.now();
    sessionStorage.setItem("quizStartTime", quizStartTime.value.toString());
  }

  const timer = setInterval(() => {
    // Calculate elapsed time
    const elapsedSeconds = Math.floor(
      (Date.now() - quizStartTime.value) / 1000
    );
    const remainingTime = Math.max(600 - elapsedSeconds, 0); // 600 seconds = 10 minutes

    if (remainingTime > 0) {
      timeLeft.value = remainingTime;
      // Save state every second
      if (quiz.value) {
        sessionStorage.setItem(
          "quizState",
          JSON.stringify({
            currentQuestionIndex: currentQuestionIndex.value,
            answers: answers.value,
            timeLeft: timeLeft.value,
            quizStartTime: quizStartTime.value,
          })
        );
      }
    } else {
      clearInterval(timer);
      submitQuiz();
    }
  }, 1000);
};

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const progress = computed(() => {
  if (!quiz.value?.questions) return 0;
  return ((currentQuestionIndex.value + 1) / quiz.value.questions.length) * 100;
});

// Add function to load question details
const loadQuestionDetails = async (questionId) => {
  try {
    isLoadingQuestion.value = true;
    await quizStore.getQuestionWithRelationsById(questionId);
    currentQuestion.value = quizStore.question;
  } catch (err) {
    console.error("Error loading question details:", err);
  } finally {
    isLoadingQuestion.value = false;
  }
};

// Update the template section for questions
const handleAnswer = (answer) => {
  if (!currentQuestion.value) return;
  answers.value[currentQuestion.value.id] = answer;
  // Save state after each answer
  if (quiz.value) {
    sessionStorage.setItem(
      "quizState",
      JSON.stringify({
        currentQuestionIndex: currentQuestionIndex.value,
        answers: answers.value,
        timeLeft: timeLeft.value,
        quizStartTime: quizStartTime.value,
      })
    );
  }
};

// Watch for changes in currentQuestionIndex
watch(
  [() => quiz.value, currentQuestionIndex],
  async ([newQuiz, newIndex]) => {
    if (newQuiz?.questions && newQuiz.questions[newIndex]) {
      const questionId = newQuiz.questions[newIndex].id;
      await loadQuestionDetails(questionId);
    }
  },
  { immediate: true }
);

const nextQuestion = () => {
  if (!quiz.value?.questions) return;
  if (currentQuestionIndex.value < quiz.value.questions.length - 1) {
    currentQuestionIndex.value++;
    // Save state after navigation
    sessionStorage.setItem(
      "quizState",
      JSON.stringify({
        currentQuestionIndex: currentQuestionIndex.value,
        answers: answers.value,
        timeLeft: timeLeft.value,
        quizStartTime: quizStartTime.value,
      })
    );
  }
};

const previousQuestion = () => {
  if (!quiz.value?.questions) return;
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--;
    // Save state after navigation
    sessionStorage.setItem(
      "quizState",
      JSON.stringify({
        currentQuestionIndex: currentQuestionIndex.value,
        answers: answers.value,
        timeLeft: timeLeft.value,
        quizStartTime: quizStartTime.value,
      })
    );
  }
};

const handleMatchUpdate = (matches) => {
  if (currentQuestion.value) {
    answers.value[currentQuestion.value.id] = matches;
  }
};

const submitQuiz = async () => {
  if (isSubmitting.value) return;
  isSubmitting.value = true;

  try {
    // Format answers into required payload structure
    const formattedAnswers = Object.entries(answers.value).map(
      ([questionId, answer]) => {
        const questionData = {
          student_id: userStore.userProfile?.id, // Use the user ID from the profile
          question_id: parseInt(questionId),
          answer_text: null,
          answer_option_id: null,
          answer_image: null,
          submitted_at: new Date().toISOString(),
          is_correct: null,
          score: null,
          feedback: null,
        };

        // Handle different question types
        const question = quiz.value.questions.find(
          (q) => q.id === parseInt(questionId)
        );
        if (!question) return questionData;

        switch (question.type) {
          case "choice":
          case "choice_image":
            questionData.answer_option_id = answer;
            break;
          case "essay":
            questionData.answer_text = answer;
            break;
          case "match_image":
            // For match_image, we store the matches as answer_text in JSON format
            questionData.answer_text = JSON.stringify(answer);
            break;
        }

        return questionData;
      }
    );

    // Create the complete payload
    const payload = {
      quiz_id: quiz.value.id,
      answers: formattedAnswers,
    };

    // Store payload in localStorage for inspection
    localStorage.setItem("quizPayload", JSON.stringify(payload, null, 2));

    // Submit quiz
    await quizStore.submitQuiz(payload);

    if (quizStore.success) {
      clearQuizStorage(); // Clear all storage on successful submission
      
      Swal.fire({
        title: "Berhasil!",
        text: "Jawaban berhasil dikirim",
        icon: "success",
        confirmButtonText: "OK",
      }).then((result) => {
        if (result.isConfirmed) {
          router.push("/kuis/results");
        }
      });
    }
  } catch (err) {
    console.error("Error preparing payload:", err);
    error.value = "Maaf, terjadi kesalahan saat menyiapkan data";
    clearQuizStorage(); // Clear storage on error
  } finally {
    isSubmitting.value = false;
  }
};

// Add beforeUnmount hook to clear storage when component is destroyed
onBeforeUnmount(() => {
  clearQuizStorage();
});
</script>

<style scoped>
.custom-scrollbar {
  max-height: 300px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #93c5fd #e0f2fe;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #e0f2fe;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #93c5fd;
  border-radius: 4px;
  border: 2px solid #e0f2fe;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #60a5fa;
}

.draggable {
  cursor: grab;
  transition: all 0.2s;
}

.draggable:active {
  cursor: grabbing;
}

.dragging {
  opacity: 0.5;
  transform: scale(0.95);
}

.droppable {
  transition: all 0.2s;
}

.drag-over {
  background-color: rgba(147, 197, 253, 0.1);
  transform: scale(1.02);
}

.matched {
  border-color: #10b981;
  background-color: rgba(16, 185, 129, 0.1);
}

.match-line {
  position: absolute;
  height: 2px;
  background-color: #10b981;
  transform-origin: left center;
  z-index: 1;
}
</style>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
    <!-- Header -->
    <div class="max-w-4xl mx-auto mb-8">
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold text-blue-600">
          <span class="mr-2">📝</span>
          {{ quiz?.title || "Kuis Seru!" }}
        </h1>
        <div class="flex items-center gap-4">
          <div class="bg-white px-4 py-2 rounded-xl shadow-md">
            <span class="text-xl">⏰</span>
            <span
              class="ml-2 font-bold"
              :class="{ 'text-red-500': timeLeft < 300 }"
            >
              {{ formatTime(timeLeft) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="max-w-4xl mx-auto text-center py-12">
      <div class="loading loading-spinner loading-lg text-blue-600"></div>
      <p class="mt-4 text-lg text-gray-600">
        Tunggu sebentar ya, teman-teman! Kuis sedang dimuat... 🌟
      </p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="max-w-4xl mx-auto">
      <div class="alert alert-error shadow-lg">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div class="flex-1">
          <span>{{ error }}</span>
          <p class="text-sm mt-2">
            Sebentar ya, kamu akan kembali ke halaman kelas... 🏫
          </p>
        </div>
      </div>
    </div>

    <!-- Quiz Content -->
    <div v-else-if="quiz" class="max-w-4xl mx-auto">
      <!-- Quiz Info Card -->
      <div class="bg-white rounded-2xl shadow-lg p-8 mb-8 transform hover:scale-[1.01] transition-transform">        
        <div class="text-center mb-6">
          <div class="flex items-center justify-center gap-4">
            <div class="bg-purple-100 p-3 rounded-xl flex items-center justify-center">
              <span class="text-2xl">📚</span>
            </div>
            <h2 class="text-xl font-bold text-purple-700">
              Yuk, Mulai Belajar! 🌈
            </h2>
          </div>
        </div>

        <!-- Lesson Info -->
        <div class="bg-purple-50 p-4 rounded-xl mb-4">
          <div class="flex items-center gap-3 mb-2">
            <span class="text-xl">🎯</span>
            <h3 class="font-semibold text-purple-700">
              {{ quiz.lesson?.title }}
            </h3>
          </div>
          <p class="text-gray-600 ml-8">{{ quiz.lesson?.description }}</p>
        </div>

        <!-- Quiz Description -->
        <div class="bg-blue-50 p-4 rounded-xl mb-4">
          <div class="flex items-start gap-3">
            <span class="text-xl">📖</span>
            <div class="flex-1">
              <h3 class="font-semibold text-blue-700 mb-2">
                Petunjuk Kuis
              </h3>
              <div class="custom-scrollbar bg-white p-4 rounded-lg shadow-inner">
                <p class="text-gray-600 whitespace-pre-line">
                  {{ quiz.description }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Time Info -->
        <div class="space-y-4">
          <div class="bg-green-50 p-4 rounded-xl">
            <div class="flex items-center gap-3">
              <span class="text-xl">⏰</span>
              <div>
                <h3 class="font-semibold text-green-700">Waktu Mulai</h3>
                <p class="text-gray-600">
                  {{ formatDate(quiz.start_time) }}
                </p>
              </div>
            </div>
          </div>
          <div class="bg-orange-50 p-4 rounded-xl">
            <div class="flex items-center gap-3">
              <span class="text-xl">⌛</span>
              <div>
                <h3 class="font-semibold text-orange-700">Waktu Selesai</h3>
                <p class="text-gray-600">{{ formatDate(quiz.end_time) }}</p>
              </div>
            </div>          </div>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="mb-8">
        <div class="w-full bg-white rounded-full h-4 shadow-inner">
          <div
            class="bg-blue-600 h-4 rounded-full transition-all duration-300"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
        <div class="flex justify-between mt-2 text-sm text-gray-600">
          <span
            >Soal {{ currentQuestionIndex + 1 }} dari
            {{ quiz.questions.length }}</span
          >
          <span>{{ Math.round(progress) }}% Sudah Dikerjakan</span>
        </div>
      </div>

      <!-- Question Card -->
      <div
        v-if="currentQuestion"
        class="bg-white rounded-2xl shadow-lg p-8 mb-8 transform hover:scale-[1.01] transition-transform"
      >
        <div class="flex items-start gap-4">
          <div class="bg-blue-100 p-3 rounded-xl">
            <span class="text-2xl">❓</span>
          </div>
          <div class="flex-1">
            <h2 class="text-xl font-bold text-gray-800 mb-4">
              {{ currentQuestion.question_text }}
            </h2>

            <!-- Question Image -->
            <div v-if="currentQuestion.question_image" class="mb-6">
              <img
                :src="getFullImageUrl(currentQuestion.question_image)"
                :alt="currentQuestion.question_text"
                class="max-w-full rounded-lg shadow-md"
              />
            </div>

            <!-- Loading State -->
            <div v-if="isLoadingQuestion" class="flex justify-center py-8">
              <div
                class="loading loading-spinner loading-lg text-blue-600"
              ></div>
            </div>

            <!-- Answer Input -->
            <div v-else class="space-y-4">
              <!-- Choice Image Type -->
              <div
                v-if="currentQuestion.type === 'choice_image'"
                class="grid grid-cols-2 gap-4"
              >
                <div
                  v-for="option in currentQuestion.options"
                  :key="option.id"
                  class="relative border-2 rounded-xl p-4 cursor-pointer transition-all"
                  :class="[
                    answers[currentQuestion.id] === option.id
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-200',
                  ]"
                  @click="handleAnswer(option.id)"
                >
                  <div
                    class="absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center"
                    :class="[
                      answers[currentQuestion.id] === option.id
                        ? 'border-blue-400 bg-blue-400'
                        : 'border-gray-300',
                    ]"
                  >
                    <span
                      v-if="answers[currentQuestion.id] === option.id"
                      class="text-white"
                      >✓</span
                    >
                  </div>
                  <div v-if="option.option_image">
                    <img
                      :src="getFullImageUrl(option.option_image)"
                      :alt="option.option_text"
                      class="w-full rounded-lg"
                    />
                  </div>
                  <p
                    v-if="option.option_text"
                    class="mt-2 text-center text-gray-700"
                  >
                    {{ option.option_text }}
                  </p>
                </div>
              </div>

              <!-- Match Image Type -->
              <div v-else-if="currentQuestion.type === 'match_image'">
                <KanbanMatch
                  :match-pairs="currentQuestion.match_pairs || currentQuestion.options || currentQuestion.matchPairs || []"
                  :base-url="base_url"
                  @update:matches="handleMatchUpdate"
                />
              </div>

              <!-- Choice Type (Original) -->
              <div
                v-else-if="currentQuestion.type === 'choice'"
                class="space-y-3"
              >
                <div
                  v-for="choice in currentQuestion.options"
                  :key="choice.id"
                  class="flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all"
                  :class="[
                    answers[currentQuestion.id] === choice.id
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-200',
                  ]"
                  @click="handleAnswer(choice.id)"
                >
                  <div
                    class="w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4"
                    :class="[
                      answers[currentQuestion.id] === choice.id
                        ? 'border-blue-400 bg-blue-400'
                        : 'border-gray-300',
                    ]"
                  >
                    <span
                      v-if="answers[currentQuestion.id] === choice.id"
                      class="text-white"
                      >✓</span
                    >
                  </div>
                  <span class="text-gray-700">{{ choice.option_text }}</span>
                </div>
              </div>

              <!-- Essay Type (Original) -->
              <div
                v-else-if="currentQuestion.type === 'essay'"
                class="space-y-4"
              >
                <textarea
                  v-model="answers[currentQuestion.id]"
                  class="w-full p-4 border-2 border-blue-200 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all"
                  rows="4"
                  placeholder="Tulis jawabanmu di sini, teman! 📝"
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Buttons -->
      <div class="flex justify-between">
        <button
          @click="previousQuestion"
          :disabled="currentQuestionIndex === 0"
          class="btn btn-outline btn-lg"
          :class="{ 'btn-disabled': currentQuestionIndex === 0 }"
        >
          <span class="mr-2">⬅️</span>
          Soal Sebelumnya
        </button>

        <div class="flex gap-4">
          <button
            v-if="currentQuestionIndex < quiz.questions.length - 1"
            @click="nextQuestion"
            class="btn btn-primary btn-lg"
          >
            Soal Berikutnya
            <span class="ml-2">➡️</span>
          </button>

          <button
            v-else
            @click="submitQuiz"
            :disabled="isSubmitting"
            class="btn btn-success btn-lg"
          >
            <span v-if="isSubmitting" class="loading loading-spinner"></span>
            <span v-else>🎯 Selesai & Kirim Jawaban</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
