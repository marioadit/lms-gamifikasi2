<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../../store/userStore';
import { useClassesStore } from '../../store/users/classesStore';
import Swal from 'sweetalert2';

const router = useRouter();
const userStore = useUserStore();
const classesStore = useClassesStore();
const isLoading = ref(true);
const isEditing = ref(false);

// Form data for editing
const editForm = ref({
  name: '',
  email: ''
});

// Get current class info
const currentClass = computed(() => {
  if (classesStore.classes && classesStore.classes.length > 0) {
    return classesStore.classes[0];
  }
  return null;
});

// Load user and class data
const loadProfileData = async () => {
  try {
    isLoading.value = true;
    await Promise.all([
      userStore.getUserProfile(),
      classesStore.getClassUser()
    ]);
    // Initialize edit form with current values
    editForm.value = {
      name: userStore.userProfile?.name || '',
      email: userStore.userProfile?.email || ''
    };
  } catch (error) {
    console.error('Error loading profile data:', error);
    Swal.fire({
      icon: 'error',
      title: 'Gagal memuat profil',
      text: 'Terjadi kesalahan saat memuat data profil'
    });
  } finally {
    isLoading.value = false;
  }
};

const startEditing = () => {
  editForm.value = {
    name: userStore.userProfile?.name || '',
    email: userStore.userProfile?.email || ''
  };
  isEditing.value = true;
};

const cancelEditing = () => {
  isEditing.value = false;
  editForm.value = {
    name: userStore.userProfile?.name || '',
    email: userStore.userProfile?.email || ''
  };
};

const saveProfile = async () => {
  try {
    await userStore.updateUserProfile(userStore.userProfile.id, editForm.value);
    // Reload the profile data after successful update
    await userStore.getUserProfile();
    isEditing.value = false;
    Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'Profil berhasil diperbarui'
    });
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: 'Gagal memperbarui profil'
    });
  }
};

onMounted(() => {
  loadProfileData();
});

const handleLogout = () => {
  Swal.fire({
    title: "Apakah kamu yakin ingin keluar dari akunmu?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Ya, keluar!",
  }).then((result) => {
    if (result.isConfirmed) {
      userStore.handleLogout();
      router.push("/login");
    }
  });
};
</script>

<template>
  <div class="p-4 bg-blue-50 min-h-screen">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center min-h-[400px]">
      <div class="loading loading-spinner loading-lg text-purple-600"></div>
      <p class="mt-4 text-lg text-gray-600">Memuat data profil...</p>
    </div>

    <div v-else>
      <!-- Profile Header -->
      <div class="bg-white p-6 rounded-3xl shadow-md mb-6">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-slate-900 mb-2">Profil Saya 👨‍🎓</h1>
            <p class="text-purple-600">Selamat datang di halaman profilmu!</p>
          </div>
          <button 
            v-if="!isEditing"
            @click="startEditing"
            class="btn btn-primary btn-sm"
          >
            Edit Profil
          </button>
        </div>
      </div>
      
      <!-- Profile Card -->
      <div class="bg-white p-6 rounded-3xl shadow-md mb-6">
        <div class="flex items-center gap-5">
          <div class="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center text-4xl">
            👨‍🎓
          </div>
          <div class="flex-1">
            <div v-if="!isEditing">
              <h2 class="text-2xl font-bold text-gray-800">
                {{ userStore.userProfile?.name || 'Nama Siswa' }}
              </h2>
              <p class="text-gray-500 mb-2">{{ userStore.userProfile?.email || 'Email tidak ditemukan' }}</p>
            </div>
            <div v-else class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                <input 
                  v-model="editForm.name"
                  type="text"
                  class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Masukkan nama"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  v-model="editForm.email"
                  type="email"
                  class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Masukkan email"
                />
              </div>
              <div class="flex gap-2">
                <button 
                  @click="saveProfile"
                  class="btn btn-primary btn-sm"
                >
                  Simpan
                </button>
                <button 
                  @click="cancelEditing"
                  class="btn btn-ghost btn-sm"
                >
                  Batal
                </button>
              </div>
            </div>
            
            <!-- Class Info -->
            <div v-if="currentClass" class="bg-purple-50 px-4 py-2 rounded-xl inline-flex items-center gap-2 mt-2">
              <span class="text-purple-600">🏫</span>
              <span class="font-medium text-purple-700">{{ currentClass.name }}</span>
            </div>
          </div>
        </div>

        <!-- Additional User Info -->
        <div v-if="!isEditing" class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-gray-50 p-4 rounded-xl">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-gray-600">👤</span>
              <span class="font-medium text-gray-700">Username</span>
            </div>
            <p class="text-gray-800">{{ userStore.userProfile?.name || '-' }}</p>
          </div>

          <div class="bg-gray-50 p-4 rounded-xl">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-gray-600">📧</span>
              <span class="font-medium text-gray-700">Email</span>
            </div>
            <p class="text-gray-800">{{ userStore.userProfile?.email || '-' }}</p>
          </div>

          <div class="bg-gray-50 p-4 rounded-xl">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-gray-600">👨‍🏫</span>
              <span class="font-medium text-gray-700">Wali Kelas</span>
            </div>
            <p class="text-gray-800">{{ currentClass?.teacher?.name || '-' }}</p>
          </div>

          <div class="bg-gray-50 p-4 rounded-xl">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-gray-600">📅</span>
              <span class="font-medium text-gray-700">Bergabung Sejak</span>
            </div>
            <p class="text-gray-800">
              {{ userStore.userProfile?.created_at ? new Date(userStore.userProfile.created_at).toLocaleDateString('id-ID', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }) : '-' }}
            </p>
          </div>
        </div>
      </div>
      
      <!-- Account Actions -->
      <div class="space-y-4">
        <!-- Logout Button -->
        <button @click="handleLogout" 
          class="w-full bg-red-500 hover:bg-red-600 text-white p-4 rounded-xl font-bold transition-colors duration-200 flex items-center justify-center gap-2">
          <span>Keluar dari Akun</span>
          <span>👋</span>
        </button>
      </div>
    </div>
  </div>
</template> 