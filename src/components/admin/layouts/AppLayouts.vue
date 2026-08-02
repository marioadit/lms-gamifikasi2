<script setup>
import { ref, onMounted } from 'vue';
import AppSidebar from "./AppSidebar.vue";
import AppFooter from "./AppFooter.vue";
import AppNavbar from "./AppNavbar.vue";
import { useAuthStore } from "../../../store/authStore";
import { getAdminProfileAPI } from "../../../api/userApi";

const sidebarOpen = ref(false);
const authStore = useAuthStore();

onMounted(async () => {
  if (!authStore.currentUserId) {
    try {
      const res = await getAdminProfileAPI();
      const user = res?.data || res;
      if (user && user.id) {
        authStore.user = user;
        authStore.userId = user.id;
        localStorage.setItem("user_id", user.id);
        localStorage.setItem("user", JSON.stringify(user));
      }
    } catch (e) {
      console.error("Error fetching user profile:", e);
    }
  }
});
</script>

<template>
  <div class="drawer lg:drawer-open min-h-screen">
    <input id="sidebar-drawer" v-model="sidebarOpen" type="checkbox" class="drawer-toggle" />
    
    <!-- Main Content Area -->
    <div class="drawer-content flex flex-col bg-gray-50">
      
      <app-navbar></app-navbar>

      <!-- Mobile navbar with hamburger button -->
      <div class="lg:hidden">
        <div class="flex items-center p-3">
          <label for="sidebar-drawer" class="btn btn-square btn-ghost">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-6 h-6 stroke-current">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </label>
        </div>
      </div>
      
      <main class="flex-1 overflow-y-auto">
        <router-view></router-view>
      </main>
      
      <app-footer></app-footer>
    </div>
    
    <!-- Sidebar -->
    <div class="drawer-side">
      <label for="sidebar-drawer" class="drawer-overlay"></label>
      <app-sidebar></app-sidebar>
    </div>
  </div>
</template>

<style scoped>
.layout-mask {
  display: none;
}
</style>
