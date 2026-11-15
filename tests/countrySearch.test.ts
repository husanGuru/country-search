import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createCountrySearch,
  type SearchState,
} from '../src/core/countrySearch'
import { mapCountryResponse } from '../src/core/mapCountryResponse'
import { HttpError } from '../src/core/httpError'
import type { RawCountry } from '../src/core/types'

const rawSpain: RawCountry = {
  name: 'Spain',
  capital: 'Madrid',
  region: 'Europe',
  population: 47351567,
  flags: {
    png: 'https://flagcdn.com/w320/es.png',
    svg: 'https://flagcdn.com/es.svg',
  },
  languages: [
    { name: 'Spanish', iso639_1: 'es', iso639_2: 'spa', nativeName: 'Español' },
  ],
}

function setup(
  search: (query: string, signal: AbortSignal) => Promise<RawCountry[]>,
) {
  const states: SearchState[] = []
  const countrySearch = createCountrySearch(
    { search },
    (state) => states.push(state),
    500,
  )
  return { ...countrySearch, states }
}

describe('createCountrySearch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('reports idle and does not search for an empty query', () => {
    const search = vi.fn()
    const { search: run, states } = setup(search)

    run('')

    expect(states).toEqual([{ status: 'idle' }])
    expect(search).not.toHaveBeenCalled()
  })

  it('waits out the debounce delay, then reports loading and the mapped results', async () => {
    const search = vi.fn().mockResolvedValue([rawSpain])
    const { search: run, states } = setup(search)

    run('spain')
    expect(states).toEqual([])

    await vi.advanceTimersByTimeAsync(500)

    expect(search).toHaveBeenCalledWith('spain', expect.any(AbortSignal))
    expect(states).toEqual([
      { status: 'loading' },
      { status: 'results', countries: [mapCountryResponse(rawSpain)] },
    ])
  })

  it('reports not-found when the search resolves with no matches', async () => {
    const search = vi.fn().mockResolvedValue([])
    const { search: run, states } = setup(search)

    run('doesnotexist')
    await vi.advanceTimersByTimeAsync(500)

    expect(states.at(-1)).toEqual({ status: 'not-found' })
  })

  it('reports an error with the classified kind for an HttpError', async () => {
    const search = vi.fn().mockRejectedValue(new HttpError(500))
    const { search: run, states } = setup(search)

    run('spain')
    await vi.advanceTimersByTimeAsync(500)

    expect(states.at(-1)).toEqual({ status: 'error', kind: 'http' })
  })

  it('does not report an error when the request was aborted', async () => {
    const search = vi
      .fn()
      .mockRejectedValue(new DOMException('aborted', 'AbortError'))
    const { search: run, states } = setup(search)

    run('spain')
    await vi.advanceTimersByTimeAsync(500)

    expect(states.some((state) => state.status === 'error')).toBe(false)
  })

  it('retry repeats the last entered query', async () => {
    const search = vi.fn().mockResolvedValue([rawSpain])
    const { search: run, retry } = setup(search)

    run('spain')
    await vi.advanceTimersByTimeAsync(500)
    search.mockClear()

    retry()
    await vi.advanceTimersByTimeAsync(500)

    expect(search).toHaveBeenCalledWith('spain', expect.any(AbortSignal))
  })
})
