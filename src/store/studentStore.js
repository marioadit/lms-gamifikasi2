import { defineStore } from "pinia";
import { getUserStudent, getClassStudents, enrollStudent, removeStudentFromClass } from "../api/studentsClassesApi";

export const useStudentStore = defineStore("student", {
    state: () => ({
        students: [],
        classStudents: [],
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
                        selected: false
                    }));
                } else if (response.data && response.data.data) {
                    this.students = response.data.data.map(student => ({
                        ...student,
                        selected: false
                    }));
                } else if (response.data) {
                    this.students = response.data.map(student => ({
                        ...student,
                        selected: false
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
                
                // Mark students that are already in the class
                if (this.students.length > 0 && classStudentsList.length > 0) {
                    this.students.forEach(student => {
                        student.selected = classStudentsList.some(
                            classStudent => classStudent.id === student.id
                        );
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
        }
    }
}); 