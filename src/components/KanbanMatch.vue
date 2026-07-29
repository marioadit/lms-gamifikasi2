<script setup>
import { ref, onMounted, computed, watch } from 'vue';

const props = defineProps({
    matchPairs: {
        type: Array,
        required: true
    },
    baseUrl: {
        type: String,
        required: true
    }
});

const emit = defineEmits(['update:matches']);

// State
const selectedLeftId = ref(null);
const selectedRightId = ref(null);
const matchPairAnswers = ref(new Map()); // Map<leftId, rightId>
const rightItemsList = ref([]);

// Colors for visual pair indicators
const pairColors = [
    { bg: 'bg-emerald-100', border: 'border-emerald-500', text: 'text-emerald-800', badge: 'bg-emerald-500' },
    { bg: 'bg-blue-100', border: 'border-blue-500', text: 'text-blue-800', badge: 'bg-blue-500' },
    { bg: 'bg-purple-100', border: 'border-purple-500', text: 'text-purple-800', badge: 'bg-purple-500' },
    { bg: 'bg-amber-100', border: 'border-amber-500', text: 'text-amber-800', badge: 'bg-amber-500' },
    { bg: 'bg-pink-100', border: 'border-pink-500', text: 'text-pink-800', badge: 'bg-pink-500' },
    { bg: 'bg-teal-100', border: 'border-teal-500', text: 'text-teal-800', badge: 'bg-teal-500' },
];

const initRightItems = () => {
    if (!props.matchPairs || props.matchPairs.length === 0) {
        rightItemsList.value = [];
        return;
    }
    const items = props.matchPairs.map((pair, index) => ({
        id: pair.id,
        right_image: pair.right_image || pair.image,
        right_text: pair.right_text || pair.text || pair.option_text || `Opsi ${index + 1}`
    }));
    // Shuffle right items once
    rightItemsList.value = [...items].sort(() => Math.random() - 0.5);
};

onMounted(initRightItems);
watch(() => props.matchPairs, initRightItems, { deep: true });

const leftItems = computed(() => props.matchPairs || []);
const rightItems = computed(() => rightItemsList.value);

const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${props.baseUrl}/${imagePath}`;
};

// Selection Logic
const selectLeftItem = (leftId) => {
    if (selectedLeftId.value === leftId) {
        selectedLeftId.value = null; // Unselect if clicked again
        return;
    }

    selectedLeftId.value = leftId;

    // If right item is already selected, pair them!
    if (selectedRightId.value !== null) {
        makePair(leftId, selectedRightId.value);
        selectedLeftId.value = null;
        selectedRightId.value = null;
    }
};

const selectRightItem = (rightId) => {
    if (selectedRightId.value === rightId) {
        selectedRightId.value = null; // Unselect if clicked again
        return;
    }

    selectedRightId.value = rightId;

    // If left item is already selected, pair them!
    if (selectedLeftId.value !== null) {
        makePair(selectedLeftId.value, rightId);
        selectedLeftId.value = null;
        selectedRightId.value = null;
    }
};

const makePair = (leftId, rightId) => {
    // Remove previous pairs involving leftId or rightId
    for (const [lId, rId] of matchPairAnswers.value.entries()) {
        if (lId === leftId || rId === rightId) {
            matchPairAnswers.value.delete(lId);
        }
    }

    matchPairAnswers.value.set(leftId, rightId);
    emitMatches();
};

const removePairByLeft = (leftId) => {
    matchPairAnswers.value.delete(leftId);
    emitMatches();
};

const emitMatches = () => {
    const answersArray = Array.from(matchPairAnswers.value.entries()).map(([leftId, rightId]) => ({
        left_id: leftId,
        right_id: rightId
    }));
    emit('update:matches', answersArray);
};

// Helpers for paired UI
const getMatchedRightId = (leftId) => {
    return matchPairAnswers.value.get(leftId) || null;
};

const getMatchedLeftId = (rightId) => {
    for (const [lId, rId] of matchPairAnswers.value.entries()) {
        if (rId === rightId) return lId;
    }
    return null;
};

const getPairColorClass = (leftId) => {
    const keys = Array.from(matchPairAnswers.value.keys());
    const index = keys.indexOf(leftId);
    if (index === -1) return null;
    return pairColors[index % pairColors.length];
};

const getPairColorClassForRight = (rightId) => {
    const leftId = getMatchedLeftId(rightId);
    if (!leftId) return null;
    return getPairColorClass(leftId);
};

const getMatchedRightText = (leftId) => {
    const rId = getMatchedRightId(leftId);
    if (!rId) return '';
    const item = rightItemsList.value.find(i => i.id === rId);
    return item?.right_text || `Opsi #${rId}`;
};

const getMatchedLeftText = (rightId) => {
    const lId = getMatchedLeftId(rightId);
    if (!lId) return '';
    const item = props.matchPairs.find(i => i.id === lId);
    return item?.left_text || item?.text || `Soal #${lId}`;
};

const clearMatches = () => {
    matchPairAnswers.value.clear();
    selectedLeftId.value = null;
    selectedRightId.value = null;
    emit('update:matches', []);
};

const reshuffleRightItems = () => {
    initRightItems();
    clearMatches();
};
</script>

<template>
    <div class="kanban-container space-y-6 p-2 md:p-4">
        <!-- Header & Instructions -->
        <div class="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-5 rounded-3xl text-white shadow-lg text-center space-y-2">
            <h2 class="text-2xl md:text-3xl font-extrabold flex items-center justify-center gap-2">
                <span>🎮</span> Pasangkan Gambar / Teks 🎯
            </h2>
            <p class="text-sm md:text-base font-medium opacity-90">
                Pilih radio button di kiri dan kanan untuk menghubungkan pasangan gambar dengan tepat!
            </p>
        </div>

        <!-- Matching Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            <!-- Left Column (Pertanyaan / Gambar Kiri) -->
            <div class="space-y-4">
                <div class="bg-blue-50/80 p-4 rounded-3xl border border-blue-200 space-y-3">
                    <div class="flex items-center justify-between border-b border-blue-200 pb-2">
                        <h3 class="font-bold text-blue-800 text-lg flex items-center gap-2">
                            <span>📌</span> Pilihan Kiri (Soal)
                        </h3>
                        <span class="text-xs font-semibold text-blue-600">
                            {{ matchPairAnswers.size }} / {{ leftItems.length }} Terpasang
                        </span>
                    </div>

                    <div class="space-y-3">
                        <div 
                            v-for="(item, idx) in leftItems" 
                            :key="item.id"
                            @click="selectLeftItem(item.id)"
                            class="relative bg-white rounded-2xl p-4 border-2 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                            :class="[
                                getMatchedRightId(item.id) 
                                    ? `${getPairColorClass(item.id)?.border} ${getPairColorClass(item.id)?.bg}` 
                                    : selectedLeftId === item.id 
                                        ? 'border-indigo-600 ring-4 ring-indigo-200 bg-indigo-50/90' 
                                        : 'border-blue-200 hover:border-blue-400 bg-white'
                            ]"
                        >
                            <div class="flex items-center justify-between gap-3">
                                <!-- Item Content -->
                                <div class="flex items-center gap-3 flex-1 min-w-0">
                                    <span class="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                                        {{ idx + 1 }}
                                    </span>

                                    <img 
                                        v-if="item.left_image || item.image"
                                        :src="getFullImageUrl(item.left_image || item.image)"
                                        :alt="item.left_text"
                                        class="h-16 w-16 object-cover rounded-xl border border-gray-200 shrink-0"
                                    />

                                    <div class="min-w-0">
                                        <p class="font-bold text-gray-800 text-sm md:text-base leading-snug">
                                            {{ item.left_text || item.text || item.option_text }}
                                        </p>
                                        
                                        <!-- Connected Badge -->
                                        <div v-if="getMatchedRightId(item.id)" class="mt-1 flex items-center gap-1 text-xs font-bold text-emerald-700">
                                            <span>🔗 Terhubung:</span>
                                            <span class="truncate max-w-[150px] underline">{{ getMatchedRightText(item.id) }}</span>
                                        </div>
                                        <div v-else-if="selectedLeftId === item.id" class="mt-1 text-xs font-semibold text-indigo-600 animate-pulse">
                                            👉 Pilih pasangan di sebelah kanan...
                                        </div>
                                    </div>
                                </div>

                                <!-- Radio Connector Circle (Right Edge) -->
                                <div class="shrink-0 flex items-center gap-2">
                                    <div 
                                        class="w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200"
                                        :class="[
                                            getMatchedRightId(item.id) 
                                                ? 'border-emerald-600 bg-emerald-600 text-white' 
                                                : selectedLeftId === item.id 
                                                    ? 'border-indigo-600 bg-indigo-600 text-white scale-110 shadow-lg' 
                                                    : 'border-gray-300 bg-gray-50 hover:border-indigo-400'
                                        ]"
                                    >
                                        <span v-if="getMatchedRightId(item.id)" class="text-xs font-bold">✓</span>
                                        <span v-else-if="selectedLeftId === item.id" class="text-xs font-bold">🔘</span>
                                        <span v-else class="w-3 h-3 rounded-full bg-gray-300"></span>
                                    </div>

                                    <!-- Unpair Button -->
                                    <button 
                                        v-if="getMatchedRightId(item.id)"
                                        @click.stop="removePairByLeft(item.id)"
                                        class="btn btn-circle btn-xs btn-ghost text-red-500 hover:bg-red-100"
                                        title="Lepas Pasangan"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Column (Jawaban / Opsi Kanan) -->
            <div class="space-y-4">
                <div class="bg-purple-50/80 p-4 rounded-3xl border border-purple-200 space-y-3">
                    <div class="flex items-center justify-between border-b border-purple-200 pb-2">
                        <h3 class="font-bold text-purple-800 text-lg flex items-center gap-2">
                            <span>🎯</span> Pilihan Kanan (Pasangan)
                        </h3>
                        <button 
                            @click="reshuffleRightItems" 
                            class="btn btn-xs btn-outline btn-primary rounded-xl"
                            :disabled="matchPairAnswers.size > 0"
                        >
                            🔄 Acak
                        </button>
                    </div>

                    <div class="space-y-3">
                        <div 
                            v-for="item in rightItems" 
                            :key="item.id"
                            @click="selectRightItem(item.id)"
                            class="relative bg-white rounded-2xl p-4 border-2 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                            :class="[
                                getMatchedLeftId(item.id) 
                                    ? `${getPairColorClassForRight(item.id)?.border} ${getPairColorClassForRight(item.id)?.bg}` 
                                    : selectedRightId === item.id 
                                        ? 'border-indigo-600 ring-4 ring-indigo-200 bg-indigo-50/90' 
                                        : 'border-purple-200 hover:border-purple-400 bg-white'
                            ]"
                        >
                            <div class="flex items-center justify-between gap-3">
                                <!-- Radio Connector Circle (Left Edge) -->
                                <div class="shrink-0 flex items-center gap-2">
                                    <div 
                                        class="w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200"
                                        :class="[
                                            getMatchedLeftId(item.id) 
                                                ? 'border-emerald-600 bg-emerald-600 text-white' 
                                                : selectedRightId === item.id 
                                                    ? 'border-indigo-600 bg-indigo-600 text-white scale-110 shadow-lg' 
                                                    : 'border-gray-300 bg-gray-50 hover:border-indigo-400'
                                        ]"
                                    >
                                        <span v-if="getMatchedLeftId(item.id)" class="text-xs font-bold">✓</span>
                                        <span v-else-if="selectedRightId === item.id" class="text-xs font-bold">🔘</span>
                                        <span v-else class="w-3 h-3 rounded-full bg-gray-300"></span>
                                    </div>
                                </div>

                                <!-- Item Content -->
                                <div class="flex items-center gap-3 flex-1 min-w-0">
                                    <img 
                                        v-if="item.right_image"
                                        :src="getFullImageUrl(item.right_image)"
                                        :alt="item.right_text"
                                        class="h-16 w-16 object-cover rounded-xl border border-gray-200 shrink-0"
                                    />

                                    <div class="min-w-0">
                                        <p class="font-bold text-gray-800 text-sm md:text-base leading-snug">
                                            {{ item.right_text }}
                                        </p>

                                        <!-- Connected Badge -->
                                        <div v-if="getMatchedLeftId(item.id)" class="mt-1 flex items-center gap-1 text-xs font-bold text-emerald-700">
                                            <span>🔗 Terhubung:</span>
                                            <span class="truncate max-w-[150px] underline">{{ getMatchedLeftText(item.id) }}</span>
                                        </div>
                                        <div v-else-if="selectedRightId === item.id" class="mt-1 text-xs font-semibold text-indigo-600 animate-pulse">
                                            👉 Pilih pasangan di sebelah kiri...
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Reset Button -->
        <div class="flex justify-center pt-2">
            <button 
                @click="clearMatches"
                class="btn btn-error btn-outline rounded-2xl px-6"
                :disabled="matchPairAnswers.size === 0"
            >
                🔄 Reset Semua Pasangan
            </button>
        </div>
    </div>
</template>

<style scoped>
.kanban-container {
    max-width: 1000px;
    margin: 0 auto;
}
</style>