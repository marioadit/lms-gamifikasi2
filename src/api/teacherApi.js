import axiosInstance from "./axiosInstance";

export const getTeachersList = async () => {
    const response = await axiosInstance.get(`admin/teachers`);
    return response.data;
}
