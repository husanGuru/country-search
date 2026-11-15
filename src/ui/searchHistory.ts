export function createHistoryList(
  history: string[],
  onSelect: (query: string) => void,
): HTMLUListElement {
  const list = document.createElement('ul')
  list.className = 'history'

  for (const query of history) {
    const item = document.createElement('li')

    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'history__item'
    button.textContent = query
    button.addEventListener('click', () => onSelect(query))

    item.append(button)
    list.append(item)
  }

  return list
}
