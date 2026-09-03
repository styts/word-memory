import { useState, watch } from '#imports'

const STORAGE_KEY = 'word_memory_settings'

export const useGameSettings = () => {
  const memorizeSeconds = useState<number>('memorizeSeconds', () => 5)
  const delaySeconds = useState<number>('delaySeconds', () => 3)
  const targetWordsCount = useState<number>('targetWordsCount', () => 4)
  const totalGridWords = useState<number>('totalGridWords', () => 12)

  if (import.meta.client) {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (typeof parsed.memorizeSeconds === 'number') memorizeSeconds.value = parsed.memorizeSeconds
        if (typeof parsed.delaySeconds === 'number') delaySeconds.value = parsed.delaySeconds
        if (typeof parsed.targetWordsCount === 'number') targetWordsCount.value = parsed.targetWordsCount
        if (typeof parsed.totalGridWords === 'number') totalGridWords.value = parsed.totalGridWords
      } catch (e) {
        console.error('Failed to load settings from localStorage:', e)
      }
    }

    watch(
      [memorizeSeconds, delaySeconds, targetWordsCount, totalGridWords],
      () => {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            memorizeSeconds: memorizeSeconds.value,
            delaySeconds: delaySeconds.value,
            targetWordsCount: targetWordsCount.value,
            totalGridWords: totalGridWords.value
          })
        )
      },
      { deep: true }
    )
  }

  return {
    memorizeSeconds,
    delaySeconds,
    targetWordsCount,
    totalGridWords
  }
}
