<script setup>
import { ref, onMounted } from "vue";
import { getAdminProfileAPI, updateUserProfile, updateUserPassword, resetUserPassword } from "../../../api/userApi";
import Swal from "sweetalert2";

const loading = ref(true);
const savingProfile = ref(false);
const savingPassword = ref(false);
const resettingPassword = ref(false);

const user = ref({
  id: null,
  name: "",
  email: "",
  role: "",
});

// Profile Form State
const profileForm = ref({
  name: "",
  email: "",
});

// Password Form State
const passwordForm = ref({
  current_password: "",
  password: "",
  password_confirmation: "",
});

const loadProfile = async () => {
  try {
    loading.value = true;
    const res = await getAdminProfileAPI();
    const data = res?.data || res;
    if (data) {
      user.value = data;
      profileForm.value.name = data.name || "";
      profileForm.value.email = data.email || "";
    }
  } catch (err) {
    console.error("Error loading profile:", err);
    Swal.fire({
      icon: "error",
      title: "Gagal Memuat Profil",
      text: err?.response?.data?.message || err?.message || "Terjadi kesalahan saat memuat data profil.",
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadProfile();
});

// Handle Profile Update
const handleUpdateProfile = async () => {
  if (!profileForm.value.name.trim()) {
    Swal.fire({ icon: "warning", title: "Peringatan", text: "Nama tidak boleh kosong!" });
    return;
  }

  try {
    savingProfile.value = true;
    const res = await updateUserProfile(user.value.id, {
      name: profileForm.value.name,
      email: profileForm.value.email,
    });

    if (res) {
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Profil Anda berhasil diperbarui.",
        timer: 2000,
        showConfirmButton: false,
      });
      await loadProfile();
    }
  } catch (err) {
    console.error("Error updating profile:", err);
    Swal.fire({
      icon: "error",
      title: "Gagal Memperbarui Profil",
      text: err?.response?.data?.message || err?.message || "Terjadi kesalahan saat menyimpan profil.",
    });
  } finally {
    savingProfile.value = false;
  }
};

// Handle Change Password
const handleChangePassword = async () => {
  if (!passwordForm.value.current_password) {
    Swal.fire({ icon: "warning", title: "Peringatan", text: "Masukkan password saat ini!" });
    return;
  }

  if (!passwordForm.value.password || passwordForm.value.password.length < 8) {
    Swal.fire({ icon: "warning", title: "Peringatan", text: "Password baru minimal 8 karakter!" });
    return;
  }

  if (passwordForm.value.password !== passwordForm.value.password_confirmation) {
    Swal.fire({ icon: "warning", title: "Peringatan", text: "Konfirmasi password baru tidak cocok!" });
    return;
  }

  try {
    savingPassword.value = true;
    const res = await updateUserPassword(user.value.id, {
      current_password: passwordForm.value.current_password,
      password: passwordForm.value.password,
      password_confirmation: passwordForm.value.password_confirmation,
    });

    if (res) {
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: res.message || "Password Anda berhasil diubah.",
      });

      // Clear password fields
      passwordForm.value.current_password = "";
      passwordForm.value.password = "";
      passwordForm.value.password_confirmation = "";
    }
  } catch (err) {
    console.error("Error changing password:", err);
    Swal.fire({
      icon: "error",
      title: "Gagal Mengubah Password",
      text: err?.response?.data?.message || err?.message || "Password saat ini mungkin salah.",
    });
  } finally {
    savingPassword.value = false;
  }
};

// Handle Reset Password to Default
const handleResetPassword = async () => {
  const confirm = await Swal.fire({
    title: "Reset Password?",
    text: "Password Anda akan direset ke password default sistem. Apakah Anda yakin?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Ya, Reset Password",
    cancelButtonText: "Batal",
  });

  if (!confirm.isConfirmed) return;

  try {
    resettingPassword.value = true;
    const res = await resetUserPassword(user.value.id);

    Swal.fire({
      icon: "success",
      title: "Password Berhasil Direset!",
      text: res.message || "Password telah direset ke password default.",
    });
  } catch (err) {
    console.error("Error resetting password:", err);
    Swal.fire({
      icon: "error",
      title: "Gagal Reset Password",
      text: err?.response?.data?.message || err?.message || "Terjadi kesalahan saat mereset password.",
    });
  } finally {
    resettingPassword.value = false;
  }
};
</script>

<template>
  <div class="p-6 space-y-6 max-w-5xl mx-auto">
    <!-- Header -->
    <div class="flex justify-between items-center border-b pb-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Profil Saya 👤</h1>
        <p class="text-gray-500 text-sm">Kelola data profil, ganti password, dan pengaturan akun Anda</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center my-12">
      <div class="loading loading-spinner loading-lg text-primary"></div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Left Column: Summary Card -->
      <div class="md:col-span-1 space-y-6">
        <div class="bg-white p-6 rounded-2xl shadow border border-gray-100 text-center space-y-4">
          <div class="w-24 h-24 mx-auto bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl shadow-md">
            👤
          </div>

          <div>
            <h2 class="text-xl font-bold text-gray-800">{{ user.name }}</h2>
            <p class="text-sm text-gray-500">{{ user.email }}</p>
          </div>

          <div>
            <span class="badge badge-primary badge-lg uppercase tracking-wider font-semibold">
              {{ user.role || 'Admin' }}
            </span>
          </div>

          <div class="text-xs text-gray-400 pt-2 border-t">
            ID Pengguna: #{{ user.id }}
          </div>
        </div>

        <!-- Quick Reset Password Info Card -->
        <div class="bg-amber-50 p-5 rounded-2xl border border-amber-200 space-y-3">
          <h3 class="font-bold text-amber-800 text-sm flex items-center gap-1.5">
            <span>🔄</span> Reset Password Default
          </h3>
          <p class="text-xs text-amber-700 leading-relaxed">
            Jika Anda lupa password atau memerlukan password default sistem, Anda dapat memilih tombol reset password di bawah ini.
          </p>
          <button 
            @click="handleResetPassword"
            class="btn btn-warning btn-block btn-sm text-amber-950 font-bold"
            :disabled="resettingPassword"
          >
            <span v-if="resettingPassword" class="loading loading-spinner loading-xs"></span>
            <span v-else>🔄 Reset Password ke Default</span>
          </button>
        </div>
      </div>

      <!-- Right Column: Edit Forms -->
      <div class="md:col-span-2 space-y-6">
        <!-- Form 1: Edit Profile Details -->
        <div class="bg-white p-6 rounded-2xl shadow border border-gray-100 space-y-4">
          <h2 class="text-lg font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
            ✏️ Ubah Informasi Profil
          </h2>

          <form @submit.prevent="handleUpdateProfile" class="space-y-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text font-semibold">Nama Lengkap</span>
              </label>
              <input 
                v-model="profileForm.name"
                type="text"
                class="input input-bordered w-full focus:input-primary"
                placeholder="Masukkan nama lengkap Anda"
                required
              />
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text font-semibold">Email</span>
              </label>
              <input 
                v-model="profileForm.email"
                type="email"
                class="input input-bordered w-full focus:input-primary"
                placeholder="Masukkan email Anda"
                required
              />
            </div>

            <div class="flex justify-end pt-2">
              <button 
                type="submit" 
                class="btn btn-primary px-6 text-white"
                :disabled="savingProfile"
              >
                <span v-if="savingProfile" class="loading loading-spinner loading-xs"></span>
                <span v-else>💾 Simpan Perubahan Profil</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Form 2: Change Password -->
        <div class="bg-white p-6 rounded-2xl shadow border border-gray-100 space-y-4">
          <h2 class="text-lg font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
            🔒 Ganti Password
          </h2>

          <form @submit.prevent="handleChangePassword" class="space-y-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text font-semibold">Password Saat Ini</span>
              </label>
              <input 
                v-model="passwordForm.current_password"
                type="password"
                class="input input-bordered w-full focus:input-primary"
                placeholder="Masukkan password saat ini"
                required
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-semibold">Password Baru</span>
                </label>
                <input 
                  v-model="passwordForm.password"
                  type="password"
                  class="input input-bordered w-full focus:input-primary"
                  placeholder="Minimal 8 karakter"
                  required
                />
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text font-semibold">Konfirmasi Password Baru</span>
                </label>
                <input 
                  v-model="passwordForm.password_confirmation"
                  type="password"
                  class="input input-bordered w-full focus:input-primary"
                  placeholder="Ulangi password baru"
                  required
                />
              </div>
            </div>

            <div class="flex justify-end pt-2">
              <button 
                type="submit" 
                class="btn btn-success px-6 text-white"
                :disabled="savingPassword"
              >
                <span v-if="savingPassword" class="loading loading-spinner loading-xs"></span>
                <span v-else>🔒 Ubah Password</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
