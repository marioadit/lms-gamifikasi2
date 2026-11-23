import { defineStore } from "pinia";
import { getClasses, getClassesById, createClass, updateClass, deleteClass, getTeachers } from "../api/classesApi";
import { getClassStudents } from "../api/studentsClassesApi";

export const useClassesStore = defineStore("classes", {
    state: () => ({
        classes: [],
        selectedClass: null,
        classStudents: [],
        teachers: [],
        loading: false,
        error: null,
        success: null
    }),

    actions: {
        async getClasses() {
            this.loading = true;
            this.error = null;
            try {
                const response = await getClasses();
                let classesList = [];

                // Handle API response that contains data in a "data" property
                if (response.data && Array.isArray(response.data)) {
                    classesList = response.data;
                } else if (response.data && Array.isArray(response.data.data)) {
                    classesList = response.data.data;
                } else if (Array.isArray(response)) {
                    classesList = response;
                }

                // Gunakan students_count langsung dari backend agar cepat tanpa loop request N+1
                for (const cls of classesList) {
                    cls.student_count = typeof cls.students_count !== 'undefined' 
                        ? cls.students_count 
                        : (cls.student_count ?? (Array.isArray(cls.students) ? cls.students.length : 0));
                }

                this.classes = classesList;
            } catch (error) {
                console.error("Error fetching classes:", error);
                this.error = "Gagal memuat data kelas";
            } finally {
                this.loading = false;
            }
        },

        async getClassById(id) {
            this.loading = true;
            this.error = null;
            try {
                const response = await getClassesById(id);
                if (response.data) {
                    const classData = response.data.data || response.data;

                    if (Array.isArray(classData.students)) {
                        classData.student_count = classData.students.length;
                        this.classStudents[id] = classData.students;
                    } else if (typeof classData.students_count !== 'undefined') {
                        classData.student_count = classData.students_count;
                    }

                    this.selectedClass = classData;
                }
            } catch (error) {
                console.error(`Error fetching class with id ${id}:`, error);
                this.error = "Gagal memuat data kelas";
            } finally {
                this.loading = false;
            }
        },

        async createClass(data) {
            this.loading = true;
            this.error = null;
            this.success = null;
            try {
                const response = await createClass(data);
                if (response.status === 201 || response.status === 200) {
                    // Get the newly created class data
                    const newClass = response.data;

                    // Add to classes list if it exists
                    if (Array.isArray(this.classes)) {
                        this.classes.push(newClass);
                    }

                    this.success = response.message || "Kelas berhasil dibuat";
                    return newClass;
                } else {
                    throw new Error(response.message || "Failed to create class");
                }
            } catch (error) {
                console.error("Error creating class:", error);
                this.error = error.message || "Gagal membuat kelas";
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updateClass(id, data) {
            this.loading = true;
            this.error = null;
            this.success = null;
            try {
                const response = await updateClass(id, data);
                if (response.status === 200 || response.status === 201) {
                    this.success = response.message || "Kelas berhasil diperbarui";

                    // Update the class in the classes array
                    if (Array.isArray(this.classes)) {
                        const index = this.classes.findIndex(cls => cls.id === id);
                        if (index !== -1) {
                            // Get updated class data
                            const updatedClass = response.data;
                            this.classes[index] = updatedClass;
                        }
                    }

                    // Also update selectedClass if it's the same class
                    if (this.selectedClass && this.selectedClass.id === id) {
                        this.selectedClass = response.data;
                    }

                    return response.data;
                } else {
                    throw new Error(response.message || "Failed to update class");
                }
            } catch (error) {
                console.error(`Error updating class with id ${id}:`, error);
                this.error = error.message || "Gagal memperbarui kelas";
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async getTeachers() {
            this.loading = true;
            this.error = null;
            try {
                const response = await getTeachers();
                if (response.data && Array.isArray(response.data)) {
                    this.teachers = response.data;
                } else if (response.data && Array.isArray(response.data.data)) {
                    this.teachers = response.data.data;
                } else {
                    console.error("Unexpected API response format:", response);
                    this.error = "Format data tidak sesuai";
                }
            } catch (error) {
                console.error("Error fetching teachers:", error);
                this.error = "Gagal memuat data guru";
            } finally {
                this.loading = false;
            }
        },
        async deleteClass(id) {
            this.loading = true;
            this.error = null;
            this.success = null;
            try {
                const response = await deleteClass(id);
                if (response.status === 200 || response.status === 204) {
                    this.success = response.message || "Kelas berhasil dihapus";
                    this.classes = this.classes.filter(cls => cls.id !== id);
                } else {
                    throw new Error(response.message || "Failed to delete class");
                }
            } catch (error) {
                console.error(`Error deleting class with id ${id}:`, error);
                this.error = "Gagal menghapus kelas Karena ada siswa yang terkait";
                throw error;
            } finally {
                this.loading = false;
            }
        }
    }
});