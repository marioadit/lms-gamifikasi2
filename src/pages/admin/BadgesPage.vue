<script setup>
import { ref, onMounted } from 'vue';

// Data dummy untuk badges/lencana
const badges = ref([
  { 
    id: 1, 
    name: 'Rajin Belajar', 
    icon: '🌟', 
    description: 'Menyelesaikan 10 pelajaran',
    criteria: 'complete_lessons',
    criteriaValue: 10,
    isActive: true,
    createdAt: '2023-09-15'
  },
  { 
    id: 2, 
    name: 'Matematika Hebat', 
    icon: '🧮', 
    description: 'Nilai sempurna di kuis matematika',
    criteria: 'perfect_quiz',
    criteriaValue: 100,
    isActive: true,
    createdAt: '2023-09-15'
  },
  { 
    id: 3, 
    name: 'Pembaca Aktif', 
    icon: '📚', 
    description: 'Membaca 5 buku online',
    criteria: 'read_books',
    criteriaValue: 5,
    isActive: true,
    createdAt: '2023-09-15'
  },
  { 
    id: 4, 
    name: 'Penyelesai Tantangan', 
    icon: '🏅', 
    description: 'Menyelesaikan 3 tantangan mingguan',
    criteria: 'complete_challenges',
    criteriaValue: 3,
    isActive: false,
    createdAt: '2023-09-20'
  }
]);

// Data untuk form
const formMode = ref('add'); // 'add' atau 'edit'
const isModalOpen = ref(false);
const selectedBadge = ref(null);
const formData = ref({
  name: '',
  icon: '🏆',
  description: '',
  criteria: 'complete_lessons',
  criteriaValue: 1,
  isActive: true
});

const icons = ['🌟', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🧮', '📚', '📝', '✏️', '🎮', '🚀', '🌈', '⭐', '💫', '🔥', '💯', '🎯', '🎨'];

const criteriaOptions = [
  { value: 'complete_lessons', label: 'Jumlah Pelajaran Selesai' },
  { value: 'perfect_quiz', label: 'Nilai Sempurna di Kuis' },
  { value: 'read_books', label: 'Jumlah Buku Dibaca' },
  { value: 'login_streak', label: 'Login Berturut-turut' },
  { value: 'complete_challenges', label: 'Menyelesaikan Tantangan' },
  { value: 'points_earned', label: 'Jumlah Poin Terkumpul' }
];

// Fungsi-fungsi
const openAddModal = () => {
  formMode.value = 'add';
  formData.value = {
    name: '',
    icon: '🏆',
    description: '',
    criteria: 'complete_lessons',
    criteriaValue: 1,
    isActive: true
  };
  isModalOpen.value = true;
};

const openEditModal = (badge) => {
  formMode.value = 'edit';
  selectedBadge.value = badge;
  formData.value = {
    name: badge.name,
    icon: badge.icon,
    description: badge.description,
    criteria: badge.criteria,
    criteriaValue: badge.criteriaValue,
    isActive: badge.isActive
  };
  isModalOpen.value = true;
};

const saveBadge = () => {
  if (formMode.value === 'add') {
    // Simulasi penambahan badge baru
    const newBadge = {
      id: badges.value.length + 1,
      ...formData.value,
      createdAt: new Date().toISOString().split('T')[0]
    };
    badges.value.push(newBadge);
  } else {
    // Simulasi update badge
    const index = badges.value.findIndex(b => b.id === selectedBadge.value.id);
    if (index !== -1) {
      badges.value[index] = {
        ...badges.value[index],
        ...formData.value
      };
    }
  }
  isModalOpen.value = false;
};

const deleteBadge = (id) => {
  if (confirm('Apakah Anda yakin ingin menghapus lencana ini?')) {
    badges.value = badges.value.filter(badge => badge.id !== id);
  }
};

const toggleBadgeStatus = (badge) => {
  badge.isActive = !badge.isActive;
};

const getCriteriaLabel = (criteriaValue) => {
  const option = criteriaOptions.find(opt => opt.value === criteriaValue);
  return option ? option.label : criteriaValue;
};
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold">Kelola Lencana 🏆</h1>
        <p class="text-gray-500">Buat dan kelola lencana untuk sistem gamifikasi</p>
      </div>
      <button @click="openAddModal" class="btn btn-primary">
        <span class="mr-1">➕</span> Tambah Lencana Baru
      </button>
    </div>
    
    <!-- Badges Table -->
    <div class="overflow-x-auto bg-white rounded-lg shadow">
      <table class="table table-zebra w-full">
        <thead>
          <tr>
            <th>Icon</th>
            <th>Nama Lencana</th>
            <th>Deskripsi</th>
            <th>Kriteria</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="badge in badges" :key="badge.id">
            <td class="text-2xl">{{ badge.icon }}</td>
            <td class="font-medium">{{ badge.name }}</td>
            <td>{{ badge.description }}</td>
            <td>{{ getCriteriaLabel(badge.criteria) }} ({{ badge.criteriaValue }})</td>
            <td>
              <div class="badge" :class="badge.isActive ? 'badge-success' : 'badge-error'">
                {{ badge.isActive ? 'Aktif' : 'Nonaktif' }}
              </div>
            </td>
            <td class="flex gap-2">
              <button @click="openEditModal(badge)" class="btn btn-sm btn-info">
                ✏️
              </button>
              <button @click="toggleBadgeStatus(badge)" class="btn btn-sm" 
                :class="badge.isActive ? 'btn-warning' : 'btn-success'">
                {{ badge.isActive ? '❌' : '✅' }}
              </button>
              <button @click="deleteBadge(badge.id)" class="btn btn-sm btn-error">
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Modal for Add/Edit Badge -->
    <div v-if="isModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">
          {{ formMode === 'add' ? 'Tambah Lencana Baru' : 'Edit Lencana' }}
        </h2>
        
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text font-medium">Nama Lencana</span>
          </label>
          <input v-model="formData.name" type="text" class="input input-bordered w-full" placeholder="Masukkan nama lencana" />
        </div>
        
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text font-medium">Ikon</span>
          </label>
          <div class="grid grid-cols-5 gap-2 bg-gray-100 p-2 rounded-lg">
            <button 
              v-for="icon in icons" 
              :key="icon" 
              @click="formData.icon = icon"
              class="text-2xl p-2 rounded-lg"
              :class="formData.icon === icon ? 'bg-primary text-white' : 'bg-white'"
            >
              {{ icon }}
            </button>
          </div>
        </div>
        
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text font-medium">Deskripsi</span>
          </label>
          <textarea v-model="formData.description" class="textarea textarea-bordered" placeholder="Deskripsi singkat lencana"></textarea>
        </div>
        
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text font-medium">Kriteria</span>
          </label>
          <select v-model="formData.criteria" class="select select-bordered w-full">
            <option v-for="option in criteriaOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
        
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text font-medium">Nilai Kriteria</span>
          </label>
          <input v-model.number="formData.criteriaValue" type="number" min="1" class="input input-bordered w-full" />
        </div>
        
        <div class="form-control mb-6">
          <label class="label cursor-pointer">
            <span class="label-text font-medium">Status Aktif</span>
            <input v-model="formData.isActive" type="checkbox" class="toggle toggle-primary" />
          </label>
        </div>
        
        <div class="flex justify-end gap-2">
          <button @click="isModalOpen = false" class="btn btn-ghost">Batal</button>
          <button @click="saveBadge" class="btn btn-primary">Simpan</button>
        </div>
      </div>
    </div>
  </div>
</template> 