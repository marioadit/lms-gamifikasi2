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
                let questionData = response.data || {};

                try {
                    const relationResponse = await getQuestionsByIdAPI(id);
                    if (relationResponse && relationResponse.data) {
                        const relData = relationResponse.data;
                        if (relData.essayAnswers) questionData.essayAnswers = relData.essayAnswers;
                        if (relData.essay_answers) questionData.essay_answers = relData.essay_answers;
                        if (relData.options && (!questionData.options || questionData.options.length === 0)) {
                            questionData.options = relData.options;
                        }
                        if (relData.matchPairs && (!questionData.match_pairs || questionData.match_pairs.length === 0)) {
                            questionData.match_pairs = relData.matchPairs;
                        }
                        if (relData.option_text && !questionData.option_text) {
                            questionData.option_text = relData.option_text;
                        }
                    }
                } catch (relErr) {
                    console.warn("Could not fetch question relation data", relErr);
                }

                this.question = questionData;
            } catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        },

        async updateQuestion(id, formData) {
            return this.updateQuestions(id, formData);
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