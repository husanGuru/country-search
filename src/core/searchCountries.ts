import { HttpError } from './httpError'
import type { RawCountry } from './types'

const BASE_URL = 'https://countries.dev/name'
const DEFAULT_TIMEOUT_MS = 10_000

export async function searchCountries(
  query: string,
  signal: AbortSignal,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<RawCountry[]> {
  const combinedSignal = AbortSignal.any([
    signal,
    AbortSignal.timeout(timeoutMs),
  ])

  const response = await fetch(`${BASE_URL}/${encodeURIComponent(query)}`, {
    signal: combinedSignal,
  })

  if (response.status === 404) {
    return []
  }

  if (!response.ok) {
    throw new HttpError(response.status)
  }

  return response.json() as Promise<RawCountry[]>
}
