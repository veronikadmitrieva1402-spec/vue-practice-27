<template>
  <div class="color-wheel-container">
    <h3>Цветовой круг</h3>
    
    <div class="wheel-controls">
      <div class="control-group">
        <label>Основной цвет:</label>
        <input type="color" v-model="selectedColor" @input="updateWheel">
        <div class="color-indicator" :style="{ background: selectedColor }"></div>
      </div>
      
      <div class="control-group">
        <label>Тип палитры:</label>
        <select v-model="wheelType" @change="updateWheel">
          <option value="analogous">Аналогичная</option>
          <option value="complementary">Комплементарная</option>
          <option value="triad">Триада</option>
          <option value="tetrad">Тетрада</option>
          <option value="splitComplementary">Сплит-комплементарная</option>
        </select>
      </div>
    </div>
    
    <div class="wheel-svg-container">
      <svg :width="wheelSize" :height="wheelSize" class="color-wheel-svg">
        <circle 
          :cx="centerX" 
          :cy="centerY" 
          :r="radius" 
          fill="none" 
          stroke="#e0e0e0" 
          stroke-width="2"
        />
        
        <g v-for="angle in angles" :key="angle">
          <line 
            :x1="centerX + Math.cos((angle-90) * Math.PI/180) * (radius - 10)"
            :y1="centerY + Math.sin((angle-90) * Math.PI/180) * (radius - 10)"
            :x2="centerX + Math.cos((angle-90) * Math.PI/180) * radius"
            :y2="centerY + Math.sin((angle-90) * Math.PI/180) * radius"
            stroke="#999"
            stroke-width="1"
          />
          <text 
            :x="centerX + Math.cos((angle-90) * Math.PI/180) * (radius + 15)"
            :y="centerY + Math.sin((angle-90) * Math.PI/180) * (radius + 15)"
            text-anchor="middle"
            font-size="12"
            fill="#666"
          >
            {{ angle }}°
          </text>
        </g>
        
        <!-- Секторы цветового круга -->
        <g v-for="(sector, index) in colorSectors" :key="index">
          <path 
            :d="getSectorPath(sector.startAngle, sector.endAngle, radius - 30, radius)"
            :fill="sector.color"
            stroke="#fff"
            stroke-width="1"
          />
        </g>
        
        <!-- Основной выбранный цвет -->
        <circle 
          :cx="centerX" 
          :cy="centerY" 
          :r="20" 
          :fill="selectedColor"
          stroke="#333"
          stroke-width="3"
          class="center-circle"
        />
        
        <!-- Гармоничные цвета -->
        <g v-for="(point, index) in harmonyPoints" :key="index">
          <circle 
            :cx="getX(point.angle, point.radius)" 
            :cy="getY(point.angle, point.radius)" 
            :r="point.size" 
            :fill="point.color"
            stroke="#fff"
            stroke-width="2"
            class="harmony-point"
            @click="selectHarmonyColor(point.color)"
          />
          <text 
            :x="getX(point.angle, point.radius + 25)" 
            :y="getY(point.angle, point.radius + 25)"
            text-anchor="middle"
            font-size="12"
            fill="#333"
            font-weight="bold"
          >
            {{ point.label }}
          </text>
        </g>
        
        <!-- Линии гармонии -->
        <g v-if="showLines">
          <line 
            v-for="(point, index) in harmonyPoints" 
            :key="'line-' + index"
            :x1="centerX"
            :y1="centerY"
            :x2="getX(point.angle, point.radius)"
            :y2="getY(point.angle, point.radius)"
            stroke="rgba(0,0,0,0.2)"
            stroke-width="1"
            stroke-dasharray="3,3"
          />
        </g>
      </svg>
    </div>
    
    <!-- Легенда гармоничных цветов -->
    <div class="harmony-legend">
      <h4>Гармоничные цвета:</h4>
      <div class="harmony-colors">
        <div 
          v-for="(point, index) in harmonyPoints" 
          :key="index"
          class="legend-item"
          @click="selectHarmonyColor(point.color)"
        >
          <div class="legend-color" :style="{ background: point.color }"></div>
          <div class="legend-info">
            <div class="legend-name">{{ point.label }}</div>
            <div class="legend-hex">{{ point.color }}</div>
            <div class="legend-angle">{{ point.angle }}°</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Управление -->
    <div class="wheel-actions">
      <button @click="toggleLines" class="btn">
        {{ showLines ? 'Скрыть линии' : 'Показать линии' }}
      </button>
      <button @click="copyAllColors" class="btn">
        Копировать все цвета
      </button>
      <button @click="generatePaletteFromWheel" class="btn generate-btn">
        Создать палитру
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '#4a6cf7'
  }
})

const emit = defineEmits(['update:modelValue', 'generate-palette'])

const selectedColor = ref(props.modelValue)
const wheelType = ref('analogous')
const showLines = ref(true)
const wheelSize = 500
const centerX = wheelSize / 2
const centerY = wheelSize / 2
const radius = 200

// Углы для меток
const angles = computed(() => {
  return [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]
})

// Сектора цветового круга (упрощенный HSL)
const colorSectors = computed(() => {
  const sectors = []
  const hueStep = 30 // 12 секторов по 30 градусов
  
  for (let i = 0; i < 12; i++) {
    const hue = i * hueStep
    const color = hslToHex(hue, 100, 50)
    sectors.push({
      startAngle: i * hueStep - 90,
      endAngle: (i + 1) * hueStep - 90,
      color: color
    })
  }
  
  return sectors
})

// Точки гармоничных цветов
const harmonyPoints = computed(() => {
  const baseHue = hexToHsl(selectedColor.value).h
  const points = []
  
  // Добавляем основной цвет
  points.push({
    angle: 0,
    radius: 0,
    size: 20,
    color: selectedColor.value,
    label: 'Основной'
  })
  
  // Добавляем гармоничные цвета в зависимости от типа
  switch (wheelType.value) {
    case 'analogous':
      // Аналогичные цвета (±30 градусов)
      points.push(
        { angle: -30, radius: 150, size: 15, color: hslToHex((baseHue - 30 + 360) % 360, 100, 50), label: 'Аналог -30°' },
        { angle: 30, radius: 150, size: 15, color: hslToHex((baseHue + 30) % 360, 100, 50), label: 'Аналог +30°' }
      )
      break
      
    case 'complementary':
      // Комплементарный цвет (180 градусов)
      points.push(
        { angle: 180, radius: 150, size: 15, color: hslToHex((baseHue + 180) % 360, 100, 50), label: 'Комплементарный' }
      )
      break
      
    case 'triad':
      // Триадные цвета (120 градусов)
      points.push(
        { angle: 120, radius: 150, size: 15, color: hslToHex((baseHue + 120) % 360, 100, 50), label: 'Триада +120°' },
        { angle: 240, radius: 150, size: 15, color: hslToHex((baseHue + 240) % 360, 100, 50), label: 'Триада +240°' }
      )
      break
      
    case 'tetrad':
      // Тетрадные цвета (90 градусов)
      points.push(
        { angle: 90, radius: 150, size: 15, color: hslToHex((baseHue + 90) % 360, 100, 50), label: 'Тетрада +90°' },
        { angle: 180, radius: 150, size: 15, color: hslToHex((baseHue + 180) % 360, 100, 50), label: 'Тетрада +180°' },
        { angle: 270, radius: 150, size: 15, color: hslToHex((baseHue + 270) % 360, 100, 50), label: 'Тетрада +270°' }
      )
      break
      
    case 'splitComplementary':
      // Сплит-комплементарные (150 и 210 градусов)
      points.push(
        { angle: 150, radius: 150, size: 15, color: hslToHex((baseHue + 150) % 360, 100, 50), label: 'Сплит +150°' },
        { angle: 210, radius: 150, size: 15, color: hslToHex((baseHue + 210) % 360, 100, 50), label: 'Сплит +210°' }
      )
      break
  }
  
  return points
})

// Вспомогательные функции
const getSectorPath = (startAngle, endAngle, innerRadius, outerRadius) => {
  const startRad = (startAngle * Math.PI) / 180
  const endRad = (endAngle * Math.PI) / 180
  
  const x1 = centerX + Math.cos(startRad) * outerRadius
  const y1 = centerY + Math.sin(startRad) * outerRadius
  const x2 = centerX + Math.cos(endRad) * outerRadius
  const y2 = centerY + Math.sin(endRad) * outerRadius
  const x3 = centerX + Math.cos(endRad) * innerRadius
  const y3 = centerY + Math.sin(endRad) * innerRadius
  const x4 = centerX + Math.cos(startRad) * innerRadius
  const y4 = centerY + Math.sin(startRad) * innerRadius
  
  return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 0 0 ${x4} ${y4} Z`
}

const getX = (angle, radius) => {
  return centerX + Math.cos((angle - 90) * Math.PI / 180) * radius
}

const getY = (angle, radius) => {
  return centerY + Math.sin((angle - 90) * Math.PI / 180) * radius
}

const updateWheel = () => {
  emit('update:modelValue', selectedColor.value)
}

const toggleLines = () => {
  showLines.value = !showLines.value
}

const selectHarmonyColor = (color) => {
  selectedColor.value = color
  updateWheel()
}

const copyAllColors = async () => {
  const colors = harmonyPoints.value.map(p => p.color).join('\n')
  try {
    await navigator.clipboard.writeText(colors)
    alert('Все цвета скопированы в буфер обмена!')
  } catch (err) {
    console.error('Ошибка копирования:', err)
  }
}

const generatePaletteFromWheel = () => {
  const colors = harmonyPoints.value.map(p => p.color)
  emit('generate-palette', colors)
}

// Конвертация цветов
const hexToHsl = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  let r = parseInt(result[1], 16) / 255
  let g = parseInt(result[2], 16) / 255
  let b = parseInt(result[3], 16) / 255
  
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

watch(() => props.modelValue, (newVal) => {
  selectedColor.value = newVal
})
</script>

<style scoped>
.color-wheel-container {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.wheel-controls {
  display: flex;
  gap: 2rem;
  margin: 1rem 0;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.control-group label {
  font-weight: 500;
  color: #333;
}

.color-indicator {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  border: 2px solid #ddd;
}

select {
  padding: 0.5rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  background: white;
  cursor: pointer;
}

.wheel-svg-container {
  display: flex;
  justify-content: center;
  margin: 2rem 0;
  overflow: auto;
}

.color-wheel-svg {
  border: 2px solid #f0f0f0;
  border-radius: 50%;
  background: #f8f9fa;
}

.center-circle {
  cursor: pointer;
  transition: transform 0.3s ease;
}

.center-circle:hover {
  transform: scale(1.1);
}

.harmony-point {
  cursor: pointer;
  transition: transform 0.3s ease;
}

.harmony-point:hover {
  transform: scale(1.2);
}

.harmony-legend {
  margin-top: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.harmony-colors {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.legend-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  border-color: #4a6cf7;
}

.legend-color {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  border: 2px solid #ddd;
}

.legend-info {
  flex: 1;
}

.legend-name {
  font-weight: 500;
  color: #333;
}

.legend-hex {
  font-family: 'Courier New', monospace;
  color: #666;
  font-size: 0.9rem;
  margin: 0.25rem 0;
}

.legend-angle {
  color: #999;
  font-size: 0.8rem;
}

.wheel-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  background: #e9ecef;
  color: #333;
}

.btn:hover {
  background: #dee2e6;
  transform: translateY(-2px);
}

.generate-btn {
  background: #4a6cf7;
  color: white;
}

.generate-btn:hover {
  background: #3a5ce5;
}
</style>