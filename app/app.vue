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
      <div class="sound-icon" v-if="gameState === 'play' || gameState === 'end'">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        </svg>
      </div>
    </div>

    <div class="main-content">
      <div v-if="gameState === 'memorize'" class="status-banner">
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
      
      <button v-if="gameState === 'end'" class="try-again-btn" @click="prepareGame">
        TRY AGAIN
      </button>

      <button v-if="gameState === 'start'" class="play-btn" @click="startGame">
        PLAY
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const wordPool = [
  'flower', 'dolphin', 'cab', 'coat', 'dune', 'fish', 'always', 'fork', 
  'complex', 'cave', 'orange', 'phone', 'table', 'chair', 'apple', 'banana'
]

const MAX_SELECTIONS = 4


const gameState = ref('start')
const targetWords = ref([])
const shuffledPlayWords = ref([])
const clickedWords = ref(new Set())
const score = ref(0)
const resultMessage = ref('')
const timerValue = ref(5)
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
  const shuffledPool = shuffle(wordPool)
  targetWords.value = shuffledPool.slice(0, MAX_SELECTIONS)
  const distractors = shuffledPool.slice(4, 12)
  shuffledPlayWords.value = shuffle([...targetWords.value, ...distractors])
  
  clickedWords.value = new Set()
  score.value = 0
  gameState.value = 'start'
  timerValue.value = 5
  
  if (countdownInterval) clearInterval(countdownInterval)
}

function startGame() {
  gameState.value = 'memorize'
  timerValue.value = 5
  
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

  if (clickedWords.value.size >= MAX_SELECTIONS) {
    endGame(score.value === MAX_SELECTIONS)
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
  return ''
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

.sound-icon {
  width: 48px;
  height: 48px;
  background-color: #434343;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}
.sound-icon svg {
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
