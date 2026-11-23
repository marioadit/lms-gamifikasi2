<script setup>
import { ref, onMounted } from "vue";
import { useStudentStore } from "../../../store/studentStore";
import { updateUserProfile } from "../../../api/userApi";
import { useRoute, useRouter } from "vue-router";

import { useAuthStore } from "../../../store/authStore";

const route = useRoute();
const router = useRouter();
const studentStore = useStudentStore();
const authStore = useAuthStore();

const studentId = route.params.id;

const form = ref({
  name: "",
  email: ""
});

const isPageLoading = ref(true);
const isSubmitting = ref(false);
const isUnauthorized = ref(false);
const errorMessage = ref(null);

onMounted(async () => {
  try {
    const student = await studentStore.getStudentById(studentId);
    if (student) {
      if (authStore.userRole === 'guru') {
        const enrolled = student.classes_enrolled;
        const isMyStudent = Array.isArray(enrolled) && enrolled.some(c => Number(c.teacher_id || c.teacher?.id || 0) === authStore.currentUserId);
        if (!isMyStudent) {
          isUnauthorized.value = true;
          errorMessage.value = "Anda tidak memiliki hak akses untuk mengubah profil siswa dari kelas lain.";
          return;
        }
      }
      form.value.name = student.name || "";
      form.value.email = student.email || "";
    }
  } catch (err) {
    errorMessage.value = "Gagal memuat data siswa";
  } finally {
    isPageLoading.value = false;
  }
});

const handleSubmit = async () => {
  isSubmitting.value = true;
  errorMessage.value = null;

  try {
    await updateUserProfile(studentId, {
      name: form.value.name,
      email: form.value.email
    });
    router.push(`/admin/users/${studentId}`);
  } catch (err) {
    errorMessage.value = typeof err === "string" ? err : (err?.response?.data?.message || err?.message || "Gagal memperbarui profil siswa");
  } finally {
    isSubmitting.value = false;
  }
};

const handleCancel = () => {
  router.push(`/admin/users/${studentId}`);
};
</script>

<template>
  <div class="p-6 max-w-2xl mx-auto">
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Ubah Profil Siswa</h1>
        <p class="text-gray-500">Ubah informasi nama dan email siswa (ID: #{{ studentId }})</p>
      </div>
      <button @click="handleCancel" class="btn btn-ghost">
        ← Kembali
      </button>
    </div>

    <div v-if="errorMessage" class="alert alert-error shadow-lg mb-6 text-white flex justify-between">
      <span>{{ errorMessage }}</span>
      <button @click="errorMessage = null" class="btn btn-ghost btn-xs">✕</button>
    </div>

    <div v-if="isPageLoading" class="flex justify-center my-8">
      <div class="loading loading-spinner loading-lg text-primary"></div>
    </div>

    <div v-else class="bg-white rounded-2xl shadow border border-gray-100 p-6">
      <form @submit.prevent="handleSubmit" class="space-y-5">
        <fieldset :disabled="isUnauthorized">
          <div class="form-control mb-4">
            <label class="label"><span class="label-text font-medium">Nama Siswa</span></label>
            <input 
              v-model="form.name" 
              type="text" 
              placeholder="Nama siswa" 
              class="input input-bordered w-full" 
              required
            />
          </div>

          <div class="form-control">
            <label class="label"><span class="label-text font-medium">Email Siswa</span></label>
            <input 
              v-model="form.email" 
              type="email" 
              placeholder="siswa@example.com" 
              class="input input-bordered w-full" 
              required
            />
          </div>
        </fieldset>

        <div class="pt-4 flex justify-end gap-3 border-t border-gray-100">
          <button type="button" @click="handleCancel" class="btn btn-ghost" :disabled="isSubmitting">
            Batal
          </button>
          <button type="submit" class="btn btn-primary px-6" :disabled="isSubmitting || isUnauthorized">
            <span v-if="isSubmitting" class="loading loading-spinner loading-xs"></span>
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
