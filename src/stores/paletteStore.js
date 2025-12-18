import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const usePaletteStore = defineStore('palette', () => {
  const currentPalette = ref([])
  
  const savedPalettes = ref([])
  
  const initializeFromLocalStorage = () => {
    const saved = localStorage.getItem('savedPalettes')
    if (saved) {
      try {
        savedPalettes.value = JSON.parse(saved)
      } catch (e) {
        console.error('Ошибка загрузки палитр:', e)
        savedPalettes.value = []
      }
    }
    
    const current = localStorage.getItem('currentPalette')
    if (current) {
      try {
        currentPalette.value = JSON.parse(current)
      } catch (e) {
        console.error('Ошибка загрузки текущей палитры:', e)
        currentPalette.value = []
      }
    }
  }
  
  const saveToLocalStorage = () => {
    localStorage.setItem('savedPalettes', JSON.stringify(savedPalettes.value))
    localStorage.setItem('currentPalette', JSON.stringify(currentPalette.value))
  }
  
  const saveCurrentPalette = (name, tags = []) => {
    if (currentPalette.value.length === 0) return null
    
    const palette = {
      id: Date.now(),
      name: name || `Палитра ${savedPalettes.value.length + 1}`,
      colors: [...currentPalette.value],
      tags,
      createdAt: new Date().toISOString()
    }
    
    savedPalettes.value.unshift(palette)
    saveToLocalStorage()
    return palette
  }
  
  const loadPalette = (palette) => {
    currentPalette.value = [...palette.colors]
    saveToLocalStorage()
  }
  
  const deletePalette = (id) => {
    savedPalettes.value = savedPalettes.value.filter(p => p.id !== id)
    saveToLocalStorage()
  }
  
  initializeFromLocalStorage()
  
  return {
    currentPalette,
    savedPalettes,
    saveCurrentPalette,
    loadPalette,
    deletePalette
  }
})