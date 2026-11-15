import type { Country } from '../core/types'

export function createFlag(country: Country, className: string): HTMLElement {
  const image = document.createElement('img')
  image.className = className
  image.src = country.flag
  image.alt = `Flag of ${country.name}`

  image.addEventListener(
    'error',
    () => {
      const emoji = document.createElement('span')
      emoji.className = `${className} ${className}--emoji`
      emoji.textContent = country.flagEmoji
      emoji.setAttribute('role', 'img')
      emoji.setAttribute('aria-label', `Flag of ${country.name}`)
      image.replaceWith(emoji)
    },
    { once: true },
  )

  return image
}
