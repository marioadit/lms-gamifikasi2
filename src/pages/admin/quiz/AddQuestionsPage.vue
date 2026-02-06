<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuizStore } from '../../../store/quizStore';

const route = useRoute();
const router = useRouter();
const quizStore = useQuizStore();

const quizId = ref(parseInt(route.params.id));
const isLoading = ref(false);
const error = ref(null);

const questionTypes = [
  { value: 'choice_image', label: 'Pilihan Gambar', icon: '🖼️' },
  { value: 'guess_image', label: 'Tebak Gambar', icon: '🎯' },
  { value: 'match_image', label: 'Pasangkan Gambar', icon: '🔄' },
  { value: 'essay', label: 'Essay', icon: '📝' },
];

// First question type selected by default
const selectedType = ref(questionTypes[0].value);

// Array to store multiple questions
const questions = ref([]);

// Function to create a new empty question
const createEmptyQuestion = () => {
  // Get the highest order number from existing questions
  const maxOrder = questions.value.length > 0
    ? Math.max(...questions.value.map(q => q.order))
    : -1;
  
  return {
    quiz_id: quizId.value,
    type: selectedType.value,
    question_text: '',
    question_image: null,
    order: maxOrder + 1, // Increment from the highest existing order
    score: 10,
    options: [],
    match_pairs: [],
    previewImage: null
  };
};

// Add first question by default
if (questions.value.length === 0) {
  questions.value.push(createEmptyQuestion());
}

const addNewQuestion = () => {
  questions.value.push(createEmptyQuestion());
};

const removeQuestion = (index) => {
  questions.value.splice(index, 1);
  // Reorder remaining questions sequentially
  questions.value.forEach((q, idx) => {
    q.order = idx;
  });
};

const handleImageUpload = (event, questionIndex) => {
  const file = event.target.files[0];
  if (file) {
    questions.value[questionIndex].question_image = file;
    questions.value[questionIndex].previewImage = URL.createObjectURL(file);
  }
};

const handleOptionImageUpload = (event, questionIndex, optionIndex) => {
  const file = event.target.files[0];
  if (file) {
    questions.value[questionIndex].options[optionIndex].option_image = file;
  }
};

const handleMatchPairImageUpload = (event, questionIndex, pairIndex, side) => {
  const file = event.target.files[0];
  if (file) {
    const pair = questions.value[questionIndex].match_pairs[pairIndex];
    if (side === 'left') {
      pair.left_image = file;
    } else {
      pair.right_image = file;
    }
  }
};

const addOption = (questionIndex) => {
  const question = questions.value[questionIndex];
  question.options.push({
    option_text: '',
    option_image: null,
    is_correct: false,
    order: question.options.length
  });
};

const addMatchPair = (questionIndex) => {
  const question = questions.value[questionIndex];
  question.match_pairs.push({
    left_text: '',
    left_image: null,
    right_text: '',
    right_image: null,
    pair_order: question.match_pairs.length
  });
};

const removeOption = (questionIndex, optionIndex) => {
  const question = questions.value[questionIndex];
  question.options.splice(optionIndex, 1);
  question.options.forEach((opt, idx) => {
    opt.order = idx;
  });
};

const removeMatchPair = (questionIndex, pairIndex) => {
  const question = questions.value[questionIndex];
  question.match_pairs.splice(pairIndex, 1);
  question.match_pairs.forEach((pair, idx) => {
    pair.pair_order = idx;
  });
};

const handleSubmit = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    // Create an array of FormData objects for each question
    const questionsData = questions.value.map(question => {
      const formData = new FormData();
      formData.append('quiz_id', question.quiz_id);
      formData.append('type', question.type);
      formData.append('question_text', question.question_text);
      formData.append('order', question.order);
      formData.append('score', question.score);

      if (question.question_image) {
        formData.append('question_image', question.question_image);
      }

      if (question.type === 'choice_image') {
        question.options.forEach((option, index) => {
          formData.append(`options[${index}][option_text]`, option.option_text || '');
          formData.append(`options[${index}][is_correct]`, option.is_correct ? '1' : '0');
          formData.append(`options[${index}][order]`, option.order);
          if (option.option_image) {
            formData.append(`options[${index}][option_image]`, option.option_image);
          }
        });
      }

      if (question.type === 'match_image') {
        question.match_pairs.forEach((pair, index) => {
          formData.append(`match_pairs[${index}][left_text]`, pair.left_text || '');
          formData.append(`match_pairs[${index}][right_text]`, pair.right_text || '');
          formData.append(`match_pairs[${index}][pair_order]`, pair.pair_order);
          if (pair.left_image) {
            formData.append(`match_pairs[${index}][left_image]`, pair.left_image);
          }
          if (pair.right_image) {
            formData.append(`match_pairs[${index}][right_image]`, pair.right_image);
          }
        });
      }

      return formData;
    });

    // Submit all questions
    await Promise.all(questionsData.map(formData => quizStore.createQuestion(formData)));
    router.push(`/admin/kuis/${quizId.value}/pertanyaan`);
  } catch (err) {
    console.error('Form submission error:', err);
    error.value = err.response?.data?.message || err.message || 'Failed to create questions';
  } finally {
    isLoading.value = false;
  }
};

const goBack = () => {
  router.push(`/admin/kuis/${quizId.value}/pertanyaan`);
};
</script>

<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold">Tambah Pertanyaan</h1>
        <p class="text-gray-500">Total Pertanyaan: {{ questions.length }}</p>
      </div>
      <div class="flex gap-2">
        <button @click="goBack" class="btn btn-outline">Kembali</button>
        <button @click="addNewQuestion" class="btn btn-primary">
          Tambah Pertanyaan Baru
        </button>
      </div>
    </div>

    <!-- Question Type Selection -->
    <div class="bg-white rounded-xl shadow-md p-6 mb-6">
      <h2 class="text-lg font-semibold mb-4">Tipe Pertanyaan Default</h2>
      <div class="flex gap-2">
        <button
          v-for="type in questionTypes"
          :key="type.value"
          @click="selectedType = type.value"
          :class="[
            'btn',
            selectedType === type.value ? 'btn-primary' : 'btn-outline'
          ]"
        >
          <span class="mr-2">{{ type.icon }}</span>
          {{ type.label }}
        </button>
      </div>
    </div>

    <!-- Questions List -->
    <div class="space-y-6">
      <div
        v-for="(question, questionIndex) in questions"
        :key="questionIndex"
        class="bg-white rounded-xl shadow-md p-6"
      >
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">Pertanyaan #{{ questionIndex + 1 }}</h3>
          <button
            @click="removeQuestion(questionIndex)"
            class="btn btn-error btn-sm"
            :disabled="questions.length === 1"
          >
            Hapus Pertanyaan
          </button>
        </div>

        <!-- Question Form -->
        <div class="space-y-6">
          <!-- Basic Question Info -->
          <div class="space-y-4">
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
              <label class="label">Gambar Pertanyaan (Opsional)</label>
              <input
                type="file"
                @change="(e) => handleImageUpload(e, questionIndex)"
                accept="image/*"
                class="file-input file-input-bordered w-full"
              />
              <img
                v-if="question.previewImage"
                :src="question.previewImage"
                class="mt-2 max-w-xs rounded-lg"
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
                  disabled
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
                @click="() => addOption(questionIndex)"
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
                  @click="() => removeOption(questionIndex, optionIndex)"
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
                  <input
                    type="file"
                    @change="(e) => handleOptionImageUpload(e, questionIndex, optionIndex)"
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
                @click="() => addMatchPair(questionIndex)"
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
                  @click="() => removeMatchPair(questionIndex, pairIndex)"
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
                  <input
                    type="file"
                    @change="(e) => handleMatchPairImageUpload(e, questionIndex, pairIndex, 'left')"
                    accept="image/*"
                    class="file-input file-input-bordered w-full"
                  />
                </div>

                <!-- Right Side -->
                <div class="space-y-3">
                  <input
                    v-model="pair.right_text"
                    type="text"
                    placeholder="Teks kanan"
                    class="input input-bordered w-full"
                  />
                  <input
                    type="file"
                    @change="(e) => handleMatchPairImageUpload(e, questionIndex, pairIndex, 'right')"
                    accept="image/*"
                    class="file-input file-input-bordered w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="alert alert-error mt-6">
      {{ error }}
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
        {{ isLoading ? 'Menyimpan...' : 'Simpan Semua Pertanyaan' }}
      </button>
    </div>
  </div>
</template>