<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuizStore } from "../../../store/quizStore.js";
import { getUserById } from "../../../api/userApi.js";

const route = useRoute();
const router = useRouter();
const quizStore = useQuizStore();

const studentId = computed(() => route.params.studentId || route.params.id);

const studentInfo = ref(null);
const quizResults = ref([]);
const isLoading = ref(true);
const errorMessage = ref(null);

const loadData = async () => {
  const currentStudentId = studentId.value;
  if (!currentStudentId) return;

  isLoading.value = true;
  errorMessage.value = null;

  try {
    const [historyRes, userRes] = await Promise.all([
      quizStore.getAnswerHistoryByStudent(currentStudentId).catch(() => null),
      getUserById(currentStudentId).catch(() => null)
    ]);

    // Set Student Info
    if (userRes) {
      studentInfo.value = userRes.data || userRes;
    }

    // Set Quiz Results List
    let list = [];
    if (historyRes) {
      if (historyRes.data && Array.isArray(historyRes.data)) {
        list = historyRes.data;
      } else if (Array.isArray(historyRes)) {
        list = historyRes;
      }
    }

    quizResults.value = list;

    // Fallback student info from first history item if userRes wasn't loaded
    if (!studentInfo.value && list.length > 0) {
      const first = list[0];
      studentInfo.value = {
        name: first.student_name || first.student?.name,
        email: first.student?.email,
        class_name: first.class_name || first.class?.name
      };
    }
  } catch (err) {
    console.error("Error loading student quiz results:", err);
    errorMessage.value = typeof err === "string" ? err : (err?.response?.data?.message || err?.message || "Gagal memuat daftar kuis siswa.");
  } finally {
    isLoading.value = false;
  }
};

onMounted(loadData);

const averageScore = computed(() => {
  if (quizResults.value.length === 0) return "0.00";
  const sum = quizResults.value.reduce((acc, r) => {
    const score = parseFloat(r.percentage_score ?? 0);
    return acc + (isNaN(score) ? 0 : score);
  }, 0);
  return (sum / quizResults.value.length).toFixed(2);
});

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return d.toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  } catch (e) {
    return dateStr;
  }
};

const goBack = () => {
  if (window.history.state && window.history.state.back) {
    router.back();
  } else {
    router.push("/admin/kuis/hasil");
  }
};
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Daftar Hasil Kuis Siswa 📚</h1>
        <p class="text-gray-500">Kumpulan kuis yang telah dikerjakan oleh siswa</p>
      </div>
      <button @click="goBack" class="btn btn-outline">
        ← Kembali
      </button>
    </div>

    <!-- Error Alert -->
    <div v-if="errorMessage" class="alert alert-error text-white shadow">
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center my-12">
      <div class="loading loading-spinner loading-lg text-primary"></div>
    </div>

    <template v-else>
      <!-- Student Info Header Card -->
      <div v-if="studentInfo" class="bg-white p-6 rounded-2xl shadow border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
            {{ studentInfo.name ? studentInfo.name.charAt(0).toUpperCase() : 'S' }}
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-800">{{ studentInfo.name }}</h2>
            <p class="text-xs text-gray-500">{{ studentInfo.email }}</p>
            <div class="flex items-center gap-2 mt-1">
              <span class="badge badge-primary badge-sm">
                {{ studentInfo.class_name || studentInfo.class?.name || 'Siswa' }}
              </span>
            </div>
          </div>
        </div>

        <div class="flex gap-4 items-center">
          <div class="text-center bg-blue-50 p-3 rounded-xl border border-blue-100 min-w-[110px]">
            <div class="text-xs text-gray-500 font-semibold">Total Kuis</div>
            <div class="text-xl font-extrabold text-blue-600">{{ quizResults.length }}</div>
          </div>
          <div class="text-center bg-emerald-50 p-3 rounded-xl border border-emerald-100 min-w-[110px]">
            <div class="text-xs text-gray-500 font-semibold">Rata-Rata Skor</div>
            <div class="text-xl font-extrabold text-emerald-600">{{ averageScore }}%</div>
          </div>
        </div>
      </div>

      <!-- Quiz Results Cards -->
      <div v-if="quizResults.length > 0" class="space-y-4">
        <div
          v-for="result in quizResults"
          :key="result.id || result.quiz_id"
          class="bg-white rounded-2xl shadow border border-gray-100 p-6 space-y-4 hover:shadow-md transition-shadow"
        >
          <!-- Top Row: Quiz Title & Action Button -->
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-100 pb-3">
            <div>
              <h2 class="text-lg font-bold text-gray-800">
                {{ result.quiz_title || result.quiz?.title || 'Kuis' }}
              </h2>
              <p class="text-xs text-gray-500">
                Pelajaran: <span class="font-semibold text-gray-700">{{ result.lesson_title || result.lesson?.title || '-' }}</span>
              </p>
            </div>

            <router-link
              :to="`/admin/kuis/hasil/detail/${studentId}/${result.quiz_id}`"
              class="btn btn-primary px-5"
            >
              Detail Pengerjaan ➔
            </router-link>
          </div>

          <!-- Stats Grid -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-purple-50/60 p-4 rounded-xl border border-purple-100">
              <span class="text-xs font-semibold text-gray-500">Tingkat Penyelesaian</span>
              <div class="text-2xl font-extrabold text-purple-600">
                {{ result.completion_rate }}%
              </div>
              <p class="text-xs text-gray-500 mt-1">
                {{ result.answered_questions }} / {{ result.total_questions }} Dijawab
              </p>
            </div>

            <div class="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100">
              <span class="text-xs font-semibold text-gray-500">Jawaban Benar</span>
              <div class="text-2xl font-extrabold text-emerald-600">
                {{ result.correct_answers }}
              </div>
              <p class="text-xs text-gray-500 mt-1">
                dari {{ result.total_questions }} Pertanyaan
              </p>
            </div>

            <div class="bg-blue-50/60 p-4 rounded-xl border border-blue-100">
              <span class="text-xs font-semibold text-gray-500">Skor Total</span>
              <div class="text-2xl font-extrabold text-blue-600">
                {{ result.percentage_score }}%
              </div>
              <p class="text-xs text-gray-500 mt-1">
                {{ result.total_score }} / {{ result.max_possible_score }} Poin
              </p>
            </div>
          </div>

          <!-- Submitted Timestamp -->
          <div class="text-xs text-gray-500 flex justify-between items-center pt-2">
            <span>Dikumpulkan Pada: <strong class="text-gray-700">{{ formatDate(result.submitted_at || result.created_at) }}</strong></span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="bg-white rounded-2xl p-12 text-center shadow border border-gray-100">
        <div class="text-4xl mb-2">📚</div>
        <h3 class="text-lg font-bold text-gray-800 mb-1">Belum Ada Kuis Dikerjakan</h3>
        <p class="text-sm text-gray-500">Siswa ini belum pernah menyelesaikan kuis apa pun.</p>
      </div>
    </template>
  </div>
</template>
