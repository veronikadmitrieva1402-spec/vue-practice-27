<template>
  <div class="export-view">
    <div class="export-header">
      <h2>Экспорт палитры</h2>
      <p>Экспортируйте цвета в различные форматы для использования в проектах</p>
    </div>
    
    <div class="export-formats">
      <div class="format-card" :class="{ active: selectedFormat === 'css' }" @click="selectFormat('css')">
        <div class="format-icon"></div>
        <div class="format-info">
          <h4>CSS Variables</h4>
          <p>CSS Custom Properties</p>
        </div>
      </div>
      
      <div class="format-card" :class="{ active: selectedFormat === 'scss' }" @click="selectFormat('scss')">
        <div class="format-icon"></div>
        <div class="format-info">
          <h4>SCSS Variables</h4>
          <p>SCSS/Sass переменные</p>
        </div>
      </div>
      
      <div class="format-card" :class="{ active: selectedFormat === 'tailwind' }" @click="selectFormat('tailwind')">
        <div class="format-icon"></div>
        <div class="format-info">
          <h4>Tailwind Config</h4>
          <p>Конфигурация Tailwind CSS</p>
        </div>
      </div>
    </div>
    
    <div class="code-preview">
      <div class="preview-header">
        <h3>Код для экспорта:</h3>
        <button @click="copyCode" class="copy-btn">
          Копировать код
        </button>
      </div>
      
      <pre class="code-block">{{ generatedCode }}</pre>
    </div>
    
    <div class="export-actions">
      <button @click="downloadFile" class="action-btn download">
        Скачать файл
      </button>
      <button @click="sharePalette" class="action-btn share">
        Поделиться
      </button>
    </div>
    
    <div v-if="showNotification" class="notification">
      {{ notificationMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePaletteStore } from '../stores/paletteStore'

const paletteStore = usePaletteStore()

const selectedFormat = ref('css')
const showNotification = ref(false)
const notificationMessage = ref('')

const currentPalette = computed(() => {
  return paletteStore.currentPalette.length > 0 
    ? paletteStore.currentPalette 
    : ['#4a6cf7', '#ff6b6b', '#51cf66', '#ffd43b', '#339af0']
})

const generatedCode = computed(() => {
  const palette = currentPalette.value
  const name = 'Color Palette'
  
  switch (selectedFormat.value) {
    case 'css':
      return generateCSS(palette, name)
    case 'scss':
      return generateSCSS(palette, name)
    case 'tailwind':
      return generateTailwind(palette, name)
    default:
      return generateCSS(palette, name)
  }
})

const generateCSS = (palette, name) => {
  let code = `/* ${name} - CSS Variables */\n\n`
  code += `:root {\n`
  palette.forEach((color, index) => {
    code += `  --color-${index + 1}: ${color};\n`
  })
  code += `}\n\n`
  code += `/* Использование: */\n`
  code += `.element {\n`
  code += `  color: var(--color-1);\n`
  code += `  background: var(--color-2);\n`
  code += `}`
  return code
}

const generateSCSS = (palette, name) => {
  let code = `// ${name} - SCSS Variables\n\n`
  palette.forEach((color, index) => {
    code += `$color-${index + 1}: ${color};\n`
  })
  code += `\n// Использование:\n`
  code += `.element {\n`
  code += `  color: $color-1;\n`
  code += `  background: $color-2;\n`
  code += `}`
  return code
}

const generateTailwind = (palette, name) => {
  let code = `// ${name} - Tailwind Config\n\n`
  code += `module.exports = {\n`
  code += `  theme: {\n`
  code += `    extend: {\n`
  code += `      colors: {\n`
  code += `        palette: {\n`
  palette.forEach((color, index) => {
    code += `          ${index + 1}: '${color}',\n`
  })
  code += `        }\n`
  code += `      }\n`
  code += `    }\n`
  code += `  }\n`
  code += `}\n\n`
  code += `// Использование: class="text-palette-1 bg-palette-2"`
  return code
}

// Действия
const selectFormat = (format) => {
  selectedFormat.value = format
}

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(generatedCode.value)
    showNotification('Код скопирован!')
  } catch (err) {
    showNotification('Ошибка копирования')
  }
}

const downloadFile = () => {
  const extensions = {
    css: 'css',
    scss: 'scss',
    tailwind: 'js'
  }
  
  const ext = extensions[selectedFormat.value] || 'txt'
  const filename = `palette.${ext}`
  
  const blob = new Blob([generatedCode.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  showNotification('Файл скачан!')
}

const sharePalette = () => {
  const colors = currentPalette.value.join(',')
  const text = `Моя цветовая палитра: ${colors}`
  
  if (navigator.share) {
    navigator.share({
      title: 'Цветовая палитра',
      text: text,
      url: window.location.href
    })
  } else {
    navigator.clipboard.writeText(text)
    showNotification('Палитра скопирована!')
  }
}

const showNotification = (message) => {
  notificationMessage.value = message
  showNotification.value = true
  setTimeout(() => {
    showNotification.value = false
  }, 2000)
}
</script>

<style scoped>
.export-view {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.export-header {
  text-align: center;
  margin-bottom: 2rem;
}

.export-header h2 {
  color: #333;
  margin-bottom: 0.5rem;
}

.export-header p {
  color: #666;
  margin: 0;
}

.export-formats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.format-card {
  padding: 1.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.format-card:hover {
  transform: translateY(-5px);
  border-color: #4a6cf7;
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.format-card.active {
  border-color: #4a6cf7;
  background: linear-gradient(135deg, #f5f7ff, #eef2ff);
}

.format-icon {
  font-size: 2.5rem;
}

.format-info h4 {
  margin: 0 0 0.25rem;
  color: #333;
}

.format-info p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.code-preview {
  margin: 2rem 0;
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

.copy-btn {
  padding: 0.5rem 1.5rem;
  background: #4a6cf7;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.copy-btn:hover {
  background: #3a5ce5;
  transform: translateY(-2px);
}

.code-block {
  background: #1a1a1a;
  color: #f8f8f2;
  padding: 1.5rem;
  border-radius: 8px;
  overflow-x: auto;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
  min-height: 200px;
  white-space: pre-wrap;
}

.export-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.action-btn {
  flex: 1;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.download {
  background: linear-gradient(135deg, #4a6cf7, #3b5bdb);
  color: white;
}

.share {
  background: linear-gradient(135deg, #51cf66, #40c057);
  color: white;
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