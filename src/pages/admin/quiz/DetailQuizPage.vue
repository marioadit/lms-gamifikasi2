<script setup>
import { useRoute, useRouter } from "vue-router";
import { useQuizStore } from "../../../store/quizStore";
import { computed, onMounted, ref } from "vue";
import { useLessonsStore } from "../../../store/lessonsStore";
import { getCurrentInstance } from "vue";

const { proxy } = getCurrentInstance();

const route = useRoute();
const router = useRouter();
const quizStore = useQuizStore();
const lessonsStore = useLessonsStore();

const quizId = ref(parseInt(route.params.id));

const selectedQuiz = computed(() => quizStore.quiz);
const selectedLessons = computed(() => lessonsStore.selectedLesson);

const questions = computed(() => quizStore.quizQuestions);

const isLoading = computed(() => quizStore.loading);
const errorMessage = computed(() => quizStore.error);
const base_url = proxy.$base_url;

onMounted(async () => {
  try {
    isLoading.value = true;
    await quizStore.getQuizById(quizId.value);
    await lessonsStore.getLessonsById(selectedQuiz.value.lesson_id);
    await quizStore.getQuizByQuestions(quizId.value);
    if (!quizStore.quiz) {
      router.push("/admin/kuis");
      return;
    }
  } catch (error) {
    console.error("Error loading lesson:", error);
    errorMessage.value = "Gagal memuat data pelajaran";
  } finally {
    isLoading.value = false;
  }
});

const lessonTitle = computed(() => {
  const lesson = lessonsStore.selectedLesson;
  return lesson?.title || "Pelajaran tidak ditemukan";
});

const goBack = () => {
  router.push("/admin/kuis");
};
</script>

<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold">Detail Kuis</h1>
        <p class="text-gray-500" v-if="selectedQuiz">
          {{ selectedQuiz.title }}
        </p>
      </div>

      <div class="flex gap-2">
        <button @click="goBack" class="btn btn-outline">Kembali</button>
        <router-link :to="`/admin/kuis/${quizId}/edit`" class="btn btn-warning">
          Edit Kuis
        </router-link>
      </div>
    </div>

    <!-- Loading indicator -->
    <div v-if="isLoading" class="flex justify-center my-12">
      <div class="loading loading-spinner loading-lg text-primary"></div>
    </div>

    <!-- Error message -->
    <div
      v-if="errorMessage"
      class="bg-red-100 text-red-700 p-4 rounded-lg mb-6"
    >
      {{ errorMessage }}
    </div>

    <div
      v-if="selectedQuiz && !isLoading"
      class="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      <div class="bg-white p-6 rounded-xl shadow-md space-y-3">
        <h2 class="text-xl font-semibold mb-4">Informasi Kuis</h2>
        <p>
          <strong>Pelajaran:</strong>
          <strong>{{
            selectedLessons?.title ?? "Pelajaran tidak ditemukan"
          }}</strong>
        </p>
        <p><strong>Judul:</strong> {{ selectedQuiz.title }}</p>
        <p><strong>Deskripsi:</strong> {{ selectedQuiz.description }}</p>
        <p>
          <strong>Tanggal Dibuat:</strong>
          {{ $formatDate(selectedQuiz.created_at) }}
        </p>
        <p>
          <strong>Status: </strong>
          <span
            :class="selectedQuiz.is_active ? 'text-green-500' : 'text-red-500'"
            >{{ selectedQuiz.is_active ? "Aktif" : "Tidak Aktif" }}</span
          >
        </p>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-md">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Pertanyaan</h2>
          <router-link
            :to="`/admin/kuis/${quizId}/pertanyaan/tambah`"
            class="btn btn-primary"
            >Tambah Pertanyaan</router-link
          >
        </div>
        <div class="space-y-4">
          <div
            v-for="question in questions.questions"
            :key="question.id"
            class="border rounded-lg p-4"
          >
            <div class="flex justify-between items-start mb-2">
              <span class="font-medium">Pertanyaan #{{ question.order }}</span>
              <div class="flex gap-2">
                <span class="badge badge-info">{{ question.type }}</span>
                <span class="badge badge-success"
                  >Skor: {{ question.score }}</span
                >
              </div>
            </div>
            <p class="text-gray-700">{{ question.question_text }}</p>
            <img
              v-if="question.question_image"
              :src="`${base_url}/${question.question_image}`"
              alt="Question Image"
              class="mt-2 rounded-lg w-32 h-32 object-cover"
            />
            <div class="flex justify-end mt-4">
              <router-link
                :to="`/admin/kuis/${quizId}/pertanyaan/${question.id}/edit`"
                class="btn btn-warning btn-sm"
                >Edit Pertanyaan</router-link
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
