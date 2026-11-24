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

// Tab state: 'enrolled' (Siswa di Kelas Ini) vs 'manage' (Tambah/Atur Siswa)
const activeTab = ref('enrolled');

// Batch actions state for enrolled students
const selectedBatchStudentIds = ref([]);
const targetClassId = ref('');
const targetStatus = ref('');
const isProcessing = ref(false);
const localSuccess = ref(null);
const localError = ref(null);

// Modal state
const showPromoteModal = ref(false);
const showStatusModal = ref(false);
const showRemoveModal = ref(false);
const studentToRemove = ref(null);

// Get data from stores
const students = computed(() => studentStore.students);
const enrolledStudents = computed(() => studentStore.classStudents || []);
const isLoading = computed(() => classesStore.loading || studentStore.loading);
const errorMessage = computed(() => localError.value || classesStore.error || studentStore.error);
const successMessage = computed(() => localSuccess.value || studentStore.success);

// Memuat data kelas dan siswa
onMounted(async () => {
  await Promise.all([
    classesStore.getClassById(classId.value),
    classesStore.getClasses(),
    studentStore.getUserStudent(),
    studentStore.getClassStudents(classId.value)
  ]);
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

// Helper parsing numeric level, e.g. "kelas 1" -> 1
const extractLevelNumber = (levelStr) => {
  if (!levelStr) return null;
  const match = String(levelStr).match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
};

const currentLevelNum = computed(() => {
  return extractLevelNumber(classData.value?.level);
});

// Dropdown pilihan kelas 1 tingkat di atas kelas saat ini
const nextLevelClasses = computed(() => {
  if (!currentLevelNum.value || !classesStore.classes) return [];
  const targetLevel = currentLevelNum.value + 1;
  return classesStore.classes.filter(cls => {
    if (Number(cls.id) === Number(classId.value)) return false;
    const clsLevelNum = extractLevelNumber(cls.level);
    return clsLevelNum === targetLevel;
  });
});

const selectedTargetClass = computed(() => {
  if (!targetClassId.value) return null;
  return nextLevelClasses.value.find(c => Number(c.id) === Number(targetClassId.value));
});

// Objek data siswa yang dipilih untuk batch
const selectedStudentsData = computed(() => {
  return enrolledStudents.value.filter(s => selectedBatchStudentIds.value.includes(s.id));
});

// Filter & search siswa di kelas ini
const searchQueryEnrolled = ref('');
const filteredEnrolledStudents = computed(() => {
  if (!searchQueryEnrolled.value) {
    return enrolledStudents.value;
  }
  const query = searchQueryEnrolled.value.toLowerCase();
  return enrolledStudents.value.filter(student =>
    student.name.toLowerCase().includes(query) ||
    student.email.toLowerCase().includes(query)
  );
});

// Toggle pilih semua siswa terdaftar
const isAllEnrolledSelected = computed(() => {
  if (filteredEnrolledStudents.value.length === 0) return false;
  return filteredEnrolledStudents.value.every(s => selectedBatchStudentIds.value.includes(s.id));
});

const toggleSelectAllEnrolled = () => {
  if (!canManageClass.value) return;
  if (isAllEnrolledSelected.value) {
    // Batalkan pilihan yang sedang tampil
    const filteredIds = filteredEnrolledStudents.value.map(s => s.id);
    selectedBatchStudentIds.value = selectedBatchStudentIds.value.filter(id => !filteredIds.includes(id));
  } else {
    // Pilih semua yang sedang tampil
    const newIds = new Set([
      ...selectedBatchStudentIds.value,
      ...filteredEnrolledStudents.value.map(s => s.id)
    ]);
    selectedBatchStudentIds.value = Array.from(newIds);
  }
};

const clearBatchSelection = () => {
  selectedBatchStudentIds.value = [];
};

// Batch Action: Naik Kelas
const openPromoteModalHandler = () => {
  if (selectedBatchStudentIds.value.length === 0 || !targetClassId.value) return;
  localError.value = null;
  localSuccess.value = null;
  showPromoteModal.value = true;
};

const handleConfirmPromote = async () => {
  if (selectedBatchStudentIds.value.length === 0 || !targetClassId.value) return;
  isProcessing.value = true;
  localError.value = null;
  localSuccess.value = null;
  try {
    const success = await studentStore.promoteStudentsBatch(
      targetClassId.value,
      selectedBatchStudentIds.value,
      classId.value
    );
    if (success) {
      localSuccess.value = `Berhasil menaikkan ${selectedBatchStudentIds.value.length} siswa ke kelas ${selectedTargetClass.value?.name || ''}!`;
      selectedBatchStudentIds.value = [];
      targetClassId.value = '';
      showPromoteModal.value = false;
      await classesStore.getClasses();
    } else {
      localError.value = studentStore.error || "Gagal menaikkan kelas siswa";
    }
  } catch (err) {
    localError.value = err.message || "Gagal menaikkan kelas siswa";
  } finally {
    isProcessing.value = false;
  }
};

// Batch Action: Ubah Status Siswa (Lulus / Pindah)
const openStatusModalHandler = () => {
  if (selectedBatchStudentIds.value.length === 0 || !targetStatus.value) return;
  localError.value = null;
  localSuccess.value = null;
  showStatusModal.value = true;
};

const handleConfirmStatus = async () => {
  if (selectedBatchStudentIds.value.length === 0 || !targetStatus.value) return;
  isProcessing.value = true;
  localError.value = null;
  localSuccess.value = null;
  try {
    const statusLabel = targetStatus.value === 'lulus' ? 'Lulus' : 'Pindah';
    const studentsToUpdate = selectedStudentsData.value;
    const count = studentsToUpdate.length;
    const success = await studentStore.changeStudentsStatusBatch(
      classId.value,
      studentsToUpdate,
      targetStatus.value
    );
    if (success) {
      localSuccess.value = `Berhasil mengeluarkan ${count} siswa dari kelas dan memperbarui status akun menjadi '${statusLabel}'!`;
      selectedBatchStudentIds.value = [];
      targetStatus.value = '';
      showStatusModal.value = false;
      await classesStore.getClasses();
    } else {
      localError.value = studentStore.error || "Gagal mengubah status siswa";
    }
  } catch (err) {
    localError.value = err.message || "Gagal mengubah status siswa";
  } finally {
    isProcessing.value = false;
  }
};

// Keluarkan 1 siswa dari kelas
const openRemoveModalHandler = (student) => {
  studentToRemove.value = student;
  localError.value = null;
  localSuccess.value = null;
  showRemoveModal.value = true;
};

const handleConfirmRemove = async () => {
  if (!studentToRemove.value) return;
  isProcessing.value = true;
  localError.value = null;
  localSuccess.value = null;
  try {
    const success = await studentStore.removeSingleStudentFromClass(
      classId.value,
      studentToRemove.value.id
    );
    if (success) {
      localSuccess.value = `Siswa ${studentToRemove.value.name} berhasil dikeluarkan dari kelas`;
      selectedBatchStudentIds.value = selectedBatchStudentIds.value.filter(id => id !== studentToRemove.value.id);
      studentToRemove.value = null;
      showRemoveModal.value = false;
      await classesStore.getClasses();
    } else {
      localError.value = studentStore.error || "Gagal mengeluarkan siswa dari kelas";
    }
  } catch (err) {
    localError.value = err.message || "Gagal mengeluarkan siswa dari kelas";
  } finally {
    isProcessing.value = false;
  }
};

// Tab 2: Simpan pendaftaran siswa (fitur kelola siswa asal)
const saveStudents = async () => {
  if (!canManageClass.value) return;
  const selectedStudentIds = students.value
    .filter(s => s.selected && !s.disabled)
    .map(s => s.id);
  
  await studentStore.saveClassStudents(classId.value, selectedStudentIds);
  await classesStore.getClasses();
  
  if (!studentStore.error) {
    setTimeout(() => {
      router.push(`/admin/kelas/${classId.value}`);
    }, 1500);
  }
};

// Filter Tab 2: Cari semua siswa
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

// Navigasi kembali
const goBackToClasses = () => {
  if (window.history.state && window.history.state.back) {
    router.back();
  } else {
    router.push('/admin/kelas');
  }
};

const goBackToDetail = () => {
  router.push(`/admin/kelas/${classId.value}`);
};
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-2xl font-bold text-gray-800">Siswa di Kelas</h1>
          <span v-if="classData" class="badge badge-primary font-semibold text-white">
            {{ classData.level }}
          </span>
        </div>
        <p v-if="classData" class="text-gray-500 font-medium mt-1">
          {{ classData.name }} • Semester {{ classData.semester || '-' }} • Tahun Ajaran {{ classData.academic_year || '-' }}
        </p>
      </div>
      <div class="flex gap-2">
        <button @click="goBackToClasses" class="btn btn-outline btn-sm">
          ← Kelola Kelas
        </button>
        <button @click="goBackToDetail" class="btn btn-outline btn-primary btn-sm">
          Detail Kelas
        </button>
      </div>
    </div>

    <!-- Read-Only Banner for Non-Assigned Teachers -->
    <div v-if="!canManageClass && classData" class="alert alert-warning shadow-sm mb-6 flex items-center justify-between text-white">
      <span>ℹ️ Anda hanya dapat melihat daftar siswa di kelas ini karena Anda bukan wali/guru kelas yang bersangkutan.</span>
    </div>
    
    <!-- Alert Messages -->
    <div v-if="errorMessage" class="alert alert-error mb-6 shadow-sm flex items-center justify-between">
      <div class="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>{{ errorMessage }}</span>
      </div>
      <button @click="localError = null; studentStore.error = null; classesStore.error = null;" class="btn btn-ghost btn-xs">✕</button>
    </div>
    
    <div v-if="successMessage" class="alert alert-success mb-6 shadow-sm flex items-center justify-between">
      <div class="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>{{ successMessage }}</span>
      </div>
      <button @click="localSuccess = null; studentStore.success = null;" class="btn btn-ghost btn-xs">✕</button>
    </div>
    
    <!-- Loading indicator -->
    <div v-if="isLoading && !isProcessing" class="flex justify-center my-12">
      <div class="loading loading-spinner loading-lg text-primary"></div>
    </div>
    
    <!-- Class Info Cards -->
    <div v-if="classData && !isLoading" class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm mb-6">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Nama Kelas</h3>
          <p class="text-lg font-bold text-gray-800">{{ classData.name }}</p>
        </div>
        <div>
          <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tingkat</h3>
          <p class="text-lg font-bold text-primary">{{ classData.level }}</p>
        </div>
        <div>
          <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Wali / Guru Kelas</h3>
          <p class="text-lg font-medium text-gray-700">{{ classData.teacher ? classData.teacher.name : '-' }}</p>
        </div>
        <div>
          <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Jumlah Siswa</h3>
          <p class="text-lg font-bold text-emerald-600">{{ enrolledStudents.length }} Siswa</p>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div v-if="!isLoading" class="flex border-b border-gray-200 mb-6 gap-2">
      <button 
        @click="activeTab = 'enrolled'" 
        class="py-3 px-5 font-semibold text-sm transition-all border-b-2 flex items-center gap-2"
        :class="activeTab === 'enrolled' 
          ? 'border-primary text-primary bg-primary/5 rounded-t-lg' 
          : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'"
      >
        <span>🎓 Siswa Terdaftar di Kelas</span>
        <span class="badge badge-sm" :class="activeTab === 'enrolled' ? 'badge-primary text-white' : 'badge-ghost'">
          {{ enrolledStudents.length }}
        </span>
      </button>

      <button 
        @click="activeTab = 'manage'" 
        class="py-3 px-5 font-semibold text-sm transition-all border-b-2 flex items-center gap-2"
        :class="activeTab === 'manage' 
          ? 'border-primary text-primary bg-primary/5 rounded-t-lg' 
          : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'"
      >
        <span>➕ Tambah / Kelola Anggota Kelas</span>
      </button>
    </div>

    <!-- TAB 1: SISWA TERDAFTAR DI KELAS INI (WITH BATCH ACTIONS) -->
    <div v-if="!isLoading && activeTab === 'enrolled'" class="space-y-6">
      
      <!-- BATCH ACTION CARD -->
      <div v-if="canManageClass && enrolledStudents.length > 0" class="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-5 shadow-sm">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-lg shadow-sm">
              ⚡
            </div>
            <div>
              <h2 class="text-base font-bold text-gray-800">Aksi Massal Siswa Terpilih (Batch)</h2>
              <p class="text-xs text-gray-600">Pilih siswa pada tabel di bawah untuk menaikkan kelas atau mengubah status.</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="badge badge-lg font-semibold" :class="selectedBatchStudentIds.length > 0 ? 'badge-primary text-white' : 'badge-ghost text-gray-500'">
              {{ selectedBatchStudentIds.length }} Siswa Dipilih
            </span>
            <button 
              v-if="selectedBatchStudentIds.length > 0" 
              @click="clearBatchSelection" 
              class="btn btn-ghost btn-xs text-gray-500"
            >
              Batalkan Pilihan
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <!-- Aksi 1: Naik Kelas -->
          <div class="bg-white p-4 rounded-xl border border-indigo-100 shadow-xs flex flex-col justify-between">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="text-lg">🚀</span>
                <h3 class="font-bold text-gray-800 text-sm">Naik Kelas (Batch Promotion)</h3>
              </div>
              <p class="text-xs text-gray-500 mb-3">
                Pindahkan siswa terpilih ke kelas berikutnya (satu tingkat di atas: <span class="font-semibold text-primary">Kelas {{ (currentLevelNum || 0) + 1 }}</span>).
              </p>
              
              <!-- Pilihan Kelas Tujuan -->
              <div v-if="nextLevelClasses.length > 0">
                <select 
                  v-model="targetClassId" 
                  class="select select-bordered select-sm w-full mb-3"
                  :disabled="isProcessing || selectedBatchStudentIds.length === 0"
                >
                  <option value="" disabled>-- Pilih Kelas Tujuan (+1 Tingkat) --</option>
                  <option v-for="cls in nextLevelClasses" :key="cls.id" :value="cls.id">
                    {{ cls.name }} ({{ cls.level }}) • Semester {{ cls.semester || '-' }}
                  </option>
                </select>
              </div>
              <div v-else-if="currentLevelNum === 6" class="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800 mb-3">
                ⭐ <span class="font-semibold">Kelas 6 merupakan tingkat akhir.</span> Siswa yang selesai dapat diubah statusnya menjadi <strong>Lulus</strong> pada panel sebelah kanan.
              </div>
              <div v-else class="p-2.5 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-600 mb-3">
                ℹ️ Belum ada kelas tingkat {{ (currentLevelNum || 0) + 1 }} yang dibuat. Silakan tambahkan kelas terlebih dahulu di menu Kelola Kelas.
              </div>
            </div>

            <button 
              @click="openPromoteModalHandler" 
              class="btn btn-primary btn-sm w-full text-white"
              :disabled="selectedBatchStudentIds.length === 0 || !targetClassId || nextLevelClasses.length === 0 || isProcessing"
            >
              <span v-if="isProcessing" class="loading loading-spinner loading-xs mr-1"></span>
              <span>Naik Kelas ({{ selectedBatchStudentIds.length }})</span>
            </button>
          </div>

          <!-- Aksi 2: Ubah Status Siswa (Lulus / Pindah) -->
          <div class="bg-white p-4 rounded-xl border border-indigo-100 shadow-xs flex flex-col justify-between">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="text-lg">🎓</span>
                <h3 class="font-bold text-gray-800 text-sm">Ubah Status Siswa (Lulus / Pindah)</h3>
              </div>
              <p class="text-xs text-gray-500 mb-3">
                Siswa terpilih akan <span class="font-semibold text-rose-600">dikeluarkan dari kelas</span> terlebih dahulu, lalu status profil siswa diperbarui.
              </p>

              <!-- Pilihan Status -->
              <div>
                <select 
                  v-model="targetStatus" 
                  class="select select-bordered select-sm w-full mb-3"
                  :disabled="isProcessing || selectedBatchStudentIds.length === 0"
                >
                  <option value="" disabled>-- Pilih Status Siswa --</option>
                  <option value="lulus">Lulus (Tamat Sekolah / Alumni)</option>
                  <option value="pindah">Pindah (Pindah Sekolah / Mutasi)</option>
                </select>
              </div>
            </div>

            <button 
              @click="openStatusModalHandler" 
              class="btn btn-warning btn-sm w-full text-white"
              :disabled="selectedBatchStudentIds.length === 0 || !targetStatus || isProcessing"
            >
              <span v-if="isProcessing" class="loading loading-spinner loading-xs mr-1"></span>
              <span>Ubah Status ({{ selectedBatchStudentIds.length }})</span>
            </button>
          </div>
        </div>
      </div>

      <!-- TABLE OF ENROLLED STUDENTS -->
      <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 class="text-lg font-bold text-gray-800">Daftar Siswa Kelas Ini</h2>
            <p class="text-xs text-gray-500">Total {{ enrolledStudents.length }} siswa terdaftar di kelas {{ classData ? classData.name : '' }}</p>
          </div>
          <div class="flex items-center gap-2">
            <div class="form-control">
              <input 
                type="text" 
                v-model="searchQueryEnrolled" 
                placeholder="Cari siswa di kelas..." 
                class="input input-bordered input-sm w-56" 
              />
            </div>
            <button 
              v-if="canManageClass && enrolledStudents.length > 0"
              @click="toggleSelectAllEnrolled" 
              class="btn btn-outline btn-sm"
            >
              {{ isAllEnrolledSelected ? 'Batal Pilih Semua' : 'Pilih Semua' }}
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="table w-full">
            <thead>
              <tr class="bg-gray-50 text-gray-600 text-xs uppercase">
                <th width="48" class="text-center" v-if="canManageClass">
                  <input 
                    type="checkbox" 
                    class="checkbox checkbox-sm checkbox-primary" 
                    :checked="isAllEnrolledSelected" 
                    @change="toggleSelectAllEnrolled"
                    :disabled="filteredEnrolledStudents.length === 0"
                  />
                </th>
                <th>Nama Siswa</th>
                <th>Email</th>
                <th>Status Profil</th>
                <th width="120" class="text-center" v-if="canManageClass">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="student in filteredEnrolledStudents" 
                :key="student.id"
                class="hover:bg-purple-50/40 transition-colors"
                :class="{ 'bg-purple-50/70': selectedBatchStudentIds.includes(student.id) }"
              >
                <td class="text-center" v-if="canManageClass">
                  <input 
                    type="checkbox" 
                    class="checkbox checkbox-sm checkbox-primary" 
                    :value="student.id" 
                    v-model="selectedBatchStudentIds" 
                  />
                </td>
                <td>
                  <div class="font-semibold text-gray-800">{{ student.name }}</div>
                  <div class="text-xs text-gray-400">ID: {{ student.id }}</div>
                </td>
                <td class="text-gray-600 text-sm">{{ student.email }}</td>
                <td>
                  <span v-if="student.status === 'aktif'" class="badge badge-success text-white badge-sm font-medium">
                    Aktif
                  </span>
                  <span v-else-if="student.status === 'lulus'" class="badge badge-info text-white badge-sm font-medium">
                    Lulus
                  </span>
                  <span v-else-if="student.status === 'pindah'" class="badge badge-warning text-white badge-sm font-medium">
                    Pindah
                  </span>
                  <span v-else class="badge badge-ghost badge-sm">
                    {{ student.status || 'Aktif' }}
                  </span>
                </td>
                <td class="text-center" v-if="canManageClass">
                  <button 
                    @click="openRemoveModalHandler(student)" 
                    class="btn btn-ghost btn-xs text-rose-600 hover:bg-rose-50"
                    title="Keluarkan dari kelas ini"
                  >
                    Keluarkan
                  </button>
                </td>
              </tr>
              <tr v-if="filteredEnrolledStudents.length === 0">
                <td :colspan="canManageClass ? 5 : 4" class="text-center py-8 text-gray-400">
                  <div class="flex flex-col items-center justify-center gap-2">
                    <span class="text-3xl">👥</span>
                    <p class="font-medium text-gray-600">
                      {{ searchQueryEnrolled ? 'Tidak ada siswa yang cocok dengan pencarian.' : 'Belum ada siswa yang terdaftar di kelas ini.' }}
                    </p>
                    <button 
                      v-if="!searchQueryEnrolled && canManageClass" 
                      @click="activeTab = 'manage'" 
                      class="btn btn-primary btn-sm mt-2 text-white"
                    >
                      ➕ Daftarkan Siswa Sekarang
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 2: TAMBAH / KELOLA ANGGOTA KELAS (SELURUH SISWA) -->
    <div v-if="!isLoading && activeTab === 'manage'" class="space-y-6">
      <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 class="text-lg font-bold text-gray-800">Pendaftaran Siswa ke Kelas Ini</h2>
            <p class="text-xs text-gray-500">Centang siswa yang ingin didaftarkan ke kelas ini. Siswa yang sudah berada di kelas lain tidak dapat dipilih.</p>
          </div>
          <div class="form-control">
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Cari semua siswa..." 
              class="input input-bordered input-sm w-56" 
            />
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="table table-zebra w-full">
            <thead>
              <tr class="bg-gray-50 text-gray-600 text-xs uppercase">
                <th width="60"></th>
                <th>Nama Siswa</th>
                <th>Email</th>
                <th>Status Pendaftaran</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="student in filteredStudents" 
                :key="student.id" 
                :class="{ 'opacity-60': student.disabled || !canManageClass }"
              >
                <td>
                  <input 
                    type="checkbox" 
                    class="checkbox checkbox-sm checkbox-primary" 
                    v-model="student.selected" 
                    :disabled="!canManageClass || student.disabled" 
                  />
                </td>
                <td class="font-medium">{{ student.name }}</td>
                <td>{{ student.email }}</td>
                <td>
                  <div v-if="student.disabled && student.enrolledClassName" class="badge badge-warning gap-1 badge-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Terdaftar di {{ student.enrolledClassName }}
                  </div>
                  <div v-else-if="student.selected" class="badge badge-success text-white badge-sm">
                    Terdaftar di Kelas Ini
                  </div>
                  <div v-else class="badge badge-ghost badge-sm">
                    Belum Terdaftar
                  </div>
                </td>
              </tr>
              <tr v-if="filteredStudents.length === 0">
                <td colspan="4" class="text-center py-6 text-gray-400">Tidak ada siswa yang ditemukan.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="divider my-4"></div>

        <div v-if="canManageClass" class="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-100 flex items-start gap-3">
          <span class="text-blue-600 text-lg">💡</span>
          <p class="text-blue-700 text-xs leading-relaxed">
            <span class="font-bold">Petunjuk:</span> Centang siswa yang ingin dimasukkan ke kelas ini lalu klik tombol <strong>"Simpan Siswa"</strong> di bawah. Jika siswa tidak dicentang, mereka akan dikeluarkan dari kelas ini.
          </p>
        </div>

        <div class="flex justify-end gap-3">
          <button @click="activeTab = 'enrolled'" class="btn btn-outline btn-sm">
            Kembali ke Siswa Kelas Ini
          </button>
          <button 
            v-if="canManageClass" 
            @click="saveStudents" 
            class="btn btn-primary btn-sm text-white" 
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="loading loading-spinner loading-xs mr-2"></span>
            Simpan Perubahan Siswa
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL 1: KONFIRMASI NAIK KELAS -->
    <dialog :class="{ 'modal modal-open': showPromoteModal }" class="modal">
      <div class="modal-box max-w-lg">
        <h3 class="font-bold text-lg text-gray-800 flex items-center gap-2">
          <span>🚀</span> Konfirmasi Naik Kelas
        </h3>
        <p class="py-3 text-sm text-gray-600">
          Anda akan menaikkan <span class="font-bold text-primary">{{ selectedBatchStudentIds.length }} siswa</span> ke kelas tujuan:
        </p>
        
        <div class="bg-indigo-50 border border-indigo-100 p-3 rounded-xl mb-4 text-sm font-semibold text-indigo-900">
          {{ selectedTargetClass?.name }} ({{ selectedTargetClass?.level }})
        </div>

        <div class="text-xs font-semibold text-gray-500 uppercase mb-2">Daftar Siswa Terpilih:</div>
        <div class="max-h-48 overflow-y-auto border border-gray-100 rounded-lg p-2 bg-gray-50 text-sm mb-4 divide-y divide-gray-100">
          <div v-for="student in selectedStudentsData" :key="student.id" class="py-1 px-2 flex justify-between">
            <span class="font-medium text-gray-700">{{ student.name }}</span>
            <span class="text-gray-400 text-xs">{{ student.email }}</span>
          </div>
        </div>

        <div class="modal-action">
          <button 
            @click="showPromoteModal = false" 
            class="btn btn-outline btn-sm"
            :disabled="isProcessing"
          >
            Batal
          </button>
          <button 
            @click="handleConfirmPromote" 
            class="btn btn-primary btn-sm text-white"
            :disabled="isProcessing"
          >
            <span v-if="isProcessing" class="loading loading-spinner loading-xs mr-1"></span>
            Ya, Naikkan Siswa
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="showPromoteModal = false">close</button>
      </form>
    </dialog>

    <!-- MODAL 2: KONFIRMASI UBAH STATUS SISWA (LULUS / PINDAH) -->
    <dialog :class="{ 'modal modal-open': showStatusModal }" class="modal">
      <div class="modal-box max-w-lg">
        <h3 class="font-bold text-lg text-amber-700 flex items-center gap-2">
          <span>⚠️</span> Konfirmasi Ubah Status Siswa
        </h3>
        
        <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl my-3 text-xs text-amber-800 leading-relaxed">
          <strong>Perhatian:</strong> Sebanyak <span class="font-bold">{{ selectedBatchStudentIds.length }} siswa</span> terpilih akan 
          <strong>dikeluarkan dari kelas {{ classData ? classData.name : '' }}</strong> terlebih dahulu, 
          lalu status profil siswa akan diubah menjadi <span class="font-bold uppercase tracking-wide">"{{ targetStatus }}"</span>.
        </div>

        <div class="text-xs font-semibold text-gray-500 uppercase mb-2">Daftar Siswa Terpilih:</div>
        <div class="max-h-48 overflow-y-auto border border-gray-100 rounded-lg p-2 bg-gray-50 text-sm mb-4 divide-y divide-gray-100">
          <div v-for="student in selectedStudentsData" :key="student.id" class="py-1 px-2 flex justify-between">
            <span class="font-medium text-gray-700">{{ student.name }}</span>
            <span class="text-gray-400 text-xs">{{ student.email }}</span>
          </div>
        </div>

        <div class="modal-action">
          <button 
            @click="showStatusModal = false" 
            class="btn btn-outline btn-sm"
            :disabled="isProcessing"
          >
            Batal
          </button>
          <button 
            @click="handleConfirmStatus" 
            class="btn btn-warning btn-sm text-white"
            :disabled="isProcessing"
          >
            <span v-if="isProcessing" class="loading loading-spinner loading-xs mr-1"></span>
            Ya, Keluarkan & Ubah Status
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="showStatusModal = false">close</button>
      </form>
    </dialog>

    <!-- MODAL 3: KONFIRMASI KELUARKAN SISWA INDIVIDUAL -->
    <dialog :class="{ 'modal modal-open': showRemoveModal }" class="modal">
      <div class="modal-box max-w-md">
        <h3 class="font-bold text-lg text-rose-700 flex items-center gap-2">
          <span>✕</span> Keluarkan Siswa dari Kelas
        </h3>
        <p class="py-3 text-sm text-gray-600">
          Apakah Anda yakin ingin mengeluarkan siswa <strong class="text-gray-800">{{ studentToRemove?.name }}</strong> dari kelas {{ classData ? classData.name : '' }}?
        </p>
        <div class="modal-action">
          <button 
            @click="showRemoveModal = false" 
            class="btn btn-outline btn-sm"
            :disabled="isProcessing"
          >
            Batal
          </button>
          <button 
            @click="handleConfirmRemove" 
            class="btn btn-error btn-sm text-white"
            :disabled="isProcessing"
          >
            <span v-if="isProcessing" class="loading loading-spinner loading-xs mr-1"></span>
            Keluarkan Siswa
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="showRemoveModal = false">close</button>
      </form>
    </dialog>
  </div>
</template>