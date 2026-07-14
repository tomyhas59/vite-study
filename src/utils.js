// 두문자(암기) 태그 추출: "[생빌프로팩앱싱] 설명..." -> { tag, rest }
export function extractMnemo(def) {
  const m = def.match(/^\[([^\]]+)\]\s*/)
  if (!m) return { tag: null, rest: def }
  return { tag: m[1], rest: def.slice(m[0].length) }
}

export function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function flattenCards(studyData) {
  const all = []
  studyData.forEach((unit) => {
    unit.cards.forEach((card) => {
      all.push({
        id: unit.id + '::' + card.t,
        unitId: unit.id,
        unitTitle: unit.title,
        t: card.t,
        d: card.d,
      })
    })
  })
  return all
}

export function highlight(text, filter) {
  if (!filter) return text
  const idx = text.toLowerCase().indexOf(filter.toLowerCase())
  if (idx === -1) return text
  return {
    before: text.slice(0, idx),
    match: text.slice(idx, idx + filter.length),
    after: text.slice(idx + filter.length),
  }
}
