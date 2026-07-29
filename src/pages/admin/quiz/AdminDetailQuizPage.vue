<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLessonsStore } from '../../../store/lessonsStore';
import { useQuizStore } from '../../../store/quizStore';
import { getCurrentInstance } from 'vue';
import { Vue3Lottie } from 'vue3-lottie';
import Swal from 'sweetalert2';

const { proxy } = getCurrentInstance();
const route = useRoute();
const router = useRouter();
const lessonsStore = useLessonsStore();
const quizStore = useQuizStore();

const lessonId = ref(parseInt(route.params.id));
const isLoading = computed(() => lessonsStore.loading);
const errorMessage = computed(() => lessonsStore.error);
const lesson = computed(() => lessonsStore.selectedLesson);
const base_url = proxy?.$base_url || "";
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

const deleteQuiz = async (quizId) => {
  Swal.fire({
    title: "Apakah Anda yakin ingin menghapus kuis ini?",
    text: "Kuis yang dihapus tidak dapat dikembalikan",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ya, Hapus",
    cancelButtonText: "Batal",
    confirmButtonColor: "#ef4444"
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await quizStore.deleteQuiz(quizId);
        Swal.fire("Berhasil", "Kuis telah dihapus", "success");
        await loadData();
      } catch (err) {
        Swal.fire("Gagal", err.message || "Gagal menghapus kuis", "error");
      }
    }
  });
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
  router.push('/admin/pelajaran');
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
};
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Detail Pelajaran & Kuis 📚</h1>
        <p class="text-gray-500" v-if="lesson">
          {{ lesson.title }} ({{ lesson.quizzes?.length || 0 }} Kuis Tersedia)
        </p>
      </div>
      <div class="flex gap-2">
        <button @click="goBack" class="btn btn-outline">
          ← Kembali ke Pelajaran
        </button>
        <router-link 
          v-if="lesson" 
          :to="`/admin/kuis/tambah?lesson_id=${lesson.id}`" 
          class="btn btn-primary text-white"
        >
          ➕ Tambah Kuis Baru
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
    <div v-else-if="errorMessage" class="alert alert-error text-white shadow">
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Content -->
    <div v-else-if="lesson" class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Lesson Information (Left Column) -->
      <div class="col-span-1 bg-white p-6 rounded-2xl shadow border border-gray-100 space-y-4">
        <h2 class="text-xl font-bold text-gray-800 border-b border-gray-100 pb-2">
          📖 Informasi Pelajaran
        </h2>
        
        <!-- Thumbnail -->
        <div v-if="lesson.thumbnail" class="mb-4">
          <img 
            :src="`${base_url}/${lesson.thumbnail}`" 
            :alt="lesson.title"
            class="rounded-xl w-full h-48 object-cover border"
          />
        </div>

        <div class="space-y-3 text-sm">
          <p><span class="font-semibold text-gray-600">Judul:</span> {{ lesson.title }}</p>
          <p><span class="font-semibold text-gray-600">Deskripsi:</span> {{ lesson.description }}</p>
          <p><span class="font-semibold text-gray-600">Kelas:</span> 
            <span class="badge badge-primary badge-sm ml-2">{{ lesson.class?.name || '-' }}</span>
          </p>
          <div class="p-3 bg-gray-50 rounded-xl space-y-1 text-xs text-gray-500 mt-4">
            <p>Dibuat: {{ formatDate(lesson.created_at) }}</p>
            <p>Diperbarui: {{ formatDate(lesson.updated_at) }}</p>
          </div>
        </div>
      </div>

      <!-- Quizzes List (Right Column - Spans 2 cols) -->
      <div class="col-span-1 md:col-span-2 space-y-4">
        <div class="flex justify-between items-center bg-white p-4 rounded-2xl shadow border border-gray-100">
          <h2 class="text-xl font-bold text-gray-800">
            📝 Daftar Kuis ({{ lesson.quizzes?.length || 0 }})
          </h2>
          <router-link 
            :to="`/admin/kuis/tambah?lesson_id=${lesson.id}`" 
            class="btn btn-primary btn-sm text-white"
          >
            ➕ Tambah Kuis
          </router-link>
        </div>

        <!-- Quiz Cards List -->
        <div v-if="lesson.quizzes?.length > 0" class="space-y-4">
          <div 
            v-for="quiz in lesson.quizzes" 
            :key="quiz.id" 
            class="bg-white p-6 rounded-2xl shadow border border-gray-100 space-y-4 hover:shadow-md transition-shadow"
          >
            <div class="flex justify-between items-start gap-4 border-b border-gray-100 pb-3">
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-lg font-bold text-gray-800">{{ quiz.title }}</h3>
                  <span 
                    :class="quiz.is_active ? 'badge-success text-white' : 'badge-ghost text-gray-400'"
                    class="badge badge-sm font-semibold"
                  >
                    {{ quiz.is_active ? 'Aktif' : 'Tidak Aktif' }}
                  </span>
                </div>
              </div>

              <!-- Per Quiz Actions -->
              <div class="flex gap-2 flex-wrap justify-end">
                <router-link 
                  :to="`/admin/kuis/${quiz.id}/pertanyaan`"
                  class="btn btn-sm btn-info text-white"
                >
                  ❓ Soal
                </router-link>

                <router-link 
                  :to="`/admin/kuis/${quiz.id}/edit`"
                  class="btn btn-sm btn-warning text-white"
                >
                  ✏️ Edit
                </router-link>

                <button 
                  @click="deleteQuiz(quiz.id)"
                  class="btn btn-sm btn-error text-white"
                >
                  🗑️ Hapus
                </button>
              </div>
            </div>

            <!-- Quiz Description -->
            <div 
              class="text-sm text-gray-600 cursor-pointer" 
              :class="{'line-clamp-2': !expandedDescriptions[quiz.id]}"
              @click="toggleDescription(quiz.id)"
            >
              {{ quiz.description }}
              <span 
                v-if="quiz.description && quiz.description.length > 30" 
                class="text-blue-600 text-xs font-semibold ml-1"
              >
                {{ expandedDescriptions[quiz.id] ? '(Sembunyikan)' : '(Selengkapnya...)' }}
              </span>
            </div>

            <!-- Timestamps Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div class="bg-blue-50/70 p-3 rounded-xl border border-blue-100">
                <span class="font-semibold text-blue-900 block mb-1">⏰ Waktu Mulai:</span>
                <span class="text-blue-800 font-medium">{{ quiz.start_time ? new Date(quiz.start_time).toLocaleString('id-ID') : '-' }}</span>
              </div>

              <div class="bg-purple-50/70 p-3 rounded-xl border border-purple-100">
                <span class="font-semibold text-purple-900 block mb-1">⌛ Waktu Selesai:</span>
                <span class="text-purple-800 font-medium">{{ quiz.end_time ? new Date(quiz.end_time).toLocaleString('id-ID') : '-' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- No Quiz Message -->
        <div v-else class="bg-white p-8 rounded-2xl shadow border border-gray-100 text-center space-y-4">
          <div class="text-4xl">📝</div>
          <h3 class="text-lg font-bold text-gray-800">Belum Ada Kuis</h3>
          <p class="text-sm text-gray-500">Pelajaran ini belum memiliki kuis. Tambahkan kuis pertama untuk siswa.</p>
          <router-link 
            :to="`/admin/kuis/tambah?lesson_id=${lesson.id}`" 
            class="btn btn-primary text-white"
          >
            ➕ Tambah Kuis Pertama
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
