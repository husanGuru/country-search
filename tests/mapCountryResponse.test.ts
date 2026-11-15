import { describe, expect, it } from 'vitest'
import { mapCountryResponse } from '../src/core/mapCountryResponse'
import type { RawCountry } from '../src/core/types'

const spain: RawCountry = {
  name: 'Spain',
  flag: '🇪🇸',
  capital: 'Madrid',
  region: 'Europe',
  population: 47351567,
  area: 505992,
  borders: ['AND', 'FRA', 'GIB', 'PRT', 'MAR'],
  flags: {
    png: 'https://flagcdn.com/w320/es.png',
    svg: 'https://flagcdn.com/es.svg',
  },
  languages: [
    { name: 'Spanish', iso639_1: 'es', iso639_2: 'spa', nativeName: 'Español' },
  ],
  currencies: [{ code: 'EUR', name: 'Euro', symbol: '€' }],
}

describe('mapCountryResponse', () => {
  it('maps the card and detail fields from the raw response', () => {
    const country = mapCountryResponse(spain)

    expect(country).toEqual({
      name: 'Spain',
      flag: 'https://flagcdn.com/es.svg',
      flagEmoji: '🇪🇸',
      capital: 'Madrid',
      region: 'Europe',
      population: 47351567,
      area: 505992,
      borders: ['AND', 'FRA', 'GIB', 'PRT', 'MAR'],
      languages: ['Spanish'],
      currencies: [{ code: 'EUR', name: 'Euro', symbol: '€' }],
    })
  })

  it('maps every language name into a flat string array', () => {
    const switzerland: RawCountry = {
      ...spain,
      name: 'Switzerland',
      languages: [
        {
          name: 'German',
          iso639_1: 'de',
          iso639_2: 'deu',
          nativeName: 'Deutsch',
        },
        {
          name: 'French',
          iso639_1: 'fr',
          iso639_2: 'fra',
          nativeName: 'français',
        },
        {
          name: 'Italian',
          iso639_1: 'it',
          iso639_2: 'ita',
          nativeName: 'italiano',
        },
      ],
    }

    const country = mapCountryResponse(switzerland)

    expect(country.languages).toEqual(['German', 'French', 'Italian'])
  })
})
