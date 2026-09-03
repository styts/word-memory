import { useState, watch } from '#imports'

const STORAGE_KEY = 'word_memory_settings'

export const useGameSettings = () => {
  const memorizeSeconds = useState<number>('memorizeSeconds', () => 5)
  const delaySeconds = useState<number>('delaySeconds', () => 3)
  const playSeconds = useState<number>('playSeconds', () => 15)
  const targetWordsCount = useState<number>('targetWordsCount', () => 4)
  const totalGridWords = useState<number>('totalGridWords', () => 12)
  const language = useState<string>('language', () => 'en')
  const fontSize = useState<string>('fontSize', () => 'medium')

  if (import.meta.client) {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (typeof parsed.memorizeSeconds === 'number') memorizeSeconds.value = parsed.memorizeSeconds
        if (typeof parsed.delaySeconds === 'number') delaySeconds.value = parsed.delaySeconds
        if (typeof parsed.playSeconds === 'number') playSeconds.value = parsed.playSeconds
        if (typeof parsed.targetWordsCount === 'number') targetWordsCount.value = parsed.targetWordsCount
        if (typeof parsed.totalGridWords === 'number') totalGridWords.value = parsed.totalGridWords
        if (typeof parsed.language === 'string') language.value = parsed.language
        if (typeof parsed.fontSize === 'string') fontSize.value = parsed.fontSize
      }
    } catch (e) {
      console.warn('Failed to read settings from localStorage:', e)
    }

    try {
      watch(
        [memorizeSeconds, delaySeconds, playSeconds, targetWordsCount, totalGridWords, language, fontSize],
        () => {
          try {
            localStorage.setItem(
              STORAGE_KEY,
              JSON.stringify({
                memorizeSeconds: memorizeSeconds.value,
                delaySeconds: delaySeconds.value,
                playSeconds: playSeconds.value,
                targetWordsCount: targetWordsCount.value,
                totalGridWords: totalGridWords.value,
                language: language.value,
                fontSize: fontSize.value
              })
            )
          } catch (e) {
            console.warn('Failed to save settings to localStorage:', e)
          }
        },
        { deep: true }
      )
    } catch (e) {}
  }

  return {
    memorizeSeconds,
    delaySeconds,
    playSeconds,
    targetWordsCount,
    totalGridWords,
    language,
    fontSize
  }
}
