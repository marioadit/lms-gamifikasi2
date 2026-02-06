<script setup>
import { computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "../../../store/userStore";
import { useStudentStore } from "../../../store/studentStore";

const usersStore = useUserStore();
const studentsStore = useStudentStore();

const route = useRoute();

const loadDetail = () => {
  const userId = route.params.id;
  usersStore.getUserById(userId);
};
onMounted(loadDetail);

const detailUser = computed(() => usersStore.detailUser);
const isLoading = computed(() => usersStore.loading);
const errorMessage = computed(() => usersStore.error);

watch(
  detailUser,
  (newVal) => {
    if (newVal && Array.isArray(newVal.classes_enrolled)) {
      newVal.classes_enrolled.forEach((kelas) => {
        if (kelas.id) {
          studentsStore.getClassStudents(kelas.id);
        }
      });
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
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold">Detail User</h1>
      </div>
      <div class="flex gap-2">
        <router-link to="/admin/users/siswa" class="btn btn-outline"
          >Kembali</router-link
        >
        <router-link
          :to="`/admin/users/${route.params.id}`"
          class="btn btn-neutral"
        >
          Update Siswa
        </router-link>
      </div>
    </div>

    <!-- Loading indicator -->
    <div v-if="isLoading" class="flex justify-center my-12">
      <div class="loading loading-spinner loading-lg text-primary"></div>
    </div>

    <!-- Error message -->
    <div
      v-if="errorMessage"
      class="bg-red-100 text-red-700 p-4 rounded-lg mb-6"
    >
      {{ errorMessage }}
    </div>

    <div
      v-if="detailUser && !isLoading"
      class="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      <div class="bg-white p-6 rounded-xl shadow-md">
        <h2 class="text-xl font-bold mb-4">Detail Siswa</h2>

        <div class="space-y-3">
          <div class="flex flex-col gap-1">
            <span class="text-sm text-gray-500">Nama:</span>
            <span class="text-base font-medium">
              {{ detailUser.name }}
            </span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-sm text-gray-500">Email :</span>
            <span class="text-base font-medium">
              {{ detailUser.email }}
            </span>
          </div>
          <div
            v-for="classes_enrolled in detailUser.classes_enrolled"
            :key="classes_enrolled.id"
          >
            <div class="flex flex-col gap-1">
              <span class="text-sm text-gray-500">Kelas :</span>
              <span class="text-base font-medium">{{
                classes_enrolled.name
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-md">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-xl font-bold mb-4">Teman Kelas</h2>
            <h4>Wali Kelas</h4>
          </div>
          <div
            v-for="classes_enrolled in detailUser.classes_enrolled"
            :key="classes_enrolled.id"
          >
            <router-link :to="`/admin/kelas/${classes_enrolled.id}/siswa`" class="btn btn-primary">
                Kelola Kelas
            </router-link>
          </div>
        </div>
        <div
          v-for="(student, idx) in studentsStore.classStudents"
          :key="student.id"
        >
          <ul class="list bg-base-100 border-b-[1px]">
            <li class="list-row">
              <div class="text-4xl font-thin opacity-30 tabular-nums">
                {{ idx + 1 }}
              </div>
              <div class="list-col-grow">
                <div>
                  {{ student.name }}
                </div>
                <div class="text-xs uppercase font-semibold opacity-60">
                  {{ student.role }}
                </div>
              </div>
              <router-link
                :to="`/admin/users/${student.id}`"
                class="btn btn-neutral"
                >Detail</router-link
              >
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
