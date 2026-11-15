import type { Country } from '../core/types'
import { createFlag } from './flag'

export function createCountryCard(
  country: Country,
  onSelect: (country: Country) => void,
): HTMLLIElement {
  const card = document.createElement('li')
  card.className = 'card'
  card.tabIndex = 0

  card.append(createFlag(country, 'card__flag'))

  const name = document.createElement('h2')
  name.className = 'card__name'
  name.textContent = country.name
  card.append(name)

  const capital = document.createElement('p')
  capital.textContent = `Capital: ${country.capital}`
  card.append(capital)

  const region = document.createElement('p')
  region.textContent = `Region: ${country.region}`
  card.append(region)

  const population = document.createElement('p')
  population.textContent = `Population: ${country.population.toLocaleString()}`
  card.append(population)

  const select = () => onSelect(country)
  card.addEventListener('click', select)
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      select()
    }
  })

  return card
}
