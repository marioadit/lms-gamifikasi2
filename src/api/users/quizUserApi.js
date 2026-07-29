import axiosInstance from "../axiosInstance";

export const getQuestionWithRelationsByIdAPI = async (id) => {
    const response = await axiosInstance.get(`users/questions/${id}`);

    return response.data;
}

export const submitQuizAPI = async (payload) => {
    const response = await axiosInstance.post(`users/student-answers`, payload);

    return response.data;
}

export const getAllStudentAnswersAPI = async () => {
    const response = await axiosInstance.get(`users/all-student-answers`);

    return response.data;
}

export const getAllQuizResultsAPI = async () => {
    const response = await axiosInstance.get(`users/answer-history`);

    return response.data;
}

export const getQuizResultsByIdAPI = async (quizId) => {
    const response = await axiosInstance.get(`users/answer-history/quiz/${quizId}`);

    return response.data;
}

export const getQuizWithLessonAndQuestionsAPI = async (quizId) => {
    const response = await axiosInstance.get(`users/quiz/${quizId}/LessonQuestions`);

    return response.data;
}