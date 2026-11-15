import { describe, expect, it, vi } from 'vitest'
import { createCachingSearch } from '../src/core/createCachingSearch'
import type { RawCountry } from '../src/core/types'

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

describe('createCachingSearch', () => {
  it('calls the wrapped search only once for a repeated query, then resolves from cache', async () => {
    const search = vi.fn().mockResolvedValue([rawSpain])
    const cachedSearch = createCachingSearch(search)

    const first = await cachedSearch('spain', new AbortController().signal)
    const second = await cachedSearch('spain', new AbortController().signal)

    expect(search).toHaveBeenCalledTimes(1)
    expect(first).toEqual([rawSpain])
    expect(second).toEqual([rawSpain])
  })

  it('treats differently-cased and padded queries as the same cache entry', async () => {
    const search = vi.fn().mockResolvedValue([rawSpain])
    const cachedSearch = createCachingSearch(search)

    await cachedSearch('Spain', new AbortController().signal)
    await cachedSearch('  spain  ', new AbortController().signal)

    expect(search).toHaveBeenCalledTimes(1)
  })

  it('reuses the same in-flight request for concurrent identical queries', async () => {
    const deferred = createDeferred<RawCountry[]>()
    const search = vi.fn().mockReturnValue(deferred.promise)
    const cachedSearch = createCachingSearch(search)

    const first = cachedSearch('spain', new AbortController().signal)
    const second = cachedSearch('spain', new AbortController().signal)

    deferred.resolve([rawSpain])

    await expect(first).resolves.toEqual([rawSpain])
    await expect(second).resolves.toEqual([rawSpain])
    expect(search).toHaveBeenCalledTimes(1)
  })

  it("aborting one caller's own signal does not break the shared in-flight request for another caller", async () => {
    const deferred = createDeferred<RawCountry[]>()
    const search = vi.fn().mockReturnValue(deferred.promise)
    const cachedSearch = createCachingSearch(search)

    const controllerA = new AbortController()
    const controllerB = new AbortController()

    const first = cachedSearch('spain', controllerA.signal)
    const second = cachedSearch('spain', controllerB.signal)

    controllerA.abort()
    deferred.resolve([rawSpain])

    await expect(first).rejects.toMatchObject({ name: 'AbortError' })
    await expect(second).resolves.toEqual([rawSpain])
    expect(search).toHaveBeenCalledTimes(1)
  })
})
