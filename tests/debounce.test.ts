import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { debounce } from '../src/core/debounce'

describe('debounce', () => {
  const delay = 500

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('does not call fn before the delay has passed', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, delay)

    debounced()
    vi.advanceTimersByTime(delay - 1)

    expect(fn).not.toHaveBeenCalled()
  })

  it('calls fn once the delay has passed', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, delay)

    debounced()
    vi.advanceTimersByTime(delay)

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('resets the timer on every call, collapsing rapid calls into one', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, delay)

    debounced()
    vi.advanceTimersByTime(delay - 1)
    debounced()
    vi.advanceTimersByTime(delay - 1)

    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('calls fn with the arguments from the last call', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, delay)

    debounced('sp')
    debounced('spain')
    vi.advanceTimersByTime(delay)

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('spain')
  })

  it('allows fn to run again on a later, separate call', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, delay)

    debounced()
    vi.advanceTimersByTime(delay)
    debounced()
    vi.advanceTimersByTime(delay)

    expect(fn).toHaveBeenCalledTimes(2)
  })
})
