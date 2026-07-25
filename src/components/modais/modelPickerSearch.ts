export function normalizeModelQuery(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLocaleLowerCase('pt');
}

export function matchesModelQuery(label: string, query: string): boolean {
  return normalizeModelQuery(label).includes(normalizeModelQuery(query));
}
