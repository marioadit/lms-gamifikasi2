<script setup>
import { ref, onMounted, computed } from "vue";
import { getAdminDashboardAPI } from "../../api/dashboardApi";
import {
  UserGroupIcon,
  AcademicCapIcon,
  UserIcon,
  ShieldCheckIcon,
  BuildingOffice2Icon,
  ArrowPathIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from "@heroicons/vue/24/outline";

const isLoading = ref(true);
const errorMsg = ref("");
const stats = ref({
  total_admin: 0,
  total_guru: 0,
  total_siswa: 0,
  total_users: 0,
  total_classes: 0,
});
const studentsPerClass = ref([]);
const searchQuery = ref("");

const fetchDashboardData = async () => {
  isLoading.value = true;
  errorMsg.value = "";
  try {
    const res = await getAdminDashboardAPI();
    if (res && res.data) {
      if (res.data.stats) {
        stats.value = res.data.stats;
      }
      if (Array.isArray(res.data.students_per_class)) {
        studentsPerClass.value = res.data.students_per_class;
      }
    }
  } catch (err) {
    console.error("Failed to load admin dashboard data:", err);
    errorMsg.value = "Gagal memuat data dashboard admin. Silakan coba lagi.";
  } finally {
    isLoading.value = false;
  }
};

const filteredClasses = computed(() => {
  if (!searchQuery.value.trim()) return studentsPerClass.value;
  const q = searchQuery.value.toLowerCase();
  return studentsPerClass.value.filter(
    (item) =>
      item.class_name?.toLowerCase().includes(q) ||
      item.level?.toLowerCase().includes(q) ||
      item.teacher_name?.toLowerCase().includes(q) ||
      item.academic_year?.toLowerCase().includes(q)
  );
});

onMounted(() => {
  fetchDashboardData();
});
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-base-content flex items-center gap-2">
          <span>🛡️</span> Dashboard Admin
        </h1>
        <p class="text-base-content/70 text-sm mt-1">
          Ringkasan statistik pengguna dan statistik jumlah siswa per kelas.
        </p>
      </div>

      <button
        @click="fetchDashboardData"
        class="btn btn-outline btn-sm gap-2 self-start sm:self-auto"
        :disabled="isLoading"
      >
        <ArrowPathIcon class="w-4 h-4" :class="{ 'animate-spin': isLoading }" />
        Refresh Data
      </button>
    </div>

    <!-- Error State -->
    <div v-if="errorMsg" class="alert alert-error shadow-lg">
      <div class="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 9 0 0118 0z" />
        </svg>
        <span>{{ errorMsg }}</span>
      </div>
      <button @click="fetchDashboardData" class="btn btn-sm btn-ghost">Coba lagi</button>
    </div>

    <!-- Skeleton Loading -->
    <div v-if="isLoading" class="space-y-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div v-for="i in 5" :key="i" class="h-28 bg-base-300 animate-pulse rounded-2xl"></div>
      </div>
      <div class="h-64 bg-base-300 animate-pulse rounded-2xl"></div>
    </div>

    <!-- Main Content -->
    <template v-else-if="!errorMsg">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <!-- Total Admin -->
        <div class="card bg-base-100 shadow-md hover:shadow-lg transition-all border border-base-200">
          <div class="card-body p-4 flex-row items-center justify-between">
            <div>
              <p class="text-xs uppercase font-semibold text-base-content/60">Total Admin</p>
              <h2 class="text-3xl font-extrabold mt-1 text-primary">{{ stats.total_admin || 0 }}</h2>
            </div>
            <div class="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <ShieldCheckIcon class="w-7 h-7" />
            </div>
          </div>
        </div>

        <!-- Total Guru -->
        <div class="card bg-base-100 shadow-md hover:shadow-lg transition-all border border-base-200">
          <div class="card-body p-4 flex-row items-center justify-between">
            <div>
              <p class="text-xs uppercase font-semibold text-base-content/60">Total Guru</p>
              <h2 class="text-3xl font-extrabold mt-1 text-secondary">{{ stats.total_guru || 0 }}</h2>
            </div>
            <div class="w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
              <AcademicCapIcon class="w-7 h-7" />
            </div>
          </div>
        </div>

        <!-- Total Siswa -->
        <div class="card bg-base-100 shadow-md hover:shadow-lg transition-all border border-base-200">
          <div class="card-body p-4 flex-row items-center justify-between">
            <div>
              <p class="text-xs uppercase font-semibold text-base-content/60">Total Siswa</p>
              <h2 class="text-3xl font-extrabold mt-1 text-accent">{{ stats.total_siswa || 0 }}</h2>
            </div>
            <div class="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center">
              <UserIcon class="w-7 h-7" />
            </div>
          </div>
        </div>

        <!-- Total Users -->
        <div class="card bg-base-100 shadow-md hover:shadow-lg transition-all border border-base-200">
          <div class="card-body p-4 flex-row items-center justify-between">
            <div>
              <p class="text-xs uppercase font-semibold text-base-content/60">Total Pengguna</p>
              <h2 class="text-3xl font-extrabold mt-1 text-info">{{ stats.total_users || 0 }}</h2>
            </div>
            <div class="w-12 h-12 rounded-full bg-info/10 text-info flex items-center justify-center">
              <UserGroupIcon class="w-7 h-7" />
            </div>
          </div>
        </div>

        <!-- Total Kelas -->
        <div class="card bg-base-100 shadow-md hover:shadow-lg transition-all border border-base-200">
          <div class="card-body p-4 flex-row items-center justify-between">
            <div>
              <p class="text-xs uppercase font-semibold text-base-content/60">Total Kelas</p>
              <h2 class="text-3xl font-extrabold mt-1 text-warning">{{ stats.total_classes || 0 }}</h2>
            </div>
            <div class="w-12 h-12 rounded-full bg-warning/10 text-warning flex items-center justify-center">
              <BuildingOffice2Icon class="w-7 h-7" />
            </div>
          </div>
        </div>
      </div>

      <!-- Students Per Class Section -->
      <div class="card bg-base-100 shadow-md border border-base-200">
        <div class="card-body p-6">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 class="text-xl font-bold text-base-content flex items-center gap-2">
                <span>🏫</span> Jumlah Siswa Per Kelas
              </h2>
              <p class="text-xs text-base-content/60 mt-0.5">
                Daftar kelas beserta wali kelas dan jumlah siswa terdaftar.
              </p>
            </div>

            <!-- Search input -->
            <div class="relative w-full md:w-64">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Cari kelas / guru..."
                class="input input-bordered input-sm w-full pl-9"
              />
              <MagnifyingGlassIcon class="w-4 h-4 absolute left-3 top-2.5 text-base-content/40" />
            </div>
          </div>

          <!-- Table -->
          <div class="overflow-x-auto">
            <table class="table w-full">
              <thead>
                <tr class="bg-base-200/50">
                  <th>#</th>
                  <th>Nama Kelas</th>
                  <th>Tingkat</th>
                  <th>Wali Kelas</th>
                  <th>Semester / Tahun</th>
                  <th class="text-center">Jumlah Siswa</th>
                  <th class="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, idx) in filteredClasses"
                  :key="item.class_id || idx"
                  class="hover:bg-base-200/30 transition-colors"
                >
                  <td class="font-bold text-xs text-base-content/50">{{ idx + 1 }}</td>
                  <td>
                    <div class="font-bold text-base-content">{{ item.class_name }}</div>
                  </td>
                  <td>
                    <span class="badge badge-outline badge-sm capitalize">{{ item.level }}</span>
                  </td>
                  <td>
                    <div class="flex items-center gap-2">
                      <span class="text-lg">👨‍🏫</span>
                      <span class="font-medium text-sm">{{ item.teacher_name || '-' }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="text-xs text-base-content/70 capitalize">
                      {{ item.semester }} ({{ item.academic_year }})
                    </div>
                  </td>
                  <td class="text-center">
                    <span
                      class="badge font-bold px-3 py-1 text-xs"
                      :class="item.student_count > 0 ? 'badge-primary' : 'badge-ghost'"
                    >
                      {{ item.student_count }} Siswa
                    </span>
                  </td>
                  <td class="text-center">
                    <router-link
                      :to="`/admin/kelas/${item.class_id}`"
                      class="btn btn-xs btn-ghost text-primary"
                    >
                      Detail Kelas
                    </router-link>
                  </td>
                </tr>

                <tr v-if="filteredClasses.length === 0">
                  <td colspan="7" class="text-center py-8 text-base-content/50">
                    Tidak ada data kelas yang ditemukan.
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
