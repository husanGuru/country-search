import type { Country } from '../core/types'
import { createFlag } from './flag'

function createRow(label: string, value: string): [HTMLElement, HTMLElement] {
  const dt = document.createElement('dt')
  dt.textContent = label

  const dd = document.createElement('dd')
  dd.textContent = value

  return [dt, dd]
}

export function createCountryDetail(
  country: Country,
  onClose: () => void,
): HTMLDivElement {
  const overlay = document.createElement('div')
  overlay.className = 'detail-overlay'
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      onClose()
    }
  })

  const panel = document.createElement('div')
  panel.className = 'detail-panel'
  overlay.append(panel)

  const closeButton = document.createElement('button')
  closeButton.type = 'button'
  closeButton.className = 'detail-panel__close'
  closeButton.textContent = 'Close'
  closeButton.addEventListener('click', onClose)
  panel.append(closeButton)

  panel.append(createFlag(country, 'detail-panel__flag'))

  const name = document.createElement('h2')
  name.textContent = country.name
  panel.append(name)

  const description = document.createElement('p')
  description.textContent =
    `${country.name} is a country in ${country.region}, with a population of ` +
    `${country.population.toLocaleString()} and an area of ${country.area.toLocaleString()} km².`
  panel.append(description)

  const list = document.createElement('dl')
  panel.append(list)

  const currencies = country.currencies
    .map((currency) => `${currency.name} (${currency.symbol ?? currency.code})`)
    .join(', ')

  list.append(
    ...createRow('Area', `${country.area.toLocaleString()} km²`),
    ...createRow('Languages', country.languages.join(', ')),
    ...createRow('Currencies', currencies || 'N/A'),
    ...createRow(
      'Borders',
      country.borders.length > 0 ? country.borders.join(', ') : 'None',
    ),
  )

  return overlay
}
