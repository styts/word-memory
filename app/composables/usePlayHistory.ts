import { useState, watch } from '#imports'

export interface PlayRecord {
  id: string
  timestamp: number
  score: number
  targetCount: number
  percent: number
  correctWords?: string[]
  wrongWords?: string[]
  targetWords?: string[]
  language?: string
  [key: string]: any
}

const STORAGE_KEY = 'word_memory_history'

export const usePlayHistory = () => {
  const history = useState<PlayRecord[]>('playHistory', () => [])

  if (import.meta.client) {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          history.value = parsed
        }
      }
    } catch (e) {
      console.warn('Failed to read play history from localStorage:', e)
    }

    try {
      watch(
        history,
        (newHistory) => {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory))
          } catch (e) {
            console.warn('Failed to save play history to localStorage:', e)
          }
        },
        { deep: true }
      )
    } catch (e) {}
  }

  function addPlayRecord(score: number, targetCount: number, details?: Record<string, any>) {
    const percent = targetCount > 0 ? Math.round((score / targetCount) * 100) : 0
    const record: PlayRecord = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      score,
      targetCount,
      percent,
      ...details
    }
    // Keep last 50 in storage max
    history.value = [...history.value, record].slice(-50)

    if (import.meta.client) {
      try {
        const config = useRuntimeConfig()
        const apiBase = config.public?.apiBase || 'https://htz.styts.com/word-memory-api'
        fetch(`${apiBase}/results`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record)
        }).catch((err) => {
          console.warn('Failed to submit play record to backend:', err)
        })
      } catch (e) {
        console.warn('Failed to send play result to API:', e)
      }
    }
  }

  function clearHistory() {
    history.value = []
  }

  return {
    history,
    addPlayRecord,
    clearHistory
  }
}
