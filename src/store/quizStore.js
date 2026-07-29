import { defineStore } from "pinia";
import { getQuizzesAPI, getQuizByIdAPI, getQuizByLessonsAPI, createQuizAPI, updateQuizAPI, deleteQuizAPI, getAllQuizResultsAPI, getQuizResultsByIdAPI, getAdminAnswerHistoryAPI, getAdminAnswerHistoryDetailAPI, getAnswerHistoryByStudentAPI } from "../api/quiz/quizApi";
import { getQuestionsByQuizIdAPI, getQuestionsByIdAPI, deleteQuestionsAPI, createQuestionsAPI } from "../api/quiz/QuestionApi";

export const useQuizStore = defineStore("quiz", {
    state: () => ({
        quizzes: [],
        quiz: null,
        quizLessons: [],
        quizQuestions: [],
        selectedQuestion: null,
        loading: false,
        error: null,
        success: null
    }),

    actions: {
        async getQuizzes() {
            this.loading = true;
            this.error = null;
            try {
                const response = await getQuizzesAPI();
                this.quizzes = response.data;
            } catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        },
        async getQuizById(id) {
            this.loading = true;
            this.error = null;
            try {
                const response = await getQuizByIdAPI(id);
                this.quiz = response.data;
            } catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        },
        async getQuizByLessons(id) {
            this.loading = true;
            this.error = null;
            try {
                const response = await getQuizByLessonsAPI(id);
                this.quizLessons = response.data;
            } catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        },
        async getQuizByQuestions(id) {
            this.loading = true;
            this.error = null;
            try {
                const response = await getQuestionsByQuizIdAPI(id);
                this.quizQuestions = response.data;
                this.quiz = {
                    id: response.data.id,
                    title: response.data.title,
                    description: response.data.description,
                    lesson_id: response.data.lesson_id,
                    start_time: response.data.start_time,
                    end_time: response.data.end_time,
                    is_active: response.data.is_active,
                    created_at: response.data.created_at,
                    updated_at: response.data.updated_at,
                };
            } catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        },
        async getQuestionById(id) {
            this.loading = true;
            this.error = null;
            try {
                const response = await getQuestionsByIdAPI(id);
                this.selectedQuestion = response.data;
                return response.data;
            } catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        },
        async deleteQuestion(questionId) {
            this.loading = true;
            this.error = null;
            try {
                await deleteQuestionsAPI(questionId);
                // Remove the deleted question from the questions array
                if (this.quizQuestions && this.quizQuestions.questions) {
                    this.quizQuestions.questions = this.quizQuestions.questions.filter(
                        question => question.id !== questionId
                    );
                }
                this.success = "Pertanyaan berhasil dihapus";
            } catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        },
        async createQuiz(data) {
            this.loading = true;
            this.error = null;
            try {
                const response = await createQuizAPI(data);
                this.quiz = response.data;
            } catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        },
        async updateQuiz(id, data) {
            this.loading = true;
            this.error = null;
            try {
                const response = await updateQuizAPI(id, data);
                this.quiz = response.data;
            } catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        },
        async deleteQuiz(id) {
            this.loading = true;
            this.error = null;
            try {
                const response = await deleteQuizAPI(id);
                this.quiz = response.data;
            } catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        },
        async createQuestion(formData) {
            this.loading = true;
            this.error = null;
            try {
                const response = await createQuestionsAPI(formData);
                if (!response.status) {
                    throw new Error(response.message || 'Failed to create question');
                }
                this.success = response.message;
                // Refresh questions list
                await this.getQuizByQuestions(formData.get('quiz_id'));
                return response.data;
            } catch (error) {
                console.error('Error creating question:', error);
                this.error = error.response?.data?.message || error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async getAllQuizResults(userId) {
            try {
                const response = await getAllQuizResultsAPI(userId);
                return response;
            } catch (error) {
                console.error('Error fetching quiz results:', error);
                throw error;
            }
        },

        async getQuizResultsById(quizId) {
            try {
                const response = await getQuizResultsByIdAPI(quizId);
                return response;
            } catch (error) {
                console.error('Error fetching quiz results:', error);
                throw error;
            }
        },

        async getAdminAnswerHistory() {
            this.loading = true;
            this.error = null;
            try {
                const response = await getAdminAnswerHistoryAPI();
                return response;
            } catch (error) {
                console.error('Error fetching admin answer history:', error);
                this.error = error.response?.data?.message || error.message || "Gagal memuat hasil kuis";
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async getAdminAnswerHistoryDetail(studentId, quizId) {
            this.loading = true;
            this.error = null;
            try {
                const response = await getAdminAnswerHistoryDetailAPI(studentId, quizId);
                return response;
            } catch (error) {
                console.error('Error fetching admin answer history detail:', error);
                this.error = error.response?.data?.message || error.message || "Gagal memuat detail hasil kuis";
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async getAnswerHistoryByStudent(studentId) {
            this.loading = true;
            this.error = null;
            try {
                const response = await getAnswerHistoryByStudentAPI(studentId);
                return response;
            } catch (error) {
                console.error('Error fetching student answer history:', error);
                this.error = error.response?.data?.message || error.message || "Gagal memuat hasil kuis siswa";
                throw error;
            } finally {
                this.loading = false;
            }
        }
    },

    // User Quiz
});