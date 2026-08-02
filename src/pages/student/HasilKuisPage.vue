<script setup>
import { ref, onMounted, getCurrentInstance } from "vue";
import { useQuizStore } from "../../store/users/QuizStore";
import { useRoute, useRouter } from "vue-router";
import { 
  getQuizResultsByIdAPI, 
  getQuizWithLessonAndQuestionsAPI, 
  getQuestionWithRelationsByIdAPI, 
  getAllStudentAnswersAPI 
} from "../../api/users/quizUserApi";

const { proxy } = getCurrentInstance();
const base_url = proxy?.$base_url || import.meta.env.VITE_API_URL || "";

const route = useRoute();
const router = useRouter();
const quizStore = useQuizStore();
const isLoading = ref(true);
const errorMessage = ref(null);

const quizData = ref(null);
const questionsList = ref([]);
const studentAnswersList = ref([]);

const enrichedQuestionsMap = ref({});

const getFullImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  return `${base_url}/${imagePath}`;
};

const fetchEnrichedQuestions = async (questions) => {
  if (!questions || !Array.isArray(questions)) return;

  await Promise.all(
    questions.map(async (q) => {
      const qId = q.question_id || q.id;
      if (qId && !enrichedQuestionsMap.value[qId]) {
        try {
          const res = await getQuestionWithRelationsByIdAPI(qId);
          if (res && res.data) {
            enrichedQuestionsMap.value[qId] = res.data;
          }
        } catch (e) {
          console.warn("Could not fetch detail question for student:", e);
        }
      }
    })
  );
};

onMounted(async () => {
  try {
    isLoading.value = true;
    errorMessage.value = null;

    const quizId = route.params.id || route.params.quizId || 2;
    const response = await getQuizResultsByIdAPI(quizId);
    
    if (response) {
      const data = response.data || response;
      quizData.value = data;

      // 1. Try extracting questions from history response
      let qList = [];
      if (Array.isArray(data.questions)) {
        qList = data.questions;
      } else if (data.quiz && Array.isArray(data.quiz.questions)) {
        qList = data.quiz.questions;
      }

      // 2. Fetch using users/quiz/{id}/LessonQuestions student endpoint if questions empty
      const targetQuizId = data.quiz_id || quizId;
      if (qList.length === 0 && targetQuizId) {
        try {
          const lqRes = await getQuizWithLessonAndQuestionsAPI(targetQuizId);
          const lqData = lqRes?.data || lqRes;
          if (lqData) {
            if (Array.isArray(lqData.questions)) {
              qList = lqData.questions;
            } else if (Array.isArray(lqData)) {
              qList = lqData;
            }
          }
        } catch (lqErr) {
          console.warn("Could not fetch quiz questions via LessonQuestions:", lqErr);
        }
      }
      questionsList.value = qList;

      // 3. Extract student answers list
      let saList = [];
      if (Array.isArray(data.student_answers)) {
        saList = data.student_answers;
      } else if (Array.isArray(data.studentAnswers)) {
        saList = data.studentAnswers;
      } else {
        try {
          const saRes = await getAllStudentAnswersAPI();
          const saData = saRes?.data || saRes;
          if (Array.isArray(saData)) {
            saList = saData;
          } else if (Array.isArray(saData?.student_answers)) {
            saList = saData.student_answers;
          }
        } catch (saErr) {
          console.warn("Could not fetch student answers:", saErr);
        }
      }
      studentAnswersList.value = saList;

      // 4. Enrich question details (options & match_pairs) via student questions API
      await fetchEnrichedQuestions(questionsList.value);
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

const getStudentAnswerForQuestion = (q) => {
  const qId = Number(q.id || q.question_id);

  if (q.student_answer) {
    return q.student_answer;
  }

  if (studentAnswersList.value && studentAnswersList.value.length > 0) {
    const validAnswerIds = (quizData.value?.student_answers_ids || []).map(id => Number(id));
    
    if (validAnswerIds.length > 0) {
      const found = studentAnswersList.value.find(
        sa => Number(sa.question_id) === qId && validAnswerIds.includes(Number(sa.id))
      );
      if (found) return found;
    }

    const found = studentAnswersList.value.find(sa => Number(sa.question_id) === qId);
    if (found) return found;
  }

  return null;
};

const getEssayOrGuessAnswerKey = (q) => {
  const enrichedQ = getEnrichedQuestion(q);
  const essayAns = enrichedQ.essay_answers || enrichedQ.essayAnswers || q.essay_answers || q.essayAnswers;
  
  if (Array.isArray(essayAns) && essayAns.length > 0) {
    return essayAns.map(a => a.option_text).join(" / ");
  }

  if (enrichedQ.option_text || q.option_text) {
    return enrichedQ.option_text || q.option_text;
  }

  return q.question_text || enrichedQ.question_text || "-";
};

const parseMatchPairs = (answerText) => {
  if (!answerText) return [];
  try {
    const parsed = typeof answerText === "string" ? JSON.parse(answerText) : answerText;
    if (Array.isArray(parsed)) return parsed;
  } catch {
    return [];
  }
  return [];
};

const getEnrichedQuestion = (q) => {
  const qId = Number(q.id || q.question_id);
  if (enrichedQuestionsMap.value[qId]) {
    return enrichedQuestionsMap.value[qId];
  }
  return q;
};

const getSelectedOptionObj = (q) => {
  const sa = getStudentAnswerForQuestion(q);
  const optId = sa?.answer_option_id;
  if (!optId) return null;

  const enrichedQ = getEnrichedQuestion(q);
  const options = enrichedQ.options || q.options || [];

  if (Array.isArray(options)) {
    const found = options.find(o => Number(o.id) === Number(optId));
    if (found) return found;
  }

  return null;
};

const getMatchPairObj = (q, pairId, side) => {
  const enrichedQ = getEnrichedQuestion(q);
  const pairs = enrichedQ.match_pairs || q.match_pairs || [];
  if (!pairs || pairs.length === 0) return null;

  const found = pairs.find(p => Number(p.id) === Number(pairId));
  if (found) return found;

  const idx = Number(pairId) - 1;
  if (idx >= 0 && idx < pairs.length) return pairs[idx];
  return null;
};

const getEmoji = (isCorrect) => {
  if (isCorrect === true) return '✨';
  if (isCorrect === false) return '❌';
  return '🤔';
};

const getAnswerEmoji = (type) => {
  switch(type) {
    case 'essay': return '📝';
    case 'guess_image': return '🎯';
    case 'choice_image': return '🖼️';
    case 'match_image': return '🔄';
    default: return '📋';
  }
};

const goBackToResults = () => {
  router.push('/kuis/results');
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-4">
    <!-- Header -->
    <div class="my-6 text-center max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
      <div class="text-left">
        <h1 class="text-3xl font-extrabold text-purple-600 flex items-center gap-2 flex-wrap">
          <span class="text-4xl">📚</span>
          Hasil Kuis
          <span class="text-4xl">✨</span>
        </h1>
        <p v-if="quizData" class="mt-1 text-lg text-purple-500 font-semibold">
          {{ quizData.quiz_title || quizData.quiz?.title || 'Detail Pengerjaan' }}
        </p>
      </div>
      <button @click="goBackToResults" class="btn btn-outline border-purple-500 text-purple-600 hover:bg-purple-600 hover:text-white rounded-2xl">
        👈 Kembali ke Hasil Kuis
      </button>
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
    <div v-else-if="quizData" class="max-w-4xl mx-auto space-y-6">
      <!-- Score Card -->
      <div class="bg-white p-6 rounded-3xl shadow-lg border-2 border-purple-100">
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
                  :stroke="(quizData.percentage_score || 0) >= 70 ? '#10B981' : (quizData.percentage_score || 0) >= 50 ? '#FBBF24' : '#EF4444'"
                  stroke-width="8"
                  fill="none"
                  :stroke-dasharray="`${(quizData.percentage_score || 0) * 3.77}, 377`"
                />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="text-center">
                  <div class="text-3xl font-extrabold text-purple-600">
                    {{ Math.round(quizData.percentage_score || 0) }}%
                  </div>
                  <div class="text-xs font-semibold text-purple-400">Nilai Kamu</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Stats Grid -->
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-purple-50 rounded-2xl p-4 text-center">
              <div class="text-2xl mb-1">✅</div>
              <div class="text-lg font-bold text-purple-600">
                {{ quizData.correct_answers || 0 }}/{{ quizData.total_questions || questionsList.length }}
              </div>
              <div class="text-xs text-purple-400 font-semibold">Jawaban Benar</div>
            </div>
            <div class="bg-purple-50 rounded-2xl p-4 text-center">
              <div class="text-2xl mb-1">🎯</div>
              <div class="text-lg font-bold text-purple-600">
                {{ quizData.total_score || 0 }}/{{ quizData.max_possible_score || 0 }}
              </div>
              <div class="text-xs text-purple-400 font-semibold">Total Skor</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Questions List -->
      <div class="space-y-4">
        <div v-if="questionsList.length === 0" class="bg-white rounded-3xl p-8 text-center shadow-lg border border-purple-100">
          <p class="text-4xl mb-2">📋</p>
          <p class="text-purple-600 font-bold text-lg">Belum ada daftar soal yang dapat ditampilkan.</p>
        </div>

        <div 
          v-for="(question, index) in questionsList" 
          :key="question.id || question.question_id || index" 
          class="bg-white rounded-3xl p-5 shadow-lg border-2"
          :class="{
            'border-green-400': getStudentAnswerForQuestion(question)?.is_correct,
            'border-red-400': getStudentAnswerForQuestion(question)?.is_correct === false,
            'border-purple-200': getStudentAnswerForQuestion(question)?.is_correct === null || !getStudentAnswerForQuestion(question)
          }"
        >
          
          <!-- Question Header -->
          <div class="flex items-center justify-between gap-3 mb-4">
            <div class="flex items-center gap-2">
              <div class="bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full text-base font-bold">
                Soal {{ index + 1 }}
              </div>
              <span class="text-2xl">{{ getEmoji(getStudentAnswerForQuestion(question)?.is_correct) }}</span>
            </div>
            <span class="text-xs font-bold text-purple-400 bg-purple-50 px-3 py-1 rounded-full">
              Poin: {{ getStudentAnswerForQuestion(question)?.score || 0 }}/{{ question.score || question.max_score || 10 }}
            </span>
          </div>

          <!-- Question Text & Image -->
          <div class="text-gray-800 text-lg font-bold mb-4 leading-relaxed">
            {{ question.question_text }}
          </div>
          <div v-if="question.question_image" class="mb-4">
            <img 
              :src="getFullImageUrl(question.question_image)" 
              alt="Gambar Soal" 
              class="max-h-48 rounded-2xl border border-gray-200 object-contain"
            />
          </div>

          <!-- Answer Section -->
          <div class="bg-purple-50/80 rounded-2xl p-4 mb-4 border border-purple-100 space-y-2">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-xl">{{ getAnswerEmoji(question.type || question.question_type) }}</span>
              <span class="font-bold text-purple-700 text-sm">Jawaban Kamu:</span>
            </div>
            
            <template v-if="getStudentAnswerForQuestion(question)">
              <!-- 1. Text Answer (Essay / Tebak Gambar / General Text) -->
              <div 
                v-if="['essay', 'guess_image'].includes(question.type || question.question_type) || (getStudentAnswerForQuestion(question).answer_text && !getSelectedOptionObj(question) && (question.type || question.question_type) !== 'match_image')" 
                class="bg-white rounded-2xl p-4 text-gray-800 font-medium border border-gray-100 leading-relaxed"
              >
                {{ getStudentAnswerForQuestion(question).answer_text || '-' }}
              </div>

              <!-- 2. Choice / Choice Image Answer -->
              <div 
                v-else-if="(question.type || question.question_type) === 'choice' || (question.type || question.question_type) === 'choice_image' || (question.type || question.question_type) === 'multiple_choice'" 
                class="space-y-2"
              >
                <div 
                  v-if="getSelectedOptionObj(question)?.option_text || getStudentAnswerForQuestion(question).answer_text" 
                  class="bg-white rounded-2xl p-3 text-gray-800 font-bold border border-gray-100 text-base"
                >
                  👉 {{ getSelectedOptionObj(question)?.option_text || getStudentAnswerForQuestion(question).answer_text }}
                </div>

                <div 
                  v-if="getSelectedOptionObj(question)?.option_image || getStudentAnswerForQuestion(question).answer_image" 
                  class="bg-white rounded-2xl p-3 border border-gray-100"
                >
                  <img 
                    :src="getFullImageUrl(getSelectedOptionObj(question)?.option_image || getStudentAnswerForQuestion(question).answer_image)" 
                    alt="Gambar Pilihan Kamu" 
                    class="max-h-36 object-contain rounded-xl border border-gray-100"
                  />
                </div>
              </div>

              <!-- 3. Match Image Answer (Pasangan Gambar) -->
              <div 
                v-else-if="(question.type || question.question_type) === 'match_image'" 
                class="space-y-2"
              >
                <div 
                  v-if="parseMatchPairs(getStudentAnswerForQuestion(question).answer_text).length > 0"
                  class="space-y-2"
                >
                  <div 
                    v-for="(pair, pIdx) in parseMatchPairs(getStudentAnswerForQuestion(question).answer_text)" 
                    :key="pIdx" 
                    class="bg-white rounded-2xl p-3 border border-purple-100 flex flex-wrap items-center justify-between gap-3 text-sm"
                  >
                    <!-- Left Item -->
                    <div class="flex items-center gap-2 p-2 bg-blue-50/80 rounded-xl border border-blue-100 flex-1 min-w-[130px]">
                      <img 
                        v-if="getMatchPairObj(question, pair.left_id, 'left')?.left_image" 
                        :src="getFullImageUrl(getMatchPairObj(question, pair.left_id, 'left')?.left_image)" 
                        class="h-10 w-10 object-cover rounded-lg border border-gray-200"
                      />
                      <span v-if="getMatchPairObj(question, pair.left_id, 'left')?.left_text" class="font-bold text-gray-800">
                        {{ getMatchPairObj(question, pair.left_id, 'left')?.left_text }}
                      </span>
                    </div>

                    <span class="text-xl font-bold text-purple-600">➔</span>

                    <!-- Right Item -->
                    <div class="flex items-center gap-2 p-2 bg-purple-50/80 rounded-xl border border-purple-100 flex-1 min-w-[130px]">
                      <img 
                        v-if="getMatchPairObj(question, pair.right_id, 'right')?.right_image" 
                        :src="getFullImageUrl(getMatchPairObj(question, pair.right_id, 'right')?.right_image)" 
                        class="h-10 w-10 object-cover rounded-lg border border-gray-200"
                      />
                      <span v-if="getMatchPairObj(question, pair.right_id, 'right')?.right_text" class="font-bold text-gray-800">
                        {{ getMatchPairObj(question, pair.right_id, 'right')?.right_text }}
                      </span>
                    </div>
                  </div>
                </div>

                <div v-else-if="getStudentAnswerForQuestion(question).answer_text" class="bg-white rounded-2xl p-3 text-gray-800 font-medium text-sm">
                  {{ getStudentAnswerForQuestion(question).answer_text }}
                </div>
              </div>
            </template>

            <div v-else class="bg-white rounded-2xl p-3 text-gray-400 font-medium italic text-sm">
              Kamu tidak mengisi jawaban untuk soal ini.
            </div>
          </div>

          <!-- Kunci Jawaban / Referensi Jawaban (for Essay, Guess Image, or Questions without options) -->
          <div 
            v-if="(!getEnrichedQuestion(question).options || getEnrichedQuestion(question).options.length === 0) && (!getEnrichedQuestion(question).match_pairs || getEnrichedQuestion(question).match_pairs.length === 0)" 
            class="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 mt-3"
          >
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xl">🔑</span>
              <span class="font-bold text-emerald-800 text-sm">Kunci Jawaban:</span>
            </div>
            <p class="text-gray-800 text-sm font-bold leading-relaxed">
              {{ getEssayOrGuessAnswerKey(question) }}
            </p>
          </div>

          <!-- Feedback / Catatan Guru -->
          <div 
            v-if="getStudentAnswerForQuestion(question)?.feedback" 
            class="bg-yellow-50 rounded-2xl p-4 border border-yellow-200 mt-3"
          >
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xl">👨‍🏫</span>
              <span class="font-bold text-yellow-800 text-sm">Catatan Guru:</span>
            </div>
            <p class="text-gray-800 text-sm leading-relaxed">{{ getStudentAnswerForQuestion(question).feedback }}</p>
          </div>
        </div>
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
          Yuk mulai belajar dan kerjakan kuis! 🚀
        </p>
      </div>
    </div>
  </div>
</template>
