<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { getUserById } from "../../../api/userApi";
import { getClasses } from "../../../api/classesApi";

const route = useRoute();

const teacherId = computed(() => route.params.id);
const detailTeacher = ref(null);
const taughtClasses = ref([]);
const isLoading = ref(true);
const errorMessage = ref(null);

const loadTeacherDetail = async () => {
  isLoading.value = true;
  errorMessage.value = null;
  try {
    const currentId = Number(teacherId.value);

    // Fetch teacher detail and all classes concurrently
    const [teacherRes, classesRes] = await Promise.all([
      getUserById(teacherId.value),
      getClasses().catch(() => null)
    ]);

    detailTeacher.value = teacherRes.data || teacherRes;

    // Process classes list from GET /api/admin/classes
    let classList = [];
    if (classesRes) {
      if (classesRes.data && Array.isArray(classesRes.data.data)) {
        classList = classesRes.data.data;
      } else if (Array.isArray(classesRes.data)) {
        classList = classesRes.data;
      } else if (Array.isArray(classesRes)) {
        classList = classesRes;
      }
    }

    // Filter classes where teacher_id matches current teacher's id
    let matchedClasses = classList.filter(c => 
      Number(c.teacher_id) === currentId || 
      Number(c.teacher?.id) === currentId
    );

    // Fallback to teacher.classes_teaching or teacher.classes if matchedClasses is empty
    if (matchedClasses.length === 0) {
      if (detailTeacher.value?.classes_teaching && Array.isArray(detailTeacher.value.classes_teaching)) {
        matchedClasses = detailTeacher.value.classes_teaching;
      } else if (detailTeacher.value?.classes && Array.isArray(detailTeacher.value.classes)) {
        matchedClasses = detailTeacher.value.classes;
      }
    }

    taughtClasses.value = matchedClasses;
  } catch (err) {
    console.error("Error fetching teacher details:", err);
    errorMessage.value = "Gagal memuat detail guru.";
  } finally {
    isLoading.value = false;
  }
};

onMounted(loadTeacherDetail);

watch(
  () => route.params.id,
  (newId, oldId) => {
    if (newId && newId !== oldId) {
      loadTeacherDetail();
    }
  }
);
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Detail Guru</h1>
        <p class="text-gray-500">Informasi profil dan daftar kelas yang diampu</p>
      </div>
      <div class="flex gap-2">
        <router-link to="/admin/users/guru" class="btn btn-outline">
          ← Kembali ke Daftar Guru
        </router-link>
      </div>
    </div>

    <!-- Loading Spinner -->
    <div v-if="isLoading" class="flex justify-center my-12">
      <div class="loading loading-spinner loading-lg text-primary"></div>
    </div>

    <!-- Error Alert -->
    <div v-if="errorMessage" class="alert alert-error shadow-lg mb-6 text-white">
      <span>{{ errorMessage }}</span>
    </div>

    <!-- 2-Column Grid Layout -->
    <div v-if="detailTeacher && !isLoading" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- SEBELAH KIRI: Informasi User / Guru -->
      <div class="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex flex-col justify-between">
        <div>
          <div class="flex items-center gap-3 mb-6">
            <div class="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
              {{ detailTeacher.name ? detailTeacher.name.charAt(0).toUpperCase() : 'G' }}
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-800">{{ detailTeacher.name }}</h2>
              <span class="badge badge-primary text-xs uppercase font-semibold">
                {{ detailTeacher.role || 'Guru' }}
              </span>
            </div>
          </div>

          <div class="space-y-4 border-t border-gray-100 pt-4">
            <div class="flex flex-col gap-1">
              <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">ID Guru</span>
              <span class="text-base font-semibold text-gray-700">#{{ detailTeacher.id }}</span>
            </div>

            <div class="flex flex-col gap-1">
              <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Nama Lengkap</span>
              <span class="text-base font-medium text-gray-900">{{ detailTeacher.name }}</span>
            </div>

            <div class="flex flex-col gap-1">
              <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</span>
              <span class="text-base font-medium text-gray-900">{{ detailTeacher.email }}</span>
            </div>
          </div>
        </div>

        <div class="flex gap-2 mt-8 pt-4 border-t border-gray-100">
          <router-link :to="`/admin/users/guru/${detailTeacher.id}/edit-profile`" class="btn btn-sm btn-outline btn-neutral flex-1">
            ✏️ Ubah Profil
          </router-link>
          <router-link :to="`/admin/users/guru/${detailTeacher.id}/edit-password`" class="btn btn-sm btn-outline btn-secondary flex-1">
            🔑 Ubah Password
          </router-link>
        </div>
      </div>

      <!-- SEBELAH KANAN: Kelas-Kelas yang Diampu -->
      <div class="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span>🏫</span> Kelas yang Diampu
          </h2>
          <div class="flex items-center gap-2">
            <span class="badge badge-accent font-semibold">
              {{ taughtClasses.length }} Kelas
            </span>
            <router-link :to="`/admin/users/guru/${detailTeacher.id}/edit-profile`" class="btn btn-xs btn-outline btn-primary">
              ⚙️ Kelola Kelas
            </router-link>
          </div>
        </div>

        <!-- List of taught classes -->
        <template v-if="taughtClasses.length > 0">
          <div class="divide-y divide-gray-100">
            <div 
              v-for="kelas in taughtClasses" 
              :key="kelas.id" 
              class="py-3 flex items-center justify-between hover:bg-gray-50 px-2 rounded-lg transition-colors"
            >
              <div>
                <h3 class="font-bold text-gray-800">{{ kelas.name }}</h3>
                <p v-if="kelas.level || kelas.academic_year" class="text-xs text-gray-500">
                  {{ kelas.level }} <span v-if="kelas.academic_year">({{ kelas.academic_year }})</span>
                </p>
              </div>
              <router-link :to="`/admin/kelas/${kelas.id}`" class="btn btn-xs btn-primary text-white">
                Detail Kelas
              </router-link>
            </div>
          </div>
        </template>

        <!-- Empty state -->
        <div v-else class="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <div class="text-4xl mb-2">📚</div>
          <p class="text-gray-500 font-medium">Belum ada kelas yang diampu</p>
          <p class="text-xs text-gray-400 mt-1">Guru ini belum ditugaskan untuk mengajar kelas apa pun.</p>
        </div>
      </div>
    </div>
  </div>
</template>
