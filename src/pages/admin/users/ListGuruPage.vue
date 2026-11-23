<script setup>
import { useTeacherStore } from "../../../store/teacherStore";
import { resetUserPassword, deleteUser } from "../../../api/userApi";
import { getClasses } from "../../../api/classesApi";
import { useRoute } from "vue-router";
import { computed, onMounted, watch, ref } from "vue";

const route = useRoute();
const teacherStore = useTeacherStore();

const teachers = computed(() => teacherStore.teachers);
const isLoading = ref(true);
let isFetching = false;
const errorMessage = computed(() => teacherStore.error);

const loadTeachers = async (force = false) => {
  if (isFetching && !force) return;
  isFetching = true;
  isLoading.value = true;
  try {
    const [_, res] = await Promise.all([
      teacherStore.getTeachers(),
      getClasses().catch(() => null)
    ]);

    let classList = [];
    if (res) {
      if (res.data && Array.isArray(res.data.data)) {
        classList = res.data.data;
      } else if (Array.isArray(res.data)) {
        classList = res.data;
      } else if (Array.isArray(res)) {
        classList = res;
      }
    }

    if (teacherStore.teachers && teacherStore.teachers.length > 0) {
      teacherStore.teachers.forEach(teacher => {
        const taught = classList.filter(c => 
          Number(c.teacher_id) === Number(teacher.id) || 
          Number(c.teacher?.id) === Number(teacher.id)
        );
        if (taught.length > 0) {
          teacher.classes_teaching = taught;
        }
      });
    }
  } catch (err) {
    console.error("Error fetching classes for teachers:", err);
  } finally {
    isLoading.value = false;
    isFetching = false;
  }
};

onMounted(loadTeachers);

watch(
  () => route.fullPath,
  (newPath, oldPath) => {
    if (newPath === "/admin/users/guru" && oldPath && oldPath !== "/admin/users/guru") {
      loadTeachers();
    }
  }
);

// Confirmation Modals State
const showResetModal = ref(false);
const showDeleteModal = ref(false);

const selectedTeacher = ref(null);
const actionLoading = ref(false);
const modalError = ref(null);
const localSuccess = ref(null);

const openResetModal = (teacher) => {
  selectedTeacher.value = teacher;
  modalError.value = null;
  showResetModal.value = true;
};

const openDeleteModal = (teacher) => {
  selectedTeacher.value = teacher;
  modalError.value = null;
  showDeleteModal.value = true;
};

const handleResetPassword = async () => {
  if (!selectedTeacher.value) return;
  actionLoading.value = true;
  modalError.value = null;
  try {
    await resetUserPassword(selectedTeacher.value.id);
    localSuccess.value = `Password guru ${selectedTeacher.value.name} berhasil di-reset`;
    showResetModal.value = false;
  } catch (err) {
    modalError.value = typeof err === "string" ? err : (err?.response?.data?.message || err?.message || "Gagal mereset password");
  } finally {
    actionLoading.value = false;
  }
};

const handleDeleteTeacher = async () => {
  if (!selectedTeacher.value) return;
  actionLoading.value = true;
  modalError.value = null;
  try {
    await deleteUser(selectedTeacher.value.id);
    localSuccess.value = `Guru ${selectedTeacher.value.name} berhasil dihapus`;
    showDeleteModal.value = false;
    await teacherStore.getTeachers();
  } catch (err) {
    modalError.value = typeof err === "string" ? err : (err?.response?.data?.message || err?.message || "Gagal menghapus guru");
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
        <h1 class="text-2xl font-bold text-gray-800">Kelola Guru</h1>
        <p class="text-gray-500">Kelola daftar guru yang terdaftar di sistem</p>
      </div>
      <router-link to="/admin/users/guru/tambah" class="btn btn-primary shadow">
        <span class="mr-1">➕</span> Tambah Guru Baru
      </router-link>
    </div>

    <!-- Alerts -->
    <div v-if="localSuccess" class="alert alert-success shadow-lg mb-6 text-white flex justify-between">
      <span>{{ localSuccess }}</span>
      <button @click="localSuccess = null" class="btn btn-ghost btn-xs">✕</button>
    </div>

    <div v-if="errorMessage" class="alert alert-error shadow-lg mb-6 text-white flex justify-between">
      <span>{{ errorMessage }}</span>
      <button @click="teacherStore.error = null" class="btn btn-ghost btn-xs">✕</button>
    </div>

    <!-- Loading Spinner -->
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
            <th class="py-3 px-4 text-left font-semibold text-gray-600">Kelas yang Diajar</th>
            <th class="py-3 px-4 text-center font-semibold text-gray-600">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="teacher in teachers" :key="teacher.id" class="hover:bg-gray-50 transition-colors">
            <td class="font-bold text-gray-500">#{{ teacher.id }}</td>
            <td class="font-medium text-gray-900">{{ teacher.name }}</td>
            <td class="text-gray-600">{{ teacher.email }}</td>
            <td>
              <div v-if="teacher.classes_teaching && teacher.classes_teaching.length > 0" class="flex flex-wrap gap-1">
                <span
                  v-for="kelas in teacher.classes_teaching"
                  :key="kelas.id"
                  class="badge badge-primary badge-sm font-medium"
                >
                  {{ kelas.name }}
                </span>
              </div>
              <span v-else class="text-gray-400 italic text-sm">Belum ada kelas</span>
            </td>
            <td>
              <div class="flex justify-center flex-wrap gap-1">
                <router-link
                  :to="`/admin/users/guru/${teacher.id}`"
                  class="btn btn-xs btn-info text-white"
                >
                  Lihat
                </router-link>
                <router-link
                  :to="`/admin/users/guru/${teacher.id}/edit-profile`"
                  class="btn btn-xs btn-outline btn-neutral"
                >
                  Ubah profil
                </router-link>
                <router-link
                  :to="`/admin/users/guru/${teacher.id}/edit-password`"
                  class="btn btn-xs btn-outline btn-secondary"
                >
                  Ubah password
                </router-link>
                <button @click="openResetModal(teacher)" class="btn btn-xs btn-warning text-white">
                  Reset password
                </button>
                <button @click="openDeleteModal(teacher)" class="btn btn-xs btn-error text-white">
                  Hapus
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="teachers.length === 0">
            <td colspan="5" class="text-center py-8 text-gray-400">
              Belum ada data guru.
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
          Apakah Anda yakin ingin mereset password untuk guru <strong>{{ selectedTeacher?.name }}</strong>?
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

    <!-- MODAL: Hapus Guru Confirmation -->
    <div v-if="showDeleteModal" class="modal modal-open">
      <div class="modal-box max-w-sm rounded-2xl text-center">
        <div class="text-red-500 text-4xl mb-2">🗑️</div>
        <h3 class="font-bold text-lg text-gray-800">Hapus Guru</h3>
        <p class="py-3 text-sm text-gray-600">
          Apakah Anda yakin ingin menghapus akun guru <strong>{{ selectedTeacher?.name }}</strong>? Tindakan ini tidak dapat dibatalkan.
        </p>

        <div v-if="modalError" class="alert alert-error text-sm text-white my-2">
          {{ modalError }}
        </div>

        <div class="modal-action justify-center gap-2 mt-4">
          <button @click="showDeleteModal = false" class="btn btn-ghost btn-sm" :disabled="actionLoading">
            Batal
          </button>
          <button @click="handleDeleteTeacher" class="btn btn-error btn-sm text-white" :disabled="actionLoading">
            <span v-if="actionLoading" class="loading loading-spinner loading-xs"></span>
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>

  </div>
</template>
