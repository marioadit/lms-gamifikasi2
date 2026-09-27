<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useClassesStore } from '../../store/classesStore';
import { useStudentStore } from '../../store/studentStore';
import { useAuthStore } from '../../store/authStore';

const router = useRouter();
const route = useRoute();
const classesStore = useClassesStore();
const studentStore = useStudentStore();
const authStore = useAuthStore();

const userRole = computed(() => authStore.userRole);
const currentUserId = computed(() => authStore.currentUserId);

const classId = ref(parseInt(route.params.id));

// Get data from stores
const students = computed(() => studentStore.students);
const isLoading = computed(() => classesStore.loading || studentStore.loading);
const errorMessage = computed(() => classesStore.error || studentStore.error);
const successMessage = computed(() => studentStore.success);

// Memuat data kelas dan siswa
onMounted(async () => {
  await classesStore.getClassById(classId.value);
  await studentStore.getUserStudent();
  await studentStore.getClassStudents(classId.value);
});

const classData = computed(() => classesStore.selectedClass);

const canManageClass = computed(() => {
  if (userRole.value === 'admin') return true;
  if (userRole.value === 'guru' && classData.value) {
    const teacherId = Number(classData.value.teacher_id || classData.value.teacher?.id || 0);
    return teacherId === currentUserId.value;
  }
  return false;
});

// Simpan siswa yang dipilih
const saveStudents = async () => {
  if (!canManageClass.value) return;
  // Dapatkan siswa yang dipilih (hanya yang tidak disabled)
  const selectedStudentIds = students.value
    .filter(s => s.selected && !s.disabled)
    .map(s => s.id);
  
  await studentStore.saveClassStudents(classId.value, selectedStudentIds);
  
  // Redirect setelah beberapa saat jika berhasil
  if (!studentStore.error) {
    setTimeout(() => {
      router.push(`/admin/kelas/${classId.value}`);
    }, 1500);
  }
};

// Cari siswa
const searchQuery = ref('');
const filteredStudents = computed(() => {
  if (!searchQuery.value) {
    return students.value;
  }
  
  const query = searchQuery.value.toLowerCase();
  return students.value.filter(student => 
    student.name.toLowerCase().includes(query) || 
    student.email.toLowerCase().includes(query)
  );
});

// Toggle pilih semua siswa
const selectAll = ref(false);
const toggleSelectAll = () => {
  if (!canManageClass.value) return;
  selectAll.value = !selectAll.value;
  students.value.forEach(student => {
    if (!student.disabled) {
      student.selected = selectAll.value;
    }
  });
};

// Navigasi kembali
const goBackToClasses = () => {
  router.push('/admin/kelas');
};

const goBackToDetail = () => {
  router.push(`/admin/kelas/${classId.value}`);
};
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold">Siswa di Kelas</h1>
        <p v-if="classData" class="text-purple-600">{{ classData.name }} - {{ classData.level }}</p>
      </div>
      <div class="flex gap-2">
        <button @click="goBackToClasses" class="btn btn-outline">
          ← Kembali ke Kelola Kelas
        </button>
        <button @click="goBackToDetail" class="btn btn-outline btn-primary">
          Detail Kelas
        </button>
      </div>
    </div>

    <!-- Read-Only Banner for Non-Assigned Teachers -->
    <div v-if="!canManageClass && classData" class="alert alert-warning shadow-sm mb-6 flex items-center justify-between text-white">
      <span>ℹ️ Anda hanya dapat melihat daftar siswa di kelas ini karena Anda bukan wali/guru kelas yang bersangkutan.</span>
    </div>
    
    <!-- Alert Messages -->
    <div v-if="errorMessage" class="alert alert-error mb-6">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      <span>{{ errorMessage }}</span>
    </div>
    
    <div v-if="successMessage" class="alert alert-success mb-6">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      <span>{{ successMessage }}</span>
    </div>
    
    <!-- Loading indicator -->
    <div v-if="isLoading" class="flex justify-center my-12">
      <div class="loading loading-spinner loading-lg text-primary"></div>
    </div>
    
    <!-- Class Info -->
    <div v-if="classData && !isLoading" class="bg-white p-5 rounded-lg shadow-md mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h3 class="text-sm font-semibold text-gray-500">Nama Kelas</h3>
          <p class="text-lg font-medium">{{ classData.name }}</p>
        </div>
        <div>
          <h3 class="text-sm font-semibold text-gray-500">Tingkat</h3>
          <p class="text-lg font-medium">{{ classData.level }}</p>
        </div>
        <div>
          <h3 class="text-sm font-semibold text-gray-500">Guru / Wali Kelas</h3>
          <p class="text-lg font-medium">{{ classData.teacher ? classData.teacher.name : '-' }}</p>
        </div>
      </div>
    </div>
    
    <!-- Student Management Section -->
    <div v-if="!isLoading && students.length > 0">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">Daftar Siswa</h2>
        <div class="flex gap-2">
          <div class="form-control">
            <input type="text" v-model="searchQuery" placeholder="Cari siswa..." class="input input-bordered" />
          </div>
        </div>
      </div>
      
      <!-- Students List -->
      <div class="bg-white p-4 rounded-lg shadow-md">
        <div class="overflow-x-auto">
          <table class="table table-zebra w-full">
            <thead>
              <tr>
                <th width="60"></th>
                <th>Nama Siswa</th>
                <th>Email</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="student in filteredStudents" :key="student.id" :class="{ 'opacity-60': student.disabled || !canManageClass }">
                <td>
                  <input type="checkbox" class="checkbox" v-model="student.selected" :disabled="!canManageClass || student.disabled" />
                </td>
                <td class="font-medium">{{ student.name }}</td>
                <td>{{ student.email }}</td>
                <td>
                  <div v-if="student.disabled && student.enrolledClassName" class="badge badge-warning gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Terdaftar di {{ student.enrolledClassName }}
                  </div>
                  <div v-else-if="student.selected" class="badge badge-success">Terdaftar</div>
                  <div v-else class="badge badge-ghost">Belum Terdaftar</div>
                </td>
              </tr>
              <tr v-if="filteredStudents.length === 0">
                <td colspan="4" class="text-center py-4">Tidak ada siswa yang ditemukan.</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="divider"></div>
        
        <div v-if="canManageClass" class="bg-blue-50 p-3 rounded-lg mb-6">
          <p class="text-blue-600 text-sm">
            <span class="font-bold">Petunjuk:</span> Centang siswa yang ingin didaftarkan ke kelas ini. Siswa yang sudah terdaftar di kelas lain tidak dapat dipilih.
          </p>
        </div>
        
        <div class="flex justify-end gap-3">
          <button @click="goBackToClasses" class="btn btn-outline">Kembali ke Kelola Kelas</button>
          <button v-if="canManageClass" @click="saveStudents" class="btn btn-primary" :disabled="isLoading">
            <span v-if="isLoading" class="loading loading-spinner loading-xs mr-2"></span>
            Simpan Siswa
          </button>
        </div>
      </div>
    </div>
  </div>
</template> 