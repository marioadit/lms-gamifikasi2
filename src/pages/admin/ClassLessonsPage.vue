<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useLessonsStore } from "../../store/lessonsStore";
import { useClassesStore } from "../../store/classesStore";
import { getCurrentInstance } from "vue";

const { proxy } = getCurrentInstance();
const base_url = proxy.$base_url;
const route = useRoute();
const router = useRouter();
const lessonsStore = useLessonsStore();
const classesStore = useClassesStore();

const classId = ref(parseInt(route.params.id));
const isLoading = ref(false);
const errorMessage = ref("");

watch(
  () => route.params.id,
  (newId) => {
    classId.value = parseInt(newId);
    lessonsStore.lessons = []; // Clear data lama saat kelas berubah
    loadData();
  }
);

// Use selectedClass instead of searching through all classes
const currentClass = computed(() => classesStore.selectedClass);
const lessons = computed(() => lessonsStore.lessons);

const getFullThumbnailUrl = (thumbnail) => {
  if (!thumbnail) return null;
  return thumbnail.startsWith("data:") ? thumbnail : `${base_url}/${thumbnail}`;
};

const goBack = () => {
  router.push("/admin/kelas");
};

// Function to load data with delay between calls
const loadData = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = "";

    // Get class details first

    lessonsStore.lessons = [];

    await classesStore.getClassById(classId.value);

    // Get lessons dengan retry
    let retries = 3;
    while (retries > 0) {
      try {
        await lessonsStore.getLessonsByClassId(classId.value);
        break;
      } catch (error) {
        retries--;
        if (retries === 0) {
          console.error("Error loading lessons:", error);
          errorMessage.value =
            "Gagal memuat data pelajaran. Silakan coba refresh halaman.";
        } else {
          // Exponential backoff: 1s, 2s, 3s
          await new Promise((resolve) =>
            setTimeout(resolve, (3 - retries) * 1000)
          );
        }
      }
    }
  } catch (error) {
    console.error("Error loading data:", error);
    errorMessage.value = "Gagal memuat data";
  } finally {
    isLoading.value = false;
  }
};

onMounted(loadData);
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold">
          Daftar Pelajaran {{ currentClass?.name }} 📚
        </h1>
        <p class="text-gray-500">
          Kelola pelajaran untuk kelas {{ currentClass?.name }} ({{
            currentClass?.level
          }})
        </p>
      </div>
      <div class="flex gap-2">
        <router-link
          :to="`/admin/pelajaran/tambah?class_id=${classId}`"
          class="btn btn-primary"
        >
          <span class="mr-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          </span>
          Tambah Pelajaran Baru
        </router-link>
        <button @click="goBack" class="btn btn-outline">
          Kembali ke Daftar Kelas
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center my-8">
      <div class="loading loading-spinner loading-lg text-primary"></div>
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="alert alert-error mb-6">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="stroke-current shrink-0 h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Lessons Grid -->
    <div
      v-if="!isLoading && lessons.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <div
        v-for="lesson in lessons"
        :key="lesson.id"
        class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
      >
        <!-- Thumbnail -->
        <div class="relative h-48">
          <img
            v-if="lesson.thumbnail"
            :src="getFullThumbnailUrl(lesson.thumbnail)"
            :alt="lesson.title"
            class="w-full h-full object-cover"
          />
          <div
            v-else
            class="w-full h-full bg-gray-200 flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-16 w-16 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>

        <!-- Content -->
        <div class="p-4">
          <h3 class="text-lg font-semibold mb-2">{{ lesson.title }}</h3>
          <p class="text-gray-600 text-sm mb-4 line-clamp-2">
            {{ lesson.description }}
          </p>

          <!-- Action Buttons -->
          <div class="flex gap-2">
            <router-link
              :to="`/admin/pelajaran/${lesson.id}`"
              class="btn btn-sm btn-ghost"
            >
              Lihat
            </router-link>
            <router-link
              :to="`/admin/pelajaran/${lesson.id}/kuis`"
              class="btn btn-sm btn-success"
            >
              Kuis
            </router-link>
            <router-link
              :to="`/admin/pelajaran/${lesson.id}/edit`"
              class="btn btn-sm btn-warning"
            >
              Edit
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="!isLoading && lessons.length === 0"
      class="bg-white rounded-lg shadow-md p-8 text-center"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="mx-auto h-12 w-12 text-gray-400 mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">
        Belum ada pelajaran
      </h3>
      <p class="text-gray-500 mb-6">
        Mulai tambahkan pelajaran untuk kelas ini
      </p>
      <router-link
        :to="`/admin/pelajaran/tambah?class_id=${classId}`"
        class="btn btn-primary"
      >
        Tambah Pelajaran Baru
      </router-link>
    </div>
  </div>
</template>
