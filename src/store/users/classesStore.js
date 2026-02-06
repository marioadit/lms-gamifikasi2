import { defineStore } from "pinia";
import { getClassByIdAPI, getClassesLessonAPI, getClassUserAPI, getClassesStudentsAPI } from "../../api/users/classesApi";

export const useClassesStore = defineStore("classesUser", {
    state: () => ({
        classes: [],
        detailClasses: null,
        classesStudent: [],
        classesLesson: [],
        loading: false,
        error: null,
        success: null
    }),

    actions: {
        async getClassUser() {
            this.loading = true;
            this.error = null;

            try {
                const response = await getClassUserAPI();
                this.classes = response.data;
                console.log(this.classes);
            }
            catch (error) {
                console.error("Error fetching students:", error);
                this.error = "Gagal memuat data siswa";
            }
            finally {
                this.loading = false;
            }
        },

        async getClassById(id) {
            this.loading = true;
            this.error = null;

            try {
                const response = await getClassByIdAPI(id);
                this.detailClasses = response.data;
                console.log(this.detailClasses);
            } catch (error) {
                console.error("Error fetching students:", error);
                this.error = "Gagal memuat data siswa";
            }
            finally {
                this.loading = false;
            }
        },

        async getClassesStudent(id) {
            this.loading = true;
            this.error = null;

            try {
                const response = await getClassesStudentsAPI(id);
                this.classesStudent = response.data;
                console.log(this.detailClasses);
            } catch (error) {
                console.error("Error fetching students:", error);
                this.error = "Gagal memuat data siswa";
            }
            finally {
                this.loading = false;
            }
        },

        async getClassesLesson(id) {
            this.loading = true;
            this.error = null;

            try {
                const response = await getClassesLessonAPI(id);
                this.classesLesson = response.data;
            } catch (error) {
                console.error("Error fetching students:", error);
                this.error = "Gagal memuat data siswa";
            }
            finally {
                this.loading = false;
            }
        }
    }
})