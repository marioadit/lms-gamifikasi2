<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useLessonsStore } from "../../store/lessonsStore";
import { useClassesStore } from "../../store/classesStore";
import { getCurrentInstance } from 'vue';
import Swal from "sweetalert2";

import { useAuthStore } from "../../store/authStore";
import { useQuizStore } from "../../store/quizStore";

const route = useRoute();
const router = useRouter();
const lessonsStore = useLessonsStore();
const classesStore = useClassesStore();
const authStore = useAuthStore();
const quizStore = useQuizStore();

const userRole = computed(() => authStore.userRole);
const currentUserId = computed(() => authStore.currentUserId);

const myClassIds = computed(() => {
  if (userRole.value !== 'guru') return null;
  return classesStore.classes
    .filter(cls => Number(cls.teacher_id || cls.teacher?.id || 0) === currentUserId.value)
    .map(cls => cls.id);
});

const classes = computed(() => {
  if (userRole.value === 'guru' && myClassIds.value) {
    return classesStore.classes.filter(cls => myClassIds.value.includes(cls.id));
  }
  return classesStore.classes;
});

const { proxy } = getCurrentInstance();
const base_url = proxy.$base_url;

const isLoading = ref(true);
let isFetching = false;

const loadAllData = async (force = false) => {
  if (isFetching && !force) return;
  isFetching = true;
  isLoading.value = true;
  try {
    await Promise.all([
      classesStore.getClasses().catch(() => null),
      lessonsStore.getLessons().catch(() => null),
      quizStore.getQuizzes().catch(() => null)
    ]);
  } catch (error) {
    console.error("Error loading lessons page data:", error);
  } finally {
    isLoading.value = false;
    isFetching = false;
  }
};

const filterClassId = ref(null);

const syncFilterFromRoute = () => {
  const cid = route.query.class_id || route.query.classId;
  if (cid) {
    filterClassId.value = Number(cid);
  } else {
    filterClassId.value = null;
  }
};

const selectClassFilter = (classId) => {
  if (!classId) {
    filterClassId.value = null;
    const q = { ...route.query };
    delete q.class_id;
    delete q.classId;
    router.replace({ query: q });
    return;
  }
  filterClassId.value = Number(classId);
  router.replace({
    query: {
      ...route.query,
      class_id: classId
    }
  });
};

const onFilterChange = () => {
  selectClassFilter(filterClassId.value);
};

onMounted(async () => {
  syncFilterFromRoute();
  await loadAllData();
});

// Watch for route fullPath changes
watch(
  () => route.fullPath,
  async (newPath, oldPath) => {
    syncFilterFromRoute();
    if (newPath.split('?')[0] === "/admin/pelajaran" && oldPath && oldPath.split('?')[0] !== "/admin/pelajaran") {
      await loadAllData();
    }
  }
);

// Watch for query class_id changes directly
watch(
  () => route.query.class_id,
  (newCid) => {
    if (newCid) {
      filterClassId.value = Number(newCid);
    } else {
      filterClassId.value = null;
    }
  }
);

const errorMessage = computed(() => lessonsStore.error);

const filteredLessons = computed(() => {
  return (lessonsStore.lessons || []).filter((lesson) => {
    if (userRole.value === 'guru' && myClassIds.value) {
      if (!myClassIds.value.includes(lesson.class_id)) {
        return false;
      }
    }
    if (!filterClassId.value) return true;
    return Number(lesson.class_id) === Number(filterClassId.value);
  });
});

const getQuizCount = (lesson) => {
  if (!lesson) return 0;
  if (typeof lesson.quizzes_count === "number") return lesson.quizzes_count;
  if (typeof lesson.quiz_count === "number") return lesson.quiz_count;
  if (Array.isArray(lesson.quizzes) && lesson.quizzes.length > 0) return lesson.quizzes.length;
  if (lesson.quiz) return 1;

  if (quizStore.quizzes && quizStore.quizzes.length > 0) {
    return quizStore.quizzes.filter(q => Number(q.lesson_id) === Number(lesson.id)).length;
  }
  return 0;
};

const deleteLesson = async (lessonId) => {
  Swal.fire({
    title: "Apakah Anda yakin ingin menghapus pelajaran ini?",
    text: "Anda tidak akan dapat mengembalikan ini!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Ya, hapus!",
  }).then(async (result) => {
    if (result.isConfirmed) {
      await lessonsStore.deleteLesson(lessonId);
      Swal.fire({
        title: "Berhasil!",
        text: "Pelajaran berhasil dihapus.",
        icon: "success",
      });
    }
  });
};
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold">Kelola Pelajaran 📚</h1>
        <p class="text-gray-500">
          Buat dan kelola materi pelajaran untuk siswa
        </p>
      </div>
      <router-link to="/admin/pelajaran/tambah" class="btn btn-primary">
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
    </div>

    <!-- Filter and Search -->
    <div class="bg-white p-4 rounded-lg shadow mb-6">
      <div class="flex flex-col md:flex-row items-end gap-4">
        <div class="form-control w-full md:w-1/3">
          <label class="label">
            <span class="label-text font-medium">Filter Kelas</span>
          </label>
          <select v-model="filterClassId" @change="onFilterChange" class="select select-bordered w-full">
            <option :value="null">Semua Kelas</option>
            <option v-for="cls in classes" :key="cls.id" :value="cls.id">
              {{ cls.name }}
            </option>
          </select>
        </div>
        <div v-if="filterClassId" class="pb-1">
          <button @click="selectClassFilter(null)" class="btn btn-outline btn-sm gap-1">
            ✕ Hapus Filter
          </button>
        </div>
      </div>
    </div>

    <!-- Loading indicator -->
    <div v-if="isLoading" class="flex justify-center my-4">
      <div class="loading loading-spinner loading-lg text-primary"></div>
    </div>

    <!-- Error message -->
    <div
      v-if="errorMessage"
      class="bg-red-100 text-red-700 p-4 rounded-lg mb-6"
    >
      {{ errorMessage }}
    </div>

    <!-- Lessons Table -->
    <div v-else class="overflow-x-auto bg-white rounded-lg shadow">
      <table class="table table-zebra w-full">
        <thead>
          <tr>
            <th>Thumbnail</th>
            <th>Judul Pelajaran</th>
            <th>Deskripsi</th>
            <th>Konten</th>
            <th>Kelas</th>
            <th>Jumlah Kuis</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="lesson in filteredLessons" :key="lesson.id" class="hover:bg-gray-50">
            <td class="w-20 align-middle">
              <div class="avatar">
                <div class="w-16 h-16 rounded-lg overflow-hidden">
                  <img
                    v-if="lesson.thumbnail"
                    :src="`${base_url}/${lesson.thumbnail}`"
                    :alt="lesson.title"
                    class="w-full h-full object-cover"
                  />
                  <div
                    v-else
                    class="w-full h-full bg-gray-200 flex items-center justify-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-8 w-8 text-gray-400"
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
              </div>
            </td>
            <td class="font-medium max-w-[200px] align-middle">
              <div class="truncate" :title="lesson.title">{{ lesson.title }}</div>
            </td>
            <td class="max-w-xs align-middle">
              <div class="truncate" :title="lesson.description">{{ lesson.description || '-' }}</div>
            </td>
            <td class="max-w-xs align-middle">
              <div class="truncate" :title="lesson.content">{{ lesson.content || '-' }}</div>
            </td>
            <td class="max-w-[150px] align-middle">
              <div
                v-if="lesson.class?.name"
                @click="selectClassFilter(lesson.class_id)"
                class="truncate font-medium text-primary hover:underline cursor-pointer flex items-center gap-1"
                :title="`Klik untuk memfilter hanya kelas ${lesson.class.name}`"
              >
                <span>{{ lesson.class.name }}</span>
              </div>
              <span v-else class="text-gray-400 italic">Tidak ada kelas</span>
            </td>
            <td class="align-middle">{{ getQuizCount(lesson) }}</td>
            <td class="align-middle">
              <div class="flex items-center gap-1.5 flex-wrap py-2">
                <router-link
                  :to="`/admin/pelajaran/${lesson.id}`"
                  class="btn btn-sm btn-ghost"
                >
                  Lihat
                </router-link>
                <button
                  v-if="lesson.class_id"
                  @click="selectClassFilter(lesson.class_id)"
                  class="btn btn-sm btn-info text-white"
                  :title="`Filter hanya kelas ${lesson.class?.name || ''}`"
                >
                  Kelas
                </button>
                <router-link
                  :to="`/admin/pelajaran/${lesson.id}/kuis`"
                  class="btn btn-sm btn-success text-white"
                >
                  Kuis ({{ getQuizCount(lesson) }})
                </router-link>
                <router-link
                  :to="`/admin/pelajaran/${lesson.id}/edit`"
                  class="btn btn-sm btn-warning"
                >
                  Edit
                </router-link>

                <button
                  class="btn btn-sm btn-error"
                  @click="deleteLesson(lesson.id)"
                >
                  Hapus
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="filteredLessons.length === 0">
            <td colspan="7" class="text-center py-4">
              Belum ada pelajaran. Tambahkan pelajaran baru.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
