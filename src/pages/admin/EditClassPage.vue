<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useClassesStore } from "../../store/classesStore";

const classesStore = useClassesStore();
const router = useRouter();
const route = useRoute();
const classId = ref(parseInt(route.params.id));

// Loading state
const isLoading = ref(true);
const errorMessage = ref("");
const successMessage = ref("");

// Data form kelas (initial empty values)
const classFormData = ref({
  name: "",
  level: "",
  teacher_id: null,
  semester: "",
});

// Tahun Ajaran split fields
const academicYear1 = ref(null);
const academicYear2 = computed(() => {
  return academicYear1.value ? academicYear1.value + 1 : null;
});

// Generate year options (current year - 2 to current year + 5)
const currentYear = new Date().getFullYear();
const yearOptions = computed(() => {
  const years = [];
  for (let y = currentYear - 2; y <= currentYear + 5; y++) {
    years.push(y);
  }
  return years;
});

// Computed properties from store
const teachers = computed(() => classesStore.teachers);
const selectedClass = computed(() => classesStore.selectedClass);

// Load data when component mounts
onMounted(async () => {
  isLoading.value = true;
  await classesStore.getTeachers();
  await classesStore.getClassById(classId.value);
  isLoading.value = false;
});

// Watch for selectedClass changes to update form
watch(selectedClass, (newValue) => {
  if (newValue) {
    classFormData.value = {
      name: newValue.name,
      level: newValue.level,
      teacher_id: newValue.teacher_id,
      semester: newValue.semester || "",
    };
    // Parse academic_year "2025/2026" into academicYear1
    if (newValue.academic_year) {
      const parts = newValue.academic_year.split('/');
      academicYear1.value = parseInt(parts[0]) || null;
    } else {
      academicYear1.value = null;
    }
  }
}, { immediate: true });

// Simpan perubahan kelas
const saveClass = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  // Validasi data
  if (!classFormData.value.name) {
    errorMessage.value = "Nama kelas tidak boleh kosong";
    isLoading.value = false;
    return;
  }

  if (!classFormData.value.level) {
    errorMessage.value = "Tingkat kelas harus dipilih";
    isLoading.value = false;
    return;
  }

  if (!classFormData.value.teacher_id) {
    errorMessage.value = "Guru harus dipilih";
    isLoading.value = false;
    return;
  }

  if (!classFormData.value.semester) {
    errorMessage.value = "Semester harus dipilih";
    isLoading.value = false;
    return;
  }

  if (!academicYear1.value) {
    errorMessage.value = "Tahun ajaran harus dipilih";
    isLoading.value = false;
    return;
  }

  try {
    const submitData = {
      ...classFormData.value,
      academic_year: `${academicYear1.value}/${academicYear2.value}`,
    };
    await classesStore.updateClass(classId.value, submitData);
    successMessage.value = "Kelas berhasil diperbarui!";
    
    // Wait 1.5 seconds, then refresh data and navigate back
    setTimeout(() => {
      classesStore.getClasses();
      router.push("/admin/kelas");
    }, 1500);
  } catch (error) {
    console.error("Error updating class:", error);
    errorMessage.value = error.message || "Gagal menyimpan perubahan kelas";
  } finally {
    isLoading.value = false;
  }
};

// Batalkan dan kembali ke daftar kelas
const cancelEdit = () => {
  router.push("/admin/kelas");
};
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold">Edit Kelas ✏️</h1>
        <p v-if="selectedClass" class="text-purple-600">
          {{ selectedClass.name }}
        </p>
      </div>
      <button @click="cancelEdit" class="btn btn-outline">
        Kembali ke Daftar
      </button>
    </div>

    <!-- Alert Messages -->
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

    <div v-if="successMessage" class="alert alert-success mb-6">
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
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>{{ successMessage }}</span>
    </div>

    <!-- Loading indicator -->
    <div v-if="isLoading" class="flex justify-center my-12">
      <div class="loading loading-spinner loading-lg text-primary"></div>
    </div>

    <!-- Form Edit Kelas -->
    <div
      v-if="!isLoading && selectedClass"
      class="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto"
    >
      <div class="form-control mb-6">
        <label class="label">
          <span class="label-text font-medium">Nama Kelas</span>
        </label>
        <input
          v-model="classFormData.name"
          type="text"
          class="input input-bordered w-full"
          placeholder="Contoh: Kelas 3A Matematika"
        />
      </div>

      <div class="form-control mb-6">
        <label class="label">
          <span class="label-text font-medium">Tingkat</span>
        </label>
        <select
          v-model="classFormData.level"
          class="select select-bordered w-full"
        >
          <option value="" disabled>Pilih Tingkat</option>
          <option value="kelas 1">Kelas 1</option>
          <option value="kelas 2">Kelas 2</option>
          <option value="kelas 3">Kelas 3</option>
          <option value="kelas 4">Kelas 4</option>
          <option value="kelas 5">Kelas 5</option>
          <option value="kelas 6">Kelas 6</option>
        </select>
      </div>

      <div class="form-control mb-6">
        <label class="label">
          <span class="label-text font-medium">Guru Pengajar</span>
        </label>
        <select
          v-model="classFormData.teacher_id"
          class="select select-bordered w-full"
        >
          <option :value="null" disabled>Pilih Guru</option>
          <option
            v-for="teacher in teachers"
            :key="teacher.id"
            :value="teacher.id"
          >
            {{ teacher.name }} ({{ teacher.email }})
          </option>
        </select>
      </div>

      <div class="form-control mb-6">
        <label class="label">
          <span class="label-text font-medium">Semester</span>
        </label>
        <select
          v-model="classFormData.semester"
          class="select select-bordered w-full"
        >
          <option value="" disabled>Pilih Semester</option>
          <option value="gasal">Gasal</option>
          <option value="genap">Genap</option>
        </select>
      </div>

      <div class="form-control mb-6">
        <label class="label">
          <span class="label-text font-medium">Tahun Ajaran</span>
        </label>
        <div class="flex items-center gap-2">
          <select
            v-model="academicYear1"
            class="select select-bordered flex-1"
          >
            <option :value="null" disabled>Pilih Tahun</option>
            <option
              v-for="year in yearOptions"
              :key="year"
              :value="year"
            >
              {{ year }}
            </option>
          </select>
          <span class="text-lg font-bold">/</span>
          <input
            :value="academicYear2"
            type="text"
            class="input input-bordered flex-1 bg-gray-100"
            readonly
            :placeholder="academicYear2 ? '' : 'Otomatis'"
          />
        </div>
      </div>

      <div class="flex justify-end gap-4">
        <button @click="cancelEdit" class="btn btn-outline">Batal</button>
        <button
          @click="saveClass"
          class="btn btn-primary"
          :disabled="isLoading"
        >
          <span
            v-if="isLoading"
            class="loading loading-spinner loading-xs mr-2"
          ></span>
          Simpan Perubahan
        </button>
      </div>
    </div>
  </div>
</template>
