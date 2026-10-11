<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useStudentRecapStore } from "../../store/studentRecapStore";
import { useClassesStore } from "../../store/classesStore";
import { useAuthStore } from "../../store/authStore";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import {
  TableCellsIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  InformationCircleIcon,
  FunnelIcon,
} from "@heroicons/vue/24/outline";

const route = useRoute();
const recapStore = useStudentRecapStore();
const classesStore = useClassesStore();
const authStore = useAuthStore();

const userRole = computed(() => authStore.userRole || localStorage.getItem("role"));
const currentUserId = computed(() =>
  Number(authStore.currentUserId || authStore.userId || authStore.user?.id || localStorage.getItem("user_id") || 0)
);

// Kelas yang diampu guru saat ini
const myClasses = computed(() => {
  if (userRole.value !== "guru") return classesStore.classes || [];
  return (classesStore.classes || []).filter(
    (cls) => Number(cls.teacher_id || cls.teacher?.id || 0) === currentUserId.value
  );
});

const filterForm = reactive({
  search: "",
  class_id: "",
  status: "aktif",
  per_page: 15,
  page: 1,
});

const searchTimeout = ref(null);

const classLevels = [
  { level: 1, label: "Kelas 1", key: "kelas_1" },
  { level: 2, label: "Kelas 2", key: "kelas_2" },
  { level: 3, label: "Kelas 3", key: "kelas_3" },
  { level: 4, label: "Kelas 4", key: "kelas_4" },
  { level: 5, label: "Kelas 5", key: "kelas_5" },
  { level: 6, label: "Kelas 6", key: "kelas_6" },
];

const loadRecaps = async () => {
  // Jika role guru, pastikan filter terkunci ke kelasnya & status aktif
  if (userRole.value === "guru") {
    filterForm.status = "aktif";

    if (myClasses.value.length > 0) {
      const isAllowed = myClasses.value.some(
        (c) => Number(c.id) === Number(filterForm.class_id)
      );
      if (!isAllowed) {
        filterForm.class_id = myClasses.value[0].id;
      }
    } else {
      // Guru belum memiliki kelas yang diampu
      filterForm.class_id = "";
      recapStore.students = [];
      return;
    }
  }

  const params = {
    page: filterForm.page,
    per_page: filterForm.per_page === "all" ? 9999 : filterForm.per_page,
  };
  if (filterForm.search) params.search = filterForm.search;
  if (filterForm.class_id) params.class_id = filterForm.class_id;
  if (filterForm.status) params.status = filterForm.status;
  if (filterForm.per_page === "all") params.all = true;

  try {
    await recapStore.fetchRecaps(params);
  } catch (err) {
    console.error("Gagal memuat data rekap:", err);
  }
};

onMounted(async () => {
  try {
    await classesStore.getClasses();
  } catch (err) {
    console.error("Gagal memuat kelas:", err);
  }

  // Jika guru, kunci otomatis status ke aktif dan pilih kelas guru tersebut
  if (userRole.value === "guru") {
    filterForm.status = "aktif";
    if (myClasses.value.length > 0) {
      filterForm.class_id = myClasses.value[0].id;
    }
  } else {
    // Admin default status kosong (semua status)
    filterForm.status = "";
  }

  await loadRecaps();
});

// Watch input pencarian dengan debounce 400ms
watch(
  () => filterForm.search,
  () => {
    clearTimeout(searchTimeout.value);
    searchTimeout.value = setTimeout(() => {
      filterForm.page = 1;
      loadRecaps();
    }, 400);
  }
);

watch(
  () => [filterForm.class_id, filterForm.status, filterForm.per_page],
  () => {
    filterForm.page = 1;
    loadRecaps();
  }
);

const handlePageChange = (newPage) => {
  if (newPage < 1 || newPage > recapStore.pagination.last_page) return;
  filterForm.page = newPage;
  loadRecaps();
};

const handleSync = async () => {
  const confirm = await Swal.fire({
    title: "Sinkronisasi Rekap Nilai?",
    text: "Sistem akan menghitung ulang rata-rata nilai dari seluruh riwayat kuis siswa.",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#4f46e5",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Ya, Sinkronkan",
    cancelButtonText: "Batal",
  });

  if (!confirm.isConfirmed) return;

  try {
    const res = await recapStore.syncAllRecaps();
    Swal.fire({
      title: "Sinkronisasi Berhasil!",
      text: res.message || "Data rekapitulasi nilai berhasil diperbarui.",
      icon: "success",
      confirmButtonColor: "#4f46e5",
    });
    await loadRecaps();
  } catch (err) {
    Swal.fire({
      title: "Gagal Sinkronisasi",
      text: err.response?.data?.message || "Terjadi kesalahan saat sinkronisasi.",
      icon: "error",
      confirmButtonColor: "#ef4444",
    });
  }
};

/**
 * Format score: jika null/undefined tampilkan '-', jika angka tampilkan string formatted
 */
const formatScore = (val) => {
  if (val === null || val === undefined || val === "") return "-";
  const num = Number(val);
  if (isNaN(num)) return "-";
  return Number.isInteger(num) ? num.toString() : num.toFixed(2);
};

/**
 * Mengambil nilai spesifik dari student data
 */
const getStudentGrade = (student, levelKey, semesterNum) => {
  if (!student) return "-";
  const flatKey = `${levelKey}_sem_${semesterNum}`;
  if (student.flat_grades && student.flat_grades[flatKey] !== undefined) {
    return formatScore(student.flat_grades[flatKey]);
  }
  const semKey = `semester_${semesterNum}`;
  if (student.grades && student.grades[levelKey] && student.grades[levelKey][semKey] !== undefined) {
    return formatScore(student.grades[levelKey][semKey]);
  }
  return "-";
};

// Hitung rerata per baris (siswa)
const getStudentOverallAverage = (student) => {
  if (!student || !student.flat_grades) return "-";
  const scores = Object.values(student.flat_grades).filter(
    (v) => v !== null && v !== undefined && !isNaN(Number(v))
  );
  if (scores.length === 0) return "-";
  const sum = scores.reduce((acc, curr) => acc + Number(curr), 0);
  return (sum / scores.length).toFixed(2);
};

// Nama kelas aktif untuk judul ekspor
const activeClassName = computed(() => {
  if (!filterForm.class_id) return "";
  const found = (classesStore.classes || []).find(
    (c) => Number(c.id) === Number(filterForm.class_id)
  );
  return found ? found.name : "";
});

/**
 * Export ke format Excel (.xlsx) dengan struktur tabel ber-header gabungan (merge cell)
 */
const exportToExcel = () => {
  const students = recapStore.students;
  if (!students || students.length === 0) {
    Swal.fire({
      title: "Data Kosong",
      text: "Tidak ada data untuk diekspor",
      icon: "warning",
    });
    return;
  }

  // Baris Header 1: Nama Siswa, Kelas 1..6 (2 kolom per kelas), Rerata
  const row1 = [
    "Nama Siswa",
    "Kelas 1", "",
    "Kelas 2", "",
    "Kelas 3", "",
    "Kelas 4", "",
    "Kelas 5", "",
    "Kelas 6", "",
    "Rerata",
  ];

  // Baris Header 2: Sub-kolom semester 1 dan 2 untuk tiap kelas
  const row2 = [
    "",
    "1", "2",
    "1", "2",
    "1", "2",
    "1", "2",
    "1", "2",
    "1", "2",
    "",
  ];

  // Baris data siswa
  const dataRows = students.map((s) => {
    const scores = [];
    classLevels.forEach((cls) => {
      scores.push(getStudentGrade(s, cls.key, 1));
      scores.push(getStudentGrade(s, cls.key, 2));
    });

    return [
      s.student_name || "-",
      ...scores,
      getStudentOverallAverage(s),
    ];
  });

  const worksheetData = [row1, row2, ...dataRows];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Konfigurasi merge cells untuk header tingkat 1 & 2
  // A1:A2 (Nama Siswa) -> r:0..1, c:0
  // N1:N2 (Rerata) -> r:0..1, c:13
  // B1:C1 (Kelas 1) -> r:0, c:1..2
  // D1:E1 (Kelas 2) -> r:0, c:3..4
  // F1:G1 (Kelas 3) -> r:0, c:5..6
  // H1:I1 (Kelas 4) -> r:0, c:7..8
  // J1:K1 (Kelas 5) -> r:0, c:9..10
  // L1:M1 (Kelas 6) -> r:0, c:11..12
  worksheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } },
    { s: { r: 0, c: 1 }, e: { r: 0, c: 2 } },
    { s: { r: 0, c: 3 }, e: { r: 0, c: 4 } },
    { s: { r: 0, c: 5 }, e: { r: 0, c: 6 } },
    { s: { r: 0, c: 7 }, e: { r: 0, c: 8 } },
    { s: { r: 0, c: 9 }, e: { r: 0, c: 10 } },
    { s: { r: 0, c: 11 }, e: { r: 0, c: 12 } },
    { s: { r: 0, c: 13 }, e: { r: 1, c: 13 } },
  ];

  // Lebar kolom rapi
  worksheet["!cols"] = [
    { wch: 30 }, // Nama Siswa
    { wch: 9 },  // Kelas 1 Sem 1
    { wch: 9 },  // Kelas 1 Sem 2
    { wch: 9 },  // Kelas 2 Sem 1
    { wch: 9 },  // Kelas 2 Sem 2
    { wch: 9 },  // Kelas 3 Sem 1
    { wch: 9 },  // Kelas 3 Sem 2
    { wch: 9 },  // Kelas 4 Sem 1
    { wch: 9 },  // Kelas 4 Sem 2
    { wch: 9 },  // Kelas 5 Sem 1
    { wch: 9 },  // Kelas 5 Sem 2
    { wch: 9 },  // Kelas 6 Sem 1
    { wch: 9 },  // Kelas 6 Sem 2
    { wch: 11 }, // Rerata
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Nilai");

  const classSuffix = activeClassName.value
    ? `_${activeClassName.value.replace(/[^a-zA-Z0-9]/g, "_")}`
    : "";
  const dateStr = new Date().toISOString().slice(0, 10);
  const fileName = `rekap_nilai_siswa${classSuffix}_${dateStr}.xlsx`;

  XLSX.writeFile(workbook, fileName);
};
</script>

<template>
  <div class="p-4 md:p-6 space-y-6">
    <!-- Header Title & Action Buttons -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div>
        <div class="flex items-center gap-3">
          <div class="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <TableCellsIcon class="w-7 h-7" />
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Rekap Nilai Siswa</h1>
            <p class="text-sm text-gray-500 mt-0.5">
              Matriks rekapitulasi rerata nilai siswa dari Kelas 1 hingga Kelas 6 untuk Semester 1 (Ganjil) dan Semester 2 (Genap)
              <span v-if="userRole === 'guru' && activeClassName" class="font-semibold text-indigo-600">
                — {{ activeClassName }}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <button
          @click="loadRecaps"
          :disabled="recapStore.loading"
          class="btn btn-outline btn-sm gap-2 border-gray-300 hover:bg-gray-100 text-gray-700"
          title="Muat Ulang Data"
        >
          <ArrowPathIcon class="w-4 h-4" :class="{ 'animate-spin': recapStore.loading }" />
          <span>Refresh</span>
        </button>

        <button
          @click="handleSync"
          :disabled="recapStore.syncing"
          class="btn btn-sm bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-sm border-none"
          title="Kalkulasi ulang seluruh nilai riwayat kuis"
        >
          <ArrowPathIcon class="w-4 h-4" :class="{ 'animate-spin': recapStore.syncing }" />
          <span>{{ recapStore.syncing ? "Sinkronisasi..." : "Sinkronkan Nilai" }}</span>
        </button>

        <!-- Tombol Ekspor ke Excel -->
        <button
          @click="exportToExcel"
          :disabled="recapStore.loading || recapStore.students.length === 0"
          class="btn btn-sm bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-sm border-none"
          title="Ekspor tabel ke format Excel (.xlsx)"
        >
          <ArrowDownTrayIcon class="w-4 h-4" />
          <span>Ekspor Excel</span>
        </button>
      </div>
    </div>

    <!-- Info / Keterangan Penjelasan Header & Format -->
    <div class="alert alert-info bg-blue-50 border border-blue-200 text-blue-900 rounded-xl shadow-sm flex items-start gap-3 p-4">
      <InformationCircleIcon class="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
      <div class="text-sm space-y-1">
        <div class="font-semibold text-blue-950">Petunjuk Tabel Rekap Nilai:</div>
        <ul class="list-disc list-inside space-y-0.5 text-blue-800">
          <li>Angka <strong>1</strong> dan <strong>2</strong> di bawah kolom kelas merupakan semester: <strong>1 = Semester 1 (Ganjil / Gasal)</strong> dan <strong>2 = Semester 2 (Genap)</strong>.</li>
          <li>Nilai di bawah kolom semester adalah <strong>rerata nilai kuis</strong> yang diselesaikan siswa pada jenjang kelas dan semester tersebut.</li>
          <li>Tanda <span class="badge badge-sm badge-ghost font-mono font-bold">-</span> menandakan belum terdapat riwayat nilai (null) pada jenjang dan semester tersebut.</li>
          <li v-if="userRole === 'guru'">
            Mode Guru: Menampilkan khusus siswa <strong>aktif</strong> pada kelas yang Anda ampu.
          </li>
        </ul>
      </div>
    </div>

    <!-- Filters & Search Toolbar -->
    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-3 items-center justify-between">
      <div class="w-full md:w-80 relative">
        <input
          v-model="filterForm.search"
          type="text"
          placeholder="Cari nama atau email siswa..."
          class="input input-bordered input-sm w-full pl-9 bg-gray-50 focus:bg-white text-sm"
        />
        <MagnifyingGlassIcon class="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
      </div>

      <div class="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
        <div class="flex items-center gap-1.5 text-sm text-gray-500">
          <FunnelIcon class="w-4 h-4" />
          <span>Filter:</span>
        </div>

        <!-- Filter Kelas: Jika Guru, otomatis terkunci ke kelasnya -->
        <template v-if="userRole === 'guru'">
          <!-- Jika Guru belum ada kelas -->
          <div
            v-if="myClasses.length === 0"
            class="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-medium"
          >
            ⚠️ Belum ada kelas yang diampu
          </div>

          <!-- Jika Guru hanya punya 1 kelas: Terkunci (tidak bisa diubah) -->
          <div
            v-else-if="myClasses.length === 1"
            class="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-semibold text-gray-700 border border-gray-200 cursor-not-allowed select-none"
            title="Filter kelas otomatis terkunci ke kelas yang Anda ampu"
          >
            <span>🏫 {{ myClasses[0]?.name }}</span>
            <span class="text-[11px] text-gray-400 font-mono">🔒</span>
          </div>

          <!-- Jika Guru punya > 1 kelas: Hanya bisa beralih di antara kelas yang diampunya -->
          <select
            v-else
            v-model="filterForm.class_id"
            class="select select-bordered select-sm text-xs bg-gray-50 focus:bg-white border-primary"
            title="Pilih kelas yang Anda ampu"
          >
            <option
              v-for="c in myClasses"
              :key="c.id"
              :value="c.id"
            >
              🏫 {{ c.name }} ({{ c.level }})
            </option>
          </select>
        </template>

        <!-- Filter Kelas: Jika Admin, bebas pilih semua kelas atau kelas tertentu -->
        <select
          v-else
          v-model="filterForm.class_id"
          class="select select-bordered select-sm text-xs bg-gray-50 focus:bg-white"
        >
          <option value="">Semua Kelas</option>
          <option
            v-for="c in classesStore.classes"
            :key="c.id"
            :value="c.id"
          >
            {{ c.name }} ({{ c.level }})
          </option>
        </select>

        <!-- Filter Status: Jika Guru, terkunci otomatis ke 'Aktif' (tidak bisa diubah) -->
        <div
          v-if="userRole === 'guru'"
          class="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-semibold text-gray-700 border border-gray-200 cursor-not-allowed select-none"
          title="Filter status otomatis terkunci pada siswa aktif"
        >
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Status: Aktif</span>
          <span class="text-[11px] text-gray-400 font-mono">🔒</span>
        </div>

        <!-- Filter Status: Jika Admin, dapat memilih status -->
        <select
          v-else
          v-model="filterForm.status"
          class="select select-bordered select-sm text-xs bg-gray-50 focus:bg-white"
        >
          <option value="">Semua Status</option>
          <option value="aktif">Aktif</option>
          <option value="lulus">Lulus</option>
          <option value="nonaktif">Nonaktif</option>
        </select>

        <!-- Pilihan Per Halaman -->
        <select
          v-model="filterForm.per_page"
          class="select select-bordered select-sm text-xs bg-gray-50 focus:bg-white"
        >
          <option :value="15">15 per halaman</option>
          <option :value="25">25 per halaman</option>
          <option :value="50">50 per halaman</option>
          <option value="all">Semua Siswa</option>
        </select>
      </div>
    </div>

    <!-- Main Recap Table Card -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <!-- Loading Overlay / Spinner -->
      <div v-if="recapStore.loading" class="flex flex-col items-center justify-center py-20">
        <span class="loading loading-spinner loading-lg text-indigo-600"></span>
        <p class="text-sm text-gray-500 mt-3 font-medium">Memuat rekapitulasi nilai siswa...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="recapStore.error" class="p-8 text-center space-y-3">
        <div class="text-red-500 font-semibold text-base">{{ recapStore.error }}</div>
        <button @click="loadRecaps" class="btn btn-sm btn-outline btn-primary">Coba Lagi</button>
      </div>

      <!-- Empty State -->
      <div v-else-if="recapStore.students.length === 0" class="p-12 text-center space-y-2">
        <div class="text-4xl">📂</div>
        <h3 class="text-base font-semibold text-gray-700">Tidak ada data rekap nilai</h3>
        <p class="text-sm text-gray-400">
          <span v-if="userRole === 'guru' && myClasses.length === 0">
            Anda belum memiliki kelas yang diampu. Silakan hubungi admin.
          </span>
          <span v-else>
            Belum ada siswa aktif terdaftar pada kelas ini atau belum memiliki riwayat kuis.
          </span>
        </p>
      </div>

      <!-- Data Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm text-center border-collapse">
          <thead>
            <!-- Header Baris 1: Kolom Nama Siswa & Kolom Kelas 1 s.d 6 -->
            <tr class="bg-gray-100 text-gray-800 border-b border-gray-300 font-semibold">
              <th
                rowspan="2"
                class="py-3 px-4 text-left border-r border-gray-300 min-w-[200px] sticky left-0 bg-gray-100 z-10 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]"
              >
                Nama Siswa
              </th>
              <th
                v-for="cls in classLevels"
                :key="cls.level"
                colspan="2"
                class="py-2.5 px-3 border-r border-gray-300 text-center tracking-wide"
                :class="{
                  'bg-blue-50/70 text-blue-900': cls.level % 2 === 1,
                  'bg-indigo-50/70 text-indigo-900': cls.level % 2 === 0,
                }"
              >
                {{ cls.label }}
              </th>
              <th
                rowspan="2"
                class="py-3 px-3 text-center bg-gray-100 text-gray-700 font-bold min-w-[80px]"
                title="Rata-rata dari seluruh nilai yang ada"
              >
                Rerata
              </th>
            </tr>

            <!-- Header Baris 2: Sub-kolom Angka 1 (Ganjil) dan 2 (Genap) untuk masing-masing kelas -->
            <tr class="bg-gray-50 text-gray-700 border-b-2 border-gray-300 font-bold text-xs">
              <template v-for="cls in classLevels" :key="`sub-${cls.level}`">
                <th
                  class="py-2 px-2.5 border-r border-gray-200 min-w-[55px] text-center hover:bg-gray-200/50 transition-colors"
                  :class="cls.level % 2 === 1 ? 'bg-blue-50/40 text-blue-800' : 'bg-indigo-50/40 text-indigo-800'"
                  title="Semester 1 (Ganjil / Gasal)"
                >
                  1
                </th>
                <th
                  class="py-2 px-2.5 border-r border-gray-300 min-w-[55px] text-center hover:bg-gray-200/50 transition-colors"
                  :class="cls.level % 2 === 1 ? 'bg-blue-50/40 text-blue-800' : 'bg-indigo-50/40 text-indigo-800'"
                  title="Semester 2 (Genap)"
                >
                  2
                </th>
              </template>
            </tr>
          </thead>

          <!-- Table Body -->
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="student in recapStore.students"
              :key="student.student_id"
              class="hover:bg-indigo-50/30 transition-colors odd:bg-white even:bg-gray-50/40"
            >
              <!-- Kolom Nama Siswa (Sticky di sisi kiri untuk scroll horizontal yang nyaman) -->
              <td class="py-3 px-4 text-left border-r border-gray-300 font-medium text-gray-900 sticky left-0 bg-inherit z-10 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">
                <div class="flex items-center justify-between gap-2">
                  <span class="font-semibold text-gray-800 hover:text-indigo-600 cursor-default">
                    {{ student.student_name }}
                  </span>
                  <!-- Khusus Admin: Tampilkan status jika bukan aktif -->
                  <span
                    v-if="userRole !== 'guru' && student.student_status && student.student_status !== 'aktif'"
                    class="badge badge-xs badge-ghost text-[10px] text-gray-500"
                  >
                    {{ student.student_status }}
                  </span>
                </div>
                <!-- Khusus Admin: Tampilkan keterangan kelas saat ini -->
                <div v-if="userRole !== 'guru' && student.current_class" class="text-[11px] text-gray-400 mt-0.5">
                  {{ student.current_class.name }} ({{ student.current_class.academic_year || '' }})
                </div>
              </td>

              <!-- Kolom Nilai untuk Kelas 1 s.d 6 (Semester 1 & 2) -->
              <template v-for="cls in classLevels" :key="`val-${student.student_id}-${cls.level}`">
                <!-- Semester 1 (Ganjil) -->
                <td
                  class="py-2.5 px-2.5 border-r border-gray-200 text-center font-mono"
                  :class="{
                    'text-gray-400 font-normal': getStudentGrade(student, cls.key, 1) === '-',
                    'font-bold text-gray-800 bg-emerald-50/40': getStudentGrade(student, cls.key, 1) !== '-',
                  }"
                >
                  <span
                    v-if="getStudentGrade(student, cls.key, 1) !== '-'"
                    class="px-1.5 py-0.5 rounded font-semibold text-xs"
                    :class="Number(getStudentGrade(student, cls.key, 1)) >= 75 ? 'text-emerald-700 bg-emerald-100/60' : 'text-amber-700 bg-amber-100/60'"
                  >
                    {{ getStudentGrade(student, cls.key, 1) }}
                  </span>
                  <span v-else class="text-gray-400 font-bold select-none">-</span>
                </td>

                <!-- Semester 2 (Genap) -->
                <td
                  class="py-2.5 px-2.5 border-r border-gray-300 text-center font-mono"
                  :class="{
                    'text-gray-400 font-normal': getStudentGrade(student, cls.key, 2) === '-',
                    'font-bold text-gray-800 bg-emerald-50/40': getStudentGrade(student, cls.key, 2) !== '-',
                  }"
                >
                  <span
                    v-if="getStudentGrade(student, cls.key, 2) !== '-'"
                    class="px-1.5 py-0.5 rounded font-semibold text-xs"
                    :class="Number(getStudentGrade(student, cls.key, 2)) >= 75 ? 'text-emerald-700 bg-emerald-100/60' : 'text-amber-700 bg-amber-100/60'"
                  >
                    {{ getStudentGrade(student, cls.key, 2) }}
                  </span>
                  <span v-else class="text-gray-400 font-bold select-none">-</span>
                </td>
              </template>

              <!-- Rerata Keseluruhan Siswa -->
              <td class="py-2.5 px-3 text-center font-mono font-bold text-xs bg-gray-50/70 text-indigo-700">
                <span v-if="getStudentOverallAverage(student) !== '-'" class="badge badge-sm badge-outline badge-primary font-mono font-semibold">
                  {{ getStudentOverallAverage(student) }}
                </span>
                <span v-else class="text-gray-400">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div
        v-if="!recapStore.loading && recapStore.students.length > 0 && filterForm.per_page !== 'all'"
        class="p-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-600"
      >
        <div>
          Menampilkan
          <span class="font-semibold text-gray-900">{{ recapStore.students.length }}</span>
          dari
          <span class="font-semibold text-gray-900">{{ recapStore.pagination.total }}</span>
          siswa
        </div>

        <div class="flex items-center gap-1.5">
          <button
            @click="handlePageChange(recapStore.pagination.current_page - 1)"
            :disabled="recapStore.pagination.current_page <= 1"
            class="btn btn-xs btn-outline border-gray-300"
          >
            « Prev
          </button>

          <span class="px-2 text-xs font-semibold text-gray-700">
            Hal {{ recapStore.pagination.current_page }} dari {{ recapStore.pagination.last_page }}
          </span>

          <button
            @click="handlePageChange(recapStore.pagination.current_page + 1)"
            :disabled="recapStore.pagination.current_page >= recapStore.pagination.last_page"
            class="btn btn-xs btn-outline border-gray-300"
          >
            Next »
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
