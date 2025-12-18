<!-- src/components/PreviewComponent.vue -->
<template>
  <div class="preview-component">
    <div class="preview-header">
      <h3>Превью палитры</h3>
      <button 
        @click="toggleTheme"
        class="theme-toggle"
      >
        {{ darkMode ? 'Светлый фон' : 'Тёмный фон' }}
      </button>
    </div>
    
    <div class="preview-container" :class="{ 'dark-mode': darkMode }">
      <!-- Mockup интерфейса -->
      <div class="mockup-app">
        <div class="mockup-nav" :style="{ backgroundColor: colors[0] }">
          <span class="mockup-text" :style="{ color: getContrastColor(colors[0]) }">
            Навигация
          </span>
        </div>
        
        <div class="mockup-content">
          <div class="mockup-card" :style="{ backgroundColor: colors[1] }">
            <h4 :style="{ color: getContrastColor(colors[1]) }">Заголовок карточки</h4>
            <p :style="{ color: getContrastColor(colors[1]) }">
              Текст на карточке с использованием цвета из палитры
            </p>
            <button 
              class="mockup-btn"
              :style="{ 
                backgroundColor: colors[2],
                color: getContrastColor(colors[2])
              }"
            >
              Кнопка действия
            </button>
          </div>
          
          <div class="mockup-sidebar" :style="{ backgroundColor: colors[3] }">
            <div 
              v-for="i in 3" 
              :key="i"
              class="sidebar-item"
              :style="{ color: getContrastColor(colors[3]) }"
            >
              Элемент {{ i }}
            </div>
          </div>
        </div>
        
        <div class="mockup-footer" :style="{ backgroundColor: colors[4] || colors[0] }">
          <span :style="{ color: getContrastColor(colors[4] || colors[0]) }">
            Футер приложения
          </span>
        </div>
      </div>
    </div>
    
    <div class="preview-hint">
      Проверьте, как цвета работают вместе на светлом и тёмном фоне
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  palette: {
    type: Array,
    default: () => []
  }
})

const darkMode = ref(false)

// Берем максимум 5 цветов для превью
const colors = computed(() => {
  return props.palette.slice(0, 5)
})

const toggleTheme = () => {
  darkMode.value = !darkMode.value
}

// Определение контрастного цвета (чёрный или белый)
const getContrastColor = (hex) => {
  if (!hex || !hex.startsWith('#')) return '#000'
  
  // Конвертируем HEX в RGB
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  
  // Формула яркости
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  
  return brightness > 128 ? '#000' : '#fff'
}
</script>

<style scoped>
.preview-component {
  margin-top: 2rem;
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.preview-header h3 {
  margin: 0;
  color: #333;
}

.theme-toggle {
  padding: 0.5rem 1rem;
  background: #e9ecef;
  border: 2px solid #dee2e6;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.theme-toggle:hover {
  background: #dee2e6;
}

.preview-container {
  padding: 1.5rem;
  background: #ffffff;
  border-radius: 8px;
  transition: background 0.3s ease;
}

.preview-container.dark-mode {
  background: #1a1a1a;
}

.mockup-app {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.mockup-nav {
  padding: 1rem;
  font-weight: bold;
}

.mockup-content {
  display: flex;
  min-height: 200px;
}

.mockup-card {
  flex: 3;
  padding: 1.5rem;
}

.mockup-card h4 {
  margin-top: 0;
}

.mockup-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  margin-top: 1rem;
}

.mockup-sidebar {
  flex: 1;
  padding: 1rem;
  border-left: 1px solid rgba(0,0,0,0.1);
}

.sidebar-item {
  padding: 0.5rem;
  margin: 0.5rem 0;
}

.mockup-footer {
  padding: 1rem;
  text-align: center;
  font-weight: bold;
}

.preview-hint {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #e3f2fd;
  border-radius: 6px;
  color: #1565c0;
  font-size: 0.9rem;
}
</style>