<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useLessonsStore } from "../../store/lessonsStore";
import { useClassesStore } from "../../store/classesStore";
import { getCurrentInstance } from 'vue';
import Swal from "sweetalert2";

const { proxy } = getCurrentInstance();
const base_url = proxy.$base_url;
const classesStore = useClassesStore();
const lessonsStore = useLessonsStore();
const router = useRouter();
const route = useRoute();
const lessonsId = ref(parseInt(route.params.id));

const isLoading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

const classes = computed(() => classesStore.classes);

const cancelEdit = () => {
  router.push("/admin/pelajaran");
};

const formData = ref({
  class_id: "",
  title: "",
  description: "",
  content: "",
  thumbnail: null,
});

const selectedLesson = computed(() => lessonsStore.selectedLesson);

// Preview URL for thumbnail
const thumbnailPreview = ref("");

const getFullThumbnailUrl = (thumbnail) => {
  if (!thumbnail) return null;
  return thumbnail.startsWith('data:') ? thumbnail : `${base_url}/${thumbnail}`;
};

// Handle file upload
const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (file) {
    try {
      formData.value.thumbnail = file;
      // Create preview URL for display
      thumbnailPreview.value = URL.createObjectURL(file);
    } catch (error) {
      console.error("Error handling file:", error);
      errorMessage.value = "Gagal mengupload gambar";
    }
  }
};

// Clear thumbnail
const clearThumbnail = () => {
  formData.value.thumbnail = null;
  thumbnailPreview.value = "";
  // Reset file input
  const fileInput = document.querySelector('input[type="file"]');
  if (fileInput) fileInput.value = "";
};

const handleSubmit = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = "";

    // Validate required fields
    const validationErrors = [];

    if (!formData.value.class_id) validationErrors.push("Kelas");
    if (!formData.value.title) validationErrors.push("Judul");
    if (!formData.value.description.trim()) validationErrors.push("Deskripsi");
    if (!formData.value.content.trim()) validationErrors.push("Konten");

    if (validationErrors.length > 0) {
      throw new Error(
        `Field berikut harus diisi: ${validationErrors.join(", ")}`
      );
    }

    // Create the request payload
    const payload = {
      class_id: parseInt(formData.value.class_id),
      title: formData.value.title.trim(),
      description: formData.value.description.trim(),
      content: formData.value.content.trim(),
    };

    // Only include thumbnail if it has changed and is a base64 string
    if (formData.value.thumbnail) {
      payload.thumbnail = formData.value.thumbnail;
    }

    // Submit the form
    const response = await lessonsStore.updateLesson(lessonsId.value, payload);

    if (response) {
      // Show success message and redirect
      await Swal.fire({
        title: "Berhasil!",
        text: "Pelajaran berhasil diperbarui",
        icon: "success",
        confirmButtonText: "OK",
      });
      
      // Redirect immediately after success
      router.push("/admin/pelajaran");
    }
  } catch (error) {
    console.error("Error updating lesson:", error);
    console.error("Server response:", error.response?.data);
    errorMessage.value =
      error.response?.data?.message ||
      error.response?.data?.errors?.[0] ||
      error.message ||
      "Terjadi kesalahan saat memperbarui pelajaran";
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  try {
    await classesStore.getClasses();
    await lessonsStore.getLessonsById(lessonsId.value);
    
    if (selectedLesson.value) {
      formData.value = {
        class_id: selectedLesson.value.class_id,
        title: selectedLesson.value.title,
        description: selectedLesson.value.description,
        content: selectedLesson.value.content,
        thumbnail: selectedLesson.value.thumbnail
      };
      thumbnailPreview.value = getFullThumbnailUrl(selectedLesson.value.thumbnail);
    }
  } catch (error) {
    console.error("Error loading lesson:", error);
    errorMessage.value = "Gagal memuat data pelajaran";
  }
});
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold">Edit Pelajaran 📚</h1>
        <p class="text-gray-500">Edit materi pelajaran terkait</p>
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
    <div v-if="isLoading" class="flex justify-center my-4">
      <div class="loading loading-spinner loading-lg text-primary"></div>
    </div>

    <!-- Form Tambah Pelajaran -->
    <form
      @submit.prevent="handleSubmit"
      class="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto"
    >
      <div class="grid grid-cols-1 gap-6">
        <!-- Pilih Kelas -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">Kelas</span>
          </label>
          <select
            v-model="formData.class_id"
            class="select select-bordered w-full focus:outline-none focus:border-primary"
            required
          >
            <option value="" disabled selected>Pilih Kelas</option>
            <option v-for="cls in classes" :key="cls.id" :value="cls.id">
              {{ cls.name }}
            </option>
          </select>
        </div>

        <!-- Judul Pelajaran -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">Judul Pelajaran</span>
          </label>
          <input
            type="text"
            v-model="formData.title"
            class="input input-bordered w-full focus:outline-none focus:border-primary"
            placeholder="Masukkan judul pelajaran"
            required
          />
        </div>

        <!-- Deskripsi -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">Deskripsi</span>
          </label>
          <textarea
            v-model="formData.description"
            class="textarea textarea-bordered min-h-[120px] w-full p-4 focus:outline-none focus:border-primary"
            placeholder="Tulis deskripsi pelajaran di sini..."
            required
          ></textarea>
          <label class="label">
            <span class="label-text-alt text-gray-500">
              Tuliskan deskripsi singkat tentang pelajaran ini
            </span>
          </label>
        </div>

        <!-- Konten -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">Konten Pelajaran</span>
          </label>
          <textarea
            v-model="formData.content"
            class="textarea textarea-bordered min-h-[300px] w-full p-4 focus:outline-none focus:border-primary"
            placeholder="Tulis konten pelajaran di sini..."
            required
          ></textarea>
          <label class="label">
            <span class="label-text-alt text-gray-500"
              >Tuliskan materi pelajaran secara lengkap</span
            >
          </label>
        </div>

        <!-- Thumbnail Input -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">Thumbnail</span>
          </label>
          <div class="flex flex-col gap-4">
            <input
              type="file"
              @change="handleFileUpload"
              accept="image/*"
              class="file-input file-input-bordered w-full focus:outline-none focus:border-primary"
            />
            <!-- Preview thumbnail -->
            <div v-if="thumbnailPreview || formData.thumbnail" class="relative w-fit">
              <img
                :src="thumbnailPreview || getFullThumbnailUrl(formData.thumbnail)"
                alt="Preview"
                class="w-32 h-32 object-cover rounded-lg border border-gray-200"
              />
              <button
                @click="clearThumbnail"
                type="button"
                class="btn btn-circle btn-xs absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 border-none text-white"
              >
                ✕
              </button>
            </div>
            <p class="text-sm text-gray-500">
              Upload gambar thumbnail untuk pelajaran (Rekomendasi: 1:1 ratio)
            </p>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="flex justify-end gap-2 mt-6 pt-4 border-t">
          <button type="button" @click="cancelEdit" class="btn btn-ghost">
            Batal
          </button>
          <button type="submit" class="btn btn-primary" :disabled="isLoading">
            <span
              v-if="isLoading"
              class="loading loading-spinner loading-sm"
            ></span>
            Simpan Perubahan
          </button>
        </div>
      </div>
    </form>
  </div>
</template>
