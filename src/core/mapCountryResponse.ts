import type { Country, RawCountry } from './types'

export function mapCountryResponse(raw: RawCountry): Country {
  return {
    name: raw.name,
    flag: raw.flags.svg,
    capital: raw.capital,
    region: raw.region,
    population: raw.population,
    languages: raw.languages.map((language) => language.name),
  }
}
