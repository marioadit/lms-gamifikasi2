import axiosInstance from "./axiosInstance";

/**
 * Fetch Admin Dashboard data
 * Endpoint: GET /api/admin/dashboard/admin
 */
export const getAdminDashboardAPI = async () => {
    const response = await axiosInstance.get("admin/dashboard/admin");
    return response.data;
};

/**
 * Fetch Teacher Dashboard data
 * Endpoint: GET /api/guru/dashboard/teacher
 */
export const getTeacherDashboardAPI = async () => {
    const response = await axiosInstance.get("guru/dashboard/teacher");
    return response.data;
};
