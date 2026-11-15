import './style.css'
import { createCountrySearch, type SearchState } from './core/countrySearch'
import { searchCountries } from './core/searchCountries'
import type { ErrorKind } from './core/classifyError'
import type { Country } from './core/types'
import { createCountryCard } from './ui/countryCard'
import { createCountryDetail } from './ui/countryDetail'

const SEARCH_DELAY_MS = 400

const app = document.createElement('div')
app.className = 'app'
document.body.append(app)

const input = document.createElement('input')
input.type = 'search'
input.className = 'search-input'
input.placeholder = 'Search for a country…'
app.append(input)

const status = document.createElement('div')
status.className = 'status'
status.hidden = true
app.append(status)

const resultsList = document.createElement('ul')
resultsList.className = 'results'
app.append(resultsList)

function clearResults() {
  resultsList.replaceChildren()
}

function hideStatus() {
  status.hidden = true
  status.replaceChildren()
}

function errorMessage(kind: ErrorKind): string {
  switch (kind) {
    case 'timeout':
      return 'The request timed out.'
    case 'http':
      return 'Something went wrong on the server.'
    default:
      return 'Network error. Check your connection and try again.'
  }
}

function showStatus(text: string, kind: 'loading' | 'not-found' | 'error') {
  status.hidden = false
  status.className = `status status--${kind}`

  const message = document.createElement('p')
  message.textContent = text
  status.replaceChildren(message)

  if (kind === 'error') {
    const retryButton = document.createElement('button')
    retryButton.type = 'button'
    retryButton.textContent = 'Retry'
    retryButton.addEventListener('click', () => countrySearch.retry())
    status.append(retryButton)
  }
}

function handleDetailKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeDetail()
  }
}

function closeDetail() {
  document.querySelector('.detail-overlay')?.remove()
  document.removeEventListener('keydown', handleDetailKeydown)
}

function openDetail(country: Country) {
  const overlay = createCountryDetail(country, closeDetail)
  document.body.append(overlay)
  document.addEventListener('keydown', handleDetailKeydown)
}

function render(state: SearchState) {
  switch (state.status) {
    case 'idle':
      hideStatus()
      clearResults()
      break
    case 'loading':
      clearResults()
      showStatus('Loading…', 'loading')
      break
    case 'results':
      hideStatus()
      resultsList.replaceChildren(
        ...state.countries.map((country) =>
          createCountryCard(country, openDetail),
        ),
      )
      break
    case 'not-found':
      clearResults()
      showStatus('No countries found.', 'not-found')
      break
    case 'error':
      clearResults()
      showStatus(errorMessage(state.kind), 'error')
      break
  }
}

const countrySearch = createCountrySearch(
  { search: searchCountries },
  render,
  SEARCH_DELAY_MS,
)

input.addEventListener('input', () => {
  countrySearch.search(input.value)
})
