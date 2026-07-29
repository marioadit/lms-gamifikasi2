<script setup>
import { useRoute, useRouter } from 'vue-router';
import { useLessonStore } from '../../store/users/lessonsStore';
import { onMounted, computed } from 'vue';
import { getCurrentInstance } from 'vue';

const { proxy } = getCurrentInstance();
const base_url = proxy?.$base_url || "";
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

const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
        return new Date(dateStr).toLocaleString('id-ID', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    } catch (e) {
        return dateStr;
    }
};
</script>

<template>
    <div class="p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
        <!-- Header -->
        <div class="my-6 text-center max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <div class="text-left">
                <h1 class="text-3xl font-extrabold text-blue-600 mb-1" v-if="detailLessons">
                    {{ detailLessons.title }} 📚
                </h1>
                <p class="text-sm text-gray-500">Pelajaran & Daftar Kuis Interaktif</p>
            </div>
            <router-link to="/kelas" class="btn btn-outline border-blue-500 text-blue-600 hover:bg-blue-600 hover:text-white rounded-2xl">
                <span>👈</span> Kembali ke Kelas
            </router-link>
        </div>

        <!-- Loading indicator -->
        <div v-if="isLoading" class="flex justify-center my-12">
            <div class="loading loading-spinner loading-lg text-blue-600"></div>
        </div>

        <!-- Error message -->
        <div v-if="errorMessage" class="max-w-4xl mx-auto">
            <div class="alert alert-error text-white shadow-lg rounded-2xl">
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{{ errorMessage }}</span>
            </div>
        </div>

        <div v-if="detailLessons && !isLoading" class="max-w-4xl mx-auto space-y-6">
            <!-- Lesson Info Card -->
            <div class="bg-white rounded-3xl shadow-lg overflow-hidden border border-blue-100">
                <!-- Thumbnail -->
                <div class="relative">
                    <div class="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-10"></div>
                    <img 
                        v-if="detailLessons.thumbnail"
                        :src="getFullThumbnailUrl(detailLessons.thumbnail)"
                        :alt="detailLessons.title"
                        class="w-full h-64 object-cover"
                    />
                    <div v-else class="w-full h-56 bg-gradient-to-r from-blue-200 to-purple-200 flex items-center justify-center">
                        <span class="text-6xl">📚</span>
                    </div>
                </div>

                <!-- Lesson Info -->
                <div class="p-6 space-y-4">
                    <div class="flex items-center gap-3">
                        <span class="text-3xl">🎯</span>
                        <h2 class="text-2xl font-bold text-blue-600">Informasi Pelajaran</h2>
                    </div>
                    
                    <div class="bg-blue-50/80 p-4 rounded-2xl border border-blue-100">
                        <h3 class="font-bold text-blue-800 text-sm mb-1">Deskripsi:</h3>
                        <p class="text-gray-700 text-sm leading-relaxed">{{ detailLessons.description }}</p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="bg-purple-50/80 p-4 rounded-2xl border border-purple-100 flex items-center gap-3">
                            <span class="text-2xl">🏫</span>
                            <div>
                                <h3 class="font-bold text-purple-800 text-xs">Kelas</h3>
                                <p class="text-gray-800 font-semibold">{{ detailLessons.class?.name || '-' }}</p>
                            </div>
                        </div>

                        <div class="bg-green-50/80 p-4 rounded-2xl border border-green-100 flex items-center gap-3">
                            <span class="text-2xl">📊</span>
                            <div>
                                <h3 class="font-bold text-green-800 text-xs">Tingkat / Level</h3>
                                <p class="text-gray-800 font-semibold">{{ detailLessons.class?.level || '-' }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Content Card -->
            <div class="bg-white rounded-3xl shadow-lg p-6 border border-blue-100 space-y-4">
                <div class="flex items-center gap-3">
                    <span class="text-3xl">📖</span>
                    <h2 class="text-2xl font-bold text-blue-600">Konten Pelajaran</h2>
                </div>
                <div class="prose max-w-none bg-blue-50/70 p-6 rounded-2xl border border-blue-100">
                    <div class="whitespace-pre-wrap text-gray-800 leading-relaxed">{{ detailLessons.content }}</div>
                </div>
            </div>

            <!-- Quizzes Card Section -->
            <div class="bg-white rounded-3xl shadow-lg p-6 border border-blue-100 space-y-6">
                <div class="flex justify-between items-center border-b border-gray-100 pb-3">
                    <div class="flex items-center gap-3">
                        <span class="text-3xl">🎮</span>
                        <h2 class="text-2xl font-bold text-blue-600">
                            Daftar Kuis Pelajaran ({{ detailLessons.quizzes?.length || 0 }})
                        </h2>
                    </div>
                </div>

                <!-- Quizzes List -->
                <div v-if="detailLessons.quizzes && detailLessons.quizzes.length > 0" class="space-y-4">
                    <div 
                        v-for="quiz in detailLessons.quizzes" 
                        :key="quiz.id" 
                        class="bg-gradient-to-r from-blue-50/90 to-purple-50/90 rounded-2xl p-6 border border-blue-100 space-y-4 hover:shadow-md transition-shadow"
                    >
                        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div class="space-y-1">
                                <div class="flex items-center gap-2">
                                    <span class="text-2xl">📝</span>
                                    <h3 class="font-bold text-xl text-blue-800">{{ quiz.title }}</h3>
                                    <span 
                                        :class="quiz.is_active ? 'badge-success text-white' : 'badge-error text-white'"
                                        class="badge badge-sm font-semibold"
                                    >
                                        {{ quiz.is_active ? '✨ Aktif' : '⏳ Belum Aktif' }}
                                    </span>
                                </div>
                                <p class="text-gray-600 text-sm pl-9">{{ quiz.description }}</p>
                            </div>

                            <!-- Dedicated Action Button per Quiz -->
                            <button 
                                class="btn btn-primary px-6 rounded-2xl text-white shadow-md hover:scale-105 transition-transform"
                                :disabled="!quiz.is_active"
                                @click="startQuiz(quiz.id)"
                            >
                                <span class="mr-1">🎯</span> Kerjakan Kuis
                            </button>
                        </div>

                        <!-- Schedule Timestamps -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-gray-600 border-t border-blue-100/60 pl-9">
                            <div class="flex items-center gap-1">
                                <span>⏰ Mulai:</span>
                                <span class="font-semibold text-gray-800">{{ formatDate(quiz.start_time) }}</span>
                            </div>
                            <div class="flex items-center gap-1">
                                <span>⌛ Selesai:</span>
                                <span class="font-semibold text-gray-800">{{ formatDate(quiz.end_time) }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Empty State -->
                <div v-else class="text-center py-8 text-gray-400 bg-gray-50 rounded-2xl border border-gray-100">
                    <p class="text-4xl mb-2">🎮</p>
                    <p class="font-semibold text-gray-600">Belum ada kuis untuk pelajaran ini.</p>
                </div>
            </div>
        </div>
    </div>
</template>