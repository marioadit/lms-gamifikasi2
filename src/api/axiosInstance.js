import axios from "axios";
import { useRouter } from "vue-router";

const base_url = import.meta.env.VITE_API_URL;

const router = useRouter();

const axiosInstance = axios.create({
    baseURL: `${base_url}/api`,
    headers: {
        "Accept": "application/json",
    }
});

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    

    if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
    } else {
        config.headers["Content-Type"] = "application/json";
    }
    
    return config;
});

axiosInstance.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem("token");

            router.push({ name: "login" });
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;