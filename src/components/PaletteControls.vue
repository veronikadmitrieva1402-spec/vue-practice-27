<template>
  <div class="controls">
    <div class="control-group">
      <button class="btn btn-primary" @click="$emit('generate')">
        Случайная палитра
      </button>
      
      <div class="color-count">
        <label>Цветов в палитре:</label>
        <select v-model="localColorsCount" @change="updateColorsCount">
          <option value="3">3</option>
          <option value="5">5</option>
          <option value="7">7</option>
        </select>
      </div>
      
      <div class="format-toggle">
        <label>Формат:</label>
        <div class="toggle-buttons">
          <button 
            :class="{ active: format === 'hex' }"
            @click="format = 'hex'"
          >
            HEX
          </button>
          <button 
            :class="{ active: format === 'rgb' }"
            @click="format = 'rgb'"
          >
            RGB
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  colors: Array,
  lockedColors: Array
})

const emit = defineEmits(['update:colors', 'update:lockedColors', 'generate'])

const localColorsCount = ref(5)
const format = ref('hex')

const updateColorsCount = () => {
  emit('update:colors', Array(parseInt(localColorsCount.value)).fill('#ffffff'))
  emit('update:lockedColors', Array(parseInt(localColorsCount.value)).fill(false))
}
</script>

<style scoped>
.controls {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #4a6cf7;
  color: white;
}

.btn-primary:hover {
  background: #3a5ce5;
  transform: translateY(-2px);
}

.color-count, .format-toggle {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

label {
  font-weight: 500;
  color: #333;
}

select {
  padding: 0.5rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  background: white;
  cursor: pointer;
}

.toggle-buttons {
  display: flex;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
}

.toggle-buttons button {
  padding: 0.5rem 1rem;
  border: none;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-buttons button.active {
  background: #4a6cf7;
  color: white;
}

.toggle-buttons button:hover:not(.active) {
  background: #f5f5f5;
}
</style>