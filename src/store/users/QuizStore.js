import { defineStore } from "pinia";

import { getAllStudentAnswersAPI, getQuestionWithRelationsByIdAPI, submitQuizAPI, getAllQuizResultsAPI, getQuizResultsByIdAPI } from "../../api/users/quizUserApi";

export const useQuizStore = defineStore("quizUser", {
    state: () => ({
        quiz: null,
        question: null,
        studentAnswers: [],
        quizResults: [],
        loading: false,
        error: null,
        success: null
    }),

    actions: {
        async getQuestionWithRelationsById(id) {
            this.loading = true;
            this.error = null;

            try {
                const response = await getQuestionWithRelationsByIdAPI(id);
                this.question = response.data;
            } catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        },

        async submitQuiz(payload) {
            this.loading = true;
            this.error = null;

            try {
                const response = await submitQuizAPI(payload);
                this.success = response.message;
            } catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        },

        async getAllStudentAnswers() {
            this.loading = true;
            this.error = null;

            try {
                const response = await getAllStudentAnswersAPI();
                this.studentAnswers = response.data;

                return response.data;
            } catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        },

        async getAllQuizResults() {
            this.loading = true;
            this.error = null;

            try {
                const response = await getAllQuizResultsAPI();
                this.quizResults = response.data;
                return response;
            } catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        },

        async getQuizResultsById(quizId) {
            this.loading = true;
            this.error = null;

            try {
                const response = await getQuizResultsByIdAPI(quizId);
                return response;
            } catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        }
    }
});