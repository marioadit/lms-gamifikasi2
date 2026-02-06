<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLessonsStore } from '../../../store/lessonsStore';
import { getCurrentInstance } from 'vue';
import { Vue3Lottie } from 'vue3-lottie';

const { proxy } = getCurrentInstance();
const route = useRoute();
const router = useRouter();
const lessonsStore = useLessonsStore();

const lessonId = ref(parseInt(route.params.id));
const isLoading = computed(() => lessonsStore.loading);
const errorMessage = computed(() => lessonsStore.error);
const lesson = computed(() => lessonsStore.selectedLesson);
const base_url = proxy.$base_url;
const expandedDescriptions = ref({});

const toggleDescription = (quizId) => {
  expandedDescriptions.value[quizId] = !expandedDescriptions.value[quizId];
};

// Function to load data
const loadData = async () => {
  try {
    await lessonsStore.getLessonsById(lessonId.value);
  } catch (error) {
    console.error('Error fetching lesson details:', error);
  }
};

// Watch for route changes
watch(
  () => route.fullPath,
  () => {
    if (route.name === 'adminDetailQuiz') {
      loadData();
    }
  }
);

onMounted(loadData);

const goBack = () => {
  router.push('/admin/kuis');
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold">Detail Pelajaran dan Kuis</h1>
        <p class="text-gray-500" v-if="lesson">{{ lesson.title }}</p>
      </div>
      <div class="flex gap-2">
        <button @click="goBack" class="btn btn-outline">Kembali</button>
        <router-link 
          v-if="lesson && lesson.quizzes?.length > 0" 
          :to="`/admin/kuis/${lesson.quizzes[0]?.id}/edit`" 
          class="btn btn-warning"
        >
          Edit Kuis
        </router-link>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center my-12 flex-col items-center">
      <Vue3Lottie
        animation-link="https://assets1.lottiefiles.com/packages/lf20_qjosmr4w.json"
        :height="200"
        :width="200"
      />
      <p class="text-gray-500 mt-4">Memuat detail pelajaran dan kuis...</p>
    </div>

    <!-- Error Message -->
    <div v-else-if="errorMessage" class="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
      {{ errorMessage }}
    </div>

    <!-- Content -->
    <div v-else-if="lesson" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Lesson Information -->
      <div class="bg-white p-6 rounded-xl shadow-md space-y-4">
        <h2 class="text-xl font-semibold mb-4">Informasi Pelajaran</h2>
        
        <!-- Thumbnail -->
        <div v-if="lesson.thumbnail" class="mb-4">
          <img 
            :src="`${base_url}/${lesson.thumbnail}`" 
            :alt="lesson.title"
            class="rounded-lg w-full h-48 object-cover"
          />
        </div>

        <div class="space-y-3">
          <p>
            <span class="font-medium">Judul:</span> 
            {{ lesson.title }}
          </p>
          <p>
            <span class="font-medium">Deskripsi:</span> 
            {{ lesson.description }}
          </p>
          <p>
            <span class="font-medium">Konten:</span> 
            {{ lesson.content }}
          </p>
          <p>
            <span class="font-medium">Dibuat:</span> 
            {{ formatDate(lesson.created_at) }}
          </p>
          <p>
            <span class="font-medium">Diperbarui:</span> 
            {{ formatDate(lesson.updated_at) }}
          </p>
        </div>
      </div>

      <!-- Quiz Information -->
      <div v-if="lesson.quizzes?.length > 0" class="bg-white p-6 rounded-xl shadow-md space-y-4">
        <h2 class="text-xl font-semibold mb-4">Informasi Kuis</h2>
        
        <div v-for="quiz in lesson.quizzes" :key="quiz.id" class="space-y-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium">{{ quiz.title }}</h3>
            <span 
              :class="quiz.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
              class="px-3 py-1 rounded-full text-sm font-medium"
            >
              {{ quiz.is_active ? 'Aktif' : 'Tidak Aktif' }}
            </span>
          </div>

          <div 
            class="text-gray-700 cursor-pointer" 
            :class="{'line-clamp-2': !expandedDescriptions[quiz.id]}"
            @click="toggleDescription(quiz.id)"
          >
            {{ quiz.description }}
            <span 
              v-if="quiz.description.length > 30" 
              class="text-blue-600 text-sm ml-1"
            >
              {{ expandedDescriptions[quiz.id] ? '(Sembunyikan)' : '(Selengkapnya...)' }}
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div class="bg-blue-50 p-4 rounded-lg">
              <h4 class="font-medium text-blue-900 mb-1">Waktu Mulai</h4>
              <p class="text-blue-700">
                {{ new Date(quiz.start_time).toLocaleString('id-ID') }}
              </p>
            </div>

            <div class="bg-purple-50 p-4 rounded-lg">
              <h4 class="font-medium text-purple-900 mb-1">Waktu Selesai</h4>
              <p class="text-purple-700">
                {{ new Date(quiz.end_time).toLocaleString('id-ID') }}
              </p>
            </div>
          </div>

          <div class="flex justify-end mt-4 pt-4 border-t">
            <router-link 
              :to="`/admin/kuis/${quiz.id}/pertanyaan`"
              class="btn btn-primary"
            >
              Kelola Pertanyaan
            </router-link>
          </div>
        </div>
      </div>

      <!-- No Quiz Message -->
      <div v-else class="bg-white p-6 rounded-xl shadow-md text-center">
        <Vue3Lottie
          animation-link="https://assets9.lottiefiles.com/packages/lf20_hl5n0bwb.json"
          :height="200"
          :width="200"
        />
        <p class="text-gray-500 mt-4">Tidak ada kuis yang tersedia untuk pelajaran ini</p>
      </div>
    </div>
  </div>
</template>

