import axiosInstance from "./axiosInstance";

export const login = async (email, password) => {
    try {
        const response = await axiosInstance.post("/auth/login", {
            email,
            password,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || "Login Gagal";
    }
}

export const register = async (formData) => {
    try {
        const response = await axiosInstance.post("/auth/register", formData);
        return response.data;
    } catch (error) {
        throw error.response?.data || "Registration Gagal";
    }
}

export const logout = async () => {
    try {
        const response = await axiosInstance.delete("/auth/logout");
        return response.data;
    } catch (error) {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            window.location.href = '/login';
            return;
        }
        throw error.response?.data || error;
    } 
}