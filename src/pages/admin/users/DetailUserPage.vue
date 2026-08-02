<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useUserStore } from "../../../store/userStore";
import { useStudentStore } from "../../../store/studentStore";
import { getClassesById } from "../../../api/classesApi";

import { useAuthStore } from "../../../store/authStore";

const usersStore = useUserStore();
const studentsStore = useStudentStore();
const authStore = useAuthStore();
const route = useRoute();

const userRole = computed(() => authStore.userRole);
const currentUserId = computed(() => authStore.currentUserId);

const classDetail = ref(null);
const isClassLoading = ref(false);

const loadDetail = async () => {
  const userId = route.params.id;
  await usersStore.getUserById(userId);
};

onMounted(loadDetail);

const detailUser = computed(() => usersStore.detailUser);
const isLoading = computed(() => usersStore.loading);
const errorMessage = computed(() => usersStore.error);

const canManage = computed(() => {
  if (userRole.value === 'admin') return true;
  if (userRole.value === 'guru' && detailUser.value) {
    const enrolled = detailUser.value.classes_enrolled;
    if (!Array.isArray(enrolled)) return false;
    return enrolled.some(c => Number(c.teacher_id || c.teacher?.id || 0) === currentUserId.value);
  }
  return false;
});

// Watch for detailUser to fetch Class Info and Classmates
watch(
  detailUser,
  async (newVal) => {
    if (newVal && Array.isArray(newVal.classes_enrolled) && newVal.classes_enrolled.length > 0) {
      const firstClass = newVal.classes_enrolled[0];
      if (firstClass && firstClass.id) {
        isClassLoading.value = true;
        try {
          // Load class detail (includes teacher / wali kelas info)
          const classRes = await getClassesById(firstClass.id);
          classDetail.value = classRes.data || classRes;
        } catch (err) {
          console.error("Error fetching class detail:", err);
        } finally {
          isClassLoading.value = false;
        }
        // Load classmates
        studentsStore.getClassStudents(firstClass.id);
      }
    } else {
      classDetail.value = null;
    }
  },
  { immediate: true }
);

watch(
  () => route.params.id,
  (newId, oldId) => {
    if (newId && newId !== oldId) {
      loadDetail();
    }
  }
);
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Detail Siswa</h1>
        <p class="text-gray-500">Informasi profil siswa, kelas, dan teman sekelas</p>
      </div>
      <div class="flex gap-2">
        <router-link to="/admin/users/siswa" class="btn btn-outline">
          ← Kembali ke Daftar Siswa
        </router-link>
      </div>
    </div>

    <!-- Loading indicator -->
    <div v-if="isLoading" class="flex justify-center my-12">
      <div class="loading loading-spinner loading-lg text-primary"></div>
    </div>

    <!-- Error message -->
    <div v-if="errorMessage" class="alert alert-error shadow-lg mb-6 text-white">
      <span>{{ errorMessage }}</span>
    </div>

    <!-- 2-Column Main Layout -->
    <div v-if="detailUser && !isLoading" class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      
      <!-- SEBELAH KIRI: Info Siswa Card -->
      <div class="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex flex-col justify-between">
        <div>
          <!-- Avatar Header -->
          <div class="flex items-center gap-4 mb-6">
            <div class="w-16 h-16 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold text-2xl">
              {{ detailUser.name ? detailUser.name.charAt(0).toUpperCase() : 'S' }}
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-800">{{ detailUser.name }}</h2>
              <div class="flex gap-2 items-center mt-1">
                <span class="badge badge-accent text-xs uppercase font-semibold">
                  {{ detailUser.role || 'Siswa' }}
                </span>
                <span 
                  v-if="detailUser.classes_enrolled && detailUser.classes_enrolled.length > 0"
                  class="badge badge-primary badge-outline text-xs font-medium"
                >
                  {{ detailUser.classes_enrolled[0].name }}
                </span>
              </div>
            </div>
          </div>

          <!-- User Details -->
          <div class="space-y-4 border-t border-gray-100 pt-4">
            <div class="flex flex-col gap-1">
              <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">ID Siswa</span>
              <span class="text-base font-semibold text-gray-700">#{{ detailUser.id }}</span>
            </div>

            <div class="flex flex-col gap-1">
              <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Nama Lengkap</span>
              <span class="text-base font-medium text-gray-900">{{ detailUser.name }}</span>
            </div>

            <div class="flex flex-col gap-1">
              <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</span>
              <span class="text-base font-medium text-gray-900">{{ detailUser.email }}</span>
            </div>

            <div class="flex flex-col gap-1">
              <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Kelas Terdaftar</span>
              <template v-if="detailUser.classes_enrolled && detailUser.classes_enrolled.length > 0">
                <div class="flex flex-wrap gap-1 mt-1">
                  <span 
                    v-for="c in detailUser.classes_enrolled" 
                    :key="c.id" 
                    class="badge badge-accent font-medium"
                  >
                    {{ c.name }}
                  </span>
                </div>
              </template>
              <span v-else class="text-gray-400 italic text-sm">Belum terdaftar di kelas</span>
            </div>
          </div>
        </div>

        <!-- Quick Action Buttons -->
        <div v-if="canManage" class="flex gap-2 mt-8 pt-4 border-t border-gray-100">
          <router-link :to="`/admin/users/${detailUser.id}/edit-profile`" class="btn btn-sm btn-outline btn-neutral flex-1">
            ✏️ Ubah Profil
          </router-link>
          <router-link :to="`/admin/users/${detailUser.id}/edit-password`" class="btn btn-sm btn-outline btn-secondary flex-1">
            🔑 Ubah Password
          </router-link>
        </div>
      </div>

      <!-- SEBELAH KANAN: Stack (Card Atas: Info Kelas & Wali Kelas, Card Bawah: Teman-teman Sekelas) -->
      <div class="space-y-6">
        
        <!-- CARD ATAS: Info Kelas & Wali Kelas -->
        <div class="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span>🏫</span> Info Kelas & Wali Kelas
            </h2>
            <template v-if="canManage && detailUser.classes_enrolled && detailUser.classes_enrolled.length > 0">
              <router-link :to="`/admin/kelas/${detailUser.classes_enrolled[0].id}/siswa`" class="btn btn-xs btn-primary text-white">
                Kelola Kelas
              </router-link>
            </template>
          </div>

          <div v-if="isClassLoading" class="flex justify-center py-4">
            <div class="loading loading-spinner loading-md text-primary"></div>
          </div>

          <template v-else-if="detailUser.classes_enrolled && detailUser.classes_enrolled.length > 0">
            <div class="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="text-base font-bold text-gray-900">
                    {{ detailUser.classes_enrolled[0].name }}
                  </h3>
                  <p v-if="classDetail?.level || classDetail?.academic_year" class="text-xs text-gray-500">
                    {{ classDetail.level }} <span v-if="classDetail.academic_year">({{ classDetail.academic_year }} - Semester {{ classDetail.semester || 'Gasal' }})</span>
                  </p>
                </div>
                <span class="badge badge-accent badge-sm font-semibold">Aktif</span>
              </div>

              <div class="pt-2 border-t border-gray-200/60 flex items-center justify-between">
                <div>
                  <span class="text-xs text-gray-400 font-semibold uppercase tracking-wider block">Wali Kelas</span>
                  <span class="text-sm font-bold text-gray-800">
                    👨‍🏫 {{ classDetail?.teacher?.name || classDetail?.teacher_name || 'Belum ada wali kelas' }}
                  </span>
                </div>
                <span v-if="classDetail?.teacher?.email" class="text-xs text-gray-500">
                  {{ classDetail.teacher.email }}
                </span>
              </div>
            </div>
          </template>

          <div v-else class="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <span class="text-gray-400 text-sm italic">Siswa ini belum terdaftar pada kelas manapun.</span>
          </div>
        </div>

        <!-- CARD BAWAH: Teman-teman Sekelas -->
        <div class="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span>👥</span> Teman-teman Sekelas
            </h2>
            <span class="badge badge-neutral font-semibold">
              {{ studentsStore.classStudents ? studentsStore.classStudents.length : 0 }} Siswa
            </span>
          </div>

          <div v-if="studentsStore.loading" class="flex justify-center py-6">
            <div class="loading loading-spinner loading-md text-primary"></div>
          </div>

          <template v-else-if="studentsStore.classStudents && studentsStore.classStudents.length > 0">
            <div class="divide-y divide-gray-100 max-h-80 overflow-y-auto pr-1">
              <div 
                v-for="(student, idx) in studentsStore.classStudents" 
                :key="student.id"
                class="py-2.5 px-2 flex items-center justify-between hover:bg-gray-50 rounded-lg transition-colors"
                :class="{ 'bg-primary/5 font-semibold': Number(student.id) === Number(detailUser.id) }"
              >
                <div class="flex items-center gap-3">
                  <span class="w-6 text-center text-xs font-bold text-gray-400">{{ idx + 1 }}.</span>
                  <div class="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-xs">
                    {{ student.name ? student.name.charAt(0).toUpperCase() : 'S' }}
                  </div>
                  <div>
                    <h4 class="text-sm font-medium text-gray-800 flex items-center gap-1.5">
                      {{ student.name }}
                      <span v-if="Number(student.id) === Number(detailUser.id)" class="badge badge-xs badge-primary">Siswa Ini</span>
                    </h4>
                    <span class="text-xs text-gray-400">{{ student.email }}</span>
                  </div>
                </div>

                <router-link 
                  v-if="Number(student.id) !== Number(detailUser.id)"
                  :to="`/admin/users/${student.id}`" 
                  class="btn btn-xs btn-ghost text-primary hover:bg-primary/10"
                >
                  Detail
                </router-link>
              </div>
            </div>
          </template>

          <div v-else class="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p class="text-gray-400 text-sm italic">Belum ada siswa lain di kelas ini.</p>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>
