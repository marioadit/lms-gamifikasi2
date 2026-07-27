<script setup>
import { useTeacherStore } from "../../../store/teacherStore";
import { useRoute } from "vue-router";
import { computed, onMounted, watch } from "vue";

const route = useRoute();
const teacherStore = useTeacherStore();

const teachers = computed(() => teacherStore.teachers);
const isLoading = computed(() => teacherStore.loading);
const errorMessage = computed(() => teacherStore.error);

const loadTeachers = () => {
  teacherStore.getTeachers();
};

onMounted(loadTeachers);

watch(
  () => route.fullPath,
  (newPath) => {
    if (newPath === "/admin/users/guru") {
      loadTeachers();
    }
  }
);

</script>
<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold">Kelola Guru</h1>
        <p class="text-gray-500">Kelola guru yang terdaftar</p>
      </div>
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
            <th>Kelas yang Diajar</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="teacher in teachers" :key="teacher.id">
            <td class="font-medium">{{ teacher.name }}</td>
            <td>{{ teacher.email }}</td>
            <td>
              <div v-if="teacher.classes_teaching && teacher.classes_teaching.length > 0" class="flex flex-wrap gap-1">
                <span
                  v-for="kelas in teacher.classes_teaching"
                  :key="kelas.id"
                  class="badge badge-primary badge-sm"
                >
                  {{ kelas.name }}
                </span>
              </div>
              <span v-else class="text-gray-500">Belum ada kelas</span>
            </td>
            <td class="flex gap-2">
              <router-link
                :to="`/admin/users/guru/${teacher.id}`"
                class="btn btn-sm btn-info"
              >
                Lihat
              </router-link>
            </td>
          </tr>
          <tr v-if="teachers.length === 0 && !isLoading">
            <td colspan="4" class="text-center py-4">Belum ada guru yang terdaftar.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
