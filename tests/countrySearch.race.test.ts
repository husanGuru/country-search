import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createCountrySearch,
  type SearchState,
} from '../src/core/countrySearch'
import { mapCountryResponse } from '../src/core/mapCountryResponse'
import type { RawCountry } from '../src/core/types'

const rawSp: RawCountry = {
  name: 'Sao Tome and Principe (stale)',
  flag: '🇸🇹',
  capital: 'Sao Tome',
  region: 'Africa',
  population: 219161,
  area: 964,
  borders: [],
  flags: { png: '', svg: '' },
  languages: [],
  currencies: [],
}

const rawSpain: RawCountry = {
  name: 'Spain',
  flag: '🇪🇸',
  capital: 'Madrid',
  region: 'Europe',
  population: 47351567,
  area: 505992,
  borders: ['AND', 'FRA', 'GIB', 'PRT', 'MAR'],
  flags: {
    png: 'https://flagcdn.com/w320/es.png',
    svg: 'https://flagcdn.com/es.svg',
  },
  languages: [
    { name: 'Spanish', iso639_1: 'es', iso639_2: 'spa', nativeName: 'Español' },
  ],
  currencies: [{ code: 'EUR', name: 'Euro', symbol: '€' }],
}

function createDeferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((res) => {
    resolve = res
  })
  return { promise, resolve }
}

describe('createCountrySearch — stale response race', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('discards an earlier request that resolves after a later one, via real cancellation', async () => {
    const spDeferred = createDeferred<RawCountry[]>()
    const spainDeferred = createDeferred<RawCountry[]>()

    // The mock genuinely reacts to the signal and rejects with AbortError on
    // abort() — otherwise this test could not tell real cancellation apart
    // from the app merely ignoring a stale response that still arrives.
    const search = vi.fn((query: string, signal: AbortSignal) => {
      const deferred = query === 'sp' ? spDeferred : spainDeferred

      return new Promise<RawCountry[]>((resolve, reject) => {
        if (signal.aborted) {
          reject(signal.reason)
          return
        }
        signal.addEventListener('abort', () => reject(signal.reason), {
          once: true,
        })
        deferred.promise.then(resolve)
      })
    })

    const states: SearchState[] = []
    const { search: run } = createCountrySearch(
      { search },
      (state) => states.push(state),
      500,
    )

    run('sp')
    await vi.advanceTimersByTimeAsync(500) // "sp" request is now in flight

    run('spain') // aborts the in-flight "sp" request
    await vi.advanceTimersByTimeAsync(500) // "spain" request is now in flight

    spainDeferred.resolve([rawSpain])
    await Promise.resolve()
    await Promise.resolve()

    // The stale "sp" response arrives last, after "spain" has already won —
    // but its request was already rejected by abort(), so this has no effect.
    spDeferred.resolve([rawSp])
    await Promise.resolve()
    await Promise.resolve()

    expect(states.at(-1)).toEqual({
      status: 'results',
      countries: [mapCountryResponse(rawSpain)],
    })
  })
})
