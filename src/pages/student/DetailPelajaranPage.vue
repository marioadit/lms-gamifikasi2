<script setup>
import { useRoute, useRouter } from 'vue-router';
import { useLessonStore } from '../../store/users/lessonsStore';
import { onMounted, computed } from 'vue';
import { getCurrentInstance } from 'vue';

const { proxy } = getCurrentInstance();
const base_url = proxy.$base_url;
const route = useRoute();
const router = useRouter();
const lessonStore = useLessonStore();

const getFullThumbnailUrl = (thumbnail) => {
    if (!thumbnail) return null;
    return `${base_url}/${thumbnail}`;
};

onMounted(() => {
    lessonStore.getUserLessonById(route.params.id);
});

const detailLessons = computed(() => lessonStore.detailLessons);
const isLoading = computed(() => lessonStore.loading);
const errorMessage = computed(() => lessonStore.error);

const startQuiz = (quizId) => {
    router.push(`/kuis/${quizId}`);
};
</script>

<template>
    <div class="p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
        <!-- Header with Fun Design -->
        <div class="my-8 text-center">
            <h1 class="text-4xl font-bold text-blue-600 mb-2" v-if="detailLessons">
                {{ detailLessons.title }}
            </h1>
            <div class="flex justify-center gap-2 mt-4">
                <router-link to="/kelas" class="btn btn-outline btn-lg">
                    <span class="mr-2">👈</span> Kembali ke Kelas
                </router-link>
            </div>
        </div>

        <!-- Loading indicator -->
        <div v-if="isLoading" class="flex justify-center my-12">
            <div class="loading loading-spinner loading-lg text-blue-600"></div>
        </div>

        <!-- Error message -->
        <div v-if="errorMessage" class="max-w-4xl mx-auto">
            <div class="alert alert-error shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{{ errorMessage }}</span>
            </div>
        </div>

        <div v-if="detailLessons && !isLoading" class="max-w-4xl mx-auto space-y-6">
            <!-- Lesson Info Card -->
            <div class="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:scale-[1.02] transition-transform duration-200">
                <!-- Thumbnail with Fun Border -->
                <div class="relative">
                    <div class="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-20"></div>
                    <img 
                        v-if="detailLessons.thumbnail"
                        :src="getFullThumbnailUrl(detailLessons.thumbnail)"
                        :alt="detailLessons.title"
                        class="w-full h-64 object-cover"
                    />
                    <div v-else class="w-full h-64 bg-gradient-to-r from-blue-200 to-purple-200 flex items-center justify-center">
                        <span class="text-6xl">📚</span>
                    </div>
                </div>

                <!-- Lesson Info -->
                <div class="p-6">
                    <div class="flex items-center gap-3 mb-4">
                        <span class="text-3xl">🎯</span>
                        <h2 class="text-2xl font-bold text-blue-600">Informasi Pelajaran</h2>
                    </div>
                    
                    <div class="space-y-4">
                        <div class="bg-blue-50 p-4 rounded-xl">
                            <div class="flex items-start gap-3">
                                <span class="text-2xl">📝</span>
                                <div>
                                    <h3 class="font-semibold text-blue-700">Deskripsi</h3>
                                    <p class="text-gray-600">{{ detailLessons.description }}</p>
                                </div>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="bg-purple-50 p-4 rounded-xl">
                                <div class="flex items-center gap-3">
                                    <span class="text-2xl">🏫</span>
                                    <div>
                                        <h3 class="font-semibold text-purple-700">Kelas</h3>
                                        <p class="text-gray-600">{{ detailLessons.class?.name }}</p>
                                    </div>
                                </div>
                            </div>

                            <div class="bg-green-50 p-4 rounded-xl">
                                <div class="flex items-center gap-3">
                                    <span class="text-2xl">📊</span>
                                    <div>
                                        <h3 class="font-semibold text-green-700">Level</h3>
                                        <p class="text-gray-600">{{ detailLessons.class?.level }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Content Card -->
            <div class="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-[1.02] transition-transform duration-200">
                <div class="flex items-center gap-3 mb-4">
                    <span class="text-3xl">📖</span>
                    <h2 class="text-2xl font-bold text-blue-600">Konten Pelajaran</h2>
                </div>
                <div class="prose max-w-none bg-blue-50 p-6 rounded-xl">
                    <div class="whitespace-pre-wrap text-gray-700">{{ detailLessons.content }}</div>
                </div>
            </div>

            <!-- Quizzes Card -->
            <div v-if="detailLessons.quizzes?.length > 0" class="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-[1.02] transition-transform duration-200">
                <div class="flex justify-between items-center mb-6">
                    <div class="flex items-center gap-3">
                        <span class="text-3xl">🎮</span>
                        <h2 class="text-2xl font-bold text-blue-600">Kuis Seru!</h2>
                    </div>
                    <button 
                        class="btn btn-primary btn-lg"
                        @click="startQuiz(detailLessons.quizzes[0].id)"
                    >
                        <span class="mr-2">🎯</span> Mulai Kuis
                    </button>
                </div>

                <div class="space-y-4">
                    <div v-for="quiz in detailLessons.quizzes" :key="quiz.id" 
                        class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 hover:shadow-md transition-shadow">
                        <div class="flex justify-between items-start">
                            <div class="flex-1">
                                <div class="flex items-center gap-3 mb-2">
                                    <span class="text-2xl">📝</span>
                                    <h3 class="font-bold text-lg text-blue-700">{{ quiz.title }}</h3>
                                </div>
                                <p class="text-gray-600 ml-10">{{ quiz.description }}</p>
                                
                                <div class="mt-4 ml-10">
                                    <div class="flex items-center gap-4 text-sm text-gray-500">
                                        <div class="flex items-center gap-2">
                                            <span>⏰</span>
                                            <span>Mulai: {{ new Date(quiz.start_time).toLocaleString('id-ID') }}</span>
                                        </div>
                                        <div class="flex items-center gap-2">
                                            <span>⌛</span>
                                            <span>Selesai: {{ new Date(quiz.end_time).toLocaleString('id-ID') }}</span>
                                        </div>
                                    </div>
                                    <div class="mt-2">
                                        <span v-if="quiz.is_active" class="badge badge-success gap-2">
                                            <span>✨</span> Aktif
                                        </span>
                                        <span v-else class="badge badge-error gap-2">
                                            <span>⏳</span> Belum Aktif
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>