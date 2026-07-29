<script setup>
import { ref } from 'vue';
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

const selectedType = ref(questionTypes[0].value);
const questions = ref([]);

const createEmptyQuestion = () => {
  const maxOrder = questions.value.length > 0
    ? Math.max(...questions.value.map(q => q.order))
    : -1;
  
  return {
    quiz_id: quizId.value,
    type: selectedType.value,
    question_text: '',
    answer_keys: [''], // Array for multiple answer key inputs
    question_image: null,
    order: maxOrder + 1,
    score: 10,
    options: [],
    match_pairs: [],
    previewImage: null
  };
};

if (questions.value.length === 0) {
  questions.value.push(createEmptyQuestion());
}

const addNewQuestion = () => {
  questions.value.push(createEmptyQuestion());
};

const removeQuestion = (index) => {
  questions.value.splice(index, 1);
  questions.value.forEach((q, idx) => {
    q.order = idx;
  });
};

const addAnswerKey = (questionIndex) => {
  questions.value[questionIndex].answer_keys.push('');
};

const removeAnswerKey = (questionIndex, keyIndex) => {
  if (questions.value[questionIndex].answer_keys.length > 1) {
    questions.value[questionIndex].answer_keys.splice(keyIndex, 1);
  }
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

    const questionsData = questions.value.map(question => {
      const formData = new FormData();
      formData.append('quiz_id', question.quiz_id);
      formData.append('type', question.type);
      formData.append('question_text', question.question_text || '');
      formData.append('order', question.order);
      formData.append('score', question.score);

      if (question.question_image) {
        formData.append('question_image', question.question_image);
      }

      // For essay and guess_image: join answer keys with pipe (|) for option_text
      if (question.type === 'essay' || question.type === 'guess_image') {
        const option_text = (question.answer_keys || [])
          .map(k => k.trim())
          .filter(Boolean)
          .join('|');
        formData.append('option_text', option_text);
      }

      // For choice_image options
      if (['choice_image', 'choice', 'multiple_choice'].includes(question.type)) {
        question.options.forEach((option, index) => {
          formData.append(`options[${index}][option_text]`, option.option_text || '');
          formData.append(`options[${index}][is_correct]`, option.is_correct ? '1' : '0');
          formData.append(`options[${index}][order]`, option.order || index);
          if (option.option_image) {
            formData.append(`options[${index}][option_image]`, option.option_image);
          }
        });
      }

      // For match_image pairs
      if (question.type === 'match_image') {
        question.match_pairs.forEach((pair, index) => {
          formData.append(`match_pairs[${index}][left_text]`, pair.left_text || '');
          formData.append(`match_pairs[${index}][right_text]`, pair.right_text || '');
          formData.append(`match_pairs[${index}][pair_order]`, pair.pair_order || index);
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

    await Promise.all(questionsData.map(formData => quizStore.createQuestion(formData)));
    router.push(`/admin/kuis/${quizId.value}/pertanyaan`);
  } catch (err) {
    console.error('Form submission error:', err);
    error.value = err.response?.data?.message || err.message || 'Gagal menambahkan pertanyaan';
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
        <h1 class="text-2xl font-bold">Tambah Pertanyaan ❓</h1>
        <p class="text-gray-500">Total Pertanyaan: {{ questions.length }}</p>
      </div>
      <div class="flex gap-2">
        <button @click="goBack" class="btn btn-outline">Kembali</button>
        <button @click="addNewQuestion" class="btn btn-primary">
          ➕ Tambah Pertanyaan Baru
        </button>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="alert alert-error text-white shadow mb-6">
      <span>{{ error }}</span>
    </div>

    <!-- Question Type Selection -->
    <div class="bg-white rounded-xl shadow-md p-6 mb-6">
      <h2 class="text-lg font-semibold mb-4">Tipe Pertanyaan Default</h2>
      <div class="flex flex-wrap gap-2">
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
          <div class="flex items-center gap-2">
            <h3 class="text-lg font-semibold">Pertanyaan #{{ questionIndex + 1 }}</h3>
            <select v-model="question.type" class="select select-sm select-bordered font-normal">
              <option v-for="t in questionTypes" :key="t.value" :value="t.value">
                {{ t.icon }} {{ t.label }}
              </option>
            </select>
          </div>
          <button
            @click="removeQuestion(questionIndex)"
            class="btn btn-error btn-sm text-white"
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

            <!-- Gambar Pertanyaan -->
            <div>
              <label class="label font-semibold">
                <span>Gambar Pertanyaan</span>
                <span v-if="question.type === 'guess_image'" class="text-red-500 text-xs">* Wajib untuk Tebak Gambar</span>
                <span v-else class="text-gray-400 text-xs">(Opsional)</span>
              </label>
              <input
                type="file"
                @change="(e) => handleImageUpload(e, questionIndex)"
                accept="image/*"
                class="file-input file-input-bordered w-full"
              />
              <img
                v-if="question.previewImage"
                :src="question.previewImage"
                class="mt-2 max-w-xs rounded-lg border shadow-sm"
              />
            </div>

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
                @click="() => addAnswerKey(questionIndex)"
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
                  @click="() => removeAnswerKey(questionIndex, keyIndex)"
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
                @click="() => addOption(questionIndex)"
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
                  @click="() => removeOption(questionIndex, optionIndex)"
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
                    @change="(e) => handleOptionImageUpload(e, questionIndex, optionIndex)"
                    accept="image/*"
                    class="file-input file-input-bordered w-full"
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
                @click="() => addMatchPair(questionIndex)"
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
                  @click="() => removeMatchPair(questionIndex, pairIndex)"
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
                    @change="(e) => handleMatchPairImageUpload(e, questionIndex, pairIndex, 'left')"
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
                    @change="(e) => handleMatchPairImageUpload(e, questionIndex, pairIndex, 'right')"
                    accept="image/*"
                    class="file-input file-input-bordered w-full text-xs"
                  />
                </div>
              </div>
            </div>
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
        <span v-else>💾 Simpan Semua Pertanyaan</span>
      </button>
    </div>
  </div>
</template>