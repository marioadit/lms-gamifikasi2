<script setup>
import { ref, computed, onMounted } from "vue";
import { getUserById, updateUserProfile } from "../../../api/userApi";
import { getClasses, updateClass, getTeachers } from "../../../api/classesApi";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const teacherId = route.params.id;

const form = ref({
  name: "",
  email: ""
});

const allClasses = ref([]);
const allTeachers = ref([]);
const selectedClassToAdd = ref("");

// State for Reassign Modal
const showReassignModal = ref(false);
const classToReassign = ref(null);
const replacementTeacherId = ref("");
const reassignLoading = ref(false);

const isPageLoading = ref(true);
const isSubmitting = ref(false);
const isClassActionLoading = ref(false);
const errorMessage = ref(null);
const successMessage = ref(null);

const loadData = async () => {
  try {
    isPageLoading.value = true;
    errorMessage.value = null;

    const [teacherRes, classesRes, teachersRes] = await Promise.all([
      getUserById(teacherId),
      getClasses().catch(() => null),
      getTeachers().catch(() => null)
    ]);

    const teacher = teacherRes.data || teacherRes;
    if (teacher) {
      form.value.name = teacher.name || "";
      form.value.email = teacher.email || "";
    }

    // Process Classes
    if (classesRes) {
      if (classesRes.data && Array.isArray(classesRes.data.data)) {
        allClasses.value = classesRes.data.data;
      } else if (Array.isArray(classesRes.data)) {
        allClasses.value = classesRes.data;
      } else if (Array.isArray(classesRes)) {
        allClasses.value = classesRes;
      }
    }

    // Process Teachers
    if (teachersRes) {
      if (teachersRes.data && Array.isArray(teachersRes.data.data)) {
        allTeachers.value = teachersRes.data.data;
      } else if (Array.isArray(teachersRes.data)) {
        allTeachers.value = teachersRes.data;
      } else if (Array.isArray(teachersRes)) {
        allTeachers.value = teachersRes;
      }
    }
  } catch (err) {
    console.error("Error loading edit teacher page data:", err);
    errorMessage.value = "Gagal memuat data guru dan kelas.";
  } finally {
    isPageLoading.value = false;
  }
};

onMounted(loadData);

// Computed properties for classes
const assignedClasses = computed(() => {
  const currentId = Number(teacherId);
  return allClasses.value.filter(
    (c) => Number(c.teacher_id) === currentId || Number(c.teacher?.id) === currentId
  );
});

const availableClassesToAdd = computed(() => {
  const currentId = Number(teacherId);
  return allClasses.value.filter(
    (c) => Number(c.teacher_id) !== currentId && Number(c.teacher?.id) !== currentId
  );
});

const otherTeachers = computed(() => {
  const currentId = Number(teacherId);
  return allTeachers.value.filter((t) => Number(t.id) !== currentId);
});

// Add class to current teacher
const handleAddClass = async () => {
  if (!selectedClassToAdd.value) return;

  const targetClassId = Number(selectedClassToAdd.value);
  const clsObj = allClasses.value.find((c) => Number(c.id) === targetClassId);

  isClassActionLoading.value = true;
  errorMessage.value = null;
  successMessage.value = null;

  try {
    await updateClass(targetClassId, {
      teacher_id: Number(teacherId)
    });

    // Update local state
    if (clsObj) {
      clsObj.teacher_id = Number(teacherId);
      if (clsObj.teacher) {
        clsObj.teacher.id = Number(teacherId);
        clsObj.teacher.name = form.value.name;
      }
    }

    selectedClassToAdd.value = "";
    successMessage.value = `Berhasil menambahkan kelas ${clsObj ? clsObj.name : ''} ke guru ini.`;
  } catch (err) {
    console.error("Error adding class to teacher:", err);
    errorMessage.value = typeof err === "string" ? err : (err?.response?.data?.message || err?.message || "Gagal mengaitkan kelas ke guru ini.");
  } finally {
    isClassActionLoading.value = false;
  }
};

// Open remove modal
const openRemoveModal = (cls) => {
  classToReassign.value = cls;
  if (otherTeachers.value.length > 0) {
    replacementTeacherId.value = otherTeachers.value[0].id;
  } else {
    replacementTeacherId.value = "";
  }
  showReassignModal.value = true;
};

// Confirm remove class (reassign to replacement teacher)
const handleConfirmRemoveClass = async () => {
  if (!classToReassign.value || !replacementTeacherId.value) return;

  reassignLoading.value = true;
  errorMessage.value = null;
  successMessage.value = null;

  try {
    const targetClassId = classToReassign.value.id;
    const newTeacherId = Number(replacementTeacherId.value);
    const replacementTeacherObj = allTeachers.value.find((t) => Number(t.id) === newTeacherId);

    await updateClass(targetClassId, {
      teacher_id: newTeacherId
    });

    // Update local state
    const clsObj = allClasses.value.find((c) => Number(c.id) === targetClassId);
    if (clsObj) {
      clsObj.teacher_id = newTeacherId;
      if (clsObj.teacher) {
        clsObj.teacher.id = newTeacherId;
        clsObj.teacher.name = replacementTeacherObj ? replacementTeacherObj.name : "";
      }
    }

    successMessage.value = `Berhasil melepaskan kelas ${classToReassign.value.name} dari guru ini.`;
    showReassignModal.value = false;
    classToReassign.value = null;
  } catch (err) {
    console.error("Error reassigning class teacher:", err);
    errorMessage.value = typeof err === "string" ? err : (err?.response?.data?.message || err?.message || "Gagal melepaskan kelas.");
  } finally {
    reassignLoading.value = false;
  }
};

// Submit profile changes
const handleSubmit = async () => {
  isSubmitting.value = true;
  errorMessage.value = null;
  successMessage.value = null;

  try {
    await updateUserProfile(teacherId, {
      name: form.value.name,
      email: form.value.email
    });
    router.push(`/admin/users/guru/${teacherId}`);
  } catch (err) {
    errorMessage.value = typeof err === "string" ? err : (err?.response?.data?.message || err?.message || "Gagal memperbarui profil guru");
  } finally {
    isSubmitting.value = false;
  }
};

const handleCancel = () => {
  router.push(`/admin/users/guru/${teacherId}`);
};
</script>

<template>
  <div class="p-6 max-w-4xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Ubah Profil & Kelas Guru</h1>
        <p class="text-gray-500">Kelola informasi data profil dan kelas yang diajar oleh guru ini (ID: #{{ teacherId }})</p>
      </div>
      <button @click="handleCancel" class="btn btn-ghost">
        ← Kembali
      </button>
    </div>

    <!-- Alerts -->
    <div v-if="successMessage" class="alert alert-success shadow-lg text-white flex justify-between">
      <span>{{ successMessage }}</span>
      <button @click="successMessage = null" class="btn btn-ghost btn-xs">✕</button>
    </div>

    <div v-if="errorMessage" class="alert alert-error shadow-lg text-white flex justify-between">
      <span>{{ errorMessage }}</span>
      <button @click="errorMessage = null" class="btn btn-ghost btn-xs">✕</button>
    </div>

    <!-- Loading Spinner -->
    <div v-if="isPageLoading" class="flex justify-center my-12">
      <div class="loading loading-spinner loading-lg text-primary"></div>
    </div>

    <template v-else>
      <!-- Form 1: Profil Guru -->
      <div class="bg-white rounded-2xl shadow border border-gray-100 p-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
          👤 Informasi Profil Guru
        </h2>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label"><span class="label-text font-medium">Nama Guru</span></label>
              <input 
                v-model="form.name" 
                type="text" 
                placeholder="Nama guru" 
                class="input input-bordered w-full" 
                required
              />
            </div>

            <div class="form-control">
              <label class="label"><span class="label-text font-medium">Email Guru</span></label>
              <input 
                v-model="form.email" 
                type="email" 
                placeholder="guru@example.com" 
                class="input input-bordered w-full" 
                required
              />
            </div>
          </div>

          <div class="pt-2 flex justify-end gap-3">
            <button type="submit" class="btn btn-primary px-6" :disabled="isSubmitting">
              <span v-if="isSubmitting" class="loading loading-spinner loading-xs"></span>
              Simpan Profil Guru
            </button>
          </div>
        </form>
      </div>

      <!-- Form 2: Kelola Kelas yang Diajar -->
      <div class="bg-white rounded-2xl shadow border border-gray-100 p-6 space-y-6">
        <h2 class="text-lg font-bold text-gray-800 pb-2 border-b border-gray-100 flex items-center gap-2">
          📚 Kelola Kelas yang Diajar
        </h2>

        <!-- Daftar Kelas yang Saat Ini Diajar -->
        <div>
          <h3 class="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wider">
            Kelas yang Saat Ini Diajar ({{ assignedClasses.length }})
          </h3>

          <div v-if="assignedClasses.length === 0" class="p-4 bg-gray-50 rounded-xl text-center text-gray-400 text-sm">
            Guru ini belum mengajar kelas apa pun.
          </div>

          <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div 
              v-for="cls in assignedClasses" 
              :key="cls.id"
              class="p-4 bg-blue-50/60 border border-blue-100 rounded-xl flex items-center justify-between"
            >
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-bold text-gray-800">{{ cls.name }}</span>
                  <span class="badge badge-primary badge-sm">{{ cls.level }}</span>
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  Semester: {{ cls.semester || '-' }} | TA: {{ cls.academic_year || '-' }}
                </div>
              </div>
              <button 
                type="button"
                @click="openRemoveModal(cls)"
                class="btn btn-xs btn-error btn-outline"
                title="Lepas/Hapus kelas dari guru ini"
              >
                🗑️ Lepas Kelas
              </button>
            </div>
          </div>
        </div>

        <!-- Tambahkan Kelas Baru -->
        <div class="pt-4 border-t border-gray-100">
          <h3 class="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wider">
            Tambah Kelas yang Diajar
          </h3>

          <div v-if="availableClassesToAdd.length === 0" class="text-sm text-gray-500 italic">
            Semua kelas yang ada di sistem telah diajar oleh guru ini.
          </div>

          <div v-else class="flex flex-col sm:flex-row gap-3">
            <select 
              v-model="selectedClassToAdd"
              class="select select-bordered flex-1"
            >
              <option value="" disabled>-- Pilih kelas yang ingin ditambahkan --</option>
              <option 
                v-for="cls in availableClassesToAdd" 
                :key="cls.id" 
                :value="cls.id"
              >
                {{ cls.name }} ({{ cls.level }}) - {{ cls.teacher ? `Guru saat ini: ${cls.teacher.name}` : 'Belum ada guru' }}
              </option>
            </select>
            <button 
              type="button" 
              @click="handleAddClass"
              class="btn btn-primary"
              :disabled="!selectedClassToAdd || isClassActionLoading"
            >
              <span v-if="isClassActionLoading" class="loading loading-spinner loading-xs"></span>
              ➕ Tambahkan Kelas
            </button>
          </div>
        </div>
      </div>

      <!-- Action Buttons Bottom -->
      <div class="flex justify-end gap-3">
        <button type="button" @click="handleCancel" class="btn btn-ghost">
          Kembali ke Daftar Guru
        </button>
      </div>
    </template>

    <!-- Modal Reassign Guru saat Lepas Kelas -->
    <dialog v-if="showReassignModal" class="modal modal-open">
      <div class="modal-box">
        <h3 class="font-bold text-lg text-gray-800">Lepas Kelas {{ classToReassign?.name }}</h3>
        <p class="py-3 text-sm text-gray-600">
          Setiap kelas wajib memiliki 1 guru pengampu di sistem. Silakan pilih guru pengganti untuk mengampu kelas 
          <span class="font-bold text-gray-800">{{ classToReassign?.name }}</span>:
        </p>

        <div v-if="otherTeachers.length === 0" class="alert alert-warning text-sm mb-4">
          Tidak ada guru lain di sistem. Tambahkan guru baru terlebih dahulu untuk menggantikan pengampu kelas ini.
        </div>

        <div v-else class="form-control mb-4">
          <label class="label"><span class="label-text font-medium">Pilih Guru Pengganti</span></label>
          <select v-model="replacementTeacherId" class="select select-bordered w-full">
            <option v-for="t in otherTeachers" :key="t.id" :value="t.id">
              {{ t.name }} ({{ t.email }})
            </option>
          </select>
        </div>

        <div class="modal-action">
          <button 
            type="button" 
            @click="showReassignModal = false" 
            class="btn btn-ghost"
            :disabled="reassignLoading"
          >
            Batal
          </button>
          <button 
            type="button" 
            @click="handleConfirmRemoveClass" 
            class="btn btn-error text-white"
            :disabled="!replacementTeacherId || reassignLoading"
          >
            <span v-if="reassignLoading" class="loading loading-spinner loading-xs"></span>
            Lepas & Pindahkan Kelas
          </button>
        </div>
      </div>
      <div class="modal-backdrop bg-black/50" @click="showReassignModal = false"></div>
    </dialog>
  </div>
</template>
