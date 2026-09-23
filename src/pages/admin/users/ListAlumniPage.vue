<script setup>
import { ref, onMounted } from "vue";
import { getAlumni } from "../../../api/userApi";

const alumniList = ref([]);
const isLoading = ref(false);
const errorMessage = ref(null);

const fetchAlumni = async () => {
  isLoading.value = true;
  errorMessage.value = null;
  try {
    const res = await getAlumni();
    let rawData = res;
    if (res && res.data) {
      rawData = res.data;
      if (rawData && rawData.data) {
        rawData = rawData.data;
      }
    }
    alumniList.value = Array.isArray(rawData) ? rawData : [];
  } catch (err) {
    errorMessage.value =
      typeof err === "string"
        ? err
        : err?.response?.data?.message || err?.message || "Gagal mengambil data alumni";
  } finally {
    isLoading.value = false;
  }
};

const getGraduationYear = (updatedAt) => {
  if (!updatedAt) return "-";
  const date = new Date(updatedAt);
  return isNaN(date.getFullYear()) ? "-" : date.getFullYear();
};

onMounted(fetchAlumni);
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Daftar Alumni</h1>
        <p class="text-gray-500">Daftar siswa yang telah lulus (Alumni)</p>
      </div>
    </div>

    <!-- Feedback Alerts -->
    <div
      v-if="errorMessage"
      class="alert alert-error shadow-lg mb-6 text-white flex justify-between"
    >
      <span>{{ errorMessage }}</span>
      <button @click="errorMessage = null" class="btn btn-ghost btn-xs">✕</button>
    </div>

    <!-- Spinner -->
    <div v-if="isLoading" class="flex justify-center my-8">
      <div class="loading loading-spinner loading-lg text-primary"></div>
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto bg-white rounded-xl shadow border border-gray-100">
      <table class="table table-zebra w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="py-3 px-4 text-left font-semibold text-gray-600">ID</th>
            <th class="py-3 px-4 text-left font-semibold text-gray-600">Nama</th>
            <th class="py-3 px-4 text-left font-semibold text-gray-600">Email</th>
            <th class="py-3 px-4 text-left font-semibold text-gray-600">Status</th>
            <th class="py-3 px-4 text-left font-semibold text-gray-600">Tahun Lulus</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="alumni in alumniList"
            :key="alumni.id"
            class="hover:bg-gray-50 transition-colors"
          >
            <td class="font-bold text-gray-500">#{{ alumni.id }}</td>
            <td class="font-medium text-gray-900">{{ alumni.name }}</td>
            <td class="text-gray-600">{{ alumni.email }}</td>
            <td>
              <span class="badge badge-success text-white font-medium capitalize">
                {{ alumni.status || 'Lulus' }}
              </span>
            </td>
            <td class="font-semibold text-gray-700">
              {{ getGraduationYear(alumni.updated_at) }}
            </td>
          </tr>
          <tr v-if="alumniList.length === 0">
            <td colspan="5" class="text-center py-8 text-gray-400">
              Belum ada data alumni.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
