<script setup>
import { onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { useClassesStore } from "../../store/users/classesStore";

const route = useRoute();
const classesStore = useClassesStore();

const loadClasses = async () => {
  const classId = route.params.id;

  await classesStore.getClassesLesson(classId);

  await classesStore.getClassById(classId);
};

onMounted(async () => {
  await loadClasses();
});

const detailClasses = computed(() => classesStore.detailClasses);

console.log(detailClasses);
const isLoading = computed(() => classesStore.loading);
const errorMessage = computed(() => classesStore.error);
</script>

<template>
  <div class="p-6 bg-blue-50 min-h-screen">
    <div class="my-8 flex justify-between items-center mb-6">
      <div>
        <h1 class="text-4xl font-bold" v-if="detailClasses">
          {{ detailClasses.name }}
        </h1>
      </div>

      <div class="flex gap-2">
        <router-link to="/kelas" class="btn btn-outline"> Kembali </router-link>
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
      v-if="detailClasses && !isLoading"
      class="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      <div class="bg-white p-6 rounded-xl shadow-md">
        <h2 class="text-xl font-bold mb-4">Informasi Kelas</h2>
        <div class="space-y-3">
          <div class="flex flex-col gap-1">
            <span class="text-sm text-gray-500">Nama Kelas:</span>
            <span class="text-base font-medium">{{ detailClasses.name }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-sm text-gray-500">Tingkat:</span>
            <span class="text-base font-medium">{{ detailClasses.level }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-sm text-gray-500">Guru:</span>
            <span class="text-base font-medium">{{
              detailClasses.teacher.name
            }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-sm text-gray-500">Email Guru:</span>
            <span class="text-base font-medium">{{
              detailClasses.teacher.email
            }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-sm text-gray-500">Jumlah Siswa:</span>
            <span class="text-base font-medium">{{
              detailClasses.students ? detailClasses.students.length : 0
            }}</span>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-md">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">Teman Satu Kelas</h2>
        </div>

        <div class="overflow-x-auto">
          <table class="table table-zebra w-full">
            <thead>
              <tr>
                <th>Nama Siswa</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="student in detailClasses.students" :key="student.id">
                <td class="font-medium">{{ student.name }}</td>
                <td>{{ student.email }}</td>
                <td>{{ student.role }}</td>
              </tr>
              <tr
                v-if="
                  !detailClasses.students || detailClasses.students.length === 0
                "
              >
                <td colspan="3" class="text-center py-4">
                  Belum ada siswa di kelas ini.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
