<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { useQuizStore } from "../../../store/quizStore";
import { useStudentStore } from "../../../store/studentStore";
import { useClassesStore } from "../../../store/classesStore";
import { useLessonsStore } from "../../../store/lessonsStore";
import { useAuthStore } from "../../../store/authStore";

const route = useRoute();
const quizStore = useQuizStore();
const studentStore = useStudentStore();
const classesStore = useClassesStore();
const lessonsStore = useLessonsStore();
const authStore = useAuthStore();

const answerHistories = ref([]);
const totalQuizzesCount = ref(0);
const isLoading = ref(true);
let isFetching = false;
const errorMessage = ref(null);

const searchQuery = ref("");
const selectedClass = ref("");

const userRole = computed(() => authStore.userRole || localStorage.getItem("role"));
const currentUserId = computed(() => Number(authStore.currentUserId || authStore.user?.id || localStorage.getItem("user_id")));

const myClassIds = computed(() => {
  if (userRole.value !== 'guru') return null;
  const list = classesStore.classes || [];
  return list
    .filter(cls => Number(cls.teacher_id || cls.teacher?.id || 0) === currentUserId.value)
    .map(cls => Number(cls.id));
});

const isStudentInGuruClasses = (student) => {
  if (userRole.value !== 'guru') return true;
  const classes = student.classes_enrolled || student.classesEnrolled || student.classes || [];
  if (!Array.isArray(classes)) return false;
  return classes.some(c => {
    const cId = Number(c.id || c.class_id);
    const tId = Number(c.teacher_id || c.teacher?.id || 0);
    return (myClassIds.value && myClassIds.value.includes(cId)) || (tId > 0 && tId === currentUserId.value);
  });
};

const loadData = async (force = false) => {
  if (isFetching && !force) return;
  isFetching = true;
  isLoading.value = true;
  errorMessage.value = null;

  try {
    const [resHistories, resQuizzes] = await Promise.all([
      quizStore.getAdminAnswerHistory().catch(() => null),
      quizStore.getQuizzes().catch(() => null),
      studentStore.getUserStudent().catch(() => null),
      classesStore.getClasses().catch(() => null),
      lessonsStore.getLessons().catch(() => null)
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
    isFetching = false;
  }
};

onMounted(loadData);

watch(
  () => route.fullPath,
  (newPath, oldPath) => {
    if (newPath === "/admin/kuis/hasil" && oldPath && oldPath !== "/admin/kuis/hasil") {
      loadData();
    }
  }
);

const totalAvailableQuizzesCount = computed(() => {
  const allQuizzes = quizStore.quizzes || [];
  if (userRole.value === 'guru' && myClassIds.value) {
    const allLessons = lessonsStore.lessons || [];
    const teacherLessonIds = allLessons
      .filter(l => myClassIds.value.includes(Number(l.class_id)))
      .map(l => Number(l.id));
    
    if (teacherLessonIds.length > 0) {
      const teacherQuizzes = allQuizzes.filter(q => teacherLessonIds.includes(Number(q.lesson_id)));
      if (teacherQuizzes.length > 0) return teacherQuizzes.length;
    }
  }
  return allQuizzes.length > 0 ? allQuizzes.length : totalQuizzesCount.value;
});

// Group histories by student (including students who haven't taken any quiz)
const studentSummaryList = computed(() => {
  const map = new Map();

  // 1. Initialize map with registered students from studentStore
  const allStudents = studentStore.students || [];

  allStudents.forEach((student) => {
    const sId = student.id;
    if (!sId) return;

    // Filter for teacher role: only include students in teacher's classes
    if (userRole.value === 'guru' && !isStudentInGuruClasses(student)) {
      return;
    }

    const classes = student.classes_enrolled || student.classesEnrolled || student.classes || [];
    let className = "Tidak ada kelas";
    let classId = null;

    if (Array.isArray(classes) && classes.length > 0) {
      const relevantClasses = userRole.value === 'guru'
        ? classes.filter(c => {
            const cId = Number(c.id || c.class_id);
            const tId = Number(c.teacher_id || c.teacher?.id || 0);
            return (myClassIds.value && myClassIds.value.includes(cId)) || (tId > 0 && tId === currentUserId.value);
          })
        : classes;

      const activeClasses = relevantClasses.length > 0 ? relevantClasses : classes;
      className = activeClasses.map((c) => c.name || c.class_name).filter(Boolean).join(", ") || "Tidak ada kelas";
      classId = activeClasses[0]?.id || null;
    } else if (typeof classes === "object" && classes?.name) {
      className = classes.name;
      classId = classes.id || null;
    }

    map.set(sId, {
      student_id: sId,
      student_name: student.name || "Siswa",
      student_email: student.email || "-",
      class_name: className,
      class_id: classId,
      raw_classes: classes,
      histories: []
    });
  });

  // 2. Merge answer histories
  answerHistories.value.forEach((item) => {
    const sId = item.student_id || item.student?.id;
    if (!sId) return;

    if (!map.has(sId)) {
      if (userRole.value !== 'guru') {
        map.set(sId, {
          student_id: sId,
          student_name: item.student_name || item.student?.name || "Siswa",
          student_email: item.student?.email || "-",
          class_name: item.class_name || item.class?.name || "Tidak ada kelas",
          class_id: item.class_id || item.class?.id,
          raw_classes: item.class ? [item.class] : [],
          histories: []
        });
      } else {
        const itemClassId = Number(item.class_id || item.class?.id || 0);
        if (itemClassId > 0 && myClassIds.value && myClassIds.value.includes(itemClassId)) {
          map.set(sId, {
            student_id: sId,
            student_name: item.student_name || item.student?.name || "Siswa",
            student_email: item.student?.email || "-",
            class_name: item.class_name || item.class?.name || "Tidak ada kelas",
            class_id: itemClassId,
            raw_classes: item.class ? [item.class] : [],
            histories: []
          });
        } else {
          return;
        }
      }
    }

    const existing = map.get(sId);
    if (item.class_name && existing.class_name === "Tidak ada kelas") {
      existing.class_name = item.class_name;
    }
    if (item.class_id && !existing.class_id) {
      existing.class_id = item.class_id;
    }
    existing.histories.push(item);
  });

  // 3. Calculate aggregates for each student based on RELEVANT quizzes for their classes
  const allLessons = lessonsStore.lessons || [];
  const allQuizzes = quizStore.quizzes || [];

  return Array.from(map.values()).map((s) => {
    const totalCompleted = s.histories.length;

    // Extract student's class IDs
    const studentClassIds = new Set();
    if (s.class_id) studentClassIds.add(Number(s.class_id));

    if (Array.isArray(s.raw_classes)) {
      s.raw_classes.forEach((c) => {
        const cId = Number(c.id || c.class_id);
        if (cId > 0) studentClassIds.add(cId);
      });
    }

    const classIdArray = Array.from(studentClassIds);

    // Find lessons belonging to student's classes
    const relevantLessonIds = allLessons
      .filter((l) => classIdArray.includes(Number(l.class_id)))
      .map((l) => Number(l.id));

    // Find quizzes belonging to student's classes or lessons
    const relevantQuizzes = allQuizzes.filter((q) => {
      const qClassId = Number(q.class_id || q.lesson?.class_id || 0);
      const qLessonId = Number(q.lesson_id);
      return (qClassId > 0 && classIdArray.includes(qClassId)) ||
             (qLessonId > 0 && relevantLessonIds.includes(qLessonId));
    });

    let totalAvailable = totalCompleted;
    if (classIdArray.length > 0) {
      totalAvailable = relevantQuizzes.length;
    } else if (totalAvailableQuizzesCount.value > 0) {
      totalAvailable = totalAvailableQuizzesCount.value;
    }

    if (totalCompleted > totalAvailable) {
      totalAvailable = totalCompleted;
    }

    const sumPercentage = s.histories.reduce((acc, h) => {
      const score = parseFloat(h.percentage_score ?? 0);
      return acc + (isNaN(score) ? 0 : score);
    }, 0);

    const avgScore = totalCompleted > 0 ? (sumPercentage / totalCompleted).toFixed(2) : "0.00";

    return {
      ...s,
      completed_count: totalCompleted,
      total_available: totalAvailable,
      average_score: avgScore
    };
  });
});

// Extract unique classes for filter
const uniqueClasses = computed(() => {
  const map = new Map();
  studentSummaryList.value.forEach((item) => {
    if (item.class_name && item.class_name !== "Tidak ada kelas") {
      const names = item.class_name.split(",").map(n => n.trim());
      names.forEach(n => {
        if (n && !map.has(n)) map.set(n, n);
      });
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
    const matchesClass = !selectedClass.value || cName === selectedClass.value || cName.includes(selectedClass.value);

    return matchesSearch && matchesClass;
  });
});

const getScoreColorClass = (student) => {
  if (student.completed_count === 0) return "badge-ghost bg-gray-100 text-gray-500";
  const num = parseFloat(student.average_score);
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
      <div class="flex items-center gap-2">
        <router-link to="/admin/rekap-nilai" class="btn btn-primary btn-sm shadow text-white">
          <span>📊</span> Rekap Nilai Siswa
        </router-link>
        <button @click="loadData" class="btn btn-outline btn-sm">
          🔄 Refresh Data
        </button>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="errorMessage" class="alert alert-error text-white shadow">
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Filters & Search -->
    <div class="bg-white p-4 rounded-xl shadow border border-gray-100 flex flex-col md:flex-row gap-4 justify-between">
      <div class="form-control w-full md:w-1/2">
        <input v-model="searchQuery" type="text" placeholder="Cari nama atau email siswa..."
          class="input input-bordered w-full" />
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
              <span class="badge font-bold px-3 py-2" :class="getScoreColorClass(student)">
                {{ student.average_score }}%
              </span>
            </td>
            <td class="text-center">
              <router-link :to="`/admin/kuis/hasil/siswa/${student.student_id}`"
                class="btn btn-sm btn-primary text-white">
                Lihat Hasil Kuis
              </router-link>
            </td>
          </tr>

          <!-- Empty State -->
          <tr v-if="filteredStudents.length === 0">
            <td colspan="6" class="text-center py-8 text-gray-400">
              Belum ada data siswa.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
