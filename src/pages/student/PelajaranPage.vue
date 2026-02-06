<script setup>
import { onMounted, computed } from "vue";
import { useLessonStore } from "../../store/users/lessonsStore";

const lessonsStore = useLessonStore();
const base_url = import.meta.env.VITE_API_URL;

const loadLessons = async () => {
  await lessonsStore.getUserLessons();
};

onMounted(async () => {
  await loadLessons();
});

const isLoading = computed(() => lessonsStore.loading);
const errorMessage = computed(() => lessonsStore.error);
</script>

<template>
  <div class="p-4 bg-blue-50 min-h-screen">
    <!-- Header kelas -->
    <div class="bg-white p-6 rounded-3xl shadow-md my-8">
      <div class="flex items-center gap-3 mb-2">
        <h1 class="text-2xl font-bold text-slate-900">
          Daftar Pelajaran
        </h1>
      </div>
      <p class="text-purple-600 flex items-center gap-2">
        <!-- <span>{{ currentClass.teacher.avatar }}</span> -->
        <!-- <span>{{ currentClass.teacher.name }}</span> -->
      </p>
    </div>
    <div v-if="isLoading">Loading kelas...</div>
    <div v-else-if="errorMessage" class="text-red-500">
      {{ errorMessage }}
    </div>
    <div v-else class="w-full">
      <div
        v-for="currentClass in lessonsStore.lessons"
        :key="currentClass.id"
        class="my-5"
      >
        <!-- Daftar Pelajaran -->
        <div class="space-y-4 mb-4">
          <div class="bg-white p-5 rounded-3xl shadow-md">
            <!-- Header Pelajaran dengan status -->
            <div class="flex justify-between items-start mb-4">
              <div class="flex items-center gap-4">
                <img
                  class="w-20 h-20 rounded-2xl bg-purple-100 flex items-center justify-center text-2xl"
                  :src="`${base_url}/${currentClass.thumbnail}`"
                  alt=""
                />
                <div>
                  <h2 class="text-xl font-bold">
                    {{ currentClass.title }}
                  </h2>
                  <p class="text-gray-500">
                    {{ currentClass.description }}
                  </p>
                  <p class="text-gray-500">
                    {{ currentClass.content }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Tombol buka pelajaran -->
            <div class="flex justify-end mb-3">
              <button
                class="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-xl font-bold flex items-center gap-2"
              >
                <span>Buka Pelajaran</span>
                <span>📚</span>
              </button>
            </div>

            <!-- Kuis terkait pelajaran -->
            <!-- <div v-if="currentClass.quizzes && currentClass.quizzes.length > 0">
          <h3 class="font-semibold text-sm text-purple-600 mb-2">Kuis untuk {{ currentClass.title }}:</h3>
          <div class="space-y-2">
            <div v-for="quiz in currentClass.quizzes" :key="quiz.id"
              class="bg-yellow-50 p-3 rounded-xl flex justify-between items-center">
              <div class="font-medium">{{ quiz.title }}</div>
              <button @click="navigateToQuiz(quiz.id)" 
                class="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-lg text-sm font-bold">
                Kerjakan ✏️
              </button>
            </div>
          </div>
        </div> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
