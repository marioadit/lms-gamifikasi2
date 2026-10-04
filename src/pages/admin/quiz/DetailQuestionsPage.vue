<script setup>
import { useRoute, useRouter } from "vue-router";
import { useQuizStore } from "../../../store/quizStore";
import { useQuestionsStore } from "../../../store/QuestionsStore";
import { computed, onMounted, ref } from "vue";
import { getCurrentInstance } from "vue";
import Swal from 'sweetalert2';

const { proxy } = getCurrentInstance();

const route = useRoute();
const router = useRouter();
const quizStore = useQuizStore();
const questionsStore = useQuestionsStore();

const quizId = ref(parseInt(route.params.id));
const questions = computed(() => quizStore.quizQuestions?.questions || []);
const selectedQuiz = computed(() => quizStore.quiz);
const isLoading = computed(() => quizStore.loading);
const errorMessage = computed(() => quizStore.error);
const successMessage = computed(() => quizStore.success);

const base_url = proxy.$base_url;

// State for expanded questions
const expandedQuestions = ref(new Set());
const questionDetails = ref({});

const toggleQuestion = async (questionId) => {
  if (expandedQuestions.value.has(questionId)) {
    expandedQuestions.value.delete(questionId);
  } else {
    expandedQuestions.value.add(questionId);
    await fetchQuestionDetails(questionId);
  }
};

const isQuestionExpanded = (questionId) => {
  return expandedQuestions.value.has(questionId);
};

const fetchQuestionDetails = async (questionId) => {
  if (questionDetails.value[questionId]) return; // Already fetched

  try {
    await questionsStore.getQuestionDetailById(questionId);
    if (questionsStore.question) {
      questionDetails.value[questionId] = questionsStore.question;
    }
  } catch (error) {
    console.error("Error fetching question details:", error);
  }
};

onMounted(async () => {
  try {
    isLoading.value = true;
    await quizStore.getQuizByQuestions(quizId.value);
  } catch (error) {
    console.error("Error loading questions:", error);
    errorMessage.value = "Gagal memuat data pertanyaan";
  } finally {
    isLoading.value = false;
  }
});

const goBack = () => {
  router.push(`/admin/kuis/${quizId.value}`);
};

const deleteQuestion = async (questionId) => {
  try {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Pertanyaan yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      await quizStore.deleteQuestion(questionId);
      delete questionDetails.value[questionId];
      expandedQuestions.value.delete(questionId);

      // Show success message
      await Swal.fire({
        title: 'Terhapus!',
        text: 'Pertanyaan berhasil dihapus.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    }
  } catch (error) {
    console.error("Error deleting question:", error);
    
    // Show error message
    await Swal.fire({
      title: 'Error!',
      text: 'Gagal menghapus pertanyaan.',
      icon: 'error',
      confirmButtonText: 'OK'
    });
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getAnswerKeys = (q) => {
  if (!q) return [];
  if (Array.isArray(q.essay_answers) && q.essay_answers.length > 0) {
    return q.essay_answers.map(a => a.option_text).filter(Boolean);
  }
  if (Array.isArray(q.essayAnswers) && q.essayAnswers.length > 0) {
    return q.essayAnswers.map(a => a.option_text).filter(Boolean);
  }
  if (q.option_text) {
    return q.option_text.split('|').map(k => k.trim()).filter(Boolean);
  }
  return [];
};
</script>

<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold">Detail Pertanyaan</h1>
        <p class="text-gray-500" v-if="selectedQuiz">
          {{ selectedQuiz.title }}
        </p>
      </div>

      <div class="flex gap-2">
        <button @click="goBack" class="btn btn-outline">Kembali</button>
        <router-link
          :to="`/admin/kuis/${quizId}/pertanyaan/tambah`"
          class="btn btn-primary"
        >
          Tambah Pertanyaan
        </router-link>
      </div>
    </div>

    <!-- Success message -->
    <div
      v-if="successMessage"
      class="bg-green-100 text-green-700 p-4 rounded-lg mb-6"
    >
      {{ successMessage }}
    </div>

    <!-- Error message -->
    <div
      v-if="errorMessage"
      class="bg-red-100 text-red-700 p-4 rounded-lg mb-6"
    >
      {{ errorMessage }}
    </div>

    <!-- Loading indicator -->
    <div v-if="isLoading" class="flex justify-center my-12">
      <div class="loading loading-spinner loading-lg text-primary"></div>
    </div>

    <!-- Questions List -->
    <div v-if="!isLoading" class="space-y-4">
      <div
        v-for="question in questions"
        :key="question.id"
        class="bg-white rounded-xl shadow-md p-6"
      >
        <!-- Question Header -->
        <div class="flex justify-between items-start mb-4">
          <div class="space-y-2">
            <div class="flex items-center gap-3">
              <span class="text-lg font-semibold">Pertanyaan #{{ question.order }}</span>
              <span class="badge badge-info">{{ question.type }}</span>
              <span class="badge badge-success">Skor: {{ question.score }}</span>
            </div>
            <p class="text-gray-700">{{ question.question_text }}</p>
          </div>
          <div class="flex gap-2">
            <button
              @click="toggleQuestion(question.id)"
              class="btn btn-info btn-sm"
            >
              {{ isQuestionExpanded(question.id) ? 'Tutup' : 'Detail' }}
            </button>
            <router-link
              :to="`/admin/kuis/${quizId}/pertanyaan/${question.id}/edit`"
              class="btn btn-warning btn-sm"
            >
              Edit
            </router-link>
            <button
              @click="deleteQuestion(question.id)"
              class="btn btn-error btn-sm"
            >
              Hapus
            </button>
          </div>
        </div>

        <!-- Question Image Preview -->
        <div v-if="question.question_image" class="mt-4">
          <img
            :src="`${base_url}/${question.question_image}`"
            :alt="'Gambar untuk pertanyaan #' + question.order"
            class="rounded-lg w-20 h-20 object-cover"
          />
        </div>

        <!-- Expanded Details -->
        <div v-if="isQuestionExpanded(question.id)" class="mt-6">
          <!-- Loading State for Details -->
          <div v-if="questionsStore.loading" class="flex justify-center py-4">
            <div class="loading loading-spinner loading-md"></div>
          </div>

          <template v-else-if="questionDetails[question.id]">
            <div class="space-y-6">
              <!-- Full Question Image -->
              <div v-if="questionDetails[question.id].question_image" class="mb-6">
                <h3 class="text-lg font-semibold mb-3">Gambar Pertanyaan</h3>
                <img
                  :src="`${base_url}/${questionDetails[question.id].question_image}`"
                  :alt="'Gambar untuk pertanyaan'"
                  class="rounded-lg w-32 h-32 object-cover"
                />
              </div>

              <!-- Quiz Information -->
              <div class="bg-blue-50 p-4 rounded-lg">
                <h3 class="text-lg font-semibold mb-2">Informasi Kuis</h3>
                <p><span class="font-medium">Judul Kuis:</span> {{ questionDetails[question.id].quiz.title }}</p>
                <p><span class="font-medium">ID Kuis:</span> {{ questionDetails[question.id].quiz.id }}</p>
              </div>

              <!-- Options Section -->
              <div v-if="questionDetails[question.id].type === 'choice_image'" class="space-y-4">
                <h3 class="text-lg font-semibold">Pilihan Jawaban</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div
                    v-for="option in questionDetails[question.id].options"
                    :key="option.id"
                    :class="[
                      'border rounded-lg p-6',
                      option.is_correct ? 'border-green-500 bg-green-50' : 'border-gray-200'
                    ]"
                  >
                    <div class="space-y-4">
                      <div class="flex items-center justify-between">
                        <span class="font-medium text-lg">Pilihan {{ option.order + 1 }}</span>
                        <span
                          v-if="option.is_correct"
                          class="badge badge-success"
                        >
                          Jawaban Benar
                        </span>
                      </div>
                      
                      <p class="text-gray-700 text-lg">{{ option.option_text }}</p>
                      
                      <div v-if="option.option_image">
                        <img
                          :src="`${base_url}/${option.option_image}`"
                          :alt="'Gambar untuk pilihan ' + (option.order + 1)"
                          class="rounded-lg w-32 h-32 object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Match Image Pairs Section -->
              <div v-if="questionDetails[question.id].type === 'match_image' && questionDetails[question.id].match_pairs?.length > 0" class="space-y-4">
                <h3 class="text-lg font-semibold">Pasangan Gambar</h3>
                <div class="grid grid-cols-1 gap-6">
                  <div
                    v-for="pair in questionDetails[question.id].match_pairs"
                    :key="pair.id"
                    class="border rounded-lg p-6"
                  >
                    <div class="space-y-4">
                      <div class="flex items-center justify-between">
                        <span class="font-medium text-lg">Pasangan {{ pair.pair_order + 1 }}</span>
                      </div>
                      
                      <div class="grid grid-cols-2 gap-8">
                        <!-- Left Side -->
                        <div class="space-y-4">
                          <div class="bg-gray-50 p-4 rounded-lg">
                            <h4 class="font-medium text-gray-700 mb-2">Bagian Kiri</h4>
                            <p class="text-gray-600">{{ pair.left_text }}</p>
                          </div>
                          
                          <div v-if="pair.left_image">
                            <img
                              :src="`${base_url}/${pair.left_image}`"
                              alt="Gambar kiri"
                              class="rounded-lg w-32 h-32 object-cover border"
                            />
                          </div>
                        </div>

                        <!-- Right Side -->
                        <div class="space-y-4">
                          <div class="bg-gray-50 p-4 rounded-lg">
                            <h4 class="font-medium text-gray-700 mb-2">Bagian Kanan</h4>
                            <p class="text-gray-600">{{ pair.right_text }}</p>
                          </div>
                          
                          <div v-if="pair.right_image">
                            <img
                              :src="`${base_url}/${pair.right_image}`"
                              alt="Gambar kanan"
                              class="rounded-lg w-32 h-32 object-cover border"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Essay & Guess Image Answer Keys Section -->
              <div v-if="['essay', 'guess_image'].includes(questionDetails[question.id].type)" class="space-y-4">
                <h3 class="text-lg font-semibold flex items-center gap-2">
                  <span>🔑</span> Kunci Jawaban / Kata Kunci
                </h3>
                <div v-if="getAnswerKeys(questionDetails[question.id]).length > 0" class="flex flex-wrap gap-2">
                  <span
                    v-for="(key, idx) in getAnswerKeys(questionDetails[question.id])"
                    :key="idx"
                    class="badge badge-lg bg-amber-100 text-amber-900 border-amber-300 font-medium px-4 py-3 text-sm flex items-center gap-1.5"
                  >
                    <span>🔑</span>
                    <span>Kata Kunci #{{ idx + 1 }}:</span>
                    <strong class="font-bold">{{ key }}</strong>
                  </span>
                </div>
                <div v-else class="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 italic text-sm">
                  Belum ada kata kunci jawaban yang ditambahkan.
                </div>
              </div>

              <!-- Metadata -->
              <div class="border-t pt-6">
                <h3 class="text-lg font-semibold mb-4">Informasi Tambahan</h3>
                <div class="grid grid-cols-2 gap-6 text-gray-600">
                  <div class="space-y-2">
                    <p>
                      <span class="font-medium">ID Pertanyaan:</span> 
                      {{ questionDetails[question.id].id }}
                    </p>
                    <p>
                      <span class="font-medium">Tipe Pertanyaan:</span> 
                      {{ questionDetails[question.id].type }}
                    </p>
                    <p>
                      <span class="font-medium">Urutan:</span> 
                      {{ questionDetails[question.id].order }}
                    </p>
                    <p>
                      <span class="font-medium">Skor:</span>
                      {{ questionDetails[question.id].score }}
                    </p>
                  </div>
                  <div class="space-y-2">
                    <p>
                      <span class="font-medium">Dibuat:</span>
                      {{ formatDate(questionDetails[question.id].created_at) }}
                    </p>
                    <p>
                      <span class="font-medium">Diperbarui:</span>
                      {{ formatDate(questionDetails[question.id].updated_at) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-if="questions.length === 0"
        class="text-center py-12 bg-gray-50 rounded-xl"
      >
        <p class="text-gray-500 mb-4">Belum ada pertanyaan untuk kuis ini</p>
        <router-link
          :to="`/admin/kuis/${quizId}/pertanyaan/tambah`"
          class="btn btn-primary"
        >
          Tambah Pertanyaan Pertama
        </router-link>
      </div>
    </div>
  </div>
</template>