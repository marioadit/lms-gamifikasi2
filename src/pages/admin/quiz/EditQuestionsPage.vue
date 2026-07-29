<script setup>
import { useRoute, useRouter } from "vue-router";
import { useQuizStore } from "../../../store/quizStore";
import { computed, onMounted, ref, onBeforeUnmount } from "vue";
import { useQuestionsStore } from "../../../store/QuestionsStore";
import { getCurrentInstance } from "vue";
import Swal from "sweetalert2";

const { proxy } = getCurrentInstance();
const base_url = proxy.$base_url;

const questionsStore = useQuestionsStore();
const quizStore = useQuizStore();
const route = useRoute();
const router = useRouter();

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
  { value: 'choice_image', label: 'Pilihan Gambar', icon: '🖼️' },
  { value: 'guess_image', label: 'Tebak Gambar', icon: '🎯' },
  { value: 'match_image', label: 'Pasangkan Gambar', icon: '🔄' },
  { value: 'essay', label: 'Essay', icon: '📝' },
];

const question = ref({
  quiz_id: quizId.value,
  type: 'essay',
  question_text: '',
  answer_keys: [''], // Array for multiple answer key inputs
  question_image: null,
  order: 0,
  score: 10,
  options: [],
  match_pairs: [],
  previewImage: null
});

const questionImagePreview = ref(null);
const optionImagePreviews = ref({});
const matchPairImagePreviews = ref({});

const getImagePreviewUrl = (image) => {
  if (image instanceof File) {
    return URL.createObjectURL(image);
  } else if (typeof image === 'string' && image.length > 0) {
    if (image.startsWith('http')) return image;
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

const addAnswerKey = () => {
  if (!Array.isArray(question.value.answer_keys)) {
    question.value.answer_keys = [];
  }
  question.value.answer_keys.push('');
};

const removeAnswerKey = (keyIndex) => {
  if (Array.isArray(question.value.answer_keys) && question.value.answer_keys.length > 1) {
    question.value.answer_keys.splice(keyIndex, 1);
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
      error.value = 'ID Kuis atau Pertanyaan tidak valid';
      return;
    }

    await questionsStore.getQuestionDetailById(questionId.value);
    const questionData = questionsStore.question;

    if (!questionData) {
      error.value = 'Gagal memuat data pertanyaan';
      return;
    }

    // Extract answer keys from essay_answers or option_text
    let keys = [];
    if (Array.isArray(questionData.essay_answers) && questionData.essay_answers.length > 0) {
      keys = questionData.essay_answers.map(a => a.option_text).filter(Boolean);
    } else if (Array.isArray(questionData.essayAnswers) && questionData.essayAnswers.length > 0) {
      keys = questionData.essayAnswers.map(a => a.option_text).filter(Boolean);
    } else if (questionData.option_text) {
      keys = questionData.option_text.split('|').map(k => k.trim()).filter(Boolean);
    }

    question.value = {
      ...question.value,
      ...questionData,
      quiz_id: quizId.value,
      answer_keys: keys.length > 0 ? keys : [''],
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
    error.value = 'Gagal memuat data pertanyaan';
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadQuestionData();
});

const handleSubmit = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    const formData = new FormData();
    formData.append('_method', 'PUT'); // Method spoofing for Laravel PUT
    formData.append('quiz_id', question.value.quiz_id);
    formData.append('type', question.value.type);
    formData.append('question_text', question.value.question_text || '');
    formData.append('order', question.value.order);
    formData.append('score', question.value.score);

    // Handle question image
    if (question.value.question_image instanceof File) {
      formData.append('question_image', question.value.question_image);
    }

    // For essay and guess_image: join answer keys with pipe (|) for option_text
    if (question.value.type === 'essay' || question.value.type === 'guess_image') {
      const option_text = (question.value.answer_keys || [])
        .map(k => k.trim())
        .filter(Boolean)
        .join('|');
      formData.append('option_text', option_text);
    }

    // Handle choice_image type options
    if (['choice_image', 'choice', 'multiple_choice'].includes(question.value.type)) {
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

    // Handle match_image type pairs
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

    await questionsStore.updateQuestion(questionId.value, formData);

    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: 'Pertanyaan berhasil diperbarui',
      timer: 1500,
      showConfirmButton: false,
    });

    router.push(`/admin/kuis/${quizId.value}/pertanyaan`);
  } catch (err) {
    console.error('Form submission error:', err);
    error.value = err.response?.data?.message || err.message || 'Gagal memperbarui pertanyaan';
  } finally {
    isLoading.value = false;
  }
};

const goBack = () => {
  router.push(`/admin/kuis/${quizId.value}/pertanyaan`);
};
</script>

<template>
  <div class="p-6 max-w-5xl mx-auto">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold">Edit Pertanyaan ✏️</h1>
        <p class="text-gray-500">Edit data pertanyaan kuis #{{ questionId }}</p>
      </div>
      <button @click="goBack" class="btn btn-outline">Kembali</button>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="alert alert-error text-white shadow mb-6">
      <span>{{ error }}</span>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center my-12">
      <div class="loading loading-spinner loading-lg text-primary"></div>
    </div>

    <div v-else class="bg-white rounded-xl shadow-md p-6 space-y-6">
      <!-- Question Type Selection -->
      <div>
        <label class="label font-semibold">Tipe Pertanyaan</label>
        <select v-model="question.type" class="select select-bordered w-full">
          <option v-for="t in questionTypes" :key="t.value" :value="t.value">
            {{ t.icon }} {{ t.label }}
          </option>
        </select>
      </div>

      <!-- Question Text -->
      <div>
        <label class="label font-semibold">
          <span>Teks Pertanyaan / Petunjuk</span>
          <span v-if="question.type === 'essay' || question.type === 'guess_image'" class="text-red-500 text-xs">* Wajib</span>
        </label>
        <textarea
          v-model="question.question_text"
          class="textarea textarea-bordered w-full"
          placeholder="Masukkan teks soal atau petunjuk pertanyaan..."
          rows="3"
          required
        ></textarea>
      </div>

      <!-- Question Image -->
      <div>
        <label class="label font-semibold">
          <span>Gambar Pertanyaan</span>
          <span v-if="question.type === 'guess_image'" class="text-red-500 text-xs">* Wajib untuk Tebak Gambar</span>
          <span v-else class="text-gray-400 text-xs">(Opsional)</span>
        </label>
        <input
          type="file"
          @change="handleImageUpload"
          accept="image/*"
          class="file-input file-input-bordered w-full"
        />
        <img
          v-if="questionImagePreview"
          :src="questionImagePreview"
          class="mt-2 max-w-xs rounded-lg border shadow-sm"
        />
      </div>

      <!-- Order & Score -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="label font-semibold">Urutan</label>
          <input
            v-model.number="question.order"
            type="number"
            min="0"
            class="input input-bordered w-full bg-gray-50"
            disabled
          />
        </div>
        <div>
          <label class="label font-semibold">Skor Soal</label>
          <input
            v-model.number="question.score"
            type="number"
            min="0"
            class="input input-bordered w-full"
          />
        </div>
      </div>

      <!-- Essay & Guess Image Answer Keys Section -->
      <div v-if="question.type === 'essay' || question.type === 'guess_image'" class="p-5 bg-amber-50 border border-amber-200 rounded-2xl space-y-4">
        <div class="flex justify-between items-center border-b border-amber-200 pb-2">
          <div>
            <h4 class="font-bold text-amber-900 text-sm flex items-center gap-1.5">
              <span>🔑</span> Kata Kunci Jawaban
              <span class="text-red-500 text-xs">* Wajib</span>
            </h4>
            <p class="text-xs text-amber-700 mt-0.5">
              Masukkan kata kunci jawaban untuk penilaian kuis.
            </p>
          </div>
          <button 
            type="button" 
            @click="addAnswerKey"
            class="btn btn-warning btn-xs font-bold text-amber-950"
          >
            ➕ Tambah Kata Kunci Jawaban Lainnya
          </button>
        </div>

        <div class="space-y-2">
          <div 
            v-for="(key, keyIndex) in question.answer_keys" 
            :key="keyIndex" 
            class="flex items-center gap-2"
          >
            <input 
              v-model="question.answer_keys[keyIndex]"
              type="text"
              class="input input-bordered w-full focus:input-primary bg-white text-sm"
              :placeholder="keyIndex === 0 ? 'Masukkan kata kunci jawaban utama (contoh: 25 atau Kucing)' : `Masukkan alternatif jawaban #${keyIndex + 1}`"
              required
            />
            <button 
              v-if="question.answer_keys.length > 1"
              type="button"
              @click="() => removeAnswerKey(keyIndex)"
              class="btn btn-error btn-square btn-sm text-white shrink-0"
              title="Hapus Kata Kunci"
            >
              🗑️
            </button>
          </div>
        </div>

        <!-- AI Correction Info Box -->
        <div v-if="question.type === 'essay'" class="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-900 text-xs flex items-center gap-2">
          <span class="text-lg">🤖</span>
          <span><strong>Info AI:</strong> Jawaban siswa pada soal tipe Essay akan dikoreksi dan dinilai secara otomatis oleh sistem dibantu AI berdasarkan kata kunci jawaban di atas.</span>
        </div>
      </div>

      <!-- Choice Image Options -->
      <div v-if="['choice_image', 'choice', 'multiple_choice'].includes(question.type)" class="space-y-4">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-semibold">Pilihan Jawaban (Opsi)</h3>
          <button
            type="button"
            @click="addOption"
            class="btn btn-primary btn-sm"
          >
            ➕ Tambah Pilihan
          </button>
        </div>

        <div
          v-for="(option, optionIndex) in question.options"
          :key="optionIndex"
          class="border rounded-xl p-4 space-y-3 bg-gray-50/50"
        >
          <div class="flex justify-between items-center">
            <h4 class="font-bold text-gray-700">Pilihan {{ optionIndex + 1 }}</h4>
            <button
              type="button"
              @click="() => removeOption(optionIndex)"
              class="btn btn-error btn-sm text-white"
            >
              Hapus
            </button>
          </div>

          <div class="space-y-3">
            <input
              v-model="option.option_text"
              type="text"
              placeholder="Teks pilihan jawaban"
              class="input input-bordered w-full bg-white"
            />

            <div>
              <label class="label text-xs font-semibold">Gambar Opsi (Opsional)</label>
              <input
                type="file"
                @change="(e) => handleOptionImageUpload(e, optionIndex)"
                accept="image/*"
                class="file-input file-input-bordered w-full"
              />
              <img
                v-if="optionImagePreviews[optionIndex]"
                :src="optionImagePreviews[optionIndex]"
                class="mt-2 max-w-xs rounded-lg border shadow-sm"
              />
            </div>

            <label class="cursor-pointer label justify-start gap-2">
              <input
                v-model="option.is_correct"
                type="checkbox"
                class="checkbox checkbox-primary"
              />
              <span class="label-text font-bold">✓ Kunci Jawaban Benar</span>
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
            ➕ Tambah Pasangan
          </button>
        </div>

        <div
          v-for="(pair, pairIndex) in question.match_pairs"
          :key="pairIndex"
          class="border rounded-xl p-4 space-y-3 bg-gray-50/50"
        >
          <div class="flex justify-between items-center">
            <h4 class="font-bold text-gray-700">Pasangan {{ pairIndex + 1 }}</h4>
            <button
              type="button"
              @click="() => removeMatchPair(pairIndex)"
              class="btn btn-error btn-sm text-white"
            >
              Hapus
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Left Side -->
            <div class="space-y-2 p-3 bg-blue-50/70 rounded-lg border border-blue-100">
              <span class="text-xs font-bold text-blue-700">Item Kiri:</span>
              <input
                v-model="pair.left_text"
                type="text"
                placeholder="Teks kiri"
                class="input input-bordered w-full bg-white text-sm"
              />
              <input
                type="file"
                @change="(e) => handleMatchPairImageUpload(e, pairIndex, 'left')"
                accept="image/*"
                class="file-input file-input-bordered w-full text-xs"
              />
            </div>

            <!-- Right Side -->
            <div class="space-y-2 p-3 bg-purple-50/70 rounded-lg border border-purple-100">
              <span class="text-xs font-bold text-purple-700">Item Kanan:</span>
              <input
                v-model="pair.right_text"
                type="text"
                placeholder="Teks kanan"
                class="input input-bordered w-full bg-white text-sm"
              />
              <input
                type="file"
                @change="(e) => handleMatchPairImageUpload(e, pairIndex, 'right')"
                accept="image/*"
                class="file-input file-input-bordered w-full text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="mt-8 flex justify-end">
        <button
          @click="handleSubmit"
          class="btn btn-success text-white px-8 btn-lg"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="loading loading-spinner"></span>
          <span v-else>💾 Simpan Perubahan Pertanyaan</span>
        </button>
      </div>
    </div>
  </div>
</template>
