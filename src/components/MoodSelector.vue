<template>
  <div class="mood-selector">
    <h4>Генерация по настроению:</h4>
    <div class="mood-buttons">
      <button 
        v-for="moodItem in moods" 
        :key="moodItem.value"
        @click="selectMood(moodItem.value)"
        :class="{ active: selectedMood === moodItem.value }"
        class="mood-btn"
        :style="{ 
          background: moodItem.color,
          color: getContrastColor(moodItem.color)
        }"
      >
        {{ moodItem.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: String
})

const emit = defineEmits(['update:modelValue'])

const selectedMood = ref(props.modelValue || 'calm')

const moods = [
  { value: 'calm', label: 'Спокойная', color: '#63e6be' },
  { value: 'energetic', label: 'Энергичная', color: '#ff6b6b' },
  { value: 'professional', label: 'Профессиональная', color: '#4a6cf7' },
  { value: 'playful', label: 'Игривая', color: '#ffd43b' },
  { value: 'elegant', label: 'Элегантная', color: '#cc5de8' }
]

const selectMood = (mood) => {
  selectedMood.value = mood
  emit('update:modelValue', mood)
}

const getContrastColor = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 128 ? '#000' : '#fff'
}
</script>

<style scoped>
.mood-selector {
  margin-top: 1rem;
}

.mood-selector h4 {
  margin-bottom: 0.75rem;
  color: #333;
}

.mood-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.mood-btn {
  padding: 0.5rem 1rem;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  flex: 1;
  min-width: 120px;
}

.mood-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.mood-btn.active {
  border-color: #333;
  box-shadow: 0 0 0 3px rgba(0,0,0,0.1);
}
</style>