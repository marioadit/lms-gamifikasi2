<script setup>
import { ref, computed, onMounted, getCurrentInstance } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuizStore } from "../../../store/quizStore.js";
import { getQuizByQuestionsAPI, getStudentAnswersAdminAPI, getOptionByIdAPI } from "../../../api/quiz/quizApi.js";
import { getQuestionsByIdAPI } from "../../../api/quiz/QuestionApi.js";

const { proxy } = getCurrentInstance();
const base_url = proxy?.$base_url || "";

const route = useRoute();
const router = useRouter();
const quizStore = useQuizStore();

const historyDetail = ref(null);
const quizInfo = ref(null);
const questionsList = ref([]);
const studentAnswersList = ref([]);
const optionsCache = ref({}); // Cache map for optionId -> optionObj
const questionsCache = ref({}); // Cache map for questionId -> questionObj
const isLoading = ref(true);
const errorMessage = ref(null);

const quizStartTime = computed(() => {
  return (
    quizInfo.value?.start_time ||
    quizInfo.value?.quiz?.start_time ||
    historyDetail.value?.quiz?.start_time ||
    historyDetail.value?.start_time ||
    null
  );
});

const quizEndTime = computed(() => {
  return (
    quizInfo.value?.end_time ||
    quizInfo.value?.quiz?.end_time ||
    historyDetail.value?.quiz?.end_time ||
    historyDetail.value?.end_time ||
    null
  );
});

const submittedAtTime = computed(() => {
  return (
    historyDetail.value?.submitted_at ||
    historyDetail.value?.created_at ||
    studentAnswersList.value?.[0]?.submitted_at ||
    studentAnswersList.value?.[0]?.created_at ||
    null
  );
});

const getFullImgUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${base_url}/${path}`;
};

const fetchOptionById = async (optionId) => {
  if (!optionId || optionsCache.value[optionId]) return;
  try {
    const res = await getOptionByIdAPI(optionId);
    if (res && res.data) {
      optionsCache.value[optionId] = res.data;
    }
  } catch (err) {
    console.warn(`Could not fetch option #${optionId}:`, err);
  }
};

const fetchQuestionDetail = async (qId) => {
  if (!qId || questionsCache.value[qId]) return;
  try {
    const res = await getQuestionsByIdAPI(qId);
    if (res && res.data) {
      questionsCache.value[qId] = res.data;
    }
  } catch (err) {
    console.warn(`Could not fetch question detail #${qId}:`, err);
  }
};

onMounted(async () => {
  const studentId = route.params.studentId || route.params.id;
  const quizId = route.params.quizId;

  try {
    isLoading.value = true;
    errorMessage.value = null;

    let res = null;
    if (studentId && quizId) {
      res = await quizStore.getAdminAnswerHistoryDetail(studentId, quizId);
    } else if (quizId || route.params.id) {
      const targetId = quizId || route.params.id;
      res = await quizStore.getQuizResultsById(targetId);
    }

    if (res && res.data) {
      historyDetail.value = res.data;
    } else if (res) {
      historyDetail.value = res;
    }

    // Check if historyDetail already contains questions array
    if (historyDetail.value && Array.isArray(historyDetail.value.questions)) {
      questionsList.value = historyDetail.value.questions;
    }

    // Target IDs for fetching questions and student answers
    const tQuizId = historyDetail.value?.quiz_id || quizId;
    const tStudentId = historyDetail.value?.student_id || studentId;

    if (tQuizId) {
      try {
        const qRes = await getQuizByQuestionsAPI(tQuizId);
        const qData = qRes?.data || qRes;
        if (qData) {
          quizInfo.value = qData;
          if (questionsList.value.length === 0) {
            if (Array.isArray(qData.questions)) {
              questionsList.value = qData.questions;
            } else if (Array.isArray(qData.quiz?.questions)) {
              questionsList.value = qData.quiz.questions;
            } else if (Array.isArray(qData)) {
              questionsList.value = qData;
            }
          }
        }
      } catch (qErr) {
        console.warn("Could not fetch quiz questions:", qErr);
      }
    }

    // Enrich all questions via GET /api/admin/questions/:id
    if (questionsList.value.length > 0) {
      await Promise.all(
        questionsList.value.map(async (q) => {
          const qId = q.id || q.question_id;
          if (qId) {
            await fetchQuestionDetail(qId);
          }
        })
      );
    }

    if (tStudentId) {
      try {
        const saRes = await getStudentAnswersAdminAPI(tStudentId);
        const saData = saRes.data || saRes;
        let answers = [];

        if (saData) {
          if (Array.isArray(saData.student_answers)) {
            answers = saData.student_answers;
          } else if (Array.isArray(saData.studentAnswers)) {
            answers = saData.studentAnswers;
          } else if (Array.isArray(saData.data?.student_answers)) {
            answers = saData.data.student_answers;
          } else if (Array.isArray(saData.data?.studentAnswers)) {
            answers = saData.data.studentAnswers;
          } else if (Array.isArray(saData.data)) {
            answers = saData.data;
          } else if (Array.isArray(saData)) {
            answers = saData;
          }
        }
        studentAnswersList.value = answers;

        // Pre-fetch options via GET /api/admin/options/:id for student answers
        answers.forEach((sa) => {
          if (sa.answer_option_id) {
            fetchOptionById(sa.answer_option_id);
          }
        });
      } catch (saErr) {
        console.warn("Could not fetch student answers:", saErr);
      }
    }
  } catch (err) {
    console.error("Error fetching detail answer history:", err);
    errorMessage.value = typeof err === "string" ? err : (err?.response?.data?.message || err?.message || "Gagal memuat detail hasil kuis.");
  } finally {
    isLoading.value = false;
  }
});

const getQuestionTypeLabel = (type) => {
  switch (type) {
    case "essay":
      return "Esai";
    case "guess_image":
      return "Tebak Gambar";
    case "multiple_choice":
      return "Pilihan Ganda";
    case "choice_image":
      return "Pilihan Gambar";
    case "match_image":
      return "Mencocokkan Gambar";
    default:
      return type || "Pertanyaan";
  }
};

// Match student answer for a question
const getStudentAnswerForQuestion = (q) => {
  const qId = Number(q.id || q.question_id);

  if (q.student_answer) {
    return q.student_answer;
  }

  if (!studentAnswersList.value || studentAnswersList.value.length === 0) {
    return null;
  }

  const validAnswerIds = (historyDetail.value?.student_answers_ids || []).map((id) => Number(id));

  let found = null;
  if (validAnswerIds.length > 0) {
    found = studentAnswersList.value.find(
      (sa) => Number(sa.question_id) === qId && validAnswerIds.includes(Number(sa.id))
    );
  }

  if (!found) {
    found = studentAnswersList.value.find((sa) => Number(sa.question_id) === qId);
  }

  return found;
};

// Get enriched question details from cache or question object
const getEnrichedQuestion = (q) => {
  const qId = Number(q.id || q.question_id);
  if (questionsCache.value[qId]) {
    return questionsCache.value[qId];
  }
  return q;
};

// Get selected option data (from question options or fetched via GET /api/admin/options/:id)
const getSelectedOptionData = (q) => {
  const sa = getStudentAnswerForQuestion(q);
  if (!sa || !sa.answer_option_id) return null;
  const optId = Number(sa.answer_option_id);

  const enrichedQ = getEnrichedQuestion(q);

  // 1. Try finding in enriched question options
  if (enrichedQ.options && Array.isArray(enrichedQ.options)) {
    const foundInQ = enrichedQ.options.find((o) => Number(o.id) === optId);
    if (foundInQ) return foundInQ;
  }

  // 2. Try finding in optionsCache
  if (optionsCache.value[optId]) {
    return optionsCache.value[optId];
  }

  // 3. Trigger async fetch if not in cache
  fetchOptionById(optId);
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

// Parse JSON string for match_image student answers
const parseMatchPairs = (answerText) => {
  if (!answerText) return [];
  try {
    const parsed = typeof answerText === "string" ? JSON.parse(answerText) : answerText;
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {
    console.warn("Could not parse match_image answer_text:", e);
  }
  return [];
};

// Find matching pair item details from match_pairs array
const getMatchPairItem = (q, pairId, side) => {
  const enrichedQ = getEnrichedQuestion(q);
  const pairs = enrichedQ.match_pairs || q.match_pairs || [];
  if (!pairs || pairs.length === 0) return null;

  const found = pairs.find((p) => Number(p.id) === Number(pairId));
  if (found) return found;

  // Fallback match by index if ID not direct match
  const idx = Number(pairId) - 1;
  if (idx >= 0 && idx < pairs.length) return pairs[idx];

  return null;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return d.toLocaleString("id-ID", {
      dateStyle: "full",
      timeStyle: "medium"
    });
  } catch (e) {
    return dateStr;
  }
};

const goBack = () => {
  const targetStudentId = route.params.studentId || route.params.id || historyDetail.value?.student_id || historyDetail.value?.student?.id;
  if (targetStudentId) {
    router.push(`/admin/kuis/hasil/siswa/${targetStudentId}`);
  } else {
    router.push("/admin/kuis/hasil");
  }
};
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Detail Hasil Kuis Siswa 📑</h1>
        <p class="text-gray-500">Rincian nilai dan hasil pengerjaan kuis siswa</p>
      </div>
      <button @click="goBack" class="btn btn-outline">
        ← Kembali ke Riwayat Siswa
      </button>
    </div>

    <!-- Error Alert -->
    <div v-if="errorMessage" class="alert alert-error text-white shadow">
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center my-12">
      <div class="loading loading-spinner loading-lg text-primary"></div>
    </div>

    <!-- Content -->
    <div v-else-if="historyDetail" class="space-y-6">
      <!-- 2-Column Info Section -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Student & Class Info -->
        <div class="bg-white p-6 rounded-2xl shadow border border-gray-100 space-y-3">
          <h2 class="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-2">
            👤 Informasi Siswa & Kelas
          </h2>
          <div class="space-y-2 text-sm">
            <p><span class="font-semibold text-gray-600">Nama Siswa:</span> {{ historyDetail.student_name || historyDetail.student?.name || '-' }}</p>
            <p><span class="font-semibold text-gray-600">Email:</span> {{ historyDetail.student?.email || '-' }}</p>
            <p>
              <span class="font-semibold text-gray-600">Kelas:</span> 
              <span class="badge badge-primary badge-sm ml-2">
                {{ historyDetail.class_name || historyDetail.class?.name || '-' }}
              </span>
            </p>
            <p><span class="font-semibold text-gray-600">Tingkat:</span> {{ historyDetail.class_level || historyDetail.class?.level || '-' }}</p>
            <p><span class="font-semibold text-gray-600">Semester / TA:</span> {{ historyDetail.class_semester || '-' }} ({{ historyDetail.class_academic_year || '-' }})</p>
          </div>
        </div>

        <!-- Quiz & Lesson Info -->
        <div class="bg-white p-6 rounded-2xl shadow border border-gray-100 space-y-3">
          <h2 class="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-2">
            📚 Informasi Kuis & Pelajaran
          </h2>
          <div class="space-y-2 text-sm">
            <p><span class="font-semibold text-gray-600">Judul Kuis:</span> {{ historyDetail.quiz_title || historyDetail.quiz?.title || '-' }}</p>
            <p><span class="font-semibold text-gray-600">Deskripsi Kuis:</span> {{ historyDetail.quiz?.description || '-' }}</p>
            <p><span class="font-semibold text-gray-600">Mata Pelajaran:</span> {{ historyDetail.lesson_title || historyDetail.lesson?.title || '-' }}</p>
            <p v-if="historyDetail.lesson?.description"><span class="font-semibold text-gray-600">Deskripsi Pelajaran:</span> {{ historyDetail.lesson.description }}</p>
          </div>
        </div>
      </div>

      <!-- Performance Metrics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Completion Rate -->
        <div class="bg-purple-50/70 border border-purple-100 p-6 rounded-2xl">
          <h3 class="font-semibold text-gray-700 mb-1">Tingkat Penyelesaian</h3>
          <div class="text-3xl font-extrabold text-purple-600 mb-1">
            {{ historyDetail.completion_rate }}%
          </div>
          <p class="text-xs text-gray-600">
            {{ historyDetail.answered_questions }} / {{ historyDetail.total_questions }} Dijawab
          </p>
        </div>

        <!-- Correct Answers -->
        <div class="bg-emerald-50/70 border border-emerald-100 p-6 rounded-2xl">
          <h3 class="font-semibold text-gray-700 mb-1">Jawaban Benar</h3>
          <div class="text-3xl font-extrabold text-emerald-600 mb-1">
            {{ historyDetail.correct_answers }}
          </div>
          <p class="text-xs text-gray-600">
            dari {{ historyDetail.total_questions }} Pertanyaan
          </p>
        </div>

        <!-- Score -->
        <div class="bg-blue-50/70 border border-blue-100 p-6 rounded-2xl">
          <h3 class="font-semibold text-gray-700 mb-1">Skor Total</h3>
          <div class="text-3xl font-extrabold text-blue-600 mb-1">
            {{ historyDetail.percentage_score }}%
          </div>
          <p class="text-xs text-gray-600">
            {{ historyDetail.total_score }} / {{ historyDetail.max_possible_score }} Poin Terkumpul
          </p>
        </div>
      </div>

      <!-- Timestamps Card -->
      <div class="bg-white p-6 rounded-2xl shadow border border-gray-100 space-y-4">
        <h2 class="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-2">
          ⏱️ Waktu Pengerjaan
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div class="p-3 bg-gray-50 rounded-xl">
            <p class="font-semibold text-gray-500">Mulai Pengerjaan:</p>
            <p class="font-medium text-gray-800 mt-1">{{ formatDate(quizStartTime) }}</p>
          </div>
          <div class="p-3 bg-gray-50 rounded-xl">
            <p class="font-semibold text-gray-500">Selesai Pengerjaan:</p>
            <p class="font-medium text-gray-800 mt-1">{{ formatDate(quizEndTime) }}</p>
          </div>
          <div class="p-3 bg-gray-50 rounded-xl">
            <p class="font-semibold text-gray-500">Dikumpulkan Pada:</p>
            <p class="font-medium text-gray-800 mt-1">{{ formatDate(submittedAtTime) }}</p>
          </div>
        </div>
      </div>

      <!-- Section: Soal Soal & Jawaban Siswa -->
      <div class="bg-white p-6 rounded-2xl shadow border border-gray-100 space-y-6">
        <div class="flex justify-between items-center border-b border-gray-100 pb-3">
          <h2 class="text-xl font-bold text-gray-800 flex items-center gap-2">
            📋 Daftar Soal & Jawaban Siswa ({{ questionsList.length }} Soal)
          </h2>
        </div>

        <div v-if="questionsList.length === 0" class="text-center py-8 text-gray-400 text-sm">
          Belum ada data soal yang dapat ditampilkan untuk kuis ini.
        </div>

        <div v-else class="space-y-6">
          <div 
            v-for="(q, index) in questionsList" 
            :key="q.id || q.question_id || index"
            class="p-5 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-4"
          >
            <!-- Question Header -->
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-gray-200/60">
              <div class="flex items-center gap-2">
                <span class="w-8 h-8 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center">
                  {{ index + 1 }}
                </span>
                <span class="font-bold text-gray-800">Pertanyaan #{{ index + 1 }}</span>
                <span class="badge badge-info badge-sm capitalize">{{ getQuestionTypeLabel(q.type || q.question_type) }}</span>
              </div>

              <div class="flex items-center gap-2">
                <span class="text-xs text-gray-500 font-medium">Poin Maks: {{ q.score || q.max_score }}</span>
                <template v-if="getStudentAnswerForQuestion(q)">
                  <span 
                    v-if="getStudentAnswerForQuestion(q).is_correct"
                    class="badge badge-success text-white font-semibold"
                  >
                    ✓ Benar (+{{ getStudentAnswerForQuestion(q).score ?? (q.score || q.max_score) }} Poin)
                  </span>
                  <span 
                    v-else
                    class="badge badge-error text-white font-semibold"
                  >
                    ✗ Salah (0 Poin)
                  </span>
                </template>
                <template v-else>
                  <span class="badge badge-ghost text-gray-400 text-xs">Belum Dijawab</span>
                </template>
              </div>
            </div>

            <!-- Question Content -->
            <div>
              <p class="text-base font-semibold text-gray-900 leading-relaxed">
                {{ q.question_text }}
              </p>
              <img 
                v-if="q.question_image"
                :src="getFullImgUrl(q.question_image)"
                alt="Gambar Soal"
                class="mt-3 max-h-48 rounded-xl border border-gray-200 object-cover"
              />
            </div>

            <!-- Jawaban Siswa Section -->
            <div 
              class="p-4 rounded-xl border space-y-3"
              :class="[
                getStudentAnswerForQuestion(q)?.is_correct 
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' 
                  : getStudentAnswerForQuestion(q) 
                    ? 'bg-red-50/80 border-red-200 text-red-950' 
                    : 'bg-gray-100 border-gray-200 text-gray-600'
              ]"
            >
              <div class="font-bold text-xs uppercase tracking-wider flex items-center gap-1">
                <span>💬</span> Jawaban Siswa:
              </div>

              <div v-if="getStudentAnswerForQuestion(q)" class="text-sm font-medium space-y-3">
                
                <!-- 1. Teks Jawaban (Essay / Text Response / Text in Option) -->
                <div 
                  v-if="getStudentAnswerForQuestion(q).answer_text && (getEnrichedQuestion(q).type || q.type) !== 'match_image'" 
                  class="bg-white/90 p-3 rounded-lg border border-gray-200 text-gray-800 font-medium whitespace-pre-line"
                >
                  <span class="text-xs font-semibold text-gray-400 block mb-1">Teks Jawaban:</span>
                  {{ getStudentAnswerForQuestion(q).answer_text }}
                </div>

                <!-- 2. Selected Option Text (if option_text exists on option) -->
                <div 
                  v-if="getSelectedOptionData(q)?.option_text"
                  class="bg-white/90 p-3 rounded-lg border border-gray-200 text-gray-800 font-medium"
                >
                  <span class="text-xs font-semibold text-gray-400 block mb-1">Teks Jawaban (Opsi):</span>
                  👉 {{ getSelectedOptionData(q).option_text }}
                </div>

                <!-- 3. Gambar Jawaban (if option_image or answer_image exists) -->
                <div v-if="getSelectedOptionData(q)?.option_image || getStudentAnswerForQuestion(q).answer_image">
                  <span class="text-xs font-semibold text-gray-500 block mb-1">Gambar Jawaban:</span>
                  <img 
                    :src="getFullImgUrl(getSelectedOptionData(q)?.option_image || getStudentAnswerForQuestion(q).answer_image)"
                    alt="Gambar Jawaban Siswa"
                    class="max-h-48 rounded-lg border border-gray-200 object-cover shadow-sm"
                  />
                </div>

                <!-- 4. Match Image Answer Breakdown (Pasangan Gambar) -->
                <div 
                  v-if="(getEnrichedQuestion(q).type || q.type) === 'match_image'" 
                  class="space-y-2 pt-1"
                >
                  <span class="text-xs font-semibold text-gray-500 block mb-1">Pasangan yang Diisi Siswa:</span>
                  
                  <div 
                    v-if="parseMatchPairs(getStudentAnswerForQuestion(q).answer_text).length > 0" 
                    class="space-y-2"
                  >
                    <div 
                      v-for="(pair, pIdx) in parseMatchPairs(getStudentAnswerForQuestion(q).answer_text)" 
                      :key="pIdx"
                      class="p-3 bg-white/90 rounded-xl border border-gray-200 flex flex-wrap items-center gap-3 text-xs"
                    >
                      <!-- Left Side -->
                      <div class="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-100 flex-1 min-w-[140px]">
                        <img 
                          v-if="getMatchPairItem(q, pair.left_id, 'left')?.left_image"
                          :src="getFullImgUrl(getMatchPairItem(q, pair.left_id, 'left')?.left_image)"
                          class="h-10 w-10 object-cover rounded-md border"
                        />
                        <span v-if="getMatchPairItem(q, pair.left_id, 'left')?.left_text" class="font-bold text-gray-800">
                          {{ getMatchPairItem(q, pair.left_id, 'left')?.left_text }}
                        </span>
                        <span v-if="!getMatchPairItem(q, pair.left_id, 'left')?.left_image && !getMatchPairItem(q, pair.left_id, 'left')?.left_text" class="text-gray-500 font-semibold">
                          Item Kiri #{{ pair.left_id }}
                        </span>
                      </div>

                      <span class="font-extrabold text-purple-600 text-base">➔</span>

                      <!-- Right Side -->
                      <div class="flex items-center gap-2 p-2 bg-purple-50 rounded-lg border border-purple-100 flex-1 min-w-[140px]">
                        <img 
                          v-if="getMatchPairItem(q, pair.right_id, 'right')?.right_image"
                          :src="getFullImgUrl(getMatchPairItem(q, pair.right_id, 'right')?.right_image)"
                          class="h-10 w-10 object-cover rounded-md border"
                        />
                        <span v-if="getMatchPairItem(q, pair.right_id, 'right')?.right_text" class="font-bold text-gray-800">
                          {{ getMatchPairItem(q, pair.right_id, 'right')?.right_text }}
                        </span>
                        <span v-if="!getMatchPairItem(q, pair.right_id, 'right')?.right_image && !getMatchPairItem(q, pair.right_id, 'right')?.right_text" class="text-gray-500 font-semibold">
                          Item Kanan #{{ pair.right_id }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div v-else-if="getStudentAnswerForQuestion(q).answer_text" class="bg-white/90 p-3 rounded-lg border border-gray-200 text-gray-800 text-xs font-mono">
                    {{ getStudentAnswerForQuestion(q).answer_text }}
                  </div>
                </div>

                <!-- Feedback / Catatan -->
                <p v-if="getStudentAnswerForQuestion(q).feedback" class="text-xs italic opacity-80 pt-1">
                  Catatan/Feedback: {{ getStudentAnswerForQuestion(q).feedback }}
                </p>
              </div>

              <div v-else class="text-sm italic opacity-70">
                Siswa tidak menjawab pertanyaan ini.
              </div>
            </div>

            <!-- Options Breakdown (for choice / choice_image) -->
            <div v-if="getEnrichedQuestion(q).options && getEnrichedQuestion(q).options.length > 0" class="pt-2">
              <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                Pilihan Jawaban & Kunci Jawaban:
              </span>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div 
                  v-for="opt in getEnrichedQuestion(q).options" 
                  :key="opt.id"
                  class="p-3 rounded-xl border text-sm flex items-center justify-between"
                  :class="[
                    opt.is_correct 
                      ? 'bg-emerald-100/70 border-emerald-300 font-semibold text-emerald-900'
                      : Number(opt.id) === Number(getStudentAnswerForQuestion(q)?.answer_option_id)
                        ? 'bg-red-100/70 border-red-300 text-red-900'
                        : 'bg-white border-gray-200 text-gray-700'
                  ]"
                >
                  <div class="flex items-center gap-2">
                    <span v-if="opt.option_text">{{ opt.option_text }}</span>
                    <img 
                      v-if="opt.option_image" 
                      :src="getFullImgUrl(opt.option_image)"
                      alt="Opsi Gambar"
                      class="h-12 w-12 object-cover rounded-lg border"
                    />
                  </div>

                  <div class="flex items-center gap-1">
                    <span v-if="opt.is_correct" class="badge badge-success badge-sm text-white">
                      ✓ Kunci Jawaban
                    </span>
                    <span 
                      v-if="Number(opt.id) === Number(getStudentAnswerForQuestion(q)?.answer_option_id)" 
                      class="badge badge-info badge-sm text-white"
                    >
                      Pilihan Siswa
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Match Pairs Breakdown (for match_image) -->
            <div v-if="getEnrichedQuestion(q).match_pairs && getEnrichedQuestion(q).match_pairs.length > 0" class="pt-2">
              <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                Kunci Pasangan Gambar:
              </span>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div 
                  v-for="pair in getEnrichedQuestion(q).match_pairs" 
                  :key="pair.id"
                  class="p-3 rounded-xl border border-purple-200 bg-purple-50/50 text-xs flex items-center justify-between gap-2"
                >
                  <!-- Left -->
                  <div class="flex items-center gap-2">
                    <img v-if="pair.left_image" :src="getFullImgUrl(pair.left_image)" class="h-10 w-10 object-cover rounded-md border" />
                    <span v-if="pair.left_text" class="font-bold text-gray-800">{{ pair.left_text }}</span>
                  </div>
                  <span class="font-extrabold text-purple-600">➔</span>
                  <!-- Right -->
                  <div class="flex items-center gap-2">
                    <img v-if="pair.right_image" :src="getFullImgUrl(pair.right_image)" class="h-10 w-10 object-cover rounded-md border" />
                    <span v-if="pair.right_text" class="font-bold text-gray-800">{{ pair.right_text }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Kunci Jawaban / Teks Soal (for Essay, Guess Image, or Questions without options) -->
            <div 
              v-if="(!getEnrichedQuestion(q).options || getEnrichedQuestion(q).options.length === 0) && (!getEnrichedQuestion(q).match_pairs || getEnrichedQuestion(q).match_pairs.length === 0)" 
              class="pt-2"
            >
              <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                Kunci Jawaban (option_text):
              </span>
              <div class="p-3 bg-emerald-50/90 rounded-xl border border-emerald-200 text-emerald-950 text-sm font-semibold flex items-center gap-2">
                <span class="text-base">🔑</span>
                <span>{{ getEssayOrGuessAnswerKey(q) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>