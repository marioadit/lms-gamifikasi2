import axiosInstance from "./axiosInstance";

export const getUserStudent = async () => {
    const response = await axiosInstance.get(`admin/students`);
    return response.data;
}

export const getClassStudents = async (classId) => {
    const response = await axiosInstance.get(`admin/classes/${classId}/students`);
    return response.data;
}

export const enrollStudent = async (classId, studentId) => {
    const response = await axiosInstance.post(`admin/classes/${classId}/students`, { student_id: studentId });
    return response.data;
}

export const removeStudentFromClass = async (classId, studentId) => {
    const response = await axiosInstance.delete(`admin/classes/${classId}/students`, { 
        data: { student_id: studentId }
    });
    return response.data;
}