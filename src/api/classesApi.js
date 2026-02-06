import axiosInstance from "./axiosInstance";

export const getClasses = async () => {
    const response = await axiosInstance.get("admin/classes");
    return response.data;
}

export const getClassesById = async (id) => {
    const response = await axiosInstance.get(`admin/classes/${id}`);
    return response.data;
}

export const createClass = async (data) => {
    const response = await axiosInstance.post("admin/classes", data);
    return response.data;
}

export const updateClass = async (id, data) => {
    const response = await axiosInstance.put(`admin/classes/${id}`, data);
    return response.data;
}

export const deleteClass = async (id) => {
    const response = await axiosInstance.delete(`admin/classes/${id}`);
    return response.data;
}

// Get Teachers
export const getTeachers = async () => {
    const response = await axiosInstance.get("admin/teachers");
    return response.data;
}