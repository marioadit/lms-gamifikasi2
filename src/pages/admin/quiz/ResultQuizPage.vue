<script setup>
import { useUserStore } from "../../../store/userStore";
import { onMounted, ref } from "vue";
const userStore = useUserStore();

const quizData = ref([]);
onMounted(async () => {
  quizData.value = await userStore.getQuizUser();
  console.log(quizData.value);
});
</script>

<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold">Hasil Kuis</h1>
      </div>
    </div>
            <!-- "id": 4,
            "name": "Siswa Rajin",
            "email": "siswa@example.com",
            "email_verified_at": null,
            "password": "$2y$12$HudBGMH1YWokidHTSvkAEefVdNsVrIKXlVDevieE60zFSpiV00yrW",
            "role": "siswa",
            "remember_token": null,
            "created_at": "2025-06-08 15:31:33",
            "updated_at": "2025-06-27 17:15:06",
            "class_id": 1,
            "enrolled_at": null,
            "class_name": "Kelas 6 A",
            "kelas": "kelas 6" -->

    <div class="overflow-x-auto bg-white rounded-lg shadow">
      <table class="table table-zebra w-full">
        <thead>
          <tr>
            <th>No</th>
            <th>Nama</th>
            <th>Email</th>
            <th>Kelas</th>
            <th>Di Udpdate</th>
            <th>Aksi</th>
            <!-- Tambahkan header sesuai data -->
          </tr>
        </thead>
        <tbody>
          <tr v-for="(user, index) in quizData" :key="user.id">
            <td>{{ index + 1 }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.kelas }}</td>
            <td>{{ user.updated_at }}</td>
            <td>
              <router-link :to="`/admin/users/kuis/${user.id}`" class="btn btn-warning">
                Detail
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
