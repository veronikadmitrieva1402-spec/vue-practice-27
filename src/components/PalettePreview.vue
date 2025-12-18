<template>
  <div class="palette-preview">
    <h3>Превью палитры</h3>
    
    <div class="preview-controls">
      <button 
        @click="darkMode = !darkMode"
        class="theme-toggle"
      >
        {{ darkMode ? 'Светлый фон' : 'Тёмный фон' }}
      </button>
    </div>
    
    <div class="preview-container" :class="{ 'dark-mode': darkMode }">
      <!-- Mockup интерфейса -->
      <div class="mockup-header">
        <h4>Заголовок страницы</h4>
        <button class="mockup-button" :style="{ backgroundColor: palette[0] }">
          Кнопка
        </button>
      </div>
      
      <div class="mockup-card" :style="{ backgroundColor: palette[1] }">
        <h5>Карточка контента</h5>
        <p>Текст на карточке демонстрирует использование цвета</p>
        <button class="mockup-button-secondary" :style="{ 
          backgroundColor: palette[2],
          color: getContrastColor(palette[2])
        }">
          Действие
        </button>
      </div>
      
      <div class="mockup-footer">
        <span :style="{ color: palette[3] }">Текст в футере</span>
        <span :style="{ color: palette[4] }">Элемент навигации</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { hexToRgb } from '../composables/useColorUtils'

defineProps({
  palette: {
    type: Array,
    default: () => []
  }
})

const darkMode = ref(false)

const getContrastColor = (hexColor) => {
  const rgb = hexToRgb(hexColor)
  if (!rgb) return '#000'
  
  // Формула контрастности
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
  return brightness > 128 ? '#000' : '#fff'
}
</script>

<style scoped>
.palette-preview {
  margin-top: 3rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.palette-preview h3 {
  margin: 0 0 1rem;
  color: #333;
}

.preview-controls {
  margin-bottom: 1.5rem;
}

.theme-toggle {
  padding: 0.5rem 1rem;
  background: #f0f0f0;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.theme-toggle:hover {
  background: #e0e0e0;
}

.preview-container {
  padding: 2rem;
  border-radius: 8px;
  background: #f8f9fa;
  transition: background 0.3s ease;
}

.preview-container.dark-mode {
  background: #1a1a1a;
  color: white;
}

.mockup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e0e0e0;
}

.mockup-header h4 {
  margin: 0;
}

.mockup-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  color: white;
  font-weight: 500;
  cursor: pointer;
}

.mockup-card {
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.mockup-card h5 {
  margin: 0 0 0.75rem;
}

.mockup-button-secondary {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 1rem;
}

.mockup-footer {
  display: flex;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}
</style>