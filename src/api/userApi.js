import axiosInstance from "./axiosInstance";

export const getUser = async () => {
    const response = await axiosInstance.get("admin/users");
    return response.data;
}

export const getUserById = async (id) => {
    const response = await axiosInstance.get(`admin/users/${id}`);
    return response.data;
}

export const createUser = async (data) => {
    const response = await axiosInstance.post("admin/users", data);

    return response.data;
}

export const updateUser = async (id, data) => {
    const response = await axiosInstance.put(`admin/users/${id}`, data)

    return response.data;
}

export const deleteUser = async (id) => {
    const response = await axiosInstance.delete(`admin/users/${id}`);

    return response.data;
}

// For Users

export const getUserProfile = async () => {
    const role = localStorage.getItem("role");
    const endpoint = (role === "admin" || role === "guru") ? "admin/users/profile" : "users/profile";
    const response = await axiosInstance.get(endpoint);
    return response.data;
}

export const getAdminProfileAPI = async () => {
    const response = await axiosInstance.get("admin/users/profile");
    return response.data;
}

export const updateUserProfile = async (id, data) => {
    const role = localStorage.getItem("role");
    const prefix = (role === "admin" || role === "guru") ? "admin/users" : "users";
    const response = await axiosInstance.put(`${prefix}/profile/${id}`, data);
    return response.data;
}

export const updateUserPassword = async (id, data) => {
    const role = localStorage.getItem("role");
    const prefix = (role === "admin" || role === "guru") ? "admin/users" : "users";
    const response = await axiosInstance.put(`${prefix}/password/${id}`, data);
    return response.data;
}

export const resetUserPassword = async (id) => {
    const response = await axiosInstance.post(`admin/users/reset-password/${id}`);
    return response.data;
}

export const getQuizUser = async () => {
    const response = await axiosInstance.get('admin/user-quiz');

    return response.data;
}