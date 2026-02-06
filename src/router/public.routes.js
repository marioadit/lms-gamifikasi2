import MainPage from "../pages/Landing/MainPage.vue";
import Login from "../pages/Auth/Login.vue";
import Register from "../pages/Auth/Register.vue";
import TentangKami from "../pages/Landing/TentangKami.vue";
import Layanan from "../pages/Landing/Layanan.vue";
import AppLayouts from "../components/landing/AppLayouts.vue";

export default [
    {
        path: "/",
        component: AppLayouts,
        meta: { publicPage: true },
        children: [
            {
                path: "",
                name: "home",
                component: MainPage,
                meta: { title: "Home", publicPage: true }
            },
            {
                path: "/login",
                name: "login",
                component: Login,
                meta: { title: "Login", guest: true, publicPage: true }
            },
            {
                path: "/register",
                name: "register",
                component: Register,
                meta: { title: "Register", guest: true, publicPage: true }
            },
            {
                path: "/tentangkami",
                name: "tentang-kami",
                component: TentangKami,
                meta: { title: "Tentang Kami", publicPage: true }
            },
            {
                path: "/layanan",
                name: "layanan",
                component: Layanan,
                meta: { title: "Layanan", publicPage: true }
            },
        ]
    },
]; 