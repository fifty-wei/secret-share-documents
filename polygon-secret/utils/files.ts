import fs from 'fs'

export function loadJSON(filename: string) {
  const file = fs.existsSync(filename) ? fs.readFileSync(filename).toString() : '{}'
  return JSON.parse(file)
}

export function saveJSON(filename: string, json: string) {
  return fs.writeFileSync(filename, JSON.stringify(json, null, 2))
}
