<script setup>
</script>

<template>
  <div class="p-5">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-4xl font-bold">Dashboard</h1>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
      <!-- Games Played Card -->
      <div class="card bg-base-100 shadow-md">
        <div class="card-body">
          <div class="flex justify-between items-center">
            <h2 class="card-title">Total Kuis Diselesaikan</h2>
            <div class="text-2xl">🎮</div>
          </div>
          <p class="text-4xl font-bold mt-2">24/25</p>
          <!-- <p class="text-success">+3 dari minggu lalu</p> -->
        </div>
      </div>

      <!-- Lessons Completed Card -->
      <div class="card bg-base-100 shadow-md">
        <div class="card-body">
          <div class="flex justify-between items-center">
            <h2 class="card-title">Pelajaran Selesai</h2>
            <div class="text-2xl">📖</div>
          </div>
          <p class="text-4xl font-bold mt-2">12/15</p>
          <!-- <p class="text-success">+2 dari minggu lalu</p> -->
        </div>
      </div>

      <!-- Achievements Card -->
      <div class="card bg-base-100 shadow-md">
        <div class="card-body">
          <div class="flex justify-between items-center">
            <h2 class="card-title">Total Kuis Aktif</h2>
            <div class="text-2xl">✅</div>
          </div>
          <p class="text-4xl font-bold mt-2">3/15</p>
          <!-- <p class="text-success">+1 penghargaan baru</p> -->
        </div>
      </div>

      <!-- Weekly Progress Card -->
      <div class="card bg-base-100 shadow-md">
        <div class="card-body">
          <div class="flex justify-between items-center">
            <h2 class="card-title">Total Nilai Sempurna</h2>
            <div class="text-2xl">📈</div>
          </div>
          <p class="text-4xl font-bold mt-2">30/96</p>
          <!-- <p class="text-success">+12% dari minggu lalu</p> -->
        </div>
      </div>
      <!-- Weekly Progress Card -->
      <div class="card bg-base-100 shadow-md">
        <div class="card-body">
          <div class="flex justify-between items-center">
            <h2 class="card-title">Total Murid</h2>
            <div class="text-2xl">👥</div>
          </div>
          <p class="text-4xl font-bold mt-2">30</p>
          <!-- <p class="text-success">+12% dari minggu lalu</p> -->
        </div>
      </div>
      <!-- Weekly Progress Card -->
      <div class="card bg-base-100 shadow-md">
        <div class="card-body">
          <div class="flex justify-between items-center">
            <h2 class="card-title">Total Kelas</h2>
            <div class="text-2xl">🏠</div>
          </div>
          <p class="text-4xl font-bold mt-2">10</p>
          <!-- <p class="text-success">+12% dari minggu lalu</p> -->
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs mb-6">
      <a class="tab tab-bordered tab-active">Progres</a>
      <a class="tab tab-bordered">Murid Kelas</a>
      <!-- <a class="tab tab-bordered">Penghargaan</a> -->
    </div>

    <!-- Subject Progress Section -->
    <div class="card bg-base-100 shadow-md mb-6">
      <div class="card-body">
        <h2 class="text-2xl font-bold mb-2">Progres Pelajaran</h2>
        <p class="text-gray-500 mb-6">Total kuis terselesaikan</p>

        <!-- Math Progress -->
        <div class="mb-4">
          <div class="flex justify-between items-center mb-2">
            <div class="flex items-center gap-2">
              <div class="bg-blue-200 p-2 rounded">
                <span class="font-semibold">12/34</span>
              </div>
              <span class="font-semibold">Matematika Kela 2 A</span>
            </div>
            <span class="font-semibold">65%</span>
          </div>
          <progress class="progress progress-primary w-full" value="65" max="100"></progress>
        </div>

        <!-- You can add more subjects here following the same pattern -->
      </div>
    </div>
  </div>
</template>