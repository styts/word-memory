# Word Memory Game

A minimal, sleek **Nuxt 4** web application designed to test and train your word memory.

## 🎮 How to Play

1. **Start**: Click the **PLAY** button to begin a round.
2. **Memorize**: You will be shown a set of words (default: 4) for a brief countdown period (default: 5 seconds).
3. **Select**: Once the timer hits zero, a grid containing target words and distractors appears. Select the words you memorized!
4. **Result**: 
   - Correctly selected words turn green instantly.
   - Wrong words turn red instantly.
   - Any missed target words will smoothly fade in over 2 seconds in green (0.8 opacity) when the game ends.
5. **Replay**: Click **TRY AGAIN** to instantly generate a new set of words and start a new round.

## ⚙️ Settings

Click the gear icon (⚙️) in the top-right corner to customize:
- **Memorize Duration**: Adjust the timer length (seconds).
- **Words to Memorize**: Adjust the number of target words.

## 🚀 Setup & Running Locally

Make sure you have Node.js installed.

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠️ Built With

- **Nuxt 4**
- **Vue 3** (Composition API)
- Vanilla CSS
