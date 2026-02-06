<script setup>
import Navbar from './AppNavbar.vue';
import AppFooter from './AppFooter.vue';
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <Navbar/>
    <main class="flex-1 overflow-y-auto">
      <router-view></router-view>
    </main>
    <AppFooter/>
  </div>
</template>
