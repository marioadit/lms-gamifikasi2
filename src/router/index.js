import { createRouter, createWebHistory } from "vue-router";
import adminRoutes from "./admin.routes";
import publicRoutes from "./public.routes";
import studentRoutes from "./student.routes";
import NotFoundPage from "../pages/NotFoundPage.vue";

const routes = [
    ...publicRoutes,
    ...adminRoutes,
    ...studentRoutes,
    // 404 route - must be last
    {
        path: "/:pathMatch(.*)*",
        name: "notFound",
        component: NotFoundPage,
        meta: { title: "Page Not Found" }
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem("token");
    const isAuthenticated = !!token;
    
    if (to.meta.publicPage) {
        return next();
    }
    
    if (to.meta.guest && isAuthenticated && !to.meta.publicPage) {
        const role = localStorage.getItem("role");
        if (role === "admin" || role === "guru") {
            return next({ path: "/admin" });
        }
        return next({ path: "/dashboard" });
    }
    
    if (to.matched.some(record => !record.meta.guest && !record.meta.publicPage) && !isAuthenticated) {
        return next({ path: "/login" });
    }
    
    next();
});

export default router;
