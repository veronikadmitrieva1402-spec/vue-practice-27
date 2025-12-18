<template>
  <div 
    class="color-card"
    :style="{ backgroundColor: color }"
    @click="$emit('copy', color)"
  >
    <div class="color-card-content">
      <button 
        class="lock-button"
        @click.stop="$emit('lock')"
        :class="{ locked: isLocked }"
        :title="isLocked ? 'Открепить цвет' : 'Закрепить цвет'"
      >

      </button>
      
      <div class="color-info">
        <div class="hex-value">{{ color }}</div>
        <div class="copy-hint">Нажмите для копирования</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  color: String,
  index: Number,
  isLocked: Boolean
})

defineEmits(['lock', 'copy'])
</script>

<style scoped>
.color-card {
  height: 200px;
  border-radius: 12px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.color-card:hover {
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
}

.color-card-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.7);
  color: white;
}

.lock-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.lock-button:hover {
  transform: scale(1.1);
  background: white;
}

.lock-button.locked {
  background: #ffeb3b;
}

.hex-value {
  font-family: 'Courier New', monospace;
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.copy-hint {
  font-size: 0.85rem;
  opacity: 0.8;
}
</style>