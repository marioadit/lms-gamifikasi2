<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useQuizStore } from "../../../store/quizStore.js";

const route = useRoute();
const quizStore = useQuizStore();
const quizResults = ref([]);

onMounted(async () => {
  const userId = route.params.id;
  try {
    const response = await quizStore.getAllQuizResults(userId);
    quizResults.value = response.data;
  } catch (error) {
    console.error("Error fetching quiz results:", error);
  }
});
</script>

<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold mb-2">Detail Hasil Kuis Siswa</h1>
    </div>

    <div
      v-for="result in quizResults"
      :key="result.quiz_id"
      class="bg-white rounded-lg shadow-lg p-6 mb-6"
    >
      <!-- Student and Class Info -->
      <div class="my-2 flex justify-end">
        <router-link
          :to="`/admin/users/kuis/${result.quiz_id}/result`"
          class="btn btn-primary"
        >
          Detail Result
        </router-link>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div class="space-y-2">
          <h2 class="text-xl font-semibold">Informasi Siswa</h2>
          <p>
            <span class="font-medium">Nama:</span> {{ result.student.name }}
          </p>
          <p>
            <span class="font-medium">Email:</span> {{ result.student.email }}
          </p>
          <p><span class="font-medium">Kelas:</span> {{ result.class.name }}</p>
        </div>
        <div class="space-y-2">
          <h2 class="text-xl font-semibold">Informasi Kuis</h2>
          <p>
            <span class="font-medium">Judul Kuis:</span> {{ result.quiz_title }}
          </p>
          <p>
            <span class="font-medium">Pelajaran:</span>
            {{ result.lesson.title }}
          </p>
        </div>
      </div>

      <!-- Quiz Performance -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div class="bg-blue-50 p-4 rounded-lg">
          <h3 class="font-semibold mb-2">Skor</h3>
          <div class="text-3xl font-bold text-blue-600">
            {{ result.percentage_score }}%
          </div>
          <p class="text-sm text-gray-600">
            {{ result.total_score }} / {{ result.max_possible_score }} poin
          </p>
        </div>

        <div class="bg-green-50 p-4 rounded-lg">
          <h3 class="font-semibold mb-2">Jawaban Benar</h3>
          <div class="text-3xl font-bold text-green-600">
            {{ result.correct_answers }}
          </div>
          <p class="text-sm text-gray-600">
            dari {{ result.total_questions }} pertanyaan
          </p>
        </div>

        <div class="bg-purple-50 p-4 rounded-lg">
          <h3 class="font-semibold mb-2">Tingkat Penyelesaian</h3>
          <div class="text-3xl font-bold text-purple-600">
            {{ result.completion_rate }}%
          </div>
          <p class="text-sm text-gray-600">
            {{ result.answered_questions }} /
            {{ result.total_questions }} pertanyaan dijawab
          </p>
        </div>
      </div>

      <!-- Timestamps -->
      <div class="border-t pt-4">
        <h3 class="font-semibold mb-3">Waktu Pengerjaan</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p class="font-medium">Mulai:</p>
            <p>{{ new Date(result.start_time).toLocaleString() }}</p>
          </div>
          <div>
            <p class="font-medium">Selesai:</p>
            <p>{{ new Date(result.end_time).toLocaleString() }}</p>
          </div>
          <div>
            <p class="font-medium">Dikumpulkan:</p>
            <p>{{ new Date(result.submitted_at).toLocaleString() }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
