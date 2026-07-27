import { defineStore } from "pinia";
import { getTeachersList } from "../api/teacherApi";

export const useTeacherStore = defineStore("teacher", {
    state: () => ({
        teachers: [],
        loading: false,
        error: null,
    }),

    actions: {
        async getTeachers() {
            this.loading = true;
            this.error = null;
            try {
                const response = await getTeachersList();
                if (response.data && response.data.data && response.data.data.data) {
                    this.teachers = response.data.data.data;
                } else if (response.data && response.data.data) {
                    this.teachers = response.data.data;
                } else if (response.data) {
                    this.teachers = response.data;
                }
            }
            catch (error) {
                console.error("Error fetching teachers:", error);
                this.error = "Gagal memuat data guru";
            }
            finally {
                this.loading = false;
            }
        },
    }
});
