import { useState } from '#imports'

export const useGameSettings = () => {
  const memorizeSeconds = useState<number>('memorizeSeconds', () => 5)
  const targetWordsCount = useState<number>('targetWordsCount', () => 4)

  return {
    memorizeSeconds,
    targetWordsCount
  }
}
