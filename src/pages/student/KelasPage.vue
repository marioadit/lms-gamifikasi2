<script setup>
import { onMounted, computed, ref } from "vue";
import { useClassesStore } from "../../store/users/classesStore";
import { useLessonStore } from "../../store/users/lessonsStore";
import { Vue3Lottie } from 'vue3-lottie';

const lessonsStore = useLessonStore();

const base_url = import.meta.env.VITE_API_URL;

const loadLessons = async () => {
  await lessonsStore.getUserLessons();
};

const classesStore = useClassesStore();

const loadClasses = async () => {
  await classesStore.getClassUser();
};

onMounted(async () => {
  await loadClasses();
  await loadLessons();
});

const isLoading = computed(() => classesStore.loading);
const errorMessage = computed(() => classesStore.error);

// Check if student has no classes and no lessons
const hasNoContent = computed(() => {
  return (!classesStore.classes || classesStore.classes.length === 0) && 
         (!lessonsStore.lessons || lessonsStore.lessons.length === 0);
});
</script>

<template>
  <div class="p-4 sm:p-6 md:p-8 bg-sky-100 min-h-screen font-sans">
    <!-- Loading and Error States -->
    <div
      v-if="isLoading"
      class="flex flex-col items-center justify-center h-64 text-sky-600"
    >
      <Vue3Lottie
        animation-link="https://assets3.lottiefiles.com/packages/lf20_szviypry.json"
        :height="200"
        :width="200"
      />
      <p class="text-xl font-semibold mt-4">Sedang mencari kelasmu...</p>
    </div>

    <div
      v-else-if="errorMessage"
      class="bg-red-100 border-2 border-red-400 text-red-700 px-6 py-4 rounded-2xl shadow-md text-center max-w-lg mx-auto"
    >
      <Vue3Lottie
        animation-link="https://assets8.lottiefiles.com/packages/lf20_error-animation.json"
        :height="150"
        :width="150"
      />
      <p class="font-bold text-lg">Oh tidak! Ada sedikit masalah:</p>
      <p>{{ errorMessage }}</p>
    </div>
    
    <!-- No Content State (No Classes & No Lessons) -->
    <div v-else-if="hasNoContent" class="text-center py-12">
      <div class="bg-white p-8 rounded-3xl shadow-lg max-w-md mx-auto">
        <Vue3Lottie
          animation-link="https://assets10.lottiefiles.com/packages/lf20_ydo1amjm.json"
          :height="200"
          :width="200"
        />
        <h2 class="text-2xl font-bold text-purple-600 mb-3">
          Selamat Datang!
        </h2>
        <p class="text-purple-500 mb-4 font-medium">
          Kamu belum terdaftar di kelas maupun pelajaran apapun.
        </p>
        <div class="bg-purple-50 p-4 rounded-xl text-left">
          <p class="text-gray-600 mb-2 flex items-start gap-2">
            <span class="text-lg">✅</span>
            <span>Tanyakan pada gurumu untuk mendaftarkanmu ke kelas</span>
          </p>
          <p class="text-gray-600 mb-2 flex items-start gap-2">
            <span class="text-lg">✅</span>
            <span>Pastikan akunmu sudah terhubung dengan benar</span>
          </p>
          <p class="text-gray-600 flex items-start gap-2">
            <span class="text-lg">✅</span>
            <span>Setelah terdaftar, kamu akan melihat pelajaran di sini</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Daftar Pelajaran -->
      <div v-if="lessonsStore.lessons && lessonsStore.lessons.length > 0">
        <div class="my-8 text-center">
          <h1
            class="font-bold text-sky-700 text-3xl sm:text-4xl flex items-center justify-center gap-3"
          >
            <Vue3Lottie
              animation-link="https://assets9.lottiefiles.com/packages/lf20_study-animation.json"
              :height="80"
              :width="80"
            />
            Ayo Belajar Hal Baru!
            <Vue3Lottie
              animation-link="https://assets5.lottiefiles.com/packages/lf20_star-animation.json"
              :height="80"
              :width="80"
            />
          </h1>
          <p class="mt-2 text-purple-600 text-lg">
            Pilih kuis untuk menguji pengetahuanmu! 🚀
          </p>
        </div>
        <div class="space-y-6">
          <div
            v-for="lesson in lessonsStore.lessons"
            :key="lesson.id"
            class="bg-white p-5 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            <div
              class="flex flex-col sm:flex-row items-start sm:items-center gap-5"
            >
              <!-- Thumbnail Pelajaran -->
              <div class="flex-shrink-0 w-full sm:w-32 h-32">
                <img
                  class="w-full h-full rounded-xl object-cover bg-purple-100 flex items-center justify-center text-3xl text-purple-500 font-bold shadow-md"
                  :src="`${base_url}/${lesson.thumbnail}`"
                  :alt="`Gambar untuk ${lesson.title}`"
                  @error="onImageError"
                />
              </div>

              <!-- Info Pelajaran -->
              <div class="flex-grow">
                <h2
                  class="text-2xl font-bold text-purple-700 mb-1 group-hover:text-purple-800"
                >
                  {{ lesson.title }}
                </h2>
                <p v-if="lesson.description" class="text-gray-600 text-sm mb-1">
                  {{ lesson.description }}
                </p>
                <p v-if="lesson.content" class="text-gray-500 text-xs italic">
                  Ringkasan: {{ lesson.content.substring(0, 80)
                  }}{{ lesson.content.length > 80 ? "..." : "" }}
                </p>
              </div>

              <!-- Tombol Aksi -->
              <div class="flex-shrink-0 mt-4 sm:mt-0">
                <router-link
                  class="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 text-md shadow-md hover:shadow-lg transition-colors duration-300 transform hover:scale-105"
                  :to="`/pelajaran/${lesson.id}`"
                >
                  <span>Mulai Belajar!</span>
                  <span class="text-xl">🚀</span>
                </router-link>
              </div>
            </div>

            <!-- Kuis (jika ada) -->
            <div
              v-if="lesson.quizzes && lesson.quizzes.length > 0"
              class="mt-5 pt-4 border-t border-dashed border-gray-200"
            >
              <h3
                class="font-semibold text-md text-yellow-700 mb-3 flex items-center gap-2"
              >
                <span class="text-2xl">🏆</span> Tantangan Seru untuk
                {{ lesson.title }}:
              </h3>
              <div class="space-y-3">
                <div
                  v-for="quiz in lesson.quizzes"
                  :key="quiz.id"
                  class="bg-yellow-100 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-yellow-200 transition-colors"
                >
                  <div class="font-medium text-yellow-800">
                    {{ quiz.title }}
                  </div>
                  <button
                    @click="navigateToQuiz(quiz.id)"
                    class="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1 shadow-sm hover:shadow-md transition-all"
                  >
                    Kerjakan <span class="text-lg">✏️</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          v-if="!lessonsStore.lessons || lessonsStore.lessons.length === 0"
          class="text-center py-10 text-sky-600"
        >
          <Vue3Lottie
            animation-link="https://assets1.lottiefiles.com/packages/lf20_empty-animation.json"
            :height="200"
            :width="200"
          />
          <p class="text-xl font-semibold">
            Yeay! Sepertinya semua pelajaran sudah selesai!
          </p>
          <p class="text-md">
            Atau... mungkin belum ada pelajaran baru. Cek lagi nanti ya!
          </p>
        </div>
      </div>
    </div>
  </div>
</template>