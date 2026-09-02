<template>
  <div class="game-container">
    <div class="header">
      <div class="timer">
        <span class="digit">0</span>
        <span class="digit">0</span>
        <span class="colon">:</span>
        <span class="digit">0</span>
        <span class="digit">{{ timerValue }}</span>
      </div>

      <button class="settings-btn" @click="showSettings = true" title="Settings">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      </button>
    </div>

    <div class="main-content">
      <div v-if="gameState === 'start' || gameState === 'memorize'" class="status-banner">
        <span>Memorize the words below</span>
      </div>

      <div v-if="gameState === 'end'" class="status-banner end-banner">
        <span class="score-text">Score: <span class="score-number">{{score}} / {{targetWords.length}}</span></span>
        <span class="result-text">{{resultMessage}}</span>
      </div>

      <div class="card" :class="{'play-mode': gameState === 'play' || gameState === 'end'}">
        <div v-if="gameState === 'start' || gameState === 'memorize'" class="memorize-grid">
          <div v-for="word in targetWords" :key="word" class="word-item memorize-word">
            <span v-if="gameState === 'memorize'">{{ word }}</span>
            <span v-else>?</span>
          </div>
        </div>

        <div v-if="gameState === 'play' || gameState === 'end'" class="play-grid">
          <div 
            v-for="word in shuffledPlayWords" 
            :key="word" 
            class="word-item play-word"
            :class="getWordClass(word)"
            @click="clickWord(word)"
          >
            {{ word }}
          </div>
        </div>
      </div>
      <button v-if="gameState === 'end'" class="try-again-btn" @click="resetAndPlay">
        TRY AGAIN
      </button>

      <button v-if="gameState === 'start'" class="play-btn" @click="startGame">
        PLAY
      </button>
    </div>

    <Settings v-if="showSettings" @close="onCloseSettings" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useGameSettings } from './composables/useGameSettings'
import Settings from './components/Settings.vue'

import wordPool from './words.json'

const { memorizeSeconds, targetWordsCount } = useGameSettings()
const showSettings = ref(false)

const gameState = ref('start')
const targetWords = ref([])
const shuffledPlayWords = ref([])
const clickedWords = ref(new Set())
const score = ref(0)
const resultMessage = ref('')
const timerValue = ref(memorizeSeconds.value || 5)
let countdownInterval = null

function shuffle(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function prepareGame() {
  const count = targetWordsCount.value || 4
  const shuffledPool = shuffle(wordPool)
  targetWords.value = shuffledPool.slice(0, count)
  const distractors = shuffledPool.slice(count, count + 8)
  shuffledPlayWords.value = shuffle([...targetWords.value, ...distractors])
  
  clickedWords.value = new Set()
  score.value = 0
  gameState.value = 'start'
  timerValue.value = memorizeSeconds.value || 5
  
  if (countdownInterval) clearInterval(countdownInterval)
}

function resetAndPlay() {
  prepareGame()
  startGame()
}

function startGame() {
  gameState.value = 'memorize'
  timerValue.value = memorizeSeconds.value || 5
  
  if (countdownInterval) clearInterval(countdownInterval)
  countdownInterval = setInterval(() => {
    timerValue.value--
    if (timerValue.value <= 0) {
      clearInterval(countdownInterval)
      gameState.value = 'play'
    }
  }, 1000)
}

function clickWord(word) {
  if (gameState.value !== 'play') return
  if (clickedWords.value.has(word)) return

  clickedWords.value.add(word)

  if (targetWords.value.includes(word)) {
    score.value++
  }

  const maxPicks = targetWordsCount.value || 4
  if (clickedWords.value.size >= maxPicks) {
    endGame(score.value === maxPicks)
  }
}

function endGame(win) {
  gameState.value = 'end'
  resultMessage.value = win ? 'You won!' : 'You lost!'
}

function getWordClass(word) {
  if (clickedWords.value.has(word)) {
    return targetWords.value.includes(word) ? 'correct' : 'wrong'
  }
  if (gameState.value === 'end' && targetWords.value.includes(word)) {
    return 'revealed-correct'
  }
  return ''
}

function onCloseSettings() {
  showSettings.value = false
  if (gameState.value === 'start') {
    prepareGame()
  }
}

onMounted(() => {
  prepareGame()
})

onUnmounted(() => {
  if (countdownInterval) clearInterval(countdownInterval)
})
</script>

<style>
body {
  margin: 0;
  font-family: 'Inter', 'Segoe UI', sans-serif;
  background-color: #4b9a76;
}

.game-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  box-sizing: border-box;
}

.header {
  width: 100%;
  max-width: 800px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.timer {
  display: flex;
  gap: 4px;
  font-size: 2rem;
}

.digit {
  background-color: #434343;
  color: #fff;
  padding: 0.5rem 0.8rem;
  border-radius: 6px;
  line-height: 1;
}

.colon {
  color: #434343;
  padding: 0.5rem 0.2rem;
  font-weight: bold;
}

.settings-btn {
  width: 48px;
  height: 48px;
  background-color: #434343;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: transform 0.1s;
}
.settings-btn:active {
  transform: scale(0.95);
}
.settings-btn svg {
  width: 24px;
  height: 24px;
}

.main-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 600px;
  margin-top: 2rem;
}

.status-banner {
  background-color: #347458;
  padding: 1rem 1.5rem;
  border-radius: 4px;
  margin-bottom: 3rem;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  color: white;
  font-size: 1.2rem;
  text-align: center;
}

.play-btn {
  margin-top: 3rem;
  background-color: #fb9c4a;
  color: white;
  border: none;
  padding: 1rem 4rem;
  font-size: 1.5rem;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
  transition: transform 0.1s;
}
.play-btn:active {
  transform: scale(0.96);
}

.end-banner {
  color: white;
  font-size: 1.2rem;
  display: flex;
  gap: 1rem;
  font-weight: bold;
}

.score-number {
  color: #f09a47;
}

.card {
  background: white;
  border-radius: 4px;
  padding: 2.5rem 2rem;
  box-shadow: 0 15px 35px rgba(0,0,0,0.25);
  width: 100%;
  box-sizing: border-box;
}

.memorize-grid {
  display: flex;
  justify-content: space-around;
  gap: 1rem;
  flex-wrap: wrap;
}

.play-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}

.word-item {
  text-align: center;
  font-size: 1.1rem;
  font-weight: bold;
  padding: 1.2rem 0.5rem;
  border-radius: 4px;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-word {
  cursor: pointer;
  background-color: white;
}

.correct {
  background-color: #5bc08a;
  color: white;
}

.wrong {
  background-color: #eb6068;
  color: white;
}

.revealed-correct {
  background-color: rgba(91, 192, 138, 0.8);
  color: white;
  transition: background-color 2s ease, color 2s ease;
}

.try-again-btn {
  margin-top: 3rem;
  background-color: #fb9c4a;
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  font-size: 1.1rem;
  font-weight: bold;
  border-radius: 4px;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
  transition: transform 0.1s;
}
.try-again-btn:active {
  transform: scale(0.98);
}
</style>
