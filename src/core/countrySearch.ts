import { debounce } from './debounce'
import { classifyError, type ErrorKind } from './classifyError'
import { mapCountryResponse } from './mapCountryResponse'
import type { Country, RawCountry } from './types'

export type SearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'results'; countries: Country[] }
  | { status: 'not-found' }
  | { status: 'error'; kind: ErrorKind }

export interface CountrySearchDeps {
  search: (query: string, signal: AbortSignal) => Promise<RawCountry[]>
}

export function createCountrySearch(
  { search }: CountrySearchDeps,
  onStateChange: (state: SearchState) => void,
  delay = 400,
) {
  let controller: AbortController | undefined
  let lastQuery = ''

  const runSearch = async (query: string, signal: AbortSignal) => {
    onStateChange({ status: 'loading' })

    try {
      const raw = await search(query, signal)

      if (raw.length === 0) {
        onStateChange({ status: 'not-found' })
        return
      }

      onStateChange({
        status: 'results',
        countries: raw.map(mapCountryResponse),
      })
    } catch (error) {
      const kind = classifyError(error)

      if (kind === 'aborted') {
        return
      }

      onStateChange({ status: 'error', kind })
    }
  }

  const debouncedRunSearch = debounce(runSearch, delay)

  function cancelPending(query: string) {
    lastQuery = query
    controller?.abort()

    if (query.trim() === '') {
      onStateChange({ status: 'idle' })
      return undefined
    }

    controller = new AbortController()
    return controller
  }

  function runCountrySearch(query: string) {
    const next = cancelPending(query)
    if (next) {
      debouncedRunSearch(query, next.signal)
    }
  }

  function searchNow(query: string) {
    const next = cancelPending(query)
    debouncedRunSearch.cancel()
    if (next) {
      void runSearch(query, next.signal)
    }
  }

  function retry() {
    runCountrySearch(lastQuery)
  }

  return { search: runCountrySearch, searchNow, retry }
}
