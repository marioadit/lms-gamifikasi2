<script setup>
import { ref } from "vue";
import { register } from "../../../api/authApi";
import { useRouter } from "vue-router";

const router = useRouter();

const form = ref({
  name: "",
  email: "",
  password: "password",
  password_confirmation: "password",
  role: "guru"
});

const isLoading = ref(false);
const errorMessage = ref(null);

const handleNameInput = () => {
  const cleanName = form.value.name.toLowerCase().replace(/[^a-z0-9]/g, "");
  form.value.email = cleanName ? `${cleanName}@example.com` : "";
};

const handleSubmit = async () => {
  isLoading.value = true;
  errorMessage.value = null;

  let finalEmail = form.value.email.trim();
  if (finalEmail && !finalEmail.includes("@")) {
    finalEmail += "@example.com";
  }

  try {
    await register({
      ...form.value,
      email: finalEmail
    });
    router.push("/admin/users/guru");
  } catch (err) {
    errorMessage.value = typeof err === "string" ? err : (err?.response?.data?.message || err?.message || "Gagal menambahkan guru");
  } finally {
    isLoading.value = false;
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
        <h1 class="text-2xl font-bold text-gray-800">Tambah Guru Baru</h1>
        <p class="text-gray-500">Lengkapi formulir untuk menambahkan data guru baru</p>
      </div>
      <button @click="handleCancel" class="btn btn-ghost">
        ← Kembali
      </button>
    </div>

    <div v-if="errorMessage" class="alert alert-error shadow-lg mb-6 text-white flex justify-between">
      <span>{{ errorMessage }}</span>
      <button @click="errorMessage = null" class="btn btn-ghost btn-xs">✕</button>
    </div>

    <div class="bg-white rounded-2xl shadow border border-gray-100 p-6">
      <form @submit.prevent="handleSubmit" class="space-y-5">
        <div class="form-control">
          <label class="label"><span class="label-text font-medium">Nama Guru</span></label>
          <input 
            v-model="form.name" 
            @input="handleNameInput"
            type="text" 
            placeholder="Contoh: guru1" 
            class="input input-bordered w-full" 
            required 
          />
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">Email</span>
            <span class="label-text-alt text-gray-400">Diakhiri @example.com</span>
          </label>
          <input 
            v-model="form.email" 
            type="email" 
            placeholder="guru1@example.com" 
            class="input input-bordered w-full" 
            required 
          />
        </div>

        <div class="form-control">
          <label class="label"><span class="label-text font-medium">Password</span></label>
          <input 
            v-model="form.password" 
            type="text" 
            class="input input-bordered w-full bg-gray-50" 
            placeholder="password"
            required 
          />
        </div>

        <div class="form-control">
          <label class="label"><span class="label-text font-medium">Konfirmasi Password</span></label>
          <input 
            v-model="form.password_confirmation" 
            type="text" 
            class="input input-bordered w-full bg-gray-50" 
            placeholder="password"
            required 
          />
        </div>

        <div class="pt-4 flex justify-end gap-3 border-t border-gray-100">
          <button type="button" @click="handleCancel" class="btn btn-ghost" :disabled="isLoading">
            Batal
          </button>
          <button type="submit" class="btn btn-primary px-6" :disabled="isLoading">
            <span v-if="isLoading" class="loading loading-spinner loading-xs"></span>
            Simpan Guru
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
