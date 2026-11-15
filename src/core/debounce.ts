export interface Debounced<Args extends unknown[]> {
  (...args: Args): void
  cancel(): void
}

export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delay: number,
): Debounced<Args> {
  let timer: ReturnType<typeof setTimeout> | undefined

  const debounced = (...args: Args) => {
    if (timer !== undefined) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => fn(...args), delay)
  }

  debounced.cancel = () => {
    if (timer !== undefined) {
      clearTimeout(timer)
      timer = undefined
    }
  }

  return debounced
}
