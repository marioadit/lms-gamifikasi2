<script setup>
import { useStudentStore } from "../../../store/studentStore";
import { resetUserPassword, deleteUser } from "../../../api/userApi";
import { useRoute } from "vue-router";
import { computed, onMounted, watch, ref } from "vue";

import { useClassesStore } from "../../../store/classesStore";
import { useAuthStore } from "../../../store/authStore";

const route = useRoute();
const studentStore = useStudentStore();
const classesStore = useClassesStore();
const authStore = useAuthStore();

const userRole = computed(() => authStore.userRole);
const currentUserId = computed(() => authStore.currentUserId);

const myClassIds = computed(() => {
  if (userRole.value !== 'guru') return null;
  return classesStore.classes
    .filter(cls => Number(cls.teacher_id || cls.teacher?.id || 0) === currentUserId.value)
    .map(cls => cls.id);
});

const loadClasses = async () => {
  await classesStore.getClasses().catch(() => null);
  await studentStore.getUserStudent();
};

onMounted(loadClasses);

const students = computed(() => {
  const allStudents = studentStore.students || [];
  if (userRole.value === 'guru') {
    return allStudents.filter(student => {
      if (!student || !Array.isArray(student.classes_enrolled)) return false;
      return student.classes_enrolled.some(c => 
        (myClassIds.value && myClassIds.value.includes(c.id)) || 
        Number(c.teacher_id || c.teacher?.id) === currentUserId.value
      );
    });
  }
  return allStudents;
});

const getStudentClasses = (student) => {
  if (!student || !Array.isArray(student.classes_enrolled)) return [];
  if (userRole.value === 'guru') {
    const filtered = student.classes_enrolled.filter(c => 
      (myClassIds.value && myClassIds.value.includes(c.id)) || 
      Number(c.teacher_id || c.teacher?.id) === currentUserId.value
    );
    return filtered.length > 0 ? filtered : student.classes_enrolled;
  }
  return student.classes_enrolled;
};

const canManageStudent = (student) => {
  if (userRole.value === 'admin') return true;
  if (userRole.value === 'guru') {
    if (!student || !Array.isArray(student.classes_enrolled)) return false;
    return student.classes_enrolled.some(c => 
      (myClassIds.value && myClassIds.value.includes(c.id)) || 
      Number(c.teacher_id || c.teacher?.id) === currentUserId.value
    );
  }
  return false;
};
const isLoading = computed(() => studentStore.loading);
const errorMessage = computed(() => studentStore.error);
const successMessage = computed(() => studentStore.success);

watch(
  () => route.fullPath,
  (newPath) => {
    if (newPath === "/admin/users/siswa") {
      loadClasses();
    }
  }
);

// Confirmation Modals State
const showResetModal = ref(false);
const showDeleteModal = ref(false);

const selectedStudent = ref(null);
const actionLoading = ref(false);
const modalError = ref(null);
const localSuccess = ref(null);

const openResetModal = (student) => {
  selectedStudent.value = student;
  modalError.value = null;
  showResetModal.value = true;
};

const openDeleteModal = (student) => {
  selectedStudent.value = student;
  modalError.value = null;
  showDeleteModal.value = true;
};

const handleResetPassword = async () => {
  if (!selectedStudent.value) return;
  actionLoading.value = true;
  modalError.value = null;
  try {
    await resetUserPassword(selectedStudent.value.id);
    localSuccess.value = `Password siswa ${selectedStudent.value.name} berhasil di-reset`;
    showResetModal.value = false;
  } catch (err) {
    modalError.value = typeof err === "string" ? err : (err?.response?.data?.message || err?.message || "Gagal mereset password");
  } finally {
    actionLoading.value = false;
  }
};

const handleDeleteStudent = async () => {
  if (!selectedStudent.value) return;
  actionLoading.value = true;
  modalError.value = null;
  try {
    await deleteUser(selectedStudent.value.id);
    localSuccess.value = `Siswa ${selectedStudent.value.name} berhasil dihapus`;
    showDeleteModal.value = false;
    await studentStore.getUserStudent();
  } catch (err) {
    modalError.value = typeof err === "string" ? err : (err?.response?.data?.message || err?.message || "Gagal menghapus siswa");
  } finally {
    actionLoading.value = false;
  }
};
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Kelola Siswa</h1>
        <p class="text-gray-500">Kelola daftar siswa yang terdaftar di sistem</p>
      </div>
      <div class="flex items-center gap-2">
        <router-link to="/admin/rekap-nilai" class="btn btn-outline btn-primary shadow">
          <span>📊</span> Rekap Nilai Siswa
        </router-link>
        <router-link to="/admin/users/tambah" class="btn btn-primary shadow">
          <span class="mr-1">➕</span> Tambah Siswa Baru
        </router-link>
      </div>
    </div>

    <!-- Feedback Alerts -->
    <div v-if="localSuccess || successMessage" class="alert alert-success shadow-lg mb-6 text-white flex justify-between">
      <span>{{ localSuccess || successMessage }}</span>
      <button @click="localSuccess = null; studentStore.success = null;" class="btn btn-ghost btn-xs">✕</button>
    </div>

    <div v-if="errorMessage" class="alert alert-error shadow-lg mb-6 text-white flex justify-between">
      <span>{{ errorMessage }}</span>
      <button @click="studentStore.error = null" class="btn btn-ghost btn-xs">✕</button>
    </div>

    <!-- Spinner -->
    <div v-if="isLoading" class="flex justify-center my-8">
      <div class="loading loading-spinner loading-lg text-primary"></div>
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto bg-white rounded-xl shadow border border-gray-100">
      <table class="table table-zebra w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="py-3 px-4 text-left font-semibold text-gray-600">ID</th>
            <th class="py-3 px-4 text-left font-semibold text-gray-600">Nama</th>
            <th class="py-3 px-4 text-left font-semibold text-gray-600">Email</th>
            <th class="py-3 px-4 text-left font-semibold text-gray-600">Kelas</th>
            <th class="py-3 px-4 text-center font-semibold text-gray-600">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="student in students" :key="student.id" class="hover:bg-gray-50 transition-colors">
            <td class="font-bold text-gray-500">#{{ student.id }}</td>
            <td class="font-medium text-gray-900">{{ student.name }}</td>
            <td class="text-gray-600">{{ student.email }}</td>
            <td>
              <template v-if="getStudentClasses(student) && getStudentClasses(student).length > 0">
                <div class="flex flex-wrap gap-1">
                  <span 
                    v-for="clases in getStudentClasses(student)" 
                    :key="clases.id" 
                    class="badge badge-accent badge-sm font-medium"
                  >
                    {{ clases.name }}
                  </span>
                </div>
              </template>
              <span v-else class="text-gray-400 italic text-sm">Belum ada kelas</span>
            </td>
            <td>
              <div class="flex justify-center flex-wrap gap-1">
                <router-link :to="`/admin/users/${student.id}`" class="btn btn-xs btn-info text-white">
                  Lihat
                </router-link>
                <template v-if="canManageStudent(student)">
                  <router-link :to="`/admin/users/${student.id}/edit-profile`" class="btn btn-xs btn-outline btn-neutral">
                    Ubah profil
                  </router-link>
                  <router-link :to="`/admin/users/${student.id}/edit-password`" class="btn btn-xs btn-outline btn-secondary">
                    Ubah password
                  </router-link>
                  <button @click="openResetModal(student)" class="btn btn-xs btn-warning text-white">
                    Reset password
                  </button>
                  <button @click="openDeleteModal(student)" class="btn btn-xs btn-error text-white">
                    Hapus
                  </button>
                </template>
              </div>
            </td>
          </tr>
          <tr v-if="students.length === 0">
            <td colspan="5" class="text-center py-8 text-gray-400">
              Belum ada data siswa.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL: Reset Password Confirmation -->
    <div v-if="showResetModal" class="modal modal-open">
      <div class="modal-box max-w-sm rounded-2xl text-center">
        <div class="text-yellow-500 text-4xl mb-2">⚡</div>
        <h3 class="font-bold text-lg text-gray-800">Reset Password</h3>
        <p class="py-3 text-sm text-gray-600">
          Apakah Anda yakin ingin mereset password untuk siswa <strong>{{ selectedStudent?.name }}</strong>?
        </p>

        <div v-if="modalError" class="alert alert-error text-sm text-white my-2">
          {{ modalError }}
        </div>

        <div class="modal-action justify-center gap-2 mt-4">
          <button @click="showResetModal = false" class="btn btn-ghost btn-sm" :disabled="actionLoading">
            Batal
          </button>
          <button @click="handleResetPassword" class="btn btn-warning btn-sm text-white" :disabled="actionLoading">
            <span v-if="actionLoading" class="loading loading-spinner loading-xs"></span>
            Ya, Reset Password
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL: Hapus Siswa Confirmation -->
    <div v-if="showDeleteModal" class="modal modal-open">
      <div class="modal-box max-w-sm rounded-2xl text-center">
        <div class="text-red-500 text-4xl mb-2">🗑️</div>
        <h3 class="font-bold text-lg text-gray-800">Hapus Siswa</h3>
        <p class="py-3 text-sm text-gray-600">
          Apakah Anda yakin ingin menghapus akun siswa <strong>{{ selectedStudent?.name }}</strong>? Tindakan ini tidak dapat dibatalkan.
        </p>

        <div v-if="modalError" class="alert alert-error text-sm text-white my-2">
          {{ modalError }}
        </div>

        <div class="modal-action justify-center gap-2 mt-4">
          <button @click="showDeleteModal = false" class="btn btn-ghost btn-sm" :disabled="actionLoading">
            Batal
          </button>
          <button @click="handleDeleteStudent" class="btn btn-error btn-sm text-white" :disabled="actionLoading">
            <span v-if="actionLoading" class="loading loading-spinner loading-xs"></span>
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>

  </div>
</template>
