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
- **Memorize Duration**: Adjust the timer length for memorizing words (seconds).
- **Delay Duration**: Set a delay step before grid selection (default: 3 seconds) to clear visual memory.
- **Play Duration**: Set the timer length for the active selection phase (default: 15 seconds) with visual progressor.
- **Words to Memorize**: Adjust the number of target words.
- **Total Grid Words**: Adjust the total number of words in the play grid.

## 🚀 Setup & Running Locally

Make sure you have Node.js installed.

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Testing & Videos

End-to-end tests are implemented using **Playwright**.

```bash
# Run Playwright tests and record videos
pnpm test
```

Recorded test execution videos are available in [videos.md](videos.md).

## 🛠️ Built With

- **Nuxt 4**
- **Vue 3** (Composition API)
- **Playwright** (End-to-end Testing)
- Vanilla CSS

## TODO

- [x] before the gameState === 'play', add a small page with step countdown (1, 2, 3 seconds delay centered) to transition from visual memory to mental recall, with configurable Settings value (default 3 seconds).
- [x] add a 🎉 (use it not as emoji, but you can find these in many other apps), when the user gets 'you won'.
- [x] add another Setting parameter, default 15 seconds, where in the lowest side of the playing state, a progressor comes by.
- [x] add link in GitHub
- [x] add a Chart component, with line which shows the last 10 plays (y is percent of correct). should we use a library? or not? which are popular?
- [ ] Setting language. default: English. alternative: German.
- [ ] feat: not a fixed column (4-5 words), but the columns should not matter.
because we might have more or less words,
and our font might be too small... make the size consistent, but at least 2 words (it's possible on a vertical phone).
maybe we will not need to have the relevant Setting config (you decide)
- [ ] Setting customization: color of the background
