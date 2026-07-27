import AppLayouts from "../components/admin/layouts/AppLayouts.vue";
import Dashboard from "../pages/admin/Dashboard.vue";
import ClassesPage from "../pages/admin/ClassesPage.vue";
import LessonsPage from "../pages/admin/LessonsPage.vue";
import BadgesPage from "../pages/admin/BadgesPage.vue";
import AddLessonPage from "../pages/admin/AddLessonPage.vue";
import AddClassPage from "../pages/admin/AddClassPage.vue";
import EditClassPage from "../pages/admin/EditClassPage.vue";
import ClassStudentsPage from "../pages/admin/ClassStudentsPage.vue";
import DetailClassesPage from "../pages/admin/DetailClassesPage.vue";
import ListSiswaPage from "../pages/admin/users/ListSiswaPage.vue";
import AddSiswaPage from "../pages/admin/users/AddSiswaPage.vue";
import EditSiswaProfilePage from "../pages/admin/users/EditSiswaProfilePage.vue";
import EditSiswaPasswordPage from "../pages/admin/users/EditSiswaPasswordPage.vue";
import ListGuruPage from "../pages/admin/users/ListGuruPage.vue";
import AddGuruPage from "../pages/admin/users/AddGuruPage.vue";
import EditGuruProfilePage from "../pages/admin/users/EditGuruProfilePage.vue";
import EditGuruPasswordPage from "../pages/admin/users/EditGuruPasswordPage.vue";
import DetailGuruPage from "../pages/admin/users/DetailGuruPage.vue";
import DetailUserPage from "../pages/admin/users/DetailUserPage.vue";
import EditLessonsPage from "../pages/admin/EditLessonsPage.vue";
import DetailLessonsPage from "../pages/admin/DetailLessonsPage.vue";
import ClassLessonsPage from "../pages/admin/ClassLessonsPage.vue";
import QuizPage from "../pages/admin/quiz/QuizPage.vue";
import AddQuizPage from "../pages/admin/quiz/AddQuizPage.vue";
import DetailQuizPage from "../pages/admin/quiz/DetailQuizPage.vue";
import EditQuizPage from "../pages/admin/quiz/EditQuizPage.vue";
import DetailQuestionsPage from "../pages/admin/quiz/DetailQuestionsPage.vue";
import EditQuestionsPage from "../pages/admin/quiz/EditQuestionsPage.vue";
import AddQuestionsPage from "../pages/admin/quiz/AddQuestionsPage.vue";
import AdminDetailQuizPage from "../pages/admin/quiz/AdminDetailQuizPage.vue";
import { name } from "dayjs/locale/id";
import ResultQuizPage from "../pages/admin/quiz/ResultQuizPage.vue";
import DetailUserQuiz from "../pages/admin/quiz/DetailUserQuiz.vue";
import DetailQuizResultPage from "../pages/admin/quiz/DetailQuizResultPage.vue";

export default [
    {
        path: "/admin",
        component: AppLayouts,
        meta: { requiresAuth: true },
        children: [
            {
                path: "",  // Empty path means this will be the default for /admin
                name: "adminDashboard",
                component: Dashboard,
                meta: { title: "Admin Dashboard", requiresAuth: true }
            },
            // Keep the original route as an alias to maintain backward compatibility
            {
                path: "dashboard",
                redirect: { name: "adminDashboard" }
            },
            // Kelas management
            {
                path: "kelas",
                name: "adminKelas",
                component: ClassesPage,
                meta: { title: "Kelola Kelas", requiresAuth: true }
            },
            {
                path: "kelas/tambah",
                name: "adminAddClass",
                component: AddClassPage,
                meta: { title: "Tambah Kelas", requiresAuth: true }
            },
            {
                path: "kelas/:id",
                name: "adminDetailClass",
                component: DetailClassesPage,
                meta: { title: "Detail Kelas", requiresAuth: true }
            },
            {
                path: "kelas/edit/:id",
                name: "adminEditClass",
                component: EditClassPage,
                meta: { title: "Edit Kelas", requiresAuth: true }
            },
            {
                path: "kelas/:id/siswa",
                name: "adminClassStudents",
                component: ClassStudentsPage,
                meta: { title: "Kelola Siswa Kelas", requiresAuth: true }
            },
            // Pelajaran management
            {
                path: "pelajaran",
                name: "adminPelajaran",
                component: LessonsPage,
                meta: { title: "Kelola Pelajaran", requiresAuth: true }
            },
            {
                path: "pelajaran/tambah",
                name: "adminAddLesson",
                component: AddLessonPage,
                meta: { title: "Tambah Pelajaran", requiresAuth: true }
            },
            {
                path: "pelajaran/:id/edit",
                name: "adminEditLesson",
                component: EditLessonsPage,
                meta: { title: "Edit Pelajaran", requiresAuth: true }
            },
            {
                path: "pelajaran/:id",
                name: "adminDetailLesson",
                component: DetailLessonsPage,
                meta: { title: "Detail Pelajaran", requiresAuth: true }
            },
            {
                path: "pelajaran/:id/kuis",
                name: "adminDetailQuiz",
                component: AdminDetailQuizPage,
                meta: { title: "Detail Kuis", requiresAuth: true }
            },
            {
                path: "kelas/:id/pelajaran",
                name: "adminClassLessons",
                component: ClassLessonsPage,
                meta: { title: "Kelola Pelajaran Kelas", requiresAuth: true }
            },
            // Quiz management
            {
                path: "kuis",
                name: "adminQuiz",
                component: QuizPage,
                meta: { title: "Kelola Kuis", requiresAuth: true }
            },
            {
                path: "kuis/tambah",
                name: "adminAddQuiz",
                component: AddQuizPage,
                meta: { title: "Tambah Kuis", requiresAuth: true }
            },
            {
                path: "kuis/:id",
                name: "DetailQuiz",
                component: DetailQuizPage,
                meta: { title: "Detail Kuis", requiresAuth: true }
            },
            {
                path: "kuis/:id/edit",
                name: "adminEditQuiz",
                component: EditQuizPage,
                meta: { title: "Edit Kuis", requiresAuth: true }
            },
            {
                path: "kuis/:id/pertanyaan",
                name: "adminDetailQuestions",
                component: DetailQuestionsPage,
                meta: { title: "Detail Pertanyaan", requiresAuth: true }
            },
            {
                path: "kuis/:id/pertanyaan/tambah",
                name: "adminAddQuestions",
                component: AddQuestionsPage,
                meta: { title: "Tambah Pertanyaan", requiresAuth: true }
            },
            {
                path: "kuis/:id/pertanyaan/:questionId/edit",
                name: "adminEditQuestions",
                component: EditQuestionsPage,
                meta: { title: "Edit Pertanyaan", requiresAuth: true }
            },
            {
                path: "kuis/hasil",
                name: "adminResultQuiz",
                component: ResultQuizPage
            },

            {
                path: "users/siswa",
                name: "adminListSiswa",
                component: ListSiswaPage,
                meta: { title: "Daftar Siswa", requiresAuth: true }
            },
            {
                path: "users/tambah",
                name: "adminAddSiswa",
                component: AddSiswaPage,
                meta: { title: "Tambah Siswa", requiresAuth: true }
            },
            {
                path: "users/:id/edit-profile",
                name: "adminEditSiswaProfile",
                component: EditSiswaProfilePage,
                meta: { title: "Edit Profil Siswa", requiresAuth: true }
            },
            {
                path: "users/:id/edit-password",
                name: "adminEditSiswaPassword",
                component: EditSiswaPasswordPage,
                meta: { title: "Edit Password Siswa", requiresAuth: true }
            },
            {
                path: "users/:id",
                name: "adminDetailSiswa",
                component: DetailUserPage,
                meta: { title: "Detail Siswa", requiresAuth: true }
            },
            {
                path: "users/guru",
                name: "adminListGuru",
                component: ListGuruPage,
                meta: { title: "Daftar Guru", requiresAuth: true }
            },
            {
                path: "users/guru/tambah",
                name: "adminAddGuru",
                component: AddGuruPage,
                meta: { title: "Tambah Guru", requiresAuth: true }
            },
            {
                path: "users/guru/:id",
                name: "adminDetailGuru",
                component: DetailGuruPage,
                meta: { title: "Detail Guru", requiresAuth: true }
            },
            {
                path: "users/guru/:id/edit-profile",
                name: "adminEditGuruProfile",
                component: EditGuruProfilePage,
                meta: { title: "Edit Profil Guru", requiresAuth: true }
            },
            {
                path: "users/guru/:id/edit-password",
                name: "adminEditGuruPassword",
                component: EditGuruPasswordPage,
                meta: { title: "Edit Password Guru", requiresAuth: true }
            },
            {
                path: "users/kuis/:id",
                name: "adminDetailUserQuiz",
                component: DetailUserQuiz,
                meta: { title: "Detail Kuis Siswa", requiresAuth: true }
            }, {
                path: "users/kuis/:id/result",
                name: "DetailQuizResult",
                component: DetailQuizResultPage,
                meta: { title: "Detail Hasil Kuis Siswa", requiresAuth: true }
            }
        ]
    }
]