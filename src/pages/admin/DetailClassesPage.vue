<script setup>
import { computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useClassesStore } from "../../store/classesStore";
import { useAuthStore } from "../../store/authStore";

const router = useRouter();
const route = useRoute();
const classesStore = useClassesStore();
const authStore = useAuthStore();

const userRole = computed(() => authStore.userRole);
const currentUserId = computed(() => authStore.currentUserId);

onMounted(() => {
  const classId = route.params.id;
  classesStore.getClassById(classId);
});

const selectedClass = computed(() => classesStore.selectedClass);
const isLoading = computed(() => classesStore.loading);
const errorMessage = computed(() => classesStore.error);

const isTaughtByMe = computed(() => {
  if (!selectedClass.value) return false;
  if (userRole.value === 'admin') return true;
  if (userRole.value === 'guru') {
    const teacherId = Number(selectedClass.value.teacher_id || selectedClass.value.teacher?.id || 0);
    return teacherId === currentUserId.value;
  }
  return false;
});

const goBack = () => {
  router.push("/admin/kelas");
};

const openEditClass = () => {
  router.push(`/admin/kelas/edit/${route.params.id}`);
};

const openStudentManagement = () => {
  router.push(`/admin/kelas/${route.params.id}/siswa`);
};
</script>

<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold">Detail Kelas</h1>
        <p class="text-gray-500" v-if="selectedClass">{{ selectedClass.name }}</p>
      </div>
      <div class="flex gap-2">
        <button @click="goBack" class="btn btn-outline">
          Kembali
        </button>
        <button @click="openEditClass" class="btn btn-warning" v-if="selectedClass && isTaughtByMe">
          Edit Kelas
        </button>
      </div>
    </div>

    <!-- Loading indicator -->
    <div v-if="isLoading" class="flex justify-center my-12">
      <div class="loading loading-spinner loading-lg text-primary"></div>
    </div>
    
    <!-- Error message -->
    <div v-if="errorMessage" class="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
      {{ errorMessage }}
    </div>

    <div v-if="selectedClass && !isLoading" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white p-6 rounded-xl shadow-md">
        <h2 class="text-xl font-bold mb-4">Detail Kelas</h2>
        <div class="space-y-3">
          <div class="flex flex-col gap-1">
            <span class="text-sm text-gray-500">Nama Kelas:</span>
            <span class="text-base font-medium">{{ selectedClass.name }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-sm text-gray-500">Tingkat:</span>
            <span class="text-base font-medium">{{ selectedClass.level }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-sm text-gray-500">Guru:</span>
            <span class="text-base font-medium">{{ selectedClass.teacher.name }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-sm text-gray-500">Email Guru:</span>
            <span class="text-base font-medium">{{ selectedClass.teacher.email }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-sm text-gray-500">Semester:</span>
            <span class="text-base font-medium">{{ selectedClass.semester || '-' }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-sm text-gray-500">Tahun Ajaran:</span>
            <span class="text-base font-medium">{{ selectedClass.academic_year || '-' }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-sm text-gray-500">Jumlah Siswa:</span>
            <span class="text-base font-medium">{{ selectedClass.students ? selectedClass.students.length : 0 }}</span>
          </div>
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-xl shadow-md">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">Daftar Siswa</h2>
          <button @click="openStudentManagement" class="btn btn-sm btn-primary">
            Kelola Siswa
          </button>
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
              <tr v-for="student in selectedClass.students" :key="student.id">
                <td class="font-medium">{{ student.name }}</td>
                <td>{{ student.email }}</td>
                <td>{{ student.role }}</td>
              </tr>
              <tr v-if="!selectedClass.students || selectedClass.students.length === 0">
                <td colspan="3" class="text-center py-4">Belum ada siswa di kelas ini.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
