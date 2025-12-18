<template>
  <div class="app">
    <nav class="navbar">
      <div class="nav-brand">
        <h1>Генератор цветовых палитр</h1>
      </div>
      <div class="nav-links">
        <router-link to="/" class="nav-link">Генератор</router-link>
        <router-link to="/library" class="nav-link">Библиотека</router-link>
        <router-link to="/analyze" class="nav-link">Анализ</router-link>
      </div>
    </nav>
    
    <main class="main-content">
      <router-view />
    </main>
    
    <footer class="footer">
      <p>Практика 28,27</p>
    </footer>
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.navbar {
  background: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.nav-brand h1 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  text-decoration: none;
  color: #666;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.nav-link:hover {
  color: #4a6cf7;
  background: #f5f7ff;
}

.nav-link.router-link-active {
  color: #4a6cf7;
  background: #eef2ff;
  font-weight: 600;
}

.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.footer {
  background: rgba(255, 255, 255, 0.9);
  padding: 1rem;
  text-align: center;
  color: #666;
  border-top: 1px solid rgba(0,0,0,0.1);
}
</style>