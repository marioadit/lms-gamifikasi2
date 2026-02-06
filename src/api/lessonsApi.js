import axiosInstance from "./axiosInstance";

export const getLessons = async () => {
    const response = await axiosInstance.get("admin/lessons");
    return response.data;
}

export const getLessonsById = async (id) => {
    const response = await axiosInstance.get(`admin/lessons/${id}`);
    return response.data;
}

export const createLesson = async (data) => {
    const formData = new FormData();
    
    // Append regular fields
    formData.append('class_id', data.class_id);
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('content', data.content);
    
    // Handle thumbnail if it exists - send as actual file
    if (data.thumbnail instanceof File) {
        formData.append('thumbnail', data.thumbnail);
    }

    const response = await axiosInstance.post("admin/lessons", formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
}

export const updateLesson = async (id, data) => {
    const formData = new FormData();
    
    // Append regular fields
    formData.append('class_id', data.class_id);
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('content', data.content);
    
    // Handle thumbnail if it exists - send as actual file
    if (data.thumbnail instanceof File) {
        formData.append('thumbnail', data.thumbnail);
    }

    const response = await axiosInstance.put(`admin/lessons/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
}

export const deleteLesson = async (id) => {
    const response = await axiosInstance.delete(`admin/lessons/${id}`);
    return response.data;
}

export const getLessonsByClassId = async (classId) => {
    const response = await axiosInstance.get(`classes/${classId}/lessons`);
    return response.data;
}

export const getLessonsByQuizId = async (lessonId) => {
    const response = await axiosInstance.get(`admin/lessons/${lessonId}/quiz`);
    return response.data;
}