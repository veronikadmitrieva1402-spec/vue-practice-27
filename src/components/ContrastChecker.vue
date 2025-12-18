<template>
  <div class="contrast-checker">
    <h3>Проверка контрастности (WCAG)</h3>
    
    <div class="color-pair-selector">
      <div class="color-selection">
        <label>Цвет текста:</label>
        <input type="color" v-model="foreground" @input="updateForeground">
        <input type="text" v-model="foreground" class="hex-input">
        <div class="color-preview" :style="{ background: foreground }"></div>
      </div>
      
      <div class="vs-icon">VS</div>
      
      <div class="color-selection">
        <label>Цвет фона:</label>
        <input type="color" v-model="background" @input="updateBackground">
        <input type="text" v-model="background" class="hex-input">
        <div class="color-preview" :style="{ background: background }"></div>
      </div>
    </div>
    
    <div class="test-example" :style="testExampleStyles">
      <p class="normal-text">Пример текста нормального размера</p>
      <p class="large-text">Пример текста большого размера</p>
      <button class="test-button">Пример кнопки</button>
    </div>
    
    <div class="results">
      <div class="result-card" :class="getResultClass('normal')">
        <h4>Обычный текст (AA/AAA)</h4>
        <div class="ratio">Коэффициент: {{ results.ratio.toFixed(2) }}:1</div>
        <div class="status">
          <span v-if="results.passesAA.normal">AA (мин. 4.5:1)</span>
          <span v-else>AA (требуется 4.5:1)</span>
        </div>
        <div class="status">
          <span v-if="results.passesAAA.normal">АAA (мин. 7:1)</span>
          <span v-else>AAA (требуется 7:1)</span>
        </div>
      </div>
      
      <div class="result-card" :class="getResultClass('large')">
        <h4>Крупный текст (AA/AAA)</h4>
        <div class="ratio">Коэффициент: {{ results.ratio.toFixed(2) }}:1</div>
        <div class="status">
          <span v-if="results.passesAA.large">AA (мин. 3:1)</span>
          <span v-else>AA (требуется 3:1)</span>
        </div>
        <div class="status">
          <span v-if="results.passesAAA.large">AAA (мин. 4.5:1)</span>
          <span v-else>AAA (требуется 4.5:1)</span>
        </div>
      </div>
      
      <div class="result-card" :class="getResultClass('ui')">
        <h4>UI компоненты (AA)</h4>
        <div class="ratio">Коэффициент: {{ results.ratio.toFixed(2) }}:1</div>
        <div class="status">
          <span v-if="results.passesAA.ui">AA (мин. 3:1)</span>
          <span v-else>AA (требуется 3:1)</span>
        </div>
      </div>
    </div>
    
    <div class="recommendations" v-if="recommendations.length > 0">
      <h4>Рекомендации:</h4>
      <ul>
        <li v-for="(rec, index) in recommendations" :key="index">{{ rec }}</li>
      </ul>
    </div>
    
    <div class="palette-check" v-if="palette">
      <h4>Проверить цвета из палитры:</h4>
      <div class="palette-colors">
        <button 
          v-for="color in palette" 
          :key="color"
          class="palette-color-btn"
          :style="{ background: color }"
          @click="selectColorFromPalette(color)"
          :title="color"
        ></button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  palette: {
    type: Array,
    default: () => []
  }
})

const foreground = ref('#000000')
const background = ref('#ffffff')

const getLuminance = (hex) => {
  const rgb = hexToRgb(hex)
  const [r, g, b] = Object.values(rgb).map(v => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const getContrastRatio = (color1, color2) => {
  const l1 = getLuminance(color1)
  const l2 = getLuminance(color2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

const results = computed(() => {
  const ratio = getContrastRatio(foreground.value, background.value)
  
  return {
    ratio,
    passesAA: {
      normal: ratio >= 4.5,
      large: ratio >= 3,
      ui: ratio >= 3
    },
    passesAAA: {
      normal: ratio >= 7,
      large: ratio >= 4.5
    }
  }
})

const recommendations = computed(() => {
  const recs = []
  const ratio = results.value.ratio
  
  if (ratio < 3) {
    recs.push('Контраст слишком низкий для любого текста')
    recs.push('Рекомендуется использовать более контрастные цвета')
  } else if (ratio < 4.5) {
    recs.push('Подходит только для крупного текста и UI элементов')
    recs.push('Для обычного текста увеличьте контраст')
  } else if (ratio < 7) {
    recs.push('Хороший контраст для обычного текста (AA)')
    recs.push('Для наивысшего уровня (AAA) увеличьте контраст')
  } else {
    recs.push('Отличный контраст! Соответствует уровню AAA')
  }
  
  return recs
})

const testExampleStyles = computed(() => ({
  backgroundColor: background.value,
  color: foreground.value
}))

const getResultClass = (type) => {
  if (type === 'ui') {
    return results.value.passesAA.ui ? 'pass' : 'fail'
  }
  return results.value.passesAA[type] ? 'pass' : 'fail'
}

const updateForeground = (event) => {
  foreground.value = event.target.value
}

const updateBackground = (event) => {
  background.value = event.target.value
}

const selectColorFromPalette = (color) => {
  if (foreground.value === '#000000' || foreground.value === background.value) {
    foreground.value = color
  } else {
    background.value = color
  }
}

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 }
}
</script>

<style scoped>
.contrast-checker {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-top: 2rem;
}

.color-pair-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin: 1.5rem 0;
  flex-wrap: wrap;
}

.color-selection {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 150px;
}

.color-selection label {
  font-weight: 500;
  color: #333;
}

.hex-input {
  padding: 0.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  width: 100px;
  text-align: center;
  font-family: 'Courier New', monospace;
}

.color-preview {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  border: 2px solid #ddd;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.vs-icon {
  font-size: 1.5rem;
  font-weight: bold;
  color: #666;
  padding: 0 1rem;
}

.test-example {
  padding: 1.5rem;
  border-radius: 8px;
  margin: 1.5rem 0;
  border: 2px solid #e0e0e0;
}

.normal-text {
  font-size: 1rem;
  margin: 0.5rem 0;
}

.large-text {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 1rem 0;
}

.test-button {
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: 2px solid currentColor;
  border-radius: 6px;
  font-weight: 500;
  cursor: default;
  margin-top: 1rem;
}

.results {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin: 1.5rem 0;
}

.result-card {
  padding: 1rem;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
}

.result-card.pass {
  border-color: #51cf66;
  background: #f8fff9;
}

.result-card.fail {
  border-color: #ff6b6b;
  background: #fff8f8;
}

.result-card h4 {
  margin-top: 0;
  margin-bottom: 0.75rem;
  color: #333;
}

.ratio {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0.5rem 0;
  font-family: 'Courier New', monospace;
}

.status {
  margin: 0.25rem 0;
  font-size: 0.9rem;
}

.recommendations {
  background: #e3f2fd;
  padding: 1rem;
  border-radius: 8px;
  margin: 1.5rem 0;
}

.recommendations h4 {
  margin-top: 0;
  color: #1565c0;
}

.recommendations ul {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.recommendations li {
  margin: 0.25rem 0;
}

.palette-check {
  margin-top: 1.5rem;
}

.palette-colors {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.palette-color-btn {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.palette-color-btn:hover {
  transform: scale(1.1);
  border-color: #333;
}
</style>