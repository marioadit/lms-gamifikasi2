<script setup>
import { ref, onMounted, computed } from "vue";
import { getTeacherDashboardAPI } from "../../api/dashboardApi";
import {
  PuzzlePieceIcon,
  BookOpenIcon,
  CheckCircleIcon,
  TrophyIcon,
  UserGroupIcon,
  BuildingOffice2Icon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
} from "@heroicons/vue/24/outline";

const isLoading = ref(true);
const errorMsg = ref("");

const stats = ref({
  quizzes_completed: { completed: 0, total: 0, formatted: "0/0" },
  lessons_completed: { completed: 0, total: 0, formatted: "0/0" },
  active_quizzes: { active: 0, total: 0, formatted: "0/0" },
  perfect_scores: { perfect: 0, total: 0, formatted: "0/0" },
  total_students: 0,
  total_classes: 0,
});

const classProgress = ref([]);
const students = ref([]);
const activeTab = ref("progress"); // 'progress' | 'students'
const studentSearch = ref("");

const fetchTeacherDashboard = async () => {
  isLoading.value = true;
  errorMsg.value = "";
  try {
    const res = await getTeacherDashboardAPI();
    if (res && res.data) {
      if (res.data.stats) {
        stats.value = res.data.stats;
      }
      if (Array.isArray(res.data.class_progress)) {
        classProgress.value = res.data.class_progress;
      }
      if (Array.isArray(res.data.students)) {
        students.value = res.data.students;
      }
    }
  } catch (err) {
    console.error("Failed to load teacher dashboard data:", err);
    errorMsg.value = "Gagal memuat data dashboard guru. Silakan coba lagi.";
  } finally {
    isLoading.value = false;
  }
};

const filteredStudents = computed(() => {
  if (!studentSearch.value.trim()) return students.value;
  const q = studentSearch.value.toLowerCase();
  return students.value.filter(
    (st) =>
      st.name?.toLowerCase().includes(q) ||
      st.email?.toLowerCase().includes(q) ||
      st.classes_enrolled?.some((c) => c.name?.toLowerCase().includes(q))
  );
});

onMounted(() => {
  fetchTeacherDashboard();
});
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-base-content flex items-center gap-2">
          <span>👨‍🏫</span> Dashboard Guru
        </h1>
        <p class="text-base-content/70 text-sm mt-1">
          Ringkasan kuis, progres pembelajaran kelas, dan daftar siswa yang diajar.
        </p>
      </div>

      <button @click="fetchTeacherDashboard" class="btn btn-outline btn-sm gap-2 self-start sm:self-auto"
        :disabled="isLoading">
        <ArrowPathIcon class="w-4 h-4" :class="{ 'animate-spin': isLoading }" />
        Refresh Data
      </button>
    </div>

    <!-- Error State -->
    <div v-if="errorMsg" class="alert alert-error shadow-lg">
      <div class="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 9 0 0118 0z" />
        </svg>
        <span>{{ errorMsg }}</span>
      </div>
      <button @click="fetchTeacherDashboard" class="btn btn-sm btn-ghost">Coba lagi</button>
    </div>

    <!-- Skeleton Loading -->
    <div v-if="isLoading" class="space-y-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="i in 6" :key="i" class="h-28 bg-base-300 animate-pulse rounded-2xl"></div>
      </div>
      <div class="h-64 bg-base-300 animate-pulse rounded-2xl"></div>
    </div>

    <!-- Main Content -->
    <template v-else-if="!errorMsg">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Quizzes Completed -->
        <div class="card bg-base-100 shadow-md hover:shadow-lg transition-all border border-base-200">
          <div class="card-body p-5 flex-row items-center justify-between">
            <div>
              <p class="text-xs uppercase font-semibold text-base-content/60">Kuis Diselesaikan</p>
              <h2 class="text-3xl font-extrabold mt-1 text-primary">
                {{ stats.quizzes_completed?.formatted || `${stats.quizzes_completed?.completed ||
                  0}/${stats.quizzes_completed?.total || 0}` }}
              </h2>
              <p class="text-xs text-base-content/50 mt-1">Total penyelesaian kuis oleh siswa</p>
            </div>
            <div class="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl">
              🎮
            </div>
          </div>
        </div>

        <!-- Lessons Completed -->
        <div class="card bg-base-100 shadow-md hover:shadow-lg transition-all border border-base-200">
          <div class="card-body p-5 flex-row items-center justify-between">
            <div>
              <p class="text-xs uppercase font-semibold text-base-content/60">Pelajaran Selesai</p>
              <h2 class="text-3xl font-extrabold mt-1 text-secondary">
                {{ stats.lessons_completed?.formatted || `${stats.lessons_completed?.completed ||
                  0}/${stats.lessons_completed?.total || 0}` }}
              </h2>
              <p class="text-xs text-base-content/50 mt-1">Total pelajaran yang terselesaikan</p>
            </div>
            <div
              class="w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center text-2xl">
              📖
            </div>
          </div>
        </div>

        <!-- Active Quizzes -->
        <div class="card bg-base-100 shadow-md hover:shadow-lg transition-all border border-base-200">
          <div class="card-body p-5 flex-row items-center justify-between">
            <div>
              <p class="text-xs uppercase font-semibold text-base-content/60">Total Kuis Aktif</p>
              <h2 class="text-3xl font-extrabold mt-1 text-success">
                {{ stats.active_quizzes?.formatted || `${stats.active_quizzes?.active ||
                  0}/${stats.active_quizzes?.total || 0}` }}
              </h2>
              <p class="text-xs text-base-content/50 mt-1">Kuis yang dapat dikerjakan siswa</p>
            </div>
            <div class="w-12 h-12 rounded-full bg-success/10 text-success flex items-center justify-center text-2xl">
              ✅
            </div>
          </div>
        </div>

        <!-- Perfect Scores -->
        <div class="card bg-base-100 shadow-md hover:shadow-lg transition-all border border-base-200">
          <div class="card-body p-5 flex-row items-center justify-between">
            <div>
              <p class="text-xs uppercase font-semibold text-base-content/60">Total Nilai Sempurna</p>
              <h2 class="text-3xl font-extrabold mt-1 text-warning">
                {{ stats.perfect_scores?.formatted || `${stats.perfect_scores?.perfect ||
                  0}/${stats.perfect_scores?.total || 0}` }}
              </h2>
              <p class="text-xs text-base-content/50 mt-1">Kuis dengan skor 100%</p>
            </div>
            <div class="w-12 h-12 rounded-full bg-warning/10 text-warning flex items-center justify-center text-2xl">
              🏆
            </div>
          </div>
        </div>

        <!-- Total Students -->
        <div class="card bg-base-100 shadow-md hover:shadow-lg transition-all border border-base-200">
          <div class="card-body p-5 flex-row items-center justify-between">
            <div>
              <p class="text-xs uppercase font-semibold text-base-content/60">Total Murid</p>
              <h2 class="text-3xl font-extrabold mt-1 text-accent">
                {{ stats.total_students || 0 }}
              </h2>
              <p class="text-xs text-base-content/50 mt-1">Siswa terdaftar di kelas guru</p>
            </div>
            <div class="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center text-2xl">
              👥
            </div>
          </div>
        </div>

        <!-- Total Classes -->
        <div class="card bg-base-100 shadow-md hover:shadow-lg transition-all border border-base-200">
          <div class="card-body p-5 flex-row items-center justify-between">
            <div>
              <p class="text-xs uppercase font-semibold text-base-content/60">Total Kelas</p>
              <h2 class="text-3xl font-extrabold mt-1 text-info">
                {{ stats.total_classes || 0 }}
              </h2>
              <p class="text-xs text-base-content/50 mt-1">Kelas yang diampu</p>
            </div>
            <div class="w-12 h-12 rounded-full bg-info/10 text-info flex items-center justify-center text-2xl">
              🏫
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="tabs tabs-boxed bg-base-200/60 p-1 rounded-xl">
        <a class="tab tab-lg flex-1 font-semibold transition-all"
          :class="{ 'tab-active bg-base-100 text-primary shadow-sm': activeTab === 'progress' }"
          @click="activeTab = 'progress'">
          📊 Progres Kelas
        </a>
        <a class="tab tab-lg flex-1 font-semibold transition-all"
          :class="{ 'tab-active bg-base-100 text-primary shadow-sm': activeTab === 'students' }"
          @click="activeTab = 'students'">
          👨‍🎓 Murid Kelas ({{ students.length }})
        </a>
      </div>

      <!-- Tab Content 1: Progres Kelas -->
      <div v-if="activeTab === 'progress'" class="card bg-base-100 shadow-md border border-base-200">
        <div class="card-body p-6">
          <h2 class="text-xl font-bold text-base-content mb-1">Progres Pelajaran & Kuis Kelas</h2>
          <p class="text-xs text-base-content/60 mb-6">Persentase penyelesaian kuis oleh siswa per kelas.</p>

          <div v-if="classProgress.length > 0" class="space-y-6">
            <div v-for="item in classProgress" :key="item.class_id"
              class="p-4 bg-base-200/40 rounded-2xl border border-base-200/60 hover:bg-base-200/70 transition-colors">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-xl bg-primary/10 text-primary grid place-items-center font-bold text-lg">
                    🏫
                  </div>
                  <div>
                    <h3 class="font-bold text-base text-base-content">{{ item.class_name }}</h3>
                    <p class="text-xs text-base-content/60 capitalize">
                      {{ item.level }} • {{ item.total_students || 0 }} Siswa
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-4">
                  <div class="text-right">
                    <span class="text-sm font-semibold text-base-content/80">
                      {{ item.completed_quizzes || 0 }} / {{ item.total_quizzes || 0 }} Kuis
                    </span>
                    <p class="text-xs text-base-content/50">Terselesaikan</p>
                  </div>
                  <span class="badge badge-primary font-bold px-3 py-2 text-sm">
                    {{ item.percentage || 0 }}%
                  </span>
                </div>
              </div>

              <!-- Progress Bar -->
              <div class="w-full bg-base-300 rounded-full h-3 overflow-hidden">
                <div class="bg-primary h-3 rounded-full transition-all duration-500"
                  :style="{ width: `${item.percentage || 0}%` }"></div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-10 text-base-content/50">
            Belum ada data progres kelas tersedia.
          </div>
        </div>
      </div>

      <!-- Tab Content 2: Daftar Murid -->
      <div v-else-if="activeTab === 'students'" class="card bg-base-100 shadow-md border border-base-200">
        <div class="card-body p-6">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 class="text-xl font-bold text-base-content">Daftar Murid Kelas</h2>
              <p class="text-xs text-base-content/60 mt-0.5">Siswa yang terdaftar di kelas di bawah pengampuan Anda.</p>
            </div>

            <!-- Search box -->
            <div class="relative w-full md:w-64">
              <input v-model="studentSearch" type="text" placeholder="Cari murid / email..."
                class="input input-bordered input-sm w-full pl-9" />
              <MagnifyingGlassIcon class="w-4 h-4 absolute left-3 top-2.5 text-base-content/40" />
            </div>
          </div>

          <!-- Table -->
          <div class="overflow-x-auto">
            <table class="table w-full">
              <thead>
                <tr class="bg-base-200/50">
                  <th>#</th>
                  <th>Nama Siswa</th>
                  <th>Email</th>
                  <th>Kelas Terdaftar</th>
                  <th class="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(st, idx) in filteredStudents" :key="st.id || idx"
                  class="hover:bg-base-200/30 transition-colors">
                  <td class="font-bold text-xs text-base-content/50">{{ idx + 1 }}</td>
                  <td>
                    <div class="flex items-center gap-3">
                      <span class="font-bold text-base-content">{{ st.name }}</span>
                    </div>
                  </td>
                  <td class="text-sm text-base-content/70">{{ st.email }}</td>
                  <td>
                    <div class="flex flex-wrap gap-1">
                      <template v-if="st.classes_enrolled && st.classes_enrolled.length > 0">
                        <span v-for="cls in st.classes_enrolled" :key="cls.id"
                          class="badge badge-accent badge-sm font-semibold">
                          {{ cls.name }} ({{ cls.academic_year }})
                        </span>
                      </template>
                      <span v-else class="text-xs text-base-content/40 font-italic">
                        Belum ada kelas
                      </span>
                    </div>
                  </td>
                  <td class="text-center">
                    <router-link :to="`/admin/kuis/hasil/siswa/${st.id}`" class="btn btn-xs btn-outline btn-primary">
                      Hasil Kuis
                    </router-link>
                  </td>
                </tr>

                <tr v-if="filteredStudents.length === 0">
                  <td colspan="5" class="text-center py-8 text-base-content/50">
                    Tidak ada siswa yang ditemukan.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
