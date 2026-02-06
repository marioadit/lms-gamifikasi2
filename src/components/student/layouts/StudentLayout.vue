<script setup>
import StudentSidebar from './StudentSidebar.vue';
import StudentNavbar from './StudentNavbar.vue';
import StudentMobileNav from './StudentMobileNav.vue';
</script>

<template>
  <div class="drawer lg:drawer-open">
    <input id="student-drawer" type="checkbox" class="drawer-toggle" />
    
    <div class="drawer-content flex flex-col">
      <!-- Navbar -->
      <StudentNavbar />
      
      <!-- Main Content -->
      <main class="flex-1 bg-base-200 overflow-y-auto pb-24 lg:pb-0">
        <router-view></router-view>
      </main>

      <!-- Mobile Bottom Navigation -->
      <StudentMobileNav />
    </div>
    
    <div class="drawer-side">
      <label for="student-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
      <StudentSidebar />
    </div>
    
  </div>
</template> 