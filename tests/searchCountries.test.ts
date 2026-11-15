import { afterEach, describe, expect, it, vi } from 'vitest'
import { searchCountries } from '../src/core/searchCountries'
import { HttpError } from '../src/core/httpError'

function mockFetchOnce(response: {
  ok: boolean
  status: number
  json?: () => Promise<unknown>
}) {
  const fetchMock = vi.fn().mockResolvedValue(response)
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('searchCountries', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('requests the countries.dev endpoint with the encoded query', async () => {
    const fetchMock = mockFetchOnce({
      ok: true,
      status: 200,
      json: async () => [],
    })
    const signal = new AbortController().signal

    await searchCountries('san marino', signal)

    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toBe('https://countries.dev/name/san%20marino')
    expect(options).toMatchObject({ signal: expect.any(AbortSignal) })
  })

  it('resolves with the parsed JSON body when the response is ok', async () => {
    const data = [{ name: 'Spain' }]
    mockFetchOnce({ ok: true, status: 200, json: async () => data })

    const result = await searchCountries('spain', new AbortController().signal)

    expect(result).toEqual(data)
  })

  it('resolves with an empty array when the response status is 404', async () => {
    mockFetchOnce({ ok: false, status: 404 })

    const result = await searchCountries(
      'doesnotexist',
      new AbortController().signal,
    )

    expect(result).toEqual([])
  })

  it('throws an HttpError carrying the status for other non-ok responses', async () => {
    mockFetchOnce({ ok: false, status: 500 })

    await expect(
      searchCountries('spain', new AbortController().signal),
    ).rejects.toThrow(HttpError)
    await expect(
      searchCountries('spain', new AbortController().signal),
    ).rejects.toMatchObject({
      status: 500,
    })
  })
})
