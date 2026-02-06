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
    const response = await axiosInstance.get("users/profile");
    return response.data;
}

export const updateUserProfile = async (id, data) => {
    const response = await axiosInstance.put(`users/profile/${id}`, data);
    return response.data;
}

export const getQuizUser = async () => {
    const response = await axiosInstance.get('admin/user-quiz');

    return response.data;
}