<script setup>
import { useRoute, useRouter } from "vue-router";
import { useQuizStore } from "../../../store/quizStore";
import { computed, onMounted, ref, watch, onBeforeUnmount } from "vue";
import { useQuestionsStore } from "../../../store/QuestionsStore";
import { getCurrentInstance } from "vue";

const { proxy } = getCurrentInstance();
const base_url = proxy.$base_url;

const questionsStore = useQuestionsStore();
const quizStore = useQuizStore();
const route = useRoute();
const router = useRouter();

// Get the IDs from route params and ensure they are valid numbers
const quizId = computed(() => {
  const id = route.params.id;
  return id ? parseInt(id) : null;
});

const questionId = computed(() => {
  const id = route.params.questionId;
  return id ? parseInt(id) : null;
});

const isLoading = ref(false);
const error = ref(null);

const questionTypes = [
  { value: 'essay', label: 'Essay', icon: '📝' },
  { value: 'choice_image', label: 'Pilihan Gambar', icon: '🖼️' },
  { value: 'guess_image', label: 'Tebak Gambar', icon: '🎯' },
  { value: 'match_image', label: 'Pasangkan Gambar', icon: '🔄' }
];

// Initialize empty question with safe defaults
const question = ref({
  quiz_id: quizId.value,
  type: 'essay', // Default type
  question_text: '',
  question_image: null,
  order: 0,
  score: 10,
  options: [],
  match_pairs: [],
  previewImage: null
});

// Add these new refs for previews
const questionImagePreview = ref(null);
const optionImagePreviews = ref({});
const matchPairImagePreviews = ref({});

// Add method to get image preview URL
const getImagePreviewUrl = (image) => {
  if (image instanceof File) {
    return URL.createObjectURL(image);
  } else if (typeof image === 'string' && image.length > 0) {
    return `${base_url}/${image}`;
  }
  return null;
};

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    question.value.question_image = file;
    questionImagePreview.value = URL.createObjectURL(file);
  }
};

const handleOptionImageUpload = (event, optionIndex) => {
  const file = event.target.files[0];
  if (file) {
    if (!question.value.options[optionIndex]) {
      question.value.options[optionIndex] = {
        option_text: '',
        option_image: null,
        is_correct: false,
        order: optionIndex
      };
    }
    question.value.options[optionIndex].option_image = file;
    optionImagePreviews.value[optionIndex] = URL.createObjectURL(file);
  }
};

const handleMatchPairImageUpload = (event, pairIndex, side) => {
  const file = event.target.files[0];
  if (file) {
    if (!question.value.match_pairs[pairIndex]) {
      question.value.match_pairs[pairIndex] = {
        left_text: '',
        left_image: null,
        right_text: '',
        right_image: null,
        pair_order: pairIndex
      };
    }
    const pair = question.value.match_pairs[pairIndex];
    if (side === 'left') {
      pair.left_image = file;
      if (!matchPairImagePreviews.value[pairIndex]) {
        matchPairImagePreviews.value[pairIndex] = {};
      }
      matchPairImagePreviews.value[pairIndex].left = URL.createObjectURL(file);
    } else {
      pair.right_image = file;
      if (!matchPairImagePreviews.value[pairIndex]) {
        matchPairImagePreviews.value[pairIndex] = {};
      }
      matchPairImagePreviews.value[pairIndex].right = URL.createObjectURL(file);
    }
  }
};

const addOption = () => {
  if (!Array.isArray(question.value.options)) {
    question.value.options = [];
  }
  question.value.options.push({
    option_text: '',
    option_image: null,
    is_correct: false,
    order: question.value.options.length
  });
};

const addMatchPair = () => {
  if (!Array.isArray(question.value.match_pairs)) {
    question.value.match_pairs = [];
  }
  question.value.match_pairs.push({
    left_text: '',
    left_image: null,
    right_text: '',
    right_image: null,
    pair_order: question.value.match_pairs.length
  });
};

const removeOption = (optionIndex) => {
  if (Array.isArray(question.value.options)) {
    question.value.options.splice(optionIndex, 1);
    question.value.options.forEach((opt, idx) => {
      opt.order = idx;
    });
  }
};

const removeMatchPair = (pairIndex) => {
  if (Array.isArray(question.value.match_pairs)) {
    question.value.match_pairs.splice(pairIndex, 1);
    question.value.match_pairs.forEach((pair, idx) => {
      pair.pair_order = idx;
    });
  }
};

// Add cleanup for object URLs
onBeforeUnmount(() => {
  if (questionImagePreview.value) URL.revokeObjectURL(questionImagePreview.value);
  Object.values(optionImagePreviews.value).forEach(url => URL.revokeObjectURL(url));
  Object.values(matchPairImagePreviews.value).forEach(pair => {
    if (pair.left) URL.revokeObjectURL(pair.left);
    if (pair.right) URL.revokeObjectURL(pair.right);
  });
});

const loadQuestionData = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    if (!quizId.value || !questionId.value) {
      error.value = 'Invalid quiz or question ID';
      return;
    }

    await quizStore.getQuizByQuestions(quizId.value);
    await questionsStore.getQuestionDetailById(questionId.value);
    const questionData = questionsStore.question;

    if (!questionData) {
      error.value = 'Failed to load question data';
      return;
    }
    question.value = {
      ...question.value,
      ...questionData,
      quiz_id: quizId.value,
      options: Array.isArray(questionData.options) ? questionData.options : [],
      match_pairs: Array.isArray(questionData.match_pairs) ? questionData.match_pairs : []
    };

    if (question.value.question_image) {
      questionImagePreview.value = getImagePreviewUrl(question.value.question_image);
    }

    if (question.value.options) {
      question.value.options.forEach((option, index) => {
        if (option.option_image) {
          optionImagePreviews.value[index] = getImagePreviewUrl(option.option_image);
        }
      });
    }

    if (question.value.match_pairs) {
      question.value.match_pairs.forEach((pair, index) => {
        if (pair.left_image || pair.right_image) {
          matchPairImagePreviews.value[index] = {};
          if (pair.left_image) {
            matchPairImagePreviews.value[index].left = getImagePreviewUrl(pair.left_image);
          }
          if (pair.right_image) {
            matchPairImagePreviews.value[index].right = getImagePreviewUrl(pair.right_image);
          }
        }
      });
    }
  } catch (err) {
    error.value = 'Failed to load question data';
  } finally {
    isLoading.value = false;
  }
};

const handleSubmit = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    const formData = new FormData();
    formData.append('quiz_id', question.value.quiz_id);
    formData.append('type', question.value.type);
    formData.append('question_text', question.value.question_text);
    formData.append('order', question.value.order);
    formData.append('score', question.value.score);

    // Handle question image
    if (question.value.question_image instanceof File) {
      formData.append('question_image', question.value.question_image);
    }

    // Handle choice_image type
    if (question.value.type === 'choice_image') {
      const options = Array.isArray(question.value.options) ? question.value.options : [];
      
      options.forEach((option, index) => {
        const prefix = `options[${index}]`;
        
        if (option.id) {
          formData.append(`${prefix}[id]`, option.id);
        }
        
        formData.append(`${prefix}[option_text]`, option.option_text || '');
        formData.append(`${prefix}[is_correct]`, option.is_correct ? '1' : '0');
        formData.append(`${prefix}[order]`, option.order || index);

        if (option.option_image instanceof File) {
          formData.append(`${prefix}[option_image]`, option.option_image);
        }
      });
    }

    // Handle match_image type
    if (question.value.type === 'match_image') {
      const matchPairs = Array.isArray(question.value.match_pairs) ? question.value.match_pairs : [];
      
      matchPairs.forEach((pair, index) => {
        const prefix = `match_pairs[${index}]`;
        
        if (pair.id) {
          formData.append(`${prefix}[id]`, pair.id);
        }
        
        formData.append(`${prefix}[left_text]`, pair.left_text || '');
        formData.append(`${prefix}[right_text]`, pair.right_text || '');
        formData.append(`${prefix}[pair_order]`, pair.pair_order || index);

        if (pair.left_image instanceof File) {
          formData.append(`${prefix}[left_image]`, pair.left_image);
        }
        if (pair.right_image instanceof File) {
          formData.append(`${prefix}[right_image]`, pair.right_image);
        }
      });
    }



    await questionsStore.updateQuestions(questionId.value, formData);
    router.push(`/admin/kuis/${quizId.value}/pertanyaan`);
  } catch (err) {
    if (err.response?.data?.errors) {
      const validationErrors = Object.values(err.response.data.errors).flat();
      error.value = validationErrors.join('\n');
    } else {
      error.value = err.response?.data?.message || err.message || 'Failed to update question';
    }
  } finally {
    isLoading.value = false;
  }
};

const goBack = () => {
  router.push(`/admin/kuis/${quizId.value}/pertanyaan`);
};

// Watch for route changes to reload data
watch([quizId, questionId], () => {
  loadQuestionData();
});

onMounted(() => {
  loadQuestionData();
});
</script>

<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold">Edit Pertanyaan</h1>
      </div>
      <button @click="goBack" class="btn btn-outline">Kembali</button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center p-8">
      <div class="loading loading-spinner loading-lg"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-error">
      {{ error }}
    </div>

    <!-- Question Form -->
    <div v-else class="bg-white rounded-xl shadow-md p-6">
      <div class="space-y-6">
        <!-- Basic Question Info -->
        <div class="space-y-4">
          <div>
            <label class="label">Tipe Pertanyaan</label>
            <div class="flex gap-2">
              <button
                v-for="type in questionTypes"
                :key="type.value"
                :class="[
                  'btn',
                  question.type === type.value ? 'btn-primary' : 'btn-outline'
                ]"
                disabled
              >
                <span class="mr-2">{{ type.icon }}</span>
                {{ type.label }}
              </button>
            </div>
          </div>

          <div>
            <label class="label">Teks Pertanyaan</label>
            <textarea
              v-model="question.question_text"
              class="textarea textarea-bordered w-full"
              rows="3"
              required
            ></textarea>
          </div>

          <div>
            <label class="label">Gambar Pertanyaan</label>
            <div v-if="questionImagePreview || question.question_image" class="mb-2">
              <img
                :src="questionImagePreview || getImagePreviewUrl(question.question_image)"
                class="max-w-xs rounded-lg"
                alt="Preview"
              />
            </div>
            <input
              type="file"
              @change="handleImageUpload"
              accept="image/*"
              class="file-input file-input-bordered w-full"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">Urutan</label>
              <input
                v-model.number="question.order"
                type="number"
                min="0"
                class="input input-bordered w-full"
              />
            </div>
            <div>
              <label class="label">Skor</label>
              <input
                v-model.number="question.score"
                type="number"
                min="0"
                class="input input-bordered w-full"
              />
            </div>
          </div>
        </div>

        <!-- Choice Image Options -->
        <div v-if="question.type === 'choice_image'" class="space-y-4">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold">Pilihan Jawaban</h3>
            <button
              type="button"
              @click="addOption"
              class="btn btn-primary btn-sm"
            >
              Tambah Pilihan
            </button>
          </div>

          <div
            v-for="(option, optionIndex) in question.options"
            :key="optionIndex"
            class="border rounded-lg p-4 space-y-3"
          >
            <div class="flex justify-between">
              <h4>Pilihan {{ optionIndex + 1 }}</h4>
              <button
                type="button"
                @click="() => removeOption(optionIndex)"
                class="btn btn-error btn-sm"
              >
                Hapus
              </button>
            </div>

            <div class="space-y-3">
              <input
                v-model="option.option_text"
                type="text"
                placeholder="Teks pilihan"
                class="input input-bordered w-full"
              />

              <div>
                <div v-if="optionImagePreviews[optionIndex] || option.option_image" class="mb-2">
                  <img
                    :src="optionImagePreviews[optionIndex] || getImagePreviewUrl(option.option_image)"
                    class="max-w-xs rounded-lg"
                    alt="Preview"
                  />
                </div>
                <input
                  type="file"
                  @change="(e) => handleOptionImageUpload(e, optionIndex)"
                  accept="image/*"
                  class="file-input file-input-bordered w-full"
                />
              </div>

              <label class="cursor-pointer label justify-start gap-2">
                <input
                  v-model="option.is_correct"
                  type="checkbox"
                  class="checkbox"
                />
                <span class="label-text">Jawaban Benar</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Match Image Pairs -->
        <div v-if="question.type === 'match_image'" class="space-y-4">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold">Pasangan Gambar</h3>
            <button
              type="button"
              @click="addMatchPair"
              class="btn btn-primary btn-sm"
            >
              Tambah Pasangan
            </button>
          </div>

          <div
            v-for="(pair, pairIndex) in question.match_pairs"
            :key="pairIndex"
            class="border rounded-lg p-4 space-y-3"
          >
            <div class="flex justify-between">
              <h4>Pasangan {{ pairIndex + 1 }}</h4>
              <button
                type="button"
                @click="() => removeMatchPair(pairIndex)"
                class="btn btn-error btn-sm"
              >
                Hapus
              </button>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <!-- Left Side -->
              <div class="space-y-3">
                <input
                  v-model="pair.left_text"
                  type="text"
                  placeholder="Teks kiri"
                  class="input input-bordered w-full"
                />
                <div>
                  <div v-if="matchPairImagePreviews[pairIndex]?.left || pair.left_image" class="mb-2">
                    <img
                      :src="matchPairImagePreviews[pairIndex]?.left || getImagePreviewUrl(pair.left_image)"
                      class="max-w-xs rounded-lg"
                      alt="Preview"
                    />
                  </div>
                  <input
                    type="file"
                    @change="(e) => handleMatchPairImageUpload(e, pairIndex, 'left')"
                    accept="image/*"
                    class="file-input file-input-bordered w-full"
                  />
                </div>
              </div>

              <!-- Right Side -->
              <div class="space-y-3">
                <input
                  v-model="pair.right_text"
                  type="text"
                  placeholder="Teks kanan"
                  class="input input-bordered w-full"
                />
                <div>
                  <div v-if="matchPairImagePreviews[pairIndex]?.right || pair.right_image" class="mb-2">
                    <img
                      :src="matchPairImagePreviews[pairIndex]?.right || getImagePreviewUrl(pair.right_image)"
                      class="max-w-xs rounded-lg"
                      alt="Preview"
                    />
                  </div>
                  <input
                    type="file"
                    @change="(e) => handleMatchPairImageUpload(e, pairIndex, 'right')"
                    accept="image/*"
                    class="file-input file-input-bordered w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="flex justify-end mt-6">
          <button
            type="button"
            @click="handleSubmit"
            class="btn btn-primary"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="loading loading-spinner"></span>
            {{ isLoading ? 'Menyimpan...' : 'Simpan Perubahan' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
