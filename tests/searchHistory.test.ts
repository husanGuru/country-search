import { describe, expect, it } from 'vitest'
import {
  addToHistory,
  loadHistory,
  saveHistory,
} from '../src/core/searchHistory'

describe('addToHistory', () => {
  it('adds a new query to the front of the list', () => {
    expect(addToHistory([], 'spain')).toEqual(['spain'])
    expect(addToHistory(['spain'], 'france')).toEqual(['france', 'spain'])
  })

  it('moves an already-present query to the front instead of duplicating it', () => {
    expect(addToHistory(['france', 'spain'], 'spain')).toEqual([
      'spain',
      'france',
    ])
  })

  it('treats differently-cased or padded queries as the same entry', () => {
    expect(addToHistory(['Spain'], '  spain  ')).toEqual(['spain'])
  })

  it('ignores an empty or whitespace-only query', () => {
    expect(addToHistory(['spain'], '   ')).toEqual(['spain'])
  })

  it('keeps at most 8 entries', () => {
    const full = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    expect(addToHistory(full, 'new')).toEqual([
      'new',
      'a',
      'b',
      'c',
      'd',
      'e',
      'f',
      'g',
    ])
  })
})

function createFakeStorage(): Storage {
  const data = new Map<string, string>()
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value)
    },
    removeItem: (key) => {
      data.delete(key)
    },
    clear: () => data.clear(),
    key: () => null,
    get length() {
      return data.size
    },
  }
}

describe('loadHistory / saveHistory', () => {
  it('round-trips a history list through storage', () => {
    const storage = createFakeStorage()

    saveHistory(['spain', 'france'], storage)

    expect(loadHistory(storage)).toEqual(['spain', 'france'])
  })

  it('returns an empty list when storage has nothing saved', () => {
    expect(loadHistory(createFakeStorage())).toEqual([])
  })

  it('returns an empty list instead of throwing on corrupted data', () => {
    const storage = createFakeStorage()
    storage.setItem('country-search:history', 'not json')

    expect(loadHistory(storage)).toEqual([])
  })
})
