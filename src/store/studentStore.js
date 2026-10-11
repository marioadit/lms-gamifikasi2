import { defineStore } from "pinia";
import { getUserStudent, getClassStudents, enrollStudent, removeStudentFromClass } from "../api/studentsClassesApi";
import { register } from "../api/authApi";
import { getUserById, updateUserProfile, updateUserPassword, resetUserPassword, deleteUser } from "../api/userApi";

export const useStudentStore = defineStore("student", {
    state: () => ({
        students: [],
        classStudents: [],
        currentStudent: null,
        loading: false,
        error: null,
        success: null
    }),

    actions: {
        async getUserStudent() {
            this.loading = true;
            this.error = null;
            try {
                const response = await getUserStudent();
                if (response.data && response.data.data && response.data.data.data) {
                    this.students = response.data.data.data.map(student => ({
                        ...student,
                        selected: false,
                        disabled: false,
                        enrolledClassName: null
                    }));
                } else if (response.data && response.data.data) {
                    this.students = response.data.data.map(student => ({
                        ...student,
                        selected: false,
                        disabled: false,
                        enrolledClassName: null
                    }));
                } else if (response.data) {
                    this.students = response.data.map(student => ({
                        ...student,
                        selected: false,
                        disabled: false,
                        enrolledClassName: null
                    }));
                }
            }
            catch (error) {
                console.error("Error fetching students:", error);
                this.error = "Gagal memuat data siswa";
            }
            finally {
                this.loading = false;
            }
        },

        async getClassStudents(classId) {
            this.loading = true;
            this.error = null;
            try {
                const response = await getClassStudents(classId);
                let classStudentsList = [];
                
                if (response.data && response.data.data && response.data.data.data) {
                    classStudentsList = response.data.data.data;
                } else if (response.data && response.data.data) {
                    classStudentsList = response.data.data;
                } else if (response.data) {
                    classStudentsList = response.data;
                }
                
                this.classStudents = classStudentsList;
                
                // Mark students that are already in this class or enrolled in another class
                if (this.students.length > 0) {
                    this.students.forEach(student => {
                        const isInThisClass = classStudentsList.some(
                            classStudent => classStudent.id === student.id
                        );
                        
                        if (isInThisClass) {
                            // Student is in the current class - allow editing
                            student.selected = true;
                            student.disabled = false;
                            student.enrolledClassName = null;
                        } else if (student.classes_enrolled && student.classes_enrolled.length > 0) {
                            // Filter classes to check if enrolled in ANOTHER class
                            const otherClasses = student.classes_enrolled.filter(
                                c => Number(c.id) !== Number(classId)
                            );
                            if (otherClasses.length > 0) {
                                // Student is enrolled in another class - disable selection and record class name
                                student.selected = false;
                                student.disabled = true;
                                student.enrolledClassName = otherClasses.map(c => c.name).join(', ');
                            } else {
                                student.selected = false;
                                student.disabled = false;
                                student.enrolledClassName = null;
                            }
                        } else {
                            student.selected = false;
                            student.disabled = false;
                            student.enrolledClassName = null;
                        }
                    });
                }
            }
            catch (error) {
                console.error(`Error fetching students for class ${classId}:`, error);
                this.error = "Gagal memuat data siswa kelas";
            }
            finally {
                this.loading = false;
            }
        },
        
        async saveClassStudents(classId, studentIds) {
            this.loading = true;
            this.error = null;
            this.success = null;
            
            try {
                // Get currently enrolled students
                const currentStudentIds = this.classStudents.map(student => student.id);
                
                // Find students to add (in studentIds but not in currentStudentIds)
                const studentsToAdd = studentIds.filter(id => !currentStudentIds.includes(id));
                
                // Find students to remove (in currentStudentIds but not in studentIds)
                const studentsToRemove = currentStudentIds.filter(id => !studentIds.includes(id));
                
                // Enroll new students
                for (const studentId of studentsToAdd) {
                    await enrollStudent(classId, studentId);
                }
                
                // Remove students no longer selected
                for (const studentId of studentsToRemove) {
                    await removeStudentFromClass(classId, studentId);
                }
                
                this.success = "Perubahan siswa berhasil disimpan";
                
                // Refresh the class students list
                await this.getClassStudents(classId);
            }
            catch (error) {
                console.error("Error saving class students:", error);
                this.error = "Gagal menyimpan perubahan siswa";
            }
            finally {
                this.loading = false;
            }
        },

        async promoteStudentsBatch(targetClassId, studentIds, currentClassId) {
            this.loading = true;
            this.error = null;
            this.success = null;
            try {
                for (const studentId of studentIds) {
                    await enrollStudent(targetClassId, studentId);
                }
                this.success = `Berhasil menaikkan ${studentIds.length} siswa ke kelas baru`;
                if (currentClassId) {
                    await this.getClassStudents(currentClassId);
                }
                await this.getUserStudent();
                return true;
            } catch (error) {
                console.error("Error promoting students batch:", error);
                this.error = error.response?.data?.message || error.message || "Gagal menaikkan kelas siswa";
                return false;
            } finally {
                this.loading = false;
            }
        },

        async changeStudentsStatusBatch(classId, students, newStatus) {
            this.loading = true;
            this.error = null;
            this.success = null;
            try {
                for (const student of students) {
                    // 1. Delete siswa dari kelas dahulu
                    await removeStudentFromClass(classId, student.id);
                    // 2. Baru update user profile status
                    await updateUserProfile(student.id, {
                        name: student.name,
                        email: student.email,
                        status: newStatus
                    });
                }
                this.success = `Berhasil mengeluarkan ${students.length} siswa dari kelas dan mengubah status menjadi ${newStatus === 'lulus' ? 'Lulus' : 'Pindah'}`;
                await this.getClassStudents(classId);
                await this.getUserStudent();
                return true;
            } catch (error) {
                console.error("Error updating students status batch:", error);
                this.error = error.response?.data?.message || error.message || "Gagal mengubah status siswa";
                return false;
            } finally {
                this.loading = false;
            }
        },

        async removeSingleStudentFromClass(classId, studentId) {
            this.loading = true;
            this.error = null;
            this.success = null;
            try {
                await removeStudentFromClass(classId, studentId);
                this.success = "Siswa berhasil dikeluarkan dari kelas";
                await this.getClassStudents(classId);
                await this.getUserStudent();
                return true;
            } catch (error) {
                console.error("Error removing student from class:", error);
                this.error = error.response?.data?.message || error.message || "Gagal mengeluarkan siswa dari kelas";
                return false;
            } finally {
                this.loading = false;
            }
        },

        async getStudentById(id) {
            this.loading = true;
            this.error = null;
            try {
                const response = await getUserById(id);
                const data = response.data || response;
                this.currentStudent = data;
                return data;
            } catch (error) {
                console.error(`Error fetching student ${id}:`, error);
                this.error = "Gagal memuat data siswa";
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async createStudent(formData) {
            this.loading = true;
            this.error = null;
            this.success = null;
            try {
                const res = await register(formData);
                this.success = "Siswa berhasil ditambahkan";
                await this.getUserStudent();
                return res;
            } catch (error) {
                console.error("Error creating student:", error);
                const message = typeof error === 'string' ? error : (error?.message || "Gagal menambahkan siswa");
                this.error = message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updateStudentProfile(id, formData) {
            this.loading = true;
            this.error = null;
            this.success = null;
            try {
                const res = await updateUserProfile(id, formData);
                this.success = "Profil siswa berhasil diperbarui";
                await this.getUserStudent();
                return res;
            } catch (error) {
                console.error("Error updating student profile:", error);
                const message = error.response?.data?.message || error.message || "Gagal memperbarui profil siswa";
                this.error = message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updateStudentPassword(id, formData) {
            this.loading = true;
            this.error = null;
            this.success = null;
            try {
                const res = await updateUserPassword(id, formData);
                this.success = "Password siswa berhasil diperbarui";
                return res;
            } catch (error) {
                console.error("Error updating student password:", error);
                const message = error.response?.data?.message || error.message || "Gagal memperbarui password";
                this.error = message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async resetStudentPassword(id) {
            this.loading = true;
            this.error = null;
            this.success = null;
            try {
                const res = await resetUserPassword(id);
                this.success = "Password siswa berhasil di-reset";
                return res;
            } catch (error) {
                console.error("Error resetting student password:", error);
                const message = error.response?.data?.message || error.message || "Gagal mereset password";
                this.error = message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async deleteStudent(id) {
            this.loading = true;
            this.error = null;
            this.success = null;
            try {
                const res = await deleteUser(id);
                this.success = "Siswa berhasil dihapus";
                await this.getUserStudent();
                return res;
            } catch (error) {
                console.error("Error deleting student:", error);
                const message = error.response?.data?.message || error.message || "Gagal menghapus siswa";
                this.error = message;
                throw error;
            } finally {
                this.loading = false;
            }
        }
    }
}); 