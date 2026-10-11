import axiosInstance from "./axiosInstance";

/**
 * Mengambil data matriks rekap nilai siswa (semua kelas dan semester)
 * Params opsional:
 * - class_id (int)
 * - search (string)
 * - status (string)
 * - page (int)
 * - per_page (int)
 * - all (boolean)
 */
export const getStudentRecaps = async (params = {}) => {
  return await axiosInstance.get("/admin/student-recaps", { params });
};

/**
 * Mengambil rekap nilai untuk satu siswa tertentu
 */
export const getStudentRecapById = async (studentId) => {
  return await axiosInstance.get(`/admin/student-recaps/${studentId}`);
};

/**
 * Mengambil rekap nilai untuk siswa yang sedang login
 */
export const getMyStudentRecap = async () => {
  return await axiosInstance.get("/users/student-recaps/my-recap");
};

/**
 * Trigger manual sinkronisasi ulang seluruh rekap nilai dari answers_history
 */
export const syncStudentRecaps = async () => {
  return await axiosInstance.post("/admin/student-recaps/sync");
};
