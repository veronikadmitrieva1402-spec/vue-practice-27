<template>
  <div class="generator-view">
    <h2>Генератор палитр</h2>
    
    <!-- Секция выбора базового цвета -->
    <div class="section">
      <h3>1. Выберите базовый цвет:</h3>
      <ColorPicker v-model="baseColor" />
      <button @click="generateFromBaseColor" class="btn generate-btn">
        Сгенерировать от этого цвета
      </button>
    </div>

    <!-- Секция выбора типа палитры -->
    <div class="section">
      <h3>2. Выберите тип палитры:</h3>
      <div class="palette-types">
        <button 
          v-for="type in paletteTypes" 
          :key="type.value"
          @click="selectPaletteType(type.value)"
          :class="{ active: selectedType === type.value }"
          class="type-btn"
        >
          {{ type.label }}
        </button>
      </div>
    </div>

    <div class="section">
        <h3>2.1 Выберите настроение палитры:</h3>
        <MoodSelector v-model="selectedMood" />
        <button @click="generateByMood" class="btn mood-btn">
            Сгенерировать по настроению
        </button>
    </div>

    <!-- Основные контролы -->
    <div class="section">
      <h3>3. Управление палитрой:</h3>
      <div class="controls">
        <button @click="generateRandomPalette" class="btn random-btn">
          Случайная палитра
        </button>
        
        <div class="control-group">
          <label>Цветов в палитре:</label>
          <select v-model="colorCount" @change="updateColorCount">
            <option value="3">3</option>
            <option value="5">5</option>
            <option value="7">7</option>
          </select>
        </div>

        <div class="control-group">
          <label>Закрепленные цвета:</label>
          <div class="locked-indicator">
            <span v-for="(isLocked, index) in locked" :key="index">
              {{ isLocked ? '1' : '0' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Отображение палитры -->
    <div class="section">
      <h3>4. Ваша палитра:</h3>
      <div class="palette">
        <div 
          v-for="(color, index) in palette" 
          :key="index"
          class="color-card"
          :style="{ backgroundColor: color }"
          @click="copyToClipboard(color)"
        >
          <div class="color-info">
            <span class="hex">{{ color }}</span>
            <button 
              class="lock-btn"
              @click.stop="toggleLock(index)"
              :title="locked[index] ? 'Открепить' : 'Закрепить'"
            >
              {{ locked[index] ? '1' : '0' }}
            </button>
          </div>
          <div class="copy-hint">Клик для копирования</div>
        </div>
      </div>
    </div>

    <!-- Превью палитры -->
    <div class="section">
      <h3>5. Превью палитры:</h3>
      <PreviewComponent :palette="palette" />
    </div>

    <!-- Уведомление -->
    <div v-if="showNotification" class="notification">
      Скопировано: {{ copiedColor }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import ColorPicker from '../components/ColorPicker.vue'
import PreviewComponent from '../components/PreviewComponent.vue'
import MoodSelector from '../components/MoodSelector.vue'

const palette = ref([])
const locked = ref([])
const colorCount = ref(5)
const baseColor = ref('#4a6cf7')
const selectedType = ref('analogous')
const showNotification = ref(false)
const copiedColor = ref('')
const selectedMood = ref('calm')

const generateByMood = () => {
  const colors = []
  
  for (let i = 0; i < colorCount.value; i++) {
    switch (selectedMood.value) {
      case 'calm':
        colors.push(generatePastelColor(200 + i * 30))
        break
      case 'energetic':
        colors.push(generateVibrantColor(i * 60))
        break
      case 'professional':
        colors.push(generateProfessionalColor(220 + i * 40))
        break
      case 'playful':
        colors.push(generatePlayfulColor(i * 72))
        break
      case 'elegant':
        colors.push(generateElegantColor(280 + i * 50))
        break
      default:
        colors.push(generateRandomColor())
    }
  }
  
  palette.value = colors
}

const generatePastelColor = (hue) => {
  return hslToHex(hue % 360, 40 + Math.random() * 30, 75 + Math.random() * 15)
}

const generateVibrantColor = (hue) => {
  return hslToHex(hue % 360, 70 + Math.random() * 30, 50 + Math.random() * 20)
}

const generateProfessionalColor = (hue) => {
  return hslToHex(hue % 360, 30 + Math.random() * 20, 40 + Math.random() * 20)
}

const generatePlayfulColor = (hue) => {
  return hslToHex(hue % 360, 80 + Math.random() * 20, 60 + Math.random() * 20)
}

const generateElegantColor = (hue) => {
  return hslToHex(hue % 360, 50 + Math.random() * 20, 30 + Math.random() * 15)
}

const hslToHex = (h, s, l) => {
  h /= 360
  s /= 100
  l /= 100
  
  let r, g, b
  
  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    
    r = hue2rgb(p, q, h + 1/3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1/3)
  }
  
  const toHex = x => {
    const hex = Math.round(x * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}
const paletteTypes = [
  { value: 'analogous', label: 'Аналогичная' },
  { value: 'monochromatic', label: 'Монохромная' },
  { value: 'complementary', label: 'Комплементарная' },
  { value: 'triad', label: 'Триада' },
  { value: 'random', label: 'Случайная' }
]

const generateRandomColor = () => {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
}

const generateRandomPalette = () => {
  const newPalette = []
  for (let i = 0; i < colorCount.value; i++) {
    newPalette.push(generateRandomColor())
  }
  
  palette.value = palette.value.map((color, index) => 
    locked.value[index] ? color : newPalette[index]
  )
}

const generateFromBaseColor = () => {
  const base = baseColor.value
  const colors = [base]
  
  for (let i = 1; i < colorCount.value; i++) {
    let hex = base.replace('#', '')
    let r = parseInt(hex.substr(0, 2), 16)
    let g = parseInt(hex.substr(2, 2), 16)
    let b = parseInt(hex.substr(4, 2), 16)
    
    switch (selectedType.value) {
      case 'analogous':
        r = (r + i * 20) % 255
        g = (g + i * 10) % 255
        break
      case 'monochromatic':
        r = Math.min(255, r + i * 10)
        g = Math.min(255, g + i * 10)
        b = Math.min(255, b + i * 10)
        break
      case 'complementary':
        if (i % 2 === 0) {
          r = (r + 30) % 255
        } else {
          r = (r - 30 + 255) % 255
        }
        break
      case 'triad':
        r = (r + i * 85) % 255
        break
      default:
        r = (r + i * 50) % 255
    }
    
    const newColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
    colors.push(newColor)
  }
  
  palette.value = colors
}

const selectPaletteType = (type) => {
  selectedType.value = type
  if (type !== 'random') {
    generateFromBaseColor()
  }
}

const updateColorCount = () => {
  const newCount = parseInt(colorCount.value)
  
  if (palette.value.length < newCount) {
    for (let i = palette.value.length; i < newCount; i++) {
      palette.value.push(generateRandomColor())
      locked.value.push(false)
    }
  } else if (palette.value.length > newCount) {
    palette.value = palette.value.slice(0, newCount)
    locked.value = locked.value.slice(0, newCount)
  }
}

const toggleLock = (index) => {
  locked.value[index] = !locked.value[index]
}

const copyToClipboard = async (color) => {
  try {
    await navigator.clipboard.writeText(color)
    copiedColor.value = color
    showNotification.value = true
    setTimeout(() => {
      showNotification.value = false
    }, 2000)
  } catch (err) {
    console.error('Ошибка копирования:', err)
  }
}

const saveToLocalStorage = () => {
  const data = {
    palette: palette.value,
    locked: locked.value,
    colorCount: colorCount.value,
    baseColor: baseColor.value,
    selectedType: selectedType.value
  }
  localStorage.setItem('colorPalette', JSON.stringify(data))
}

const loadFromLocalStorage = () => {
  const saved = localStorage.getItem('colorPalette')
  if (saved) {
    try {
      const data = JSON.parse(saved)
      palette.value = data.palette || []
      locked.value = data.locked || []
      colorCount.value = data.colorCount || 5
      baseColor.value = data.baseColor || '#4a6cf7'
      selectedType.value = data.selectedType || 'analogous'
      
      if (palette.value.length === 0) {
        generateRandomPalette()
      }
    } catch (e) {
      console.error('Ошибка загрузки из localStorage:', e)
      generateRandomPalette()
    }
  } else {
    generateRandomPalette()
  }
}

watch(palette, saveToLocalStorage, { deep: true })
watch(locked, saveToLocalStorage, { deep: true })
watch(colorCount, saveToLocalStorage)
watch(baseColor, saveToLocalStorage)
watch(selectedType, saveToLocalStorage)

onMounted(() => {
  loadFromLocalStorage()
})
</script>

<style scoped>
.generator-view {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
}

.section h3 {
  margin-top: 0;
  color: #333;
  margin-bottom: 1rem;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.generate-btn {
  background: #4a6cf7;
  color: white;
  margin-top: 1rem;
}

.random-btn {
  background: #51cf66;
  color: white;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.palette-types {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.type-btn {
  padding: 0.5rem 1rem;
  background: #e9ecef;
  border: 2px solid #dee2e6;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.type-btn.active {
  background: #4a6cf7;
  color: white;
  border-color: #4a6cf7;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.control-group label {
  font-weight: 500;
}

select {
  padding: 0.5rem;
  border: 2px solid #dee2e6;
  border-radius: 6px;
  background: white;
}

.locked-indicator {
  display: flex;
  gap: 0.5rem;
  font-size: 1.2rem;
}

.palette {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.color-card {
  flex: 1;
  height: 180px;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.color-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}

.color-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hex {
  color: white;
  font-weight: bold;
  font-family: 'Courier New', monospace;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
}

.lock-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.2rem;
}

.copy-hint {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.85rem;
  text-align: center;
  margin-top: 0.5rem;
}
.mood-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin-top: 1rem;
}

.notification {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: #51cf66;
  color: white;
  padding: 1rem 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>