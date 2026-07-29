<script setup>
import { ref, onMounted, computed } from "vue";
import { useQuizStore } from "../../../store/quizStore";

const quizStore = useQuizStore();

const answerHistories = ref([]);
const totalQuizzesCount = ref(0);
const isLoading = ref(true);
const errorMessage = ref(null);

const searchQuery = ref("");
const selectedClass = ref("");

const loadData = async () => {
  isLoading.value = true;
  errorMessage.value = null;

  try {
    const [resHistories, resQuizzes] = await Promise.all([
      quizStore.getAdminAnswerHistory().catch(() => null),
      quizStore.getQuizzes().catch(() => null)
    ]);

    // Process Answer Histories
    if (resHistories) {
      if (resHistories.data && Array.isArray(resHistories.data)) {
        answerHistories.value = resHistories.data;
      } else if (Array.isArray(resHistories)) {
        answerHistories.value = resHistories;
      }
    }

    // Process Total Quizzes Count
    if (quizStore.quizzes && Array.isArray(quizStore.quizzes)) {
      totalQuizzesCount.value = quizStore.quizzes.length;
    } else if (resQuizzes && Array.isArray(resQuizzes.data)) {
      totalQuizzesCount.value = resQuizzes.data.length;
    }
  } catch (err) {
    console.error("Error loading quiz results data:", err);
    errorMessage.value = typeof err === "string" ? err : (err?.response?.data?.message || err?.message || "Gagal memuat hasil kuis.");
  } finally {
    isLoading.value = false;
  }
};

onMounted(loadData);

// Group histories by student
const studentSummaryList = computed(() => {
  const map = new Map();

  answerHistories.value.forEach((item) => {
    const sId = item.student_id || item.student?.id;
    if (!sId) return;

    if (!map.has(sId)) {
      map.set(sId, {
        student_id: sId,
        student_name: item.student_name || item.student?.name || "Siswa",
        student_email: item.student?.email || "-",
        class_name: item.class_name || item.class?.name || "Tidak ada kelas",
        class_id: item.class_id || item.class?.id,
        histories: []
      });
    }

    map.get(sId).histories.push(item);
  });

  // Calculate aggregates for each student
  return Array.from(map.values()).map((s) => {
    const totalCompleted = s.histories.length;
    const sumPercentage = s.histories.reduce((acc, h) => {
      const score = parseFloat(h.percentage_score ?? 0);
      return acc + (isNaN(score) ? 0 : score);
    }, 0);

    const avgScore = totalCompleted > 0 ? (sumPercentage / totalCompleted).toFixed(2) : "0.00";

    return {
      ...s,
      completed_count: totalCompleted,
      total_available: totalQuizzesCount.value > 0 ? totalQuizzesCount.value : totalCompleted,
      average_score: avgScore
    };
  });
});

// Extract unique classes for filter
const uniqueClasses = computed(() => {
  const map = new Map();
  studentSummaryList.value.forEach((item) => {
    if (item.class_name && !map.has(item.class_name)) {
      map.set(item.class_name, item.class_name);
    }
  });
  return Array.from(map.keys());
});

// Filter student list based on search and class
const filteredStudents = computed(() => {
  return studentSummaryList.value.filter((item) => {
    const sName = (item.student_name || "").toLowerCase();
    const sEmail = (item.student_email || "").toLowerCase();
    const cName = item.class_name || "";

    const query = searchQuery.value.toLowerCase().trim();

    const matchesSearch = !query || sName.includes(query) || sEmail.includes(query);
    const matchesClass = !selectedClass.value || cName === selectedClass.value;

    return matchesSearch && matchesClass;
  });
});

const getScoreColorClass = (score) => {
  const num = parseFloat(score);
  if (num >= 80) return "badge-success text-white";
  if (num >= 60) return "badge-warning text-white";
  return "badge-error text-white";
};
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Hasil Kuis Siswa 📊</h1>
        <p class="text-gray-500">Ringkasan hasil kuis per siswa</p>
      </div>
      <button @click="loadData" class="btn btn-outline btn-sm">
        🔄 Refresh Data
      </button>
    </div>

    <!-- Error Alert -->
    <div v-if="errorMessage" class="alert alert-error text-white shadow">
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Filters & Search -->
    <div class="bg-white p-4 rounded-xl shadow border border-gray-100 flex flex-col md:flex-row gap-4 justify-between">
      <div class="form-control w-full md:w-1/2">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari nama atau email siswa..."
          class="input input-bordered w-full"
        />
      </div>

      <div class="form-control w-full md:w-1/3">
        <select v-model="selectedClass" class="select select-bordered w-full">
          <option value="">Semua Kelas</option>
          <option v-for="cls in uniqueClasses" :key="cls" :value="cls">
            {{ cls }}
          </option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center my-12">
      <div class="loading loading-spinner loading-lg text-primary"></div>
    </div>

    <!-- Student Aggregation Table -->
    <div v-else class="overflow-x-auto bg-white rounded-xl shadow border border-gray-100">
      <table class="table table-zebra w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="py-3 px-4">No</th>
            <th class="py-3 px-4">Siswa</th>
            <th class="py-3 px-4">Kelas</th>
            <th class="py-3 px-4 text-center">Kuis Dikerjakan</th>
            <th class="py-3 px-4 text-center">Rata-Rata Skor</th>
            <th class="py-3 px-4 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(student, index) in filteredStudents" :key="student.student_id" class="hover:bg-gray-50">
            <td class="font-bold text-gray-500">{{ index + 1 }}</td>
            <td>
              <div class="font-bold text-gray-900">{{ student.student_name }}</div>
              <div class="text-xs text-gray-500">{{ student.student_email }}</div>
            </td>
            <td>
              <span class="badge badge-primary badge-sm">
                {{ student.class_name }}
              </span>
            </td>
            <td class="text-center font-bold text-gray-800">
              <span class="px-2 py-1 bg-gray-100 rounded-lg">
                {{ student.completed_count }} / {{ student.total_available }}
              </span>
            </td>
            <td class="text-center">
              <span class="badge font-bold px-3 py-2" :class="getScoreColorClass(student.average_score)">
                {{ student.average_score }}%
              </span>
            </td>
            <td class="text-center">
              <router-link
                :to="`/admin/kuis/hasil/siswa/${student.student_id}`"
                class="btn btn-sm btn-primary text-white"
              >
                Lihat Hasil Kuis
              </router-link>
            </td>
          </tr>

          <!-- Empty State -->
          <tr v-if="filteredStudents.length === 0">
            <td colspan="6" class="text-center py-8 text-gray-400">
              Belum ada data pengerjaan kuis siswa.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
