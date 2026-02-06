<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../store/authStore';
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/16/solid';
import Swal from 'sweetalert2';

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  role: 'siswa'
});

const loading = ref(false);
const error = ref('');
const showPassword = ref(false);
const showConfirmPassword = ref(false);

const register = async () => {
  error.value = '';
  loading.value = true;
  
  // Tampilkan loading animation yang menarik untuk anak SD
  const loadingSwal = Swal.fire({
    title: 'Tunggu sebentar ya...',
    text: 'Kakak sedang mendaftarkan akun kamu',
    imageUrl: 'https://raw.githubusercontent.com/sweetalert2/sweetalert2/main/assets/swal2-logo.png',
    imageWidth: 100,
    imageHeight: 100,
    imageAlt: 'Ilustrasi Belajar',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
  
  try {
    await authStore.register(form);
    
    // Tutup loading
    loadingSwal.close();
    
    // Tampilkan pesan sukses dengan gambar dan bahasa yang ramah anak
    await Swal.fire({
      title: 'Hore! Pendaftaran Berhasil!',
      text: 'Akunmu sudah siap, ayo mulai belajar!',
      icon: 'success',
      confirmButtonText: 'Oke!',
      confirmButtonColor: '#7e22ce',
      background: '#fff',
      backdrop: `rgba(124, 58, 237, 0.1)`,
      allowOutsideClick: false,
    });
    
    // Redirect to login after successful registration
    router.push('/login');
  } catch (err) {
    // Tutup loading
    loadingSwal.close();
    
    // Tampilkan pesan error dengan bahasa sederhana
    error.value = err?.message || 'Pendaftaran gagal. Silakan coba lagi.';
    
    await Swal.fire({
      title: 'Ups! Ada masalah',
      text: error.value,
      icon: 'error',
      confirmButtonText: 'Coba Lagi',
      confirmButtonColor: '#7e22ce',
      background: '#fff',
    });
  } finally {
    loading.value = false;
  }
};

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value;
};
</script>

<template>
  <div class="min-h-screen bg-blue-50 flex items-center justify-center p-4">
    <div class="card bg-white shadow-xl max-w-lg w-full rounded-3xl">
      <div class="card-body p-8">
        <!-- Logo & Header -->
        <div class="flex flex-col items-center mb-8">
          <div class="bg-purple-100 rounded-full p-6 mb-4">
            <img src="../../assets/images/sm.png" alt="Learning Adventure Logo" class="w-16 h-16" 
              onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLW1vcnRhcmJvYXJkIj48cGF0aCBkPSJNNSA3QzkgNSAxMCA0IDEyIDQgYzIgMCAzIDEgNyAzIC00IDItNSAzLTcgMy0yIDAtMy0xLTctMyIvPjxwYXRoIGQ9Ik0xMSAxNlY3Ii8+PHBhdGggZD0iTTcgMTB2NGMwIDQgMyA2IDcgNnM3LTIgNy02di00Ii8+PC9zdmc+';" />
          </div>
          
          <h2 class="text-3xl font-bold text-slate-900">Petualangan Belajar</h2>
          <p class="text-purple-500 text-center mt-2 text-lg">Ayo bergabung dan mulai belajar bersama!</p>
        </div>
        
        <!-- Error message -->
        <div v-if="error" class="alert bg-red-100 text-red-700 p-4 rounded-xl mb-6 text-lg">
          <div class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-8 w-8 mr-2" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{{ error }}</span>
          </div>
        </div>
        
        <!-- Registration Form -->
        <form @submit.prevent="register" class="space-y-6">
          <div class="form-control">
            <label class="block mb-2">
              <span class="text-lg font-semibold text-slate-900">Nama Lengkap</span>
            </label>
            <input 
              type="text" 
              v-model="form.name" 
              placeholder="Budi Siswa" 
              class="w-full p-4 text-lg border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:ring focus:ring-purple-200 focus:outline-none" 
              required 
            />
          </div>
          
          <div class="form-control">
            <label class="block mb-2">
              <span class="text-lg font-semibold text-slate-900">Email</span>
            </label>
            <input 
              type="email" 
              v-model="form.email" 
              placeholder="budi@example.com" 
              class="w-full p-4 text-lg border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:ring focus:ring-purple-200 focus:outline-none" 
              required 
            />
          </div>
          
          <div class="form-control relative">
            <label class="block mb-2">
              <span class="text-lg font-semibold text-slate-900">Kata Sandi</span>
            </label>
            <div class="relative">
              <input 
                :type="showPassword ? 'text' : 'password'" 
                v-model="form.password" 
                placeholder="••••••••" 
                class="w-full p-4 text-lg border-2 border-purple-200 rounded-xl pr-24 focus:border-purple-400 focus:ring focus:ring-purple-200 focus:outline-none" 
                required 
              />
              <button 
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 bg-purple-100 hover:bg-purple-200 text-slate-900 rounded-lg px-3 py-2 flex items-center gap-1"
                @click="togglePasswordVisibility"
              >
                <EyeIcon v-if="!showPassword" class="w-6 h-6" />
                <EyeSlashIcon v-else class="w-6 h-6" />
                <span class="text-sm font-medium">{{ showPassword ? 'Tutup' : 'Lihat' }}</span>
              </button>
            </div>
            <p class="text-slate-900 text-sm mt-1">Kata sandi rahasia kamu</p>
          </div>
          
          <div class="form-control relative">
            <label class="block mb-2">
              <span class="text-lg font-semibold text-slate-900">Ulangi Kata Sandi</span>
            </label>
            <div class="relative">
              <input 
                :type="showConfirmPassword ? 'text' : 'password'" 
                v-model="form.password_confirmation" 
                placeholder="••••••••" 
                class="w-full p-4 text-lg border-2 border-purple-200 rounded-xl pr-24 focus:border-purple-400 focus:ring focus:ring-purple-200 focus:outline-none" 
                required 
              />
              <button 
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 bg-purple-100 hover:bg-purple-200 text-slate-900 rounded-lg px-3 py-2 flex items-center gap-1"
                @click="toggleConfirmPasswordVisibility"
              >
                <EyeIcon v-if="!showConfirmPassword" class="w-6 h-6" />
                <EyeSlashIcon v-else class="w-6 h-6" />
                <span class="text-sm font-medium">{{ showConfirmPassword ? 'Tutup' : 'Lihat' }}</span>
              </button>
            </div>
            <p class="text-slate-900 text-sm mt-1">Tulis ulang kata sandi yang sama</p>
          </div>
          
          <button 
            type="submit" 
            class="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xl py-4 px-6 rounded-xl mt-8 transition duration-300 shadow-lg"
            :class="{ 'opacity-70 cursor-not-allowed': loading }" 
            :disabled="loading"
          >
            {{ loading ? 'Sedang Mendaftar...' : 'Daftar Sekarang!' }}
          </button>

          <div class="text-center mt-4">
            <p class="text-lg text-slate-900">
              Sudah punya akun? 
              <router-link to="/login" class="font-bold text-purple-600 hover:underline">Masuk di sini</router-link>
            </p>
          </div>
        </form>
      </div>
    </div>
  </div>
</template> 