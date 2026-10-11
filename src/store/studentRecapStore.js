import { defineStore } from "pinia";
import { getStudentRecaps, syncStudentRecaps } from "../api/studentRecapApi";

export const useStudentRecapStore = defineStore("studentRecap", {
  state: () => ({
    students: [],
    pagination: {
      current_page: 1,
      last_page: 1,
      per_page: 15,
      total: 0,
    },
    loading: false,
    syncing: false,
    error: null,
  }),

  actions: {
    async fetchRecaps(params = {}) {
      this.loading = true;
      this.error = null;
      try {
        const response = await getStudentRecaps(params);
        if (response.data && response.data.data) {
          const resData = response.data.data;
          this.students = resData.students || [];
          if (resData.pagination) {
            this.pagination = resData.pagination;
          } else if (resData.total !== undefined) {
            this.pagination = {
              current_page: 1,
              last_page: 1,
              per_page: resData.total,
              total: resData.total,
            };
          }
        }
        return response.data;
      } catch (err) {
        console.error("Gagal mengambil data rekap nilai siswa:", err);
        this.error =
          err.response?.data?.message ||
          err.message ||
          "Gagal memuat rekap nilai siswa";
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async syncAllRecaps() {
      this.syncing = true;
      this.error = null;
      try {
        const response = await syncStudentRecaps();
        return response.data;
      } catch (err) {
        console.error("Gagal sinkronisasi data rekap nilai siswa:", err);
        this.error =
          err.response?.data?.message ||
          err.message ||
          "Gagal melakukan sinkronisasi rekap nilai";
        throw err;
      } finally {
        this.syncing = false;
      }
    },
  },
});
