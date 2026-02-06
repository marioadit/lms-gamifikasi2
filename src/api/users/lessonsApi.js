import axiosInstance from "../axiosInstance";

export const getUserLessonAPI = async () => {
    const response = await axiosInstance.get('users/lessons');

    return response.data;   
}

export const getUserLessonByIdAPI = async (id) => {
    const response = await axiosInstance.get(`users/lessons/${id}`);

    return response.data;
}

export const getLessonQuestionsAPI = async (id) => {
    const response = await axiosInstance.get(`users/quiz/${id}/LessonQuestions`);

    return response.data;
}
