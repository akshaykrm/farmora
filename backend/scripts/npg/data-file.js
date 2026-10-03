import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

export const DEFAULT_DATA_FILE = fileURLToPath(
  new URL('./npg-data.json', import.meta.url)
)

export const loadLegacyData = (filePath = DEFAULT_DATA_FILE) =>
  JSON.parse(readFileSync(filePath, 'utf8'))
