<script setup>
import { ref, onMounted } from "vue";
import { getUserById, updateUserPassword } from "../../../api/userApi";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const teacherId = route.params.id;
const teacherName = ref("");

const form = ref({
  current_password: "password",
  password: "password",
  password_confirmation: "password"
});

const isPageLoading = ref(true);
const isSubmitting = ref(false);
const errorMessage = ref(null);

onMounted(async () => {
  try {
    const res = await getUserById(teacherId);
    const teacher = res.data || res;
    if (teacher) {
      teacherName.value = teacher.name || "";
    }
  } catch (err) {
    console.error(err);
  } finally {
    isPageLoading.value = false;
  }
});

const handleSubmit = async () => {
  isSubmitting.value = true;
  errorMessage.value = null;

  try {
    await updateUserPassword(teacherId, {
      current_password: form.value.current_password,
      password: form.value.password,
      password_confirmation: form.value.password_confirmation
    });
    router.push(`/admin/users/guru/${teacherId}`);
  } catch (err) {
    errorMessage.value = typeof err === "string" ? err : (err?.response?.data?.message || err?.message || "Gagal memperbarui password guru");
  } finally {
    isSubmitting.value = false;
  }
};

const handleCancel = () => {
  router.push(`/admin/users/guru/${teacherId}`);
};
</script>

<template>
  <div class="p-6 max-w-2xl mx-auto">
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Ubah Password Guru</h1>
        <p class="text-gray-500">Ubah password untuk akun guru: <strong>{{ teacherName || `#${teacherId}` }}</strong></p>
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
        <div class="form-control">
          <label class="label"><span class="label-text font-medium">Password Saat Ini</span></label>
          <input 
            v-model="form.current_password" 
            type="text" 
            class="input input-bordered w-full" 
            required
          />
        </div>

        <div class="form-control">
          <label class="label"><span class="label-text font-medium">Password Baru</span></label>
          <input 
            v-model="form.password" 
            type="text" 
            class="input input-bordered w-full" 
            required
          />
        </div>

        <div class="form-control">
          <label class="label"><span class="label-text font-medium">Konfirmasi Password Baru</span></label>
          <input 
            v-model="form.password_confirmation" 
            type="text" 
            class="input input-bordered w-full" 
            required
          />
        </div>

        <div class="pt-4 flex justify-end gap-3 border-t border-gray-100">
          <button type="button" @click="handleCancel" class="btn btn-ghost" :disabled="isSubmitting">
            Batal
          </button>
          <button type="submit" class="btn btn-primary px-6" :disabled="isSubmitting">
            <span v-if="isSubmitting" class="loading loading-spinner loading-xs"></span>
            Simpan Password
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
