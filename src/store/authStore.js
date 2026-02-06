import { defineStore } from "pinia";
import { login, register, logout } from "../api/authApi";

export const useAuthStore = defineStore("auth", {
    state: () => ({
        user: null,
        token: localStorage.getItem("token") || "",
        role: localStorage.getItem("role") || "",
        name: localStorage.getItem("name") || "",
        loading: false,
        error: null
    }),

    getters: {
        isAuthenticated: (state) => !!state.token,
        userRole: (state) => state.role,
        userName: (state) => state.name,
        isLoading: (state) => state.loading,
        getError: (state) => state.error
    },

    actions: {
        setLoading(status) {
            this.loading = status;
        },

        setError(error) {
            this.error = error;
        },

        clearError() {
            this.error = null;
        },

        clearUserData() {
            this.user = null;
            this.token = "";
            this.role = "";
            this.name = "";
            this.error = null;
        },

        clearLocalStorage() {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('name');
            localStorage.removeItem('expires_at');
            localStorage.removeItem('token_type');
        },

        async login(email, password) {
            this.setLoading(true);
            this.clearError();
            
            try {
                const response = await login(email, password);
                const userData = response.data;

                // Update store state
                this.user = userData.user;
                this.token = userData.token;
                this.role = userData.user.role;
                this.name = userData.user.name;

                // Update localStorage
                localStorage.setItem("token", userData.token);
                localStorage.setItem("role", userData.user.role);
                localStorage.setItem("name", userData.user.name);
                localStorage.setItem("token_type", userData.token_type);
                localStorage.setItem("expires_at", userData.expires_at);

                return userData;
            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Login gagal. Silakan coba lagi.';
                this.setError(errorMessage);
                throw error;
            } finally {
                this.setLoading(false);
            }
        },

        async register(formData) {
            this.setLoading(true);
            this.clearError();
            
            try {
                const response = await register(formData);
                return response;
            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.';
                this.setError(errorMessage);
                throw error;
            } finally {
                this.setLoading(false);
            }
        },

        async logout() {
            this.setLoading(true);
            this.clearError();
            
            try {
                await logout();
                this.clearUserData();
                this.clearLocalStorage();
                return true;
            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Logout gagal. Silakan coba lagi.';
                this.setError(errorMessage);
                throw error;
            } finally {
                // Ensure state is cleared even if API call fails
                this.clearUserData();
                this.clearLocalStorage();
                this.setLoading(false);
            }
        }
    }
});