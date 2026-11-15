import type { Country, RawCountry } from './types'

export function mapCountryResponse(raw: RawCountry): Country {
  return {
    name: raw.name,
    flag: raw.flags.svg,
    flagEmoji: raw.flag,
    capital: raw.capital,
    region: raw.region,
    population: raw.population,
    area: raw.area,
    borders: raw.borders,
    languages: raw.languages.map((language) => language.name),
    currencies: raw.currencies,
  }
}
