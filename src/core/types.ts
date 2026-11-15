export interface RawCurrency {
  code: string
  name: string
  symbol?: string
}

export interface RawCountry {
  name: string
  flag: string
  capital: string
  region: string
  population: number
  area: number
  borders: string[]
  flags: {
    png: string
    svg: string
  }
  languages: {
    name: string
    iso639_1: string
    iso639_2: string
    nativeName: string
  }[]
  currencies: RawCurrency[]
}

export interface Country {
  name: string
  flag: string
  flagEmoji: string
  capital: string
  region: string
  population: number
  area: number
  borders: string[]
  languages: string[]
  currencies: RawCurrency[]
}
