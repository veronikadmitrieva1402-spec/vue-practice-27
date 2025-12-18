<template>
  <div class="library-view">
    <div class="library-header">
      <h2>Библиотека палитр</h2>
      <p>Сохраняйте, организуйте и управляйте вашими цветовыми палитрами</p>
    </div>
    
    <div class="search-filters">
      <div class="search-box">
        <input 
          type="text" 
          v-model="searchQuery"
          placeholder="Поиск по названию..."
          class="search-input"
        >
        <button class="search-btn"></button>
      </div>
      
      <div class="filter-tags">
        <button 
          v-for="tag in availableTags" 
          :key="tag"
          @click="toggleTag(tag)"
          :class="{ active: selectedTags.includes(tag) }"
          class="tag-btn"
        >
          {{ tag }}
        </button>
      </div>
      
      <div class="sort-controls">
        <label>Сортировка:</label>
        <select v-model="sortBy" @change="sortPalettes">
          <option value="date">По дате</option>
          <option value="name">По названию</option>
          <option value="colors">По количеству цветов</option>
        </select>
      </div>
    </div>
    
    <div class="library-stats">
      <div class="stat-card">
        <div class="stat-number">{{ totalPalettes }}</div>
        <div class="stat-label">Всего палитр</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ favoritePalettes }}</div>
        <div class="stat-label">Избранных</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ totalColors }}</div>
        <div class="stat-label">Всего цветов</div>
      </div>
    </div>
    
    <div class="palettes-grid">
      <div 
        v-for="palette in filteredPalettes" 
        :key="palette.id"
        class="palette-card"
        :class="{ favorite: palette.favorite }"
      >
        <div class="palette-header">
          <h3>{{ palette.name }}</h3>
          <div class="palette-actions">
            <button 
              @click="toggleFavorite(palette.id)"
              class="fav-btn"
              :title="palette.favorite ? 'Убрать из избранного' : 'В избранное'"
            >
              {{ palette.favorite ? '1' : '0' }}
            </button>
            <button 
              @click="editPalette(palette)"
              class="edit-btn"
              title="Редактировать"
            >
              
            </button>
            <button 
              @click="deletePalette(palette.id)"
              class="delete-btn"
              title="Удалить"
            >
              
            </button>
          </div>
        </div>
        
        <div class="palette-date">
          {{ formatDate(palette.createdAt) }}
        </div>
        
        <div class="palette-colors">
          <div 
            v-for="color in palette.colors.slice(0, 5)" 
            :key="color"
            class="palette-color"
            :style="{ backgroundColor: color }"
            :title="color"
            @click="copyColor(color)"
          ></div>
          <div v-if="palette.colors.length > 5" class="more-colors">
            +{{ palette.colors.length - 5 }}
          </div>
        </div>
        
        <div class="palette-tags">
          <span 
            v-for="tag in palette.tags" 
            :key="tag"
            class="tag"
          >
            {{ tag }}
          </span>
        </div>
        
        <div class="palette-footer">
          <button @click="loadPalette(palette)" class="load-btn">
            Загрузить
          </button>
          <button @click="exportPalette(palette)" class="export-btn">
            Экспорт
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="filteredPalettes.length === 0" class="empty-state">
      <div class="empty-icon"></div>
      <h3>Библиотека пуста</h3>
      <p>Сохраните ваши первые палитры из генератора!</p>
      <button @click="goToGenerator" class="btn primary-btn">
        Перейти к генератору
      </button>
    </div>
    
    <div v-if="editingPalette" class="edit-dialog">
      <div class="dialog-content">
        <h3>Редактировать палитру</h3>
        
        <div class="form-group">
          <label>Название:</label>
          <input 
            type="text" 
            v-model="editingPalette.name"
            class="form-input"
          >
        </div>
        
        <div class="form-group">
          <label>Теги (через запятую):</label>
          <input 
            type="text" 
            v-model="editingPalette.tagsString"
            class="form-input"
            placeholder="дизайн, интерфейс, бренд"
          >
        </div>
        
        <div class="form-group">
          <label>Цвета:</label>
          <div class="edit-colors">
            <div 
              v-for="(color, index) in editingPalette.colors" 
              :key="index"
              class="edit-color"
            >
              <input 
                type="color" 
                v-model="editingPalette.colors[index]"
                class="color-input"
              >
              <input 
                type="text" 
                v-model="editingPalette.colors[index]"
                class="hex-input"
              >
              <button 
                @click="removeColor(index)"
                class="remove-color-btn"
                v-if="editingPalette.colors.length > 1"
              >
                ×
              </button>
            </div>
          </div>
          <button @click="addColor" class="add-color-btn">
            + Добавить цвет
          </button>
        </div>
        
        <div class="dialog-actions">
          <button @click="saveEdit" class="btn save-btn">
            Сохранить
          </button>
          <button @click="cancelEdit" class="btn cancel-btn">
            Отмена
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePaletteStore } from '../stores/paletteStore'

const router = useRouter()
const paletteStore = usePaletteStore()

const searchQuery = ref('')
const selectedTags = ref([])
const sortBy = ref('date')
const editingPalette = ref(null)

const availableTags = ref([
  'дизайн', 'интерфейс', 'бренд', 'веб', 'мобильный',
  'светлая', 'тёмная', 'пастельная', 'яркая', 'профессиональная'
])

const filteredPalettes = computed(() => {
  let palettes = [...paletteStore.savedPalettes]
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    palettes = palettes.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.tags?.some(tag => tag.toLowerCase().includes(query))
    )
  }
  
  if (selectedTags.value.length > 0) {
    palettes = palettes.filter(p => 
      p.tags?.some(tag => selectedTags.value.includes(tag))
    )
  }
  
  palettes.sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'colors':
        return b.colors.length - a.colors.length
      case 'date':
      default:
        return new Date(b.createdAt) - new Date(a.createdAt)
    }
  })
  
  return palettes
})

const totalPalettes = computed(() => paletteStore.savedPalettes.length)
const favoritePalettes = computed(() => 
  paletteStore.savedPalettes.filter(p => p.favorite).length
)
const totalColors = computed(() => 
  paletteStore.savedPalettes.reduce((sum, p) => sum + p.colors.length, 0)
)

const toggleTag = (tag) => {
  const index = selectedTags.value.indexOf(tag)
  if (index === -1) {
    selectedTags.value.push(tag)
  } else {
    selectedTags.value.splice(index, 1)
  }
}

const sortPalettes = () => {
}

const toggleFavorite = (id) => {
  const palette = paletteStore.savedPalettes.find(p => p.id === id)
  if (palette) {
    palette.favorite = !palette.favorite
    saveToLocalStorage()
  }
}

const editPalette = (palette) => {
  editingPalette.value = {
    ...palette,
    tagsString: palette.tags?.join(', ') || '',
    originalId: palette.id
  }
}

const deletePalette = (id) => {
  if (confirm('Удалить эту палитру?')) {
    paletteStore.deletePalette(id)
  }
}

const loadPalette = (palette) => {
  paletteStore.loadPalette(palette)
  router.push('/')
}

const exportPalette = (palette) => {
  const data = {
    name: palette.name,
    colors: palette.colors,
    tags: palette.tags,
    exportDate: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${palette.name.replace(/\s+/g, '_')}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const goToGenerator = () => {
  router.push('/')
}

const saveEdit = () => {
  if (!editingPalette.value) return
  
  // Обновляем теги
  editingPalette.value.tags = editingPalette.value.tagsString
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
  
  // Находим и обновляем палитру
  const index = paletteStore.savedPalettes.findIndex(p => p.id === editingPalette.value.originalId)
  if (index !== -1) {
    const { originalId, tagsString, ...updatedPalette } = editingPalette.value
    paletteStore.savedPalettes[index] = updatedPalette
    saveToLocalStorage()
  }
  
  editingPalette.value = null
}

const cancelEdit = () => {
  editingPalette.value = null
}

const addColor = () => {
  if (editingPalette.value) {
    editingPalette.value.colors.push('#4a6cf7')
  }
}

const removeColor = (index) => {
  if (editingPalette.value && editingPalette.value.colors.length > 1) {
    editingPalette.value.colors.splice(index, 1)
  }
}

const copyColor = async (color) => {
  try {
    await navigator.clipboard.writeText(color)
    alert(`Скопировано: ${color}`)
  } catch (err) {
    console.error('Ошибка копирования:', err)
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const saveToLocalStorage = () => {
  localStorage.setItem('savedPalettes', JSON.stringify(paletteStore.savedPalettes))
}

// Инициализация
onMounted(() => {
  if (paletteStore.savedPalettes.length === 0) {
    // Добавляем примеры палитр для демонстрации
    const examplePalettes = [
      {
        id: 1,
        name: 'Профессиональная синяя',
        colors: ['#1a365d', '#2d3748', '#4a5568', '#718096', '#90cdf4'],
        tags: ['профессиональная', 'синяя', 'интерфейс'],
        favorite: true,
        createdAt: '2024-01-15'
      },
      {
        id: 2,
        name: 'Энергичная летняя',
        colors: ['#ff6b6b', '#ffd166', '#06d6a0', '#118ab2', '#073b4c'],
        tags: ['яркая', 'энергичная', 'летняя'],
        favorite: false,
        createdAt: '2024-01-14'
      }
    ]
    
    paletteStore.savedPalettes.push(...examplePalettes)
    saveToLocalStorage()
  }
})
</script>

<style scoped>
.library-view {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.library-header {
  text-align: center;
  margin-bottom: 2rem;
}

.library-header h2 {
  color: #333;
  margin-bottom: 0.5rem;
}

.library-header p {
  color: #666;
  margin: 0;
}

.search-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 2rem;
  align-items: center;
}

.search-box {
  flex: 1;
  min-width: 300px;
  display: flex;
  gap: 0.5rem;
}

.search-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
}

.search-btn {
  padding: 0.75rem 1.5rem;
  background: #4a6cf7;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-btn {
  padding: 0.5rem 1rem;
  background: #e9ecef;
  border: 2px solid #dee2e6;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.tag-btn.active {
  background: #4a6cf7;
  color: white;
  border-color: #4a6cf7;
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.sort-controls select {
  padding: 0.5rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  background: white;
  cursor: pointer;
}

.library-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
  text-align: center;
  border: 2px solid #e9ecef;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: #4a6cf7;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

.palettes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.palette-card {
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.palette-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  border-color: #4a6cf7;
}

.palette-card.favorite {
  border-color: #ffd43b;
  background: linear-gradient(135deg, #fff9db, #fff3bf);
}

.palette-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.palette-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.2rem;
}

.palette-actions {
  display: flex;
  gap: 0.5rem;
}

.fav-btn, .edit-btn, .delete-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s;
}

.fav-btn:hover {
  color: #ffd43b;
  transform: scale(1.2);
}

.edit-btn:hover {
  color: #4a6cf7;
  transform: scale(1.2);
}

.delete-btn:hover {
  color: #ff6b6b;
  transform: scale(1.2);
}

.palette-date {
  color: #999;
  font-size: 0.85rem;
  margin-bottom: 1rem;
}

.palette-colors {
  display: flex;
  gap: 0.5rem;
  margin: 1rem 0;
  flex-wrap: wrap;
}

.palette-color {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.2s;
}

.palette-color:hover {
  transform: scale(1.1);
}

.more-colors {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 8px;
  font-weight: bold;
  color: #666;
}

.palette-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1rem 0;
}

.tag {
  padding: 0.25rem 0.75rem;
  background: #e9ecef;
  border-radius: 12px;
  font-size: 0.8rem;
  color: #666;
}

.palette-footer {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.load-btn, .export-btn {
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.load-btn {
  background: #4a6cf7;
  color: white;
}

.load-btn:hover {
  background: #3a5ce5;
}

.export-btn {
  background: #e9ecef;
  color: #333;
}

.export-btn:hover {
  background: #dee2e6;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: #f8f9fa;
  border-radius: 12px;
  margin-top: 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: #333;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #666;
  margin-bottom: 1.5rem;
}

.primary-btn {
  background: #4a6cf7;
  color: white;
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 1rem;
}

.edit-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
}

.edit-colors {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 1rem 0;
}

.edit-color {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.color-input {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.hex-input {
  flex: 1;
  padding: 0.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
}

.remove-color-btn {
  background: #ff6b6b;
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
}

.add-color-btn {
  background: #e9ecef;
  border: 2px dashed #dee2e6;
  color: #666;
  padding: 0.75rem;
  width: 100%;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.add-color-btn:hover {
  background: #dee2e6;
}

.dialog-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.save-btn {
  background: #51cf66;
  color: white;
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.cancel-btn {
  background: #ff6b6b;
  color: white;
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}
</style>