import { defineStore } from "pinia";
import { getQuestionsAPI, getQuestionsByIdAPI, createQuestionsAPI, updateQuestionsAPI, deleteQuestionsAPI, getQuestionByIdAPI } from "../api/quiz/QuestionApi.js";

export const useQuestionsStore = defineStore("questions", {
    state: () => ({
        questions: [],
        question: null,
        loading: false,
        error: null,
        success: null
    }),

    actions: {
        async getQuestions() {
            this.loading = true;
            this.error = null;

            try {
                const response = await getQuestionsAPI();
                this.questions = response.data;
            } catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        },

        async getQuestionDetailById(id) {
            this.loading = true;
            this.error = null;

            try {
                const response = await getQuestionByIdAPI(id);
                this.question = response.data;
            } catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        },
        
        async createQuestions(data) {
            this.loading = true;
            this.error = null;

            try {
                const response = await createQuestionsAPI(data);
                this.questions.push(response.data);
                this.success = "Question created successfully";
            } catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        },
        
        async updateQuestions(id, formData) {
            this.loading = true;
            this.error = null;

            try {
                const response = await updateQuestionsAPI(id, formData);
                
                if (this.questions.length > 0) {
                    this.questions = this.questions.map(question => 
                        question.id === id ? response.data : question
                    );
                }
                if (this.question && this.question.id === id) {
                    this.question = response.data;
                }
                this.success = "Question updated successfully";
                return response.data;
            } catch (error) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },
        
        async deleteQuestions(id) {
            this.loading = true;
            this.error = null;

            try {
                const response = await deleteQuestionsAPI(id);
                this.questions = response.data;
                this.success = "Question deleted successfully";
            } catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        }
    }
})