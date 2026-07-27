<script setup>
import { ref, onMounted } from "vue";
import { getUserById, updateUserProfile } from "../../../api/userApi";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const teacherId = route.params.id;

const form = ref({
  name: "",
  email: ""
});

const isPageLoading = ref(true);
const isSubmitting = ref(false);
const errorMessage = ref(null);

onMounted(async () => {
  try {
    const res = await getUserById(teacherId);
    const teacher = res.data || res;
    if (teacher) {
      form.value.name = teacher.name || "";
      form.value.email = teacher.email || "";
    }
  } catch (err) {
    errorMessage.value = "Gagal memuat data guru";
  } finally {
    isPageLoading.value = false;
  }
});

const handleSubmit = async () => {
  isSubmitting.value = true;
  errorMessage.value = null;

  try {
    await updateUserProfile(teacherId, {
      name: form.value.name,
      email: form.value.email
    });
    router.push("/admin/users/guru");
  } catch (err) {
    errorMessage.value = typeof err === "string" ? err : (err?.response?.data?.message || err?.message || "Gagal memperbarui profil guru");
  } finally {
    isSubmitting.value = false;
  }
};

const handleCancel = () => {
  router.push("/admin/users/guru");
};
</script>

<template>
  <div class="p-6 max-w-2xl mx-auto">
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Ubah Profil Guru</h1>
        <p class="text-gray-500">Ubah informasi nama dan email guru (ID: #{{ teacherId }})</p>
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

        <div class="pt-4 flex justify-end gap-3 border-t border-gray-100">
          <button type="button" @click="handleCancel" class="btn btn-ghost" :disabled="isSubmitting">
            Batal
          </button>
          <button type="submit" class="btn btn-primary px-6" :disabled="isSubmitting">
            <span v-if="isSubmitting" class="loading loading-spinner loading-xs"></span>
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
