<script setup>
import { ref, onMounted, computed } from 'vue';

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
const draggedItem = ref(null);
const matchPairAnswers = ref(new Map());

// Computed
const leftItems = computed(() => props.matchPairs);

const rightItems = computed(() => {
    // Create a copy of the match pairs
    const items = props.matchPairs.map(pair => ({
        id: pair.id,
        // Randomly choose between original and shuffled images
        right_image: Math.random() < 0.5 ? pair.right_image : pair.left_image,
        right_text: Math.random() < 0.5 ? pair.right_text : pair.left_text,
        original_right_image: pair.right_image,
        original_right_text: pair.right_text,
        original_left_image: pair.left_image,
        original_left_text: pair.left_text
    }));

    // Shuffle the array
    return items.sort(() => Math.random() - 0.5);
});

// Add new refs for animations and touch support
const isDragging = ref(false);
const touchStartX = ref(0);
const touchStartY = ref(0);

// Methods
const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return `${props.baseUrl}/${imagePath}`;
};

const handleDragStart = (e, item, type) => {
    draggedItem.value = { ...item, type };
    e.target.classList.add('dragging');
    if (e.target.querySelector('img')) {
        const img = e.target.querySelector('img');
        e.dataTransfer.setDragImage(img, 0, 0);
    }
};

const handleDragEnd = (e) => {
    e.target.classList.remove('dragging');
    draggedItem.value = null;
};

const handleDragOver = (e) => {
    e.preventDefault();
    e.target.closest('.droppable')?.classList.add('drag-over');
};

const handleDragLeave = (e) => {
    e.target.closest('.droppable')?.classList.remove('drag-over');
};

const handleDrop = (e, targetItem) => {
    e.preventDefault();
    e.target.closest('.droppable')?.classList.remove('drag-over');
    
    if (!draggedItem.value) return;

    // Handle matching
    if (draggedItem.value.type === 'left' && targetItem.type === 'right') {
        matchPairAnswers.value.set(draggedItem.value.id, targetItem.id);
    } else if (draggedItem.value.type === 'right' && targetItem.type === 'left') {
        matchPairAnswers.value.set(targetItem.id, draggedItem.value.id);
    }

    // Emit updated matches
    const answersArray = Array.from(matchPairAnswers.value.entries()).map(([leftId, rightId]) => ({
        left_id: leftId,
        right_id: rightId
    }));
    emit('update:matches', answersArray);
};

const isMatched = (itemId) => {
    if (matchPairAnswers.value.has(itemId)) {
        return true;
    }
    return Array.from(matchPairAnswers.value.values()).includes(itemId);
};

const getMatchedPair = (itemId) => {
    if (matchPairAnswers.value.has(itemId)) {
        return matchPairAnswers.value.get(itemId);
    }
    for (const [leftId, rightId] of matchPairAnswers.value.entries()) {
        if (rightId === itemId) {
            return leftId;
        }
    }
    return null;
};

const clearMatches = () => {
    matchPairAnswers.value.clear();
    emit('update:matches', []);
};

const getConnectionLineStyle = (leftId, rightId) => {
    const leftEl = document.querySelector(`[data-pair-id="left-${leftId}"]`);
    const rightEl = document.querySelector(`[data-pair-id="right-${rightId}"]`);
    
    if (!leftEl || !rightEl) return {};
    
    const leftRect = leftEl.getBoundingClientRect();
    const rightRect = rightEl.getBoundingClientRect();
    
    const containerRect = leftEl.closest('.kanban-container').getBoundingClientRect();
    
    const x1 = leftRect.right - containerRect.left;
    const y1 = leftRect.top + (leftRect.height / 2) - containerRect.top;
    const x2 = rightRect.left - containerRect.left;
    const y2 = rightRect.top + (rightRect.height / 2) - containerRect.top;
    
    const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    
    return {
        left: `${x1}px`,
        top: `${y1}px`,
        width: `${length}px`,
        transform: `rotate(${angle}deg)`
    };
};

// Add function to reshuffle right items
const reshuffleRightItems = () => {
    // Force recomputation of rightItems
    rightItems.value = rightItems.value.map(item => ({
        ...item,
        right_image: Math.random() < 0.5 ? item.original_right_image : item.original_left_image,
        right_text: Math.random() < 0.5 ? item.original_right_text : item.original_left_text
    })).sort(() => Math.random() - 0.5);
    
    // Clear existing matches
    clearMatches();
};

// Add touch event handlers
const handleTouchStart = (e, item, type) => {
    touchStartX.value = e.touches[0].clientX;
    touchStartY.value = e.touches[0].clientY;
    handleDragStart(e, item, type);
};

const handleTouchMove = (e) => {
    if (!isDragging.value) return;
    e.preventDefault();
    const touch = e.touches[0];
    const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
    const droppable = elements.find(el => el.classList.contains('droppable'));
    
    if (droppable) {
        droppable.classList.add('drag-over');
    }
};

const handleTouchEnd = (e) => {
    if (!isDragging.value) return;
    const touch = e.changedTouches[0];
    const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
    const droppable = elements.find(el => el.classList.contains('droppable'));
    
    if (droppable) {
        const itemId = droppable.dataset.pairId?.split('-')[1];
        const type = droppable.dataset.pairId?.split('-')[0];
        if (itemId && type) {
            handleDrop(e, { id: parseInt(itemId), type });
        }
    }
    
    isDragging.value = false;
    document.querySelectorAll('.drag-over').forEach(el => {
        el.classList.remove('drag-over');
    });
};
</script>

<template>
    <div class="kanban-container space-y-4 md:space-y-8 p-2 md:p-4">
        <!-- Fun Header -->
        <div class="text-center mb-6">
            <h2 class="text-2xl md:text-3xl font-bold text-indigo-600 mb-2">🎮 Matching Game! 🎯</h2>
            <p class="text-gray-600 text-sm md:text-base">Drag and match the correct pairs!</p>
        </div>

        <!-- Mobile Instructions -->
        <div class="md:hidden bg-yellow-50 rounded-xl p-4 mb-4 text-center">
            <p class="text-yellow-700">
                <span class="text-xl">👆</span> Tap and hold to drag items
            </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-12 relative">
            <!-- Left Column -->
            <div class="space-y-4">
                <div class="bg-gradient-to-r from-blue-100 to-blue-50 rounded-xl p-4">
                    <h3 class="text-lg md:text-xl font-bold text-blue-700 mb-4 flex items-center">
                        <span class="text-2xl mr-2">🎁</span> Your Items
                    </h3>
                    <div class="space-y-4">
                        <div v-for="item in leftItems" :key="item.id"
                             :data-pair-id="'left-' + item.id"
                             class="droppable relative bg-white border-3 rounded-xl p-4 transition-all transform hover:scale-102"
                             :class="{
                                 'matched': isMatched(item.id),
                                 'border-blue-300 shadow-lg': !isMatched(item.id)
                             }"
                             draggable="true"
                             @dragstart="handleDragStart($event, item, 'left')"
                             @dragend="handleDragEnd($event)"
                             @dragover="handleDragOver($event)"
                             @dragleave="handleDragLeave($event)"
                             @drop="handleDrop($event, { id: item.id, type: 'left' })"
                             @touchstart="handleTouchStart($event, item, 'left')"
                             @touchmove="handleTouchMove($event)"
                             @touchend="handleTouchEnd($event)">
                            
                            <div class="draggable flex flex-col items-center">
                                <div class="relative w-full aspect-square mb-3">
                                    <img :src="getFullImageUrl(item.left_image)"
                                         :alt="item.left_text"
                                         class="absolute inset-0 w-full h-full object-contain rounded-lg">
                                </div>
                                <p class="text-center font-bold text-blue-700 text-lg">{{ item.left_text }}</p>
                            </div>
                            <!-- Success Animation -->
                            <div v-if="isMatched(item.id)" class="absolute -top-2 -right-2 animate-bounce">
                                <span class="text-2xl">⭐</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Column -->
            <div class="space-y-4">
                <div class="bg-gradient-to-r from-purple-100 to-purple-50 rounded-xl p-4">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg md:text-xl font-bold text-purple-700 flex items-center">
                            <span class="text-2xl mr-2">🎯</span> Match These!
                        </h3>
                        <button @click="reshuffleRightItems"
                                class="btn btn-primary btn-sm md:btn-md animate-pulse"
                                :disabled="matchPairAnswers.size > 0">
                            <span class="text-xl mr-2">🔄</span>
                            <span class="hidden md:inline">Shuffle</span>
                        </button>
                    </div>
                    <div class="space-y-4">
                        <div v-for="item in rightItems" :key="item.id"
                             :data-pair-id="'right-' + item.id"
                             class="droppable relative bg-white border-3 rounded-xl p-4 transition-all transform hover:scale-102"
                             :class="{
                                 'matched': isMatched(item.id),
                                 'border-purple-300 shadow-lg': !isMatched(item.id)
                             }"
                             draggable="true"
                             @dragstart="handleDragStart($event, item, 'right')"
                             @dragend="handleDragEnd($event)"
                             @dragover="handleDragOver($event)"
                             @dragleave="handleDragLeave($event)"
                             @drop="handleDrop($event, { id: item.id, type: 'right' })"
                             @touchstart="handleTouchStart($event, item, 'right')"
                             @touchmove="handleTouchMove($event)"
                             @touchend="handleTouchEnd($event)">
                            
                            <div class="draggable flex flex-col items-center">
                                <div class="relative w-full aspect-square mb-3">
                                    <img :src="getFullImageUrl(item.right_image)"
                                         :alt="item.right_text"
                                         class="absolute inset-0 w-full h-full object-contain rounded-lg">
                                </div>
                                <p class="text-center font-bold text-purple-700 text-lg">{{ item.right_text }}</p>
                            </div>
                            <!-- Success Animation -->
                            <div v-if="isMatched(item.id)" class="absolute -top-2 -right-2 animate-bounce">
                                <span class="text-2xl">⭐</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Connection Lines (only show on desktop) -->
            <div class="hidden md:block">
                <div v-for="[leftId, rightId] in Array.from(matchPairAnswers)" :key="leftId + '-' + rightId"
                     class="match-line"
                     :style="getConnectionLineStyle(leftId, rightId)">
                </div>
            </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-center gap-4 mt-6">
            <button @click="clearMatches"
                    class="btn btn-error btn-outline btn-lg"
                    :disabled="matchPairAnswers.size === 0">
                <span class="text-xl mr-2">🔄</span> Start Over
            </button>
        </div>

        <!-- Success Message -->
        <div v-if="matchPairAnswers.size === leftItems.length"
             class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div class="bg-white rounded-xl p-8 text-center transform animate-bounce">
                <h3 class="text-2xl font-bold text-green-600 mb-4">
                    🎉 Great Job! 🌟
                </h3>
                <p class="text-gray-600">You matched all the pairs correctly!</p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.kanban-container {
    position: relative;
    min-height: 400px;
    max-width: 1200px;
    margin: 0 auto;
}

.draggable {
    cursor: grab;
    transition: all 0.3s;
    user-select: none;
    touch-action: none;
}

.draggable:active {
    cursor: grabbing;
}

.dragging {
    opacity: 0.7;
    transform: scale(0.95);
}

.droppable {
    transition: all 0.3s;
}

.drag-over {
    background-color: rgba(147, 197, 253, 0.2);
    transform: scale(1.05);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.matched {
    border-color: #10B981 !important;
    background-color: rgba(16, 185, 129, 0.1);
    transform: scale(1.02);
}

.match-line {
    position: absolute;
    height: 4px;
    background: linear-gradient(90deg, #60A5FA, #8B5CF6);
    transform-origin: left center;
    z-index: 1;
    border-radius: 2px;
    opacity: 0.6;
}

.border-3 {
    border-width: 3px;
}

.hover\:scale-102:hover {
    transform: scale(1.02);
}

@keyframes bounce {
    0%, 100% {
        transform: translateY(-5%);
        animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    50% {
        transform: translateY(0);
        animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
}

.animate-bounce {
    animation: bounce 1s infinite;
}

@media (max-width: 768px) {
    .kanban-container {
        padding: 0.5rem;
    }
    
    .droppable {
        margin-bottom: 1rem;
    }
}
</style> 