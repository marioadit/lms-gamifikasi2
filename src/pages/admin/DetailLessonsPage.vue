<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useLessonsStore } from "../../store/lessonsStore";
import { getCurrentInstance } from 'vue';

const { proxy } = getCurrentInstance();
const base_url = proxy.$base_url;
const route = useRoute();
const router = useRouter();
const lessonsStore = useLessonsStore();

const lessonsId = ref(parseInt(route.params.id));
const isLoading = ref(false);
const errorMessage = ref("");

const lesson = computed(() => lessonsStore.selectedLesson);

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
    await lessonsStore.getLessonsById(lessonsId.value);
  } catch (error) {
    console.error("Error loading lesson:", error);
    errorMessage.value = "Gagal memuat data pelajaran";
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold">Detail Pelajaran 📚</h1>
        <p class="text-gray-500">Informasi lengkap tentang pelajaran</p>
      </div>
      <button @click="goBack" class="btn btn-outline">
        Kembali ke Daftar
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center my-8">
      <div class="loading loading-spinner loading-lg text-primary"></div>
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="alert alert-error mb-6">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Lesson Details -->
    <div v-if="lesson && !isLoading" class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Left Column - Thumbnail and Basic Info -->
      <div class="col-span-1">
        <div class="bg-white rounded-lg shadow-md p-6">
          <!-- Thumbnail -->
          <div class="mb-6">
            <img v-if="lesson.thumbnail" :src="getFullThumbnailUrl(lesson.thumbnail)" :alt="lesson.title"
              class="w-full h-48 object-cover rounded-lg" />
            <div v-else class="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <!-- Class Information -->
          <div class="prose">
            <h3 class="text-lg font-semibold mb-2">Informasi Kelas</h3>
            <div class="space-y-2">
              <p><span class="font-medium">Nama Kelas:</span> {{ lesson.class?.name }}</p>
              <p><span class="font-medium">Level:</span> {{ lesson.class?.level }}</p>
            </div>
          </div>

          <!-- Timestamps -->
          <div class="mt-6 text-sm text-gray-500">
            <p>Dibuat: {{ new Date(lesson.created_at).toLocaleDateString('id-ID') }}</p>
            <p>Diperbarui: {{ new Date(lesson.updated_at).toLocaleDateString('id-ID') }}</p>
          </div>
        </div>
      </div>

      <!-- Right Column - Lesson Content -->
      <div class="col-span-1 md:col-span-2">
        <div class="bg-white rounded-lg shadow-md p-6">
          <!-- Title and Description -->
          <div class="mb-6">
            <h2 class="text-2xl font-bold mb-4">{{ lesson.title }}</h2>
            <p class="text-gray-600">{{ lesson.description }}</p>
          </div>

          <!-- Content -->
          <div class="prose max-w-none">
            <h3 class="text-lg font-semibold mb-2">Konten Pelajaran</h3>
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="whitespace-pre-wrap">{{ lesson.content }}</p>
            </div>
          </div>

          <!-- Quizzes Section -->
          <div class="mt-8">
            <h3 class="text-lg font-semibold mb-4">Daftar Kuis</h3>
            <div v-if="lesson.quizzes && lesson.quizzes.length > 0" class="space-y-4">
              <div v-for="quiz in lesson.quizzes" :key="quiz.id"
                class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 class="font-medium">{{ quiz.title }}</h4>
                <p class="text-sm text-gray-600">{{ quiz.description }}</p>
              </div>
            </div>
            <div v-else class="text-center py-8 bg-gray-50 rounded-lg">
              <p class="text-gray-500">Belum ada kuis untuk pelajaran ini</p>
              <router-link :to="`/admin/pelajaran/${lesson.id}/kuis/tambah`" class="btn btn-primary mt-4">
                Tambah Kuis Baru
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>