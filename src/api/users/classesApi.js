import axiosInstance from "../axiosInstance";

export const getClassUserAPI = async () => {
    const response = await axiosInstance.get("users/classes");
    return response.data;
}

export const getClassByIdAPI = async (id) => {
    const response = await axiosInstance.get(`users/classes/${id}`);
    return response.data;
}

export const getClassesStudentsAPI = async (id) => {
    const response = await axiosInstance.get(`users/classes/${id}/students`)
    return response.data;
}

export const getClassesLessonAPI = async (id) => {
    const response = await axiosInstance.get(`users/classes/${id}/lessons`)
    return response.data;
}