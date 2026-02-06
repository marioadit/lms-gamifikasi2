import { defineStore } from "pinia";
import { getLessons, getLessonsById, createLesson, updateLesson, deleteLesson, getLessonsByClassId, getLessonsByQuizId } from "../api/lessonsApi";

export const useLessonsStore = defineStore("lessons", {
    state: () => ({
        lessons: [],
        selectedLesson: null,
        loading: false,
        error: null,
        success: null,
        lastFetch: null,
        classLessonsCache: new Map(), // Cache for class-specific lessons
        lastClassFetch: new Map(),    // Track last fetch time for each class
    }),
    actions: {
        async getLessons() {
            const CACHE_DURATION = 2000; // 5 seconds cache
            if (this.lastFetch && Date.now() - this.lastFetch < CACHE_DURATION) {
                return;
            }

            this.loading = true;
            this.error = null;
            try {
                const response = await getLessons();
                this.lessons = response.data;
                this.lastFetch = Date.now();
            } catch (error) {
                console.error("Error fetching lessons:", error)
                this.error = error.message || "Gagal mengambil pelajaran";
            } finally {
                this.loading = false;
            }
        },
        async getLessonsById(id) {
            this.loading = true;
            this.error = null;
            try {
                const response = await getLessonsById(id);
                this.selectedLesson = response.data;
            } catch (error) {
                console.error("Error fetching lesson by id:", error);
                this.error = error.message || "Gagal mengambil pelajaran";
            } finally {
                this.loading = false;
            }
        },
        async getLessonsByClassId(classId) {
            const CACHE_DURATION = 5000; // 5 seconds cache
            const lastFetch = this.lastClassFetch.get(classId);

            if (lastFetch && Date.now() - lastFetch < CACHE_DURATION) {
                return this.classLessonsCache.get(classId);
            }

            this.loading = true;
            this.error = null;
            try {
                const response = await getLessonsByClassId(classId);
                this.lessons = response.data;

                // Update cache
                this.classLessonsCache.set(classId, response.data);
                this.lastClassFetch.set(classId, Date.now());

                return response.data;
            } catch (error) {
                console.error("Error fetching lessons:", error);
                this.error = error.message || "Gagal mengambil pelajaran";
            } finally {
                this.loading = false;
            }
        },

        async createLesson(data) {
            this.loading = true;
            this.error = null;
            this.success = null;
            try {
                // Determine if we're sending FormData or JSON
                const config = {};

                if (data instanceof FormData) {
                    // Let the browser set the content-type with boundary for FormData
                } else {
                    config.headers = {
                        'Content-Type': 'application/json'
                    };
                }

                const response = await createLesson(data, config);
                this.lessons.push(response.data);
                this.success = "Pelajaran berhasil dibuat";
                return response.data;
            } catch (error) {
                console.error("Error creating lesson:", error);
                this.error = error.response?.data?.message || error.message || "Gagal membuat pelajaran";
                throw error; // Re-throw the error so the component can handle it
            } finally {
                this.loading = false;
            }
        },
        async updateLesson(id, data) {
            this.loading = true;
            this.error = null;
            this.success = null;
            try {
                const response = await updateLesson(id, data);
                this.success = "Pelajaran berhasil diperbarui";

                // Update both the selected lesson and the lessons array if it exists
                this.selectedLesson = response.data;

                const index = this.lessons.findIndex(lesson => lesson.id === id);
                if (index !== -1) {
                    this.lessons[index] = response.data;
                }

                return response.data;
            } catch (error) {
                console.error("Error updating lesson:", error);
                this.error = error.response?.data?.message || error.message || "Gagal mengupdate pelajaran";
                this.success = null;
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async deleteLesson(lessonId) {
            this.loading = true;
            this.error = null;
            this.success = null;
            try {
                await deleteLesson(lessonId);
                this.lessons = this.lessons.filter(lesson => lesson.id !== lessonId);
                this.success = "Pelajaran berhasil dihapus";
                return true;
            } catch (error) {
                console.error("Error deleting lesson:", error);
                this.error = error.response?.data?.message || error.message || "Gagal menghapus pelajaran";
                throw error; // Re-throw the error so the component can handle it
            } finally {
                this.loading = false;
            }
        },
        async getLessonsByQuizId(quizId) {
            this.loading = true;
            this.error = null;
            this.success = null;
            try {
                const response = await getLessonsByQuizId(quizId);
                this.lessons = response.data;
                return response.data;
            } catch (error) {
                console.error("Error fetching lessons by quiz id:", error);
                this.error = error.response?.data?.message || error.message || "Gagal mengambil pelajaran";
                throw error;
            } finally {
                this.loading = false;
            }
        }
    }
});