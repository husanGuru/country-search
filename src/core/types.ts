export interface RawCountry {
  name: string
  capital: string
  region: string
  population: number
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
}

export interface Country {
  name: string
  flag: string
  capital: string
  region: string
  population: number
  languages: string[]
}
