<script setup>
import { useRouter } from "vue-router";
import { ref, onMounted, computed } from "vue";
import { useLessonsStore } from "../../../store/lessonsStore";
import { useQuizStore } from "../../../store/quizStore";
import Swal from "sweetalert2";

const router = useRouter();

const quizStore = useQuizStore();

const lessonsStore = useLessonsStore();

const loadLessons = async () => {
  await lessonsStore.getLessons();
};

const lessons = computed(() => lessonsStore.lessons);

onMounted(async () => {
  await loadLessons();
});

const quizFormData = ref({
  lesson_id: "",
  title: "",
  description: "",
  start_time: "",
  end_time: "",
  is_active: 1,
});

const isLoading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

const handleSubmit = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = "";
    successMessage.value = "";

    await quizStore.createQuiz(quizFormData.value);

    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      },
    });
    Toast.fire({
      icon: "success",
      title: "Kuis berhasil ditambahkan",
    });

    router.push("/admin/kuis");
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    isLoading.value = false;
  }
};

const cancelAdd = () => {
  router.push("/admin/kuis");
};
</script>

<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <button @click="cancelAdd" class="btn btn-outline">
        Kembali ke Kuis
      </button>
    </div>

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
    <div v-if="isLoading" class="flex justify-center my-4">
      <div class="loading loading-spinner loading-lg text-primary"></div>
    </div>

    <!-- Form Tambah Kuis -->
    <div class="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
      <div class="form-control mb-6">
        <div class="text-center mb-6">
          <h1 class="text-2xl font-bold">Tambah Kuis Baru 📝</h1>
          <p class="text-gray-500">Buat kuis baru dan pilih pelajaran</p>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="form-control mb-6">
            <label class="label">
              <span class="label-text font-medium">Pelajaran</span>
            </label>
            <select
              class="select select-bordered w-full"
              v-model="quizFormData.lesson_id"
              :disabled="lessons.length === 0"
            >
              <option value="" disabled>
                {{
                  lessons.length > 0 ? "Pilih Pelajaran" : "Belum ada pelajaran"
                }}
              </option>
              <option
                v-for="lesson in lessons"
                :key="lesson.id"
                :value="lesson.id"
              >
                {{ lesson.title }}
              </option>
            </select>
            <p class="text-sm text-gray-500">
              <span v-if="lessons.length === 0">
                Belum ada pelajaran. Silakan tambahkan pelajaran terlebih
                dahulu.
              </span>
            </p>
          </div>

          <div class="form-control mb-6">
            <label class="label">
              <span class="label-text font-medium">Nama Kuis</span>
            </label>
            <input
              v-model="quizFormData.title"
              type="text"
              class="input input-bordered w-full"
              placeholder="Contoh: Kuis 1"
            />
          </div>

          <div class="form-control mb-6">
            <label class="label">
              <span class="label-text font-medium">Deskripsi</span>
            </label>
            <textarea
              v-model="quizFormData.description"
              class="textarea textarea-bordered w-full"
              placeholder="Contoh: Kuis 1 adalah kuis yang berisi soal-soal matematika"
            ></textarea>
          </div>

          <div class="form-control mb-6">
            <label class="label">
              <span class="label-text font-medium">Waktu Mulai</span>
            </label>
            <input
              v-model="quizFormData.start_time"
              type="datetime-local"
              class="input input-bordered w-full"
            />
          </div>

          <div class="form-control mb-6">
            <label class="label">
              <span class="label-text font-medium">Waktu Selesai</span>
            </label>
            <input
              v-model="quizFormData.end_time"
              type="datetime-local"
              class="input input-bordered w-full"
            />
          </div>

          <div class="form-control mb-6">
            <label class="label">
              <span class="label-text font-medium">Aktif</span> &nbsp;
            </label>
            <input
              v-model="quizFormData.is_active"
              :checked="true"
              type="checkbox"
              class="toggle toggle-primary"
            />
          </div>

          <div class="flex justify-end gap-4">
            <button @click="cancelAdd" class="btn btn-outline">Batal</button>
            <button class="btn btn-primary" :disabled="isLoading">
              <span
                v-if="isLoading"
                class="loading loading-spinner loading-xs mr-2"
              ></span>
              Simpan Kuis
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
