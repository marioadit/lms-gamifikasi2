getLessons<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { useClassesStore } from "../../store/classesStore";
import { useLessonsStore } from "../../store/lessonsStore";
import Swal from "sweetalert2";

const route = useRoute();
const classesStore = useClassesStore();
const lessonsStore = useLessonsStore();

// Load classes when component mounts
onMounted(async () => {
  try {
    await classesStore.getClasses();
    await lessonsStore.getLessons(); // Load all lessons to get counts
  } catch (error) {
    console.error("Error loading classes:", error);
  }
});

// Also reload when navigating back to this page
watch(
  () => route.fullPath,
  async (newPath) => {
    if (newPath === "/admin/kelas") {
      try {
        await classesStore.getClasses();
        await lessonsStore.getLessons();
      } catch (error) {
        console.error("Error loading classes:", error);
      }
    }
  },
  { immediate: true }
);

const classes = computed(() => classesStore.classes.map(cls => ({
  ...cls,
  lesson_count: lessonsStore.lessons.filter(lesson => lesson.class_id === cls.id).length
})));
const isLoading = computed(() => classesStore.loading);
const errorMessage = computed(() => classesStore.error);

const isClassModalOpen = ref(false);
const formMode = ref("add");
const selectedClass = ref(null);
const classFormData = ref({
  name: "",
  level: "",
  teacher_id: null,
});

const isStudentModalOpen = ref(false);
const classIdForStudents = ref(null);

const saveClass = () => {
  isLoading.value = true;
  errorMessage.value = "";

  setTimeout(() => {
    if (formMode.value === "add") {
      const newClass = {
        id: classes.value.length + 1,
        ...classFormData.value,
        teacher: teachers.value.find(
          (t) => t.id === classFormData.value.teacher_id
        ),
        student_count: 0,
        lesson_count: 0,
      };
      classes.value.push(newClass);
    } else {
      const index = classes.value.findIndex(
        (c) => c.id === selectedClass.value.id
      );
      if (index !== -1) {
        classes.value[index] = {
          ...classes.value[index],
          ...classFormData.value,
          teacher: teachers.value.find(
            (t) => t.id === classFormData.value.teacher_id
          ),
        };
      }
    }
    isLoading.value = false;
    isClassModalOpen.value = false;
  }, 500);
};

const deleteClass = async (id) => {
  Swal.fire({
    title: "Apakah Anda yakin ingin menghapus kelas ini?",
    text: "Anda tidak akan dapat mengembalikan ini!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Ya, hapus!",
  }).then(async (result) => {
    if (result.isConfirmed) {
      await classesStore.deleteClass(id);
      Swal.fire({
        title: "Berhasil!",
        text: "Kelas berhasil dihapus.",
        icon: "success",
      });
    }
  });
};

const saveStudents = () => {
  isLoading.value = true;

  const selectedStudentIds = students.value
    .filter((s) => s.selected)
    .map((s) => s.id);

  setTimeout(() => {
    const classIndex = classes.value.findIndex(
      (c) => c.id === classIdForStudents.value
    );
    if (classIndex !== -1) {
      classes.value[classIndex].student_count = selectedStudentIds.length;
    }

    isLoading.value = false;
    isStudentModalOpen.value = false;
  }, 500);
};
</script>

<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold">Kelola Kelas 🏫</h1>
        <p class="text-gray-500">Buat dan kelola kelas untuk siswa</p>
      </div>
      <router-link to="/admin/kelas/tambah" class="btn btn-primary">
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
        Tambah Kelas Baru
      </router-link>
    </div>

    <div v-if="isLoading" class="flex justify-center my-4">
      <div class="loading loading-spinner loading-lg text-primary"></div>
    </div>

    <div
      v-if="errorMessage"
      class="bg-red-100 text-red-700 p-4 rounded-lg mb-6"
    >
      {{ errorMessage }}
    </div>

    <div class="overflow-x-auto bg-white rounded-lg shadow">
      <table class="table table-zebra w-full">
        <thead>
          <tr>
            <th>Nama Kelas</th>
            <th>Tingkat</th>
            <th>Guru</th>
            <th>Jumlah Siswa</th>
            <th>Jumlah Pelajaran</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cls in classes" :key="cls.id">
            <td class="font-medium">{{ cls.name }}</td>
            <td>{{ cls.level }}</td>
            <td>{{ cls.teacher ? cls.teacher.name : "Belum ada guru" }}</td>
            <td>{{ cls.student_count }}</td>
            <td>{{ cls.lesson_count || 0 }}</td>
            <td class="flex gap-2">
              <router-link
                :to="`/admin/kelas/${cls.id}`"
                class="btn btn-sm btn-ghost"
              >
                Lihat
              </router-link>
              <router-link
                :to="`/admin/kelas/${cls.id}/siswa`"
                class="btn btn-sm btn-info"
              >
                Siswa
              </router-link>
              <router-link
                :to="`/admin/kelas/${cls.id}/pelajaran`"
                class="btn btn-sm btn-success"
              >
                Pelajaran
              </router-link>
              <router-link
                :to="`/admin/kelas/edit/${cls.id}`"
                class="btn btn-sm btn-warning"
              >
                Edit
              </router-link>
              <button @click="deleteClass(cls.id)" class="btn btn-sm btn-error">
                Hapus
              </button>
            </td>
          </tr>
          <tr v-if="classes.length === 0">
            <td colspan="6" class="text-center py-4">
              Belum ada kelas. Tambahkan kelas baru.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="isClassModalOpen"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">
          {{ formMode === "add" ? "Tambah Kelas Baru" : "Edit Kelas" }}
        </h2>

        <div class="form-control mb-4">
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

        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text font-medium">Tingkat</span>
          </label>
          <select
            v-model="classFormData.level"
            class="select select-bordered w-full"
          >
            <option v-for="level in levelOptions" :key="level" :value="level">
              {{ level }}
            </option>
          </select>
        </div>

        <div class="form-control mb-6">
          <label class="label">
            <span class="label-text font-medium">Guru</span>
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
              {{ teacher.name }}
            </option>
          </select>
        </div>

        <div class="flex justify-end gap-2">
          <button @click="isClassModalOpen = false" class="btn btn-ghost">
            Batal
          </button>
          <button
            @click="saveClass"
            class="btn btn-primary"
            :disabled="isLoading"
          >
            <span
              v-if="isLoading"
              class="loading loading-spinner loading-xs"
            ></span>
            Simpan
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="isStudentModalOpen"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white p-6 rounded-lg w-full max-w-xl">
        <h2 class="text-xl font-bold mb-4">Kelola Siswa di Kelas</h2>

        <p class="text-gray-500 mb-4">
          Pilih siswa yang ingin ditambahkan ke kelas ini.
        </p>

        <div class="mb-6 max-h-72 overflow-y-auto">
          <div
            v-for="student in students"
            :key="student.id"
            class="form-control"
          >
            <label class="label cursor-pointer">
              <div class="flex items-center gap-2">
                <input
                  type="checkbox"
                  v-model="student.selected"
                  class="checkbox checkbox-primary"
                />
                <div>
                  <div class="font-medium">{{ student.name }}</div>
                  <div class="text-sm text-gray-500">{{ student.email }}</div>
                </div>
              </div>
            </label>
          </div>
        </div>

        <div class="flex justify-end gap-2">
          <button @click="isStudentModalOpen = false" class="btn btn-ghost">
            Batal
          </button>
          <button
            @click="saveStudents"
            class="btn btn-primary"
            :disabled="isLoading"
          >
            <span
              v-if="isLoading"
              class="loading loading-spinner loading-xs"
            ></span>
            Simpan
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
