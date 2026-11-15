import { describe, expect, it } from 'vitest'
import { classifyError } from '../src/core/classifyError'
import { HttpError } from '../src/core/httpError'

describe('classifyError', () => {
  it('classifies an HttpError as "http"', () => {
    expect(classifyError(new HttpError(500))).toBe('http')
  })

  it('classifies a TimeoutError DOMException as "timeout"', () => {
    const error = new DOMException('The operation timed out.', 'TimeoutError')

    expect(classifyError(error)).toBe('timeout')
  })

  it('classifies an AbortError DOMException as "aborted"', () => {
    const error = new DOMException('The operation was aborted.', 'AbortError')

    expect(classifyError(error)).toBe('aborted')
  })

  it('classifies anything else as "network"', () => {
    expect(classifyError(new TypeError('Failed to fetch'))).toBe('network')
  })
})
