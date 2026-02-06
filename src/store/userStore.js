import { defineStore } from "pinia";
import { getUser, getUserById, createUser, updateUser, deleteUser, getUserProfile, updateUserProfile, getQuizUser } from "../api/userApi";
import { useRouter } from "vue-router";

const router = useRouter();

export const useUserStore = defineStore("users", {
    state: () => ({
        users: [],
        detailUser: null,
        loading: false,
        error: null,
        success: null,
        userProfile: null,
    }),

    actions: {

        async getUser() {
            this.loading = true;

            this.error = null;

            try {

                const response = await getUser();

                if (response.data && response.data.data) {
                    this.users = response.data.data.map(user => ({
                        ...user,
                        selected: false
                    }));
                } else if (response.data && response.data.data) {
                    this.users = response.data.map(user => ({
                        ...user,
                        selected: false
                    }));
                }
            } catch (error) {
                console.error("Error fetching user:", error);
                this.error = "Gagal memuat data user";
            } finally {
                this.loading = false;
            }
        },

        async getUserById(userId) {
            this.loading = true;
            this.error = null;

            try {
                const response = await getUserById(userId);

                if (response.data) {
                    this.detailUser = response.data.data || response.data;
                }

            } catch (error) {
                console.error(`Error fetching students for class ${classId}:`, error);
                this.error = "Gagal memuat data siswa";
            }
            finally {
                this.loading = false;
            }
        },
        
        async handleLogout() {
            try {
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                router.push("/login");
            } catch (error) {
                console.error("Error logging out:", error);
                this.error = "Gagal keluar";
            }
        },

        async getUserProfile() {
            this.loading = true;
            this.error = null;

            try {
                const response = await getUserProfile();
                this.userProfile = response.data;
            } catch (error) {
                console.error("Error fetching user profile:", error);
                this.error = "Gagal memuat data profil";
            } finally {
                this.loading = false;
            }
        },

        async updateUserProfile(id, data) {
            this.loading = true;
            this.error = null;

            try {
                const response = await updateUserProfile(id, data);
                this.userProfile = response.data;
            } catch (error) {
                console.error("Error updating user profile:", error);
                this.error = "Gagal memperbarui data profil";
            } finally {
                this.loading = false;
            }
        },
        
        async getQuizUser() {
            this.loading = true;
            this.error = null;
            
            try {
                const response = await getQuizUser();
                return response.data;
            } catch (error) {
                console.error("Error fetching quiz user:", error);
                this.error = "Gagal memuat data kuis";
            } finally {
                this.loading = false;
            }
        }

    }
})