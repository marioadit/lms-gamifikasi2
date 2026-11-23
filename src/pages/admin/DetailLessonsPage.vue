<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useLessonsStore } from "../../store/lessonsStore";
import { useQuizStore } from "../../store/quizStore";
import { getCurrentInstance } from 'vue';

const { proxy } = getCurrentInstance();
const base_url = proxy?.$base_url || "";
const route = useRoute();
const router = useRouter();
const lessonsStore = useLessonsStore();
const quizStore = useQuizStore();

const lessonsId = ref(parseInt(route.params.id));
const isLoading = ref(false);
const errorMessage = ref("");

const lesson = computed(() => lessonsStore.selectedLesson);

const lessonQuizzes = computed(() => {
  if (lesson.value?.quizzes && Array.isArray(lesson.value.quizzes) && lesson.value.quizzes.length > 0) {
    return lesson.value.quizzes;
  }
  if (quizStore.quizzes && quizStore.quizzes.length > 0 && lessonsId.value) {
    return quizStore.quizzes.filter(q => Number(q.lesson_id) === Number(lessonsId.value));
  }
  return [];
});

const getFullThumbnailUrl = (thumbnail) => {
  if (!thumbnail) return null;
  return thumbnail.startsWith('data:') ? thumbnail : `${base_url}/${thumbnail}`;
};

const goBack = () => {
  router.push("/admin/pelajaran");
};

onMounted(async () => {
  try {
    isLoading.value = true;
    await Promise.all([
      lessonsStore.getLessonsById(lessonsId.value),
      quizStore.getQuizzes().catch(() => null)
    ]);
  } catch (error) {
    console.error("Error loading lesson:", error);
    errorMessage.value = "Gagal memuat data pelajaran";
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Detail Pelajaran 📚</h1>
        <p class="text-gray-500">Informasi lengkap tentang pelajaran dan kuis terkait</p>
      </div>
      <button @click="goBack" class="btn btn-outline">
        ← Kembali ke Daftar
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center my-8">
      <div class="loading loading-spinner loading-lg text-primary"></div>
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="alert alert-error text-white shadow">
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Lesson Details -->
    <div v-if="lesson && !isLoading" class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Left Column - Thumbnail and Basic Info -->
      <div class="col-span-1 space-y-4">
        <div class="bg-white rounded-2xl shadow border border-gray-100 p-6 space-y-4">
          <!-- Thumbnail -->
          <div>
            <img v-if="lesson.thumbnail" :src="getFullThumbnailUrl(lesson.thumbnail)" :alt="lesson.title"
              class="w-full h-48 object-cover rounded-xl border" />
            <div v-else class="w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center border">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <!-- Class Information -->
          <div class="space-y-2 text-sm">
            <h3 class="text-base font-bold text-gray-800 border-b border-gray-100 pb-2">Informasi Kelas</h3>
            <p><span class="font-semibold text-gray-600">Nama Kelas:</span> {{ lesson.class?.name || '-' }}</p>
            <p><span class="font-semibold text-gray-600">Level:</span> {{ lesson.class?.level || '-' }}</p>
          </div>

          <!-- Timestamps -->
          <div class="p-3 bg-gray-50 rounded-xl space-y-1 text-xs text-gray-500">
            <p>Dibuat: {{ new Date(lesson.created_at).toLocaleDateString('id-ID') }}</p>
            <p>Diperbarui: {{ new Date(lesson.updated_at).toLocaleDateString('id-ID') }}</p>
          </div>
        </div>
      </div>

      <!-- Right Column - Lesson Content & Quizzes -->
      <div class="col-span-1 md:col-span-2 space-y-6">
        <div class="bg-white rounded-2xl shadow border border-gray-100 p-6 space-y-6">
          <!-- Title and Description -->
          <div>
            <h2 class="text-2xl font-bold text-gray-800 mb-2">{{ lesson.title }}</h2>
            <p class="text-gray-600">{{ lesson.description }}</p>
          </div>

          <!-- Content -->
          <div class="space-y-2">
            <h3 class="text-lg font-bold text-gray-800">Konten Pelajaran</h3>
            <div class="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p class="whitespace-pre-wrap text-sm text-gray-800">{{ lesson.content }}</p>
            </div>
          </div>

          <!-- Quizzes Section -->
          <div class="border-t border-gray-100 pt-6 space-y-4">
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-bold text-gray-800">Daftar Kuis ({{ lessonQuizzes.length }})</h3>
              <router-link :to="`/admin/kuis/tambah?lesson_id=${lesson.id}`" class="btn btn-primary btn-sm text-white">
                ➕ Tambah Kuis Baru
              </router-link>
            </div>

            <div v-if="lessonQuizzes.length > 0" class="space-y-3">
              <div v-for="quiz in lessonQuizzes" :key="quiz.id"
                class="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <div class="flex items-center gap-2">
                    <h4 class="font-bold text-gray-800 text-base">{{ quiz.title }}</h4>
                    <span :class="quiz.is_active ? 'badge-success text-white' : 'badge-ghost text-gray-400'"
                      class="badge badge-sm font-semibold">
                      {{ quiz.is_active ? 'Aktif' : 'Tidak Aktif' }}
                    </span>
                  </div>
                  <p class="text-xs text-gray-600 mt-1">{{ quiz.description }}</p>
                </div>

                <div class="flex gap-2 flex-wrap">
                  :to="`/admin/kuis/${quiz.id}`" class="btn btn-xs btn-primary text-white">
                  👁️ Detail
                  <router-link :to="`/admin/kuis/${quiz.id}/edit`" class="btn btn-xs btn-warning text-white">
                    ✏️ Edit
                  </router-link>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
              <p class="text-gray-500 text-sm">Belum ada kuis untuk pelajaran ini</p>
              <router-link :to="`/admin/kuis/tambah?lesson_id=${lesson.id}`"
                class="btn btn-primary btn-sm text-white mt-3">
                ➕ Tambah Kuis Pertama
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>