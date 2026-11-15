const STORAGE_KEY = 'country-search:history'
const HISTORY_LIMIT = 8

export function addToHistory(history: string[], query: string): string[] {
  const trimmed = query.trim()

  if (trimmed === '') {
    return history
  }

  const withoutDuplicate = history.filter(
    (entry) => entry.toLowerCase() !== trimmed.toLowerCase(),
  )

  return [trimmed.toLowerCase(), ...withoutDuplicate].slice(0, HISTORY_LIMIT)
}

export function loadHistory(storage: Storage): string[] {
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }

    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed)
      ? parsed.filter((entry): entry is string => typeof entry === 'string')
      : []
  } catch {
    return []
  }
}

export function saveHistory(history: string[], storage: Storage): void {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(history))
  } catch {
    // localStorage can throw (quota exceeded, private mode) — history is a
    // nice-to-have, never worth failing the search over.
  }
}
