<template>
  <div class="settings-modal-overlay" @click.self="$emit('close')">
    <div class="settings-card">
      <h2>Game Settings</h2>
      
      <div class="setting-group">
        <label for="memorizeSeconds">Memorize Duration (seconds)</label>
        <div class="setting-input-wrap">
          <input 
            id="memorizeSeconds" 
            type="number" 
            min="1" 
            max="60" 
            v-model.number="memorizeSeconds"
          />
          <span class="unit">sec</span>
        </div>
      </div>

      <div class="setting-group">
        <label for="targetWordsCount">Words to Memorize</label>
        <div class="setting-input-wrap">
          <input 
            id="targetWordsCount" 
            type="number" 
            min="1" 
            max="20" 
            v-model.number="targetWordsCount"
            @change="onTargetWordsChange"
          />
          <span class="unit">words</span>
        </div>
      </div>

      <div class="setting-group">
        <label for="totalGridWords">Total Grid Words</label>
        <div class="setting-input-wrap">
          <input 
            id="totalGridWords" 
            type="number" 
            :min="targetWordsCount" 
            max="64" 
            v-model.number="totalGridWords"
            @change="onTotalWordsChange"
          />
          <span class="unit">words</span>
        </div>
      </div>

      <div class="actions">
        <button class="save-btn" @click="$emit('close')">Save & Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useGameSettings } from '../composables/useGameSettings'

defineEmits(['close'])

const { memorizeSeconds, targetWordsCount, totalGridWords } = useGameSettings()

function onTargetWordsChange() {
  if (targetWordsCount.value < 1) targetWordsCount.value = 1
  if (totalGridWords.value < targetWordsCount.value) {
    totalGridWords.value = targetWordsCount.value
  }
}

function onTotalWordsChange() {
  if (totalGridWords.value < targetWordsCount.value) {
    totalGridWords.value = targetWordsCount.value
  }
}
</script>

<style scoped>
.settings-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.settings-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.settings-card h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #333;
  text-align: center;
}

.setting-group {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.setting-group label {
  font-weight: bold;
  color: #555;
  font-size: 0.95rem;
}

.setting-input-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.setting-input-wrap input {
  flex: 1;
  padding: 0.6rem 0.8rem;
  font-size: 1.1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  outline: none;
}

.setting-input-wrap input:focus {
  border-color: #4b9a76;
}

.unit {
  color: #777;
  font-weight: 500;
}

.actions {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.save-btn {
  background-color: #4b9a76;
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  font-size: 1rem;
  font-weight: bold;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.save-btn:hover {
  background-color: #3b8262;
}
</style>
