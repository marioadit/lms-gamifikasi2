import axiosInstance from "../axiosInstance";

export const getQuizzesAPI = async () => {
    const response = await axiosInstance.get("admin/quiz");
    return response.data;
}

export const getQuizByIdAPI = async (id) => {
    const response = await axiosInstance.get(`admin/quiz/${id}`);
    return response.data;
}

export const getQuizByLessonsAPI = async (id) => {
    const response = await axiosInstance.get(`admin/quiz/${id}/lessons`);
    return response.data;
}

export const getQuizByQuestionsAPI = async (id) => {
    const response = await axiosInstance.get(`admin/quiz/${id}/questions`);
    return response.data;
}


export const createQuizAPI = async (data) => {
    const response = await axiosInstance.post("admin/quiz", data);
    return response.data;
}

export const updateQuizAPI = async (id, data) => {
    const response = await axiosInstance.put(`admin/quiz/${id}`, data);
    return response.data;
}

export const deleteQuizAPI = async (id) => {
    const response = await axiosInstance.delete(`admin/quiz/${id}`);
    return response.data;
}

export const getAllQuizResultsAPI = async (id) => {
    const response = await axiosInstance.get(`admin/quizzes/results/${id}`);

    return response.data;
}

export const getQuizResultsByIdAPI = async (quizId) => {
    const response = await axiosInstance.get(`admin/quizzes/${quizId}/results`);

    return response.data;
}