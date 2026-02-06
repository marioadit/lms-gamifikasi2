import StudentLayout from "../components/student/layouts/StudentLayout.vue";
import Dashboard from "../pages/student/Dashboard.vue";
import KelasPage from "../pages/student/KelasPage.vue";
import KuisPage from "../pages/student/KuisPage.vue";
import ProfilePage from "../pages/student/ProfilePage.vue";
import DetailKelasPage from "../pages/student/DetailKelasPage.vue";
import DetailPelajaranPage from "../pages/student/DetailPelajaranPage.vue";
import StartKuisPage from "../pages/student/StartKuisPage.vue";
import HasilKuisPage from "../pages/student/HasilKuisPage.vue";
import GetHasilKuisPage from "../pages/student/GetHasilKuisPage.vue";

export default [
    {
        path: "/dashboard",
        component: StudentLayout,
        meta: { requiresAuth: true },
        children: [
            {
                path: "",
                name: "studentDashboard",
                component: Dashboard,
                meta: { title: "Student Dashboard", requiresAuth: true }
            },
        ]
    },
    {
        path: "/kelas",
        component: StudentLayout,
        meta: { requiresAuth: true },
        children: [
            {
                path: "",
                name: "studentKelas",
                component: KelasPage,
                meta: { title: "Kelas Saya", requiresAuth: true }
            },
            {
                path: ":id",
                name: "detailKelas",
                component: DetailKelasPage,
                meta: { title: "Detail Kelas", requiresAuth: true }
            }
        ]
    },
    {
        path: "/pelajaran",
        component: StudentLayout,
        meta: { requiresAuth: true },
        children: [
            {
                path: ":id",
                name: "detailPelajaran",
                component: DetailPelajaranPage,
                meta: { title: "Detail Pelajaran", requiresAuth: true }
            }
        ]
    },
    {
        path: "/kuis",
        component: StudentLayout,
        meta: { requiresAuth: true },
        children: [
            {
                path: "",
                name: "studentKuis",
                component: KuisPage,
                meta: { title: "Kuis", requiresAuth: true }
            },
            {
                path: ":id",
                name: "startKuis",
                component: StartKuisPage,
                meta: { title: "Start Kuis", requiresAuth: true }
            },
            {
                path: "results",
                name: "getHasilKuis",
                component: GetHasilKuisPage,
                meta: { title: "Hasil Kuis", requiresAuth: true }
            },
            {
                path: "results/:id",
                name: "hasilKuis",
                component: HasilKuisPage,
                meta: { title: "Hasil Kuis", requiresAuth: true }
            }
        ]
    },
    {
        path: "/profil",
        component: StudentLayout,
        meta: { requiresAuth: true },
        children: [
            {
                path: "",
                name: "studentProfil",
                component: ProfilePage,
                meta: { title: "Profil Saya", requiresAuth: true }
            }
        ]
    }
] 