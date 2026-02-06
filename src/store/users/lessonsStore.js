import { defineStore } from "pinia";

import { getUserLessonAPI, getUserLessonByIdAPI, getLessonQuestionsAPI } from "../../api/users/lessonsApi";

export const useLessonStore = defineStore("lessonUser", {
    state: () => ({
        lessons: [],
        detailLessons: null,
        lessonQuestions: null,
        loading: false,
        error: null,
        success: null
    }),

    actions: {
        async getUserLessons() {
            this.loading = true;
            this.error = null;

            try {
                const response = await getUserLessonAPI();
                this.lessons = response.data;
            } catch (error) {
                console.error("Error fetching students:", error);
                this.error = "Gagal memuat data pelajaran";
            }
            finally {
                this.loading = false;
            }
        },
        async getUserLessonById(id) {
            this.loading = true;
            this.error = null;

            try {
                const response = await getUserLessonByIdAPI(id);
                this.detailLessons = response.data;
            } catch (error) {
                console.error("Error fetching students:", error);
                this.error = "Gagal memuat data pelajaran";
            }
            finally {
                this.loading = false;
            }
        },

        async getLessonQuestions(id) {
            this.loading = true;
            this.error = null;

            try {
                const response = await getLessonQuestionsAPI(id);
                if (!response || !response.data) {
                    throw new Error('Data kuis tidak ditemukan');
                }
                this.lessonQuestions = response.data;
                return response; // Return the complete response
            } catch (error) {
                console.error("Error fetching quiz questions:", error);
                this.error = error.message || "Gagal memuat data kuis";
                throw error; // Re-throw the error to be handled by the component
            } finally {
                this.loading = false;
            }
        }
    }
})
