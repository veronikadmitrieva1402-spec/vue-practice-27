<!-- src/components/ColorPicker.vue -->
<template>
  <div class="color-picker">
    <div class="picker-row">
      <input 
        type="color" 
        v-model="colorValue"
        @input="updateColor"
        class="color-input"
      >
      <input 
        type="text" 
        v-model="displayValue"
        @change="validateColor"
        class="value-input"
        :placeholder="format === 'hex' ? '#FF6B6B' : 'rgb(255,107,107)'"
      >
      <div class="color-preview" :style="{ background: colorValue }"></div>
      
      <button 
        @click="toggleFormat"
        class="format-toggle"
        :title="format === 'hex' ? 'Переключить на RGB' : 'Переключить на HEX'"
      >
        {{ format === 'hex' ? 'RGB' : 'HEX' }}
      </button>
    </div>
    
    <div class="color-presets">
      <div 
        v-for="preset in presets" 
        :key="preset"
        class="preset"
        :style="{ background: preset }"
        @click="selectPreset(preset)"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '#4a6cf7'
  },
  format: {
    type: String,
    default: 'hex'
  }
})

const emit = defineEmits(['update:modelValue', 'format-change'])

const colorValue = ref(props.modelValue)
const format = ref(props.format)
const presets = ref([
  '#4a6cf7', '#ff6b6b', '#51cf66', '#ffd43b',
  '#339af0', '#ff922b', '#94d82d', '#cc5de8',
  '#20c997', '#ff8787', '#748ffc', '#63e6be'
])

// Отображаемое значение в текущем формате
const displayValue = computed({
  get() {
    if (format.value === 'hex') {
      return colorValue.value
    } else {
      return hexToRgb(colorValue.value)
    }
  },
  set(value) {
    if (format.value === 'hex') {
      colorValue.value = value
    } else {
      const hex = rgbToHex(value)
      if (hex) colorValue.value = hex
    }
    updateColor()
  }
})

watch(() => props.modelValue, (newVal) => {
  colorValue.value = newVal
})

const updateColor = () => {
  emit('update:modelValue', colorValue.value)
}

const validateColor = () => {
  if (format.value === 'hex') {
    const hex = displayValue.value
    if (!/^#[0-9A-F]{6}$/i.test(hex)) {
      colorValue.value = '#4a6cf7'
    }
  } else {
    const rgb = displayValue.value
    if (!/^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/i.test(rgb)) {
      colorValue.value = '#4a6cf7'
    }
  }
  updateColor()
}

const toggleFormat = () => {
  format.value = format.value === 'hex' ? 'rgb' : 'hex'
  emit('format-change', format.value)
}

const selectPreset = (color) => {
  colorValue.value = color
  updateColor()
}

// Вспомогательные функции
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? 
    `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})` :
    'rgb(0, 0, 0)'
}

const rgbToHex = (rgb) => {
  const result = /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i.exec(rgb)
  if (!result) return null
  
  const r = parseInt(result[1]).toString(16).padStart(2, '0')
  const g = parseInt(result[2]).toString(16).padStart(2, '0')
  const b = parseInt(result[3]).toString(16).padStart(2, '0')
  
  return `#${r}${g}${b}`
}
</script>

<style scoped>
/* Добавьте в существующие стили */
.format-toggle {
  padding: 0.5rem 1rem;
  background: #e9ecef;
  border: 2px solid #dee2e6;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.format-toggle:hover {
  background: #dee2e6;
}

.value-input {
  padding: 10px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  width: 140px;
  font-family: 'Courier New', monospace;
}
</style>