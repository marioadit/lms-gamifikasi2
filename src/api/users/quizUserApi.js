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
    const response = await axiosInstance.get(`users/quizzes/results`);

    return response.data;
}

export const getQuizResultsByIdAPI = async (quizId) => {
    const response = await axiosInstance.get(`users/quizzes/${quizId}/results`);

    return response.data;
}