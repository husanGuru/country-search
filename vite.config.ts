import { defineConfig } from 'vitest/config'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/country-search/' : '/',
  test: {
    passWithNoTests: true,
  },
}))
