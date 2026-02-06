import axiosInstance from "../axiosInstance";

export const getQuestionsAPI = async () => {
    const response = await axiosInstance.get('admin/questions');

    return response.data;
}

export const getQuestionsByIdAPI = async (id) => {
    const response = await axiosInstance.get(`admin/questions/${id}`);

    return response.data;
}

export const getQuestionsByQuizIdAPI = async (quizId) => {
    const response = await axiosInstance.get(`admin/quiz/${quizId}/questions`);

    return response.data;
}

export const createQuestionsAPI = async (formData) => {
    const response = await axiosInstance.post('admin/questions', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    });

    return response.data;
}

export const updateQuestionsAPI = async (id, formData) => {
    const response = await axiosInstance.put(`admin/questions/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    });

    return response.data;
}

export const deleteQuestionsAPI = async (id) => {
    const response = await axiosInstance.delete(`admin/questions/${id}`);

    return response.data;
}

export const getQuestionByIdAPI = async (id) => {
    const response = await axiosInstance.get(`admin/questions/${id}/detail`);

    return response.data;
}