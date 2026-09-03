import en from './en.json'
import de from './de.json'
import ru from './ru.json'

export type WordItem = string | { word: string; article?: string }

export const wordPools: Record<string, WordItem[]> = {
  en,
  de,
  ru
}

export default wordPools
