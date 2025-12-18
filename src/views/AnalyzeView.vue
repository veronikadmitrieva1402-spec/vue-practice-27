<template>
  <div class="analyze-view">
    <div class="analyze-header">
      <h2>Анализ доступности</h2>
      <p>Проверка контрастности по стандарту WCAG 2.1</p>
    </div>
    
    <div class="analyze-content">
      <ContrastChecker :palette="currentPalette" />
      
      <div class="wcag-levels">
        <h3>Уровни доступности WCAG:</h3>
        <div class="levels-grid">
          <div class="level-card level-aaa">
            <h4>AAA (Наивысший)</h4>
            <ul>
              <li>Обычный текст: 7:1</li>
              <li>Крупный текст: 4.5:1</li>
              <li>UI компоненты: 4.5:1</li>
            </ul>
          </div>
          
          <div class="level-card level-aa">
            <h4>AA (Рекомендуемый)</h4>
            <ul>
              <li>Обычный текст: 4.5:1</li>
              <li>Крупный текст: 3:1</li>
              <li>UI компоненты: 3:1</li>
            </ul>
          </div>
          
          <div class="level-card level-a">
            <h4>A (Минимальный)</h4>
            <ul>
              <li>Крупный текст: 3:1</li>
              <li>UI компоненты: 3:1</li>
              <li>Не для обычного текста</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="accent-colors">
        <h3>Подбор акцентных цветов</h3>
        <p>Выберите цвет для подбора гармоничных акцентов:</p>
        
        <div class="accent-controls">
          <input type="color" v-model="accentBase" @input="generateAccents">
          <input type="text" v-model="accentBase" class="accent-input">
        </div>
        
        <div class="accent-results">
          <div 
            v-for="(color, index) in accentColors" 
            :key="index"
            class="accent-color"
            :style="{ background: color }"
            @click="copyColor(color)"
          >
            <span class="accent-hex">{{ color }}</span>
            <span class="accent-type">{{ getAccentType(index) }}</span>
          </div>
        </div>
      </div>

      <div class="color-wheel-section">
        <h3>Графическое представление цветового круга</h3>
        <ColorWheel 
            v-model="wheelColor" 
            @generate-palette="handleWheelPalette"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ContrastChecker from '../components/ContrastChecker.vue'
import { usePaletteStore } from '../stores/paletteStore'
import ColorWheel from '../components/ColorWheel.vue'

const paletteStore = usePaletteStore()
const accentBase = ref('#4a6cf7')
const accentColors = ref([])
const wheelColor = ref('#4a6cf7')

const handleWheelPalette = (colors) => {
  alert(`Сгенерирована палитра из ${colors.length} цветов!`)
}

const currentPalette = computed(() => {
  return paletteStore.currentPalette.length > 0 
    ? paletteStore.currentPalette 
    : ['#4a6cf7', '#ff6b6b', '#51cf66', '#ffd43b', '#339af0']
})

const generateAccents = () => {
  const base = accentBase.value
  const accents = []
  
  const accentTypes = [
    { hue: 180, sat: 1.2, light: 0 },     // Комплементарный
    { hue: 30, sat: 0.8, light: 20 },     // Аналогичный светлый
    { hue: 150, sat: 1.1, light: -10 },   // Сплит-комплементарный
    { hue: 0, sat: 0.6, light: 30 },      // Тот же оттенок, светлее
    { hue: 0, sat: 1.3, light: -20 }      // Тот же оттенок, насыщеннее
  ]
  
  accentTypes.forEach(type => {
    const color = adjustColor(base, type.hue, type.sat, type.light)
    if (color) accents.push(color)
  })
  
  accentColors.value = accents.slice(0, 5)
}

const getAccentType = (index) => {
  const types = [
    'Комплементарный',
    'Аналогичный светлый',
    'Сплит-комплементарный',
    'Светлый оттенок',
    'Насыщенный оттенок'
  ]
  return types[index] || 'Акцентный'
}

const copyColor = async (color) => {
  try {
    await navigator.clipboard.writeText(color)
    alert(`Скопировано: ${color}`)
  } catch (err) {
    console.error('Ошибка копирования:', err)
  }
}

const adjustColor = (hex, hueShift, satMultiplier, lightAdjust) => {
  const rgb = hexToRgb(hex)
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  
  let h = (hsl.h + hueShift) % 360
  let s = Math.min(100, Math.max(0, hsl.s * satMultiplier))
  let l = Math.min(100, Math.max(0, hsl.l + lightAdjust))
  
  return hslToHex(h, s, l)
}

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 }
}

const rgbToHsl = (r, g, b) => {
  r /= 255
  g /= 255
  b /= 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2
  
  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  }
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

generateAccents()
</script>

<style scoped>
.analyze-view {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.analyze-header {
  text-align: center;
  margin-bottom: 2rem;
}

.analyze-header h2 {
  color: #333;
  margin-bottom: 0.5rem;
}

.analyze-header p {
  color: #666;
  margin: 0;
}

.wcag-levels {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
}

.wcag-levels h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #333;
}

.levels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.level-card {
  padding: 1.5rem;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
}

.level-card h4 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.level-aaa {
  border-color: #51cf66;
  background: linear-gradient(135deg, #51cf66, #40c057);
  color: white;
}

.level-aa {
  border-color: #4a6cf7;
  background: linear-gradient(135deg, #4a6cf7, #3b5bdb);
  color: white;
}

.level-a {
  border-color: #ffd43b;
  background: linear-gradient(135deg, #ffd43b, #fab005);
  color: #333;
}

.level-card ul {
  margin: 0;
  padding-left: 1.2rem;
}

.level-card li {
  margin: 0.5rem 0;
}

.accent-colors {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
}

.accent-colors h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: #333;
}

.accent-colors p {
  color: #666;
  margin-bottom: 1rem;
}

.accent-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.accent-input {
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  width: 120px;
  font-family: 'Courier New', monospace;
}

.accent-results {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.accent-color {
  height: 100px;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  transition: transform 0.3s ease;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.accent-color:hover {
  transform: translateY(-5px);
}

.accent-hex {
  color: white;
  font-weight: bold;
  font-family: 'Courier New', monospace;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
}

.accent-type {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.85rem;
  background: rgba(0, 0, 0, 0.3);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  align-self: flex-start;
}
</style>