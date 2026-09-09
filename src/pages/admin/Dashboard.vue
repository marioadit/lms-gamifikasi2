<script setup>
import { computed } from "vue";
import DashboardAdmin from "./DashboardAdmin.vue";
import DashboardGuru from "./DashboardGuru.vue";

const role = localStorage.getItem("role");
const isGuru = computed(() => role === "guru");
</script>

<template>
  <DashboardGuru v-if="isGuru" />
  <DashboardAdmin v-else />
</template>