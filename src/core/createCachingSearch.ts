import type { RawCountry } from './types'

type Search = (query: string, signal: AbortSignal) => Promise<RawCountry[]>

function normalize(query: string): string {
  return query.trim().toLowerCase()
}

/**
 * Wraps a search function with a resolved-result cache and in-flight request
 * deduplication, keyed by a normalized query string.
 *
 * A caller's own AbortSignal only ever rejects *that caller's* returned
 * promise — it never touches the shared in-flight request, since other
 * callers may still be waiting on the exact same network call.
 */
export function createCachingSearch(search: Search): Search {
  const cache = new Map<string, RawCountry[]>()
  const inFlight = new Map<string, Promise<RawCountry[]>>()

  return function cachedSearch(
    query: string,
    callerSignal: AbortSignal,
  ): Promise<RawCountry[]> {
    const key = normalize(query)
    const cached = cache.get(key)

    if (cached) {
      return Promise.resolve(cached)
    }

    let shared = inFlight.get(key)

    if (!shared) {
      const controller = new AbortController()
      shared = search(query, controller.signal)
        .then((result) => {
          cache.set(key, result)
          return result
        })
        .finally(() => {
          inFlight.delete(key)
        })
      inFlight.set(key, shared)
    }

    return followCaller(shared, callerSignal)
  }
}

function followCaller<T>(shared: Promise<T>, signal: AbortSignal): Promise<T> {
  if (signal.aborted) {
    return Promise.reject(signal.reason)
  }

  return new Promise<T>((resolve, reject) => {
    const onAbort = () => reject(signal.reason)
    signal.addEventListener('abort', onAbort, { once: true })

    shared.then(
      (value) => {
        signal.removeEventListener('abort', onAbort)
        resolve(value)
      },
      (error: unknown) => {
        signal.removeEventListener('abort', onAbort)
        reject(error)
      },
    )
  })
}
