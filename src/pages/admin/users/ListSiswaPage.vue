<script setup>
import { useStudentStore } from "../../../store/studentStore";
import { useRoute } from "vue-router";
import { computed, onMounted, watch } from "vue";

const route = useRoute();
const studentStore = useStudentStore();

const students = computed(() => studentStore.students);
const isLoading = computed(() => studentStore.loading);
const errorMessage = computed(() => studentStore.error);

const loadClasses = () => {
  studentStore.getUserStudent();
};

onMounted(loadClasses);

watch(
  () => route.fullPath,
  (newPath) => {
    if (newPath === "/admin/user/siswa") {
      loadClasses();
    }
  }
);

</script>
<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold">Kelola Siswa</h1>
        <p class="text-gray-500">Kelola siswa yang terdaftar</p>
      </div>
      <router-link to="/admin/users/tambah" class="btn btn-primary">
        <span class="mr-1">➕</span> Tambah Siswa Baru
      </router-link>
    </div>
    <div v-if="isLoading" class="flex justify-center my-4">
      <div class="loading loading-spinner loading-lg text-primary"></div>
    </div>
    <div
      v-if="errorMessage"
      class="bg-red-100 text-red-700 p-4 rounded-lg mb-6"
    >
      {{ errorMessage }}
    </div>

    <div class="overflow-x-auto bg-white rounded-lg shadow">
      <table class="table table-zebra w-full">
        <thead>
          <tr>
            <th>Nama</th>
            <th>Email</th>
            <th>Kelas</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="student in students" :key="student.id">
            <td class="font-medium">{{ student.name }}</td>
            <td>{{ student.email }}</td>
            <td v-for="clases in student.classes_enrolled" :key="clases.id">
              <span>{{ clases.name }}</span>
            </td>
            <td v-if="student.classes_enrolled.length === 0">
              <span class="text-gray-500">Belum ada kelas</span>
            </td>
            <td v-if="student.classes_enrolled.length > 1">
              <span class="text-gray-500">Terdaftar di beberapa kelas</span>
            </td>
            <td class="flex gap-2">
              <router-link
                :to="`/admin/users/${student.id}`"
                class="btn btn-sm btn-info"
              >
                Lihat
              </router-link>
              <button class="btn btn-sm btn-warning">Edit</button>
              <button class="btn btn-sm btn-error">Hapus</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
