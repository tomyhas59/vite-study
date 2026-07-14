import { useEffect, useMemo, useState } from 'react'
import { STUDY_DATA } from '../data/studyData.js'
import { extractMnemo, highlight, shuffle } from '../utils.js'

export default function StudyView({ selectedUnit, search, knownSet, toggleKnown }) {
  const [focusMode, setFocusMode] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [focusOrder, setFocusOrder] = useState([])
  const [focusIndex, setFocusIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const cards = useMemo(() => {
    const filter = search.trim().toLowerCase()
    const list = []
    STUDY_DATA.forEach((unit) => {
      if (selectedUnit !== 'all' && unit.id !== selectedUnit) return
      unit.cards.forEach((c) => {
        if (
          filter &&
          !c.t.toLowerCase().includes(filter) &&
          !c.d.toLowerCase().includes(filter)
        )
          return
        list.push({ id: unit.id + '::' + c.t, unitId: unit.id, unitTitle: unit.title, t: c.t, d: c.d })
      })
    })
    return list
  }, [selectedUnit, search])

  useEffect(() => {
    if (cards.length === 0) {
      setSelectedId(null)
      return
    }
    if (!cards.find((c) => c.id === selectedId)) {
      setSelectedId(cards[0].id)
    }
  }, [cards])

  useEffect(() => {
    setFocusOrder(cards.map((c) => c.id))
    setFocusIndex(0)
    setFlipped(false)
  }, [cards.length, selectedUnit, search])

  const selectedCard = cards.find((c) => c.id === selectedId) || cards[0]

  function startFocus() {
    setFocusOrder(shuffle(cards.map((c) => c.id)))
    setFocusIndex(0)
    setFlipped(false)
    setFocusMode(true)
  }

  function nextFocus() {
    setFlipped(false)
    setFocusIndex((i) => (i + 1) % focusOrder.length)
  }
  function prevFocus() {
    setFlipped(false)
    setFocusIndex((i) => (i - 1 + focusOrder.length) % focusOrder.length)
  }

  const focusCard = cards.find((c) => c.id === focusOrder[focusIndex])

  const unitLabel =
    selectedUnit === 'all'
      ? '전체 단원'
      : STUDY_DATA.find((u) => u.id === selectedUnit)?.title || ''

  if (cards.length === 0) {
    return (
      <div className="empty-state">
        <p>“{search}”에 해당하는 용어를 찾지 못했어요.</p>
      </div>
    )
  }

  return (
    <div className="study-view">
      <div className="study-toolbar">
        <div>
          <h2 className="study-title">{unitLabel}</h2>
          <p className="study-count">{cards.length}개 용어</p>
        </div>
        <div className="toolbar-actions">
          {focusMode ? (
            <button className="btn-secondary small" onClick={() => setFocusMode(false)}>
              ← 목록으로
            </button>
          ) : (
            <button className="btn-primary small" onClick={startFocus}>
              🔀 집중 암기 모드
            </button>
          )}
        </div>
      </div>

      {focusMode ? (
        <FocusCard
          card={focusCard}
          index={focusIndex}
          total={focusOrder.length}
          flipped={flipped}
          setFlipped={setFlipped}
          onNext={nextFocus}
          onPrev={prevFocus}
          known={focusCard ? knownSet.has(focusCard.id) : false}
          onToggleKnown={() => focusCard && toggleKnown(focusCard.id)}
        />
      ) : (
        <div className="master-detail">
          <div className="term-list-panel">
            {cards.map((c) => (
              <button
                key={c.id}
                className={'term-row' + (c.id === selectedId ? ' active' : '')}
                onClick={() => setSelectedId(c.id)}
              >
                <span className="term-row-name">{renderHighlighted(c.t, search)}</span>
                {knownSet.has(c.id) && <span className="dot-known" title="암기완료" />}
              </button>
            ))}
          </div>

          <DetailPanel
            card={selectedCard}
            search={search}
            known={selectedCard ? knownSet.has(selectedCard.id) : false}
            onToggleKnown={() => selectedCard && toggleKnown(selectedCard.id)}
            onPrev={() => {
              const idx = cards.findIndex((c) => c.id === selectedId)
              setSelectedId(cards[(idx - 1 + cards.length) % cards.length].id)
            }}
            onNext={() => {
              const idx = cards.findIndex((c) => c.id === selectedId)
              setSelectedId(cards[(idx + 1) % cards.length].id)
            }}
          />
        </div>
      )}
    </div>
  )
}

function renderHighlighted(text, filter) {
  const h = highlight(text, filter)
  if (typeof h === 'string') return h
  return (
    <>
      {h.before}
      <mark>{h.match}</mark>
      {h.after}
    </>
  )
}

function DetailPanel({ card, search, known, onToggleKnown, onPrev, onNext }) {
  if (!card) return <div className="detail-panel" />
  const { tag, rest } = extractMnemo(card.d)
  return (
    <div className="detail-panel">
      <div className="detail-top">
        <span className="detail-unit-tag">{card.unitTitle}</span>
        <button
          className={'mark-known-btn' + (known ? ' known' : '')}
          onClick={onToggleKnown}
        >
          {known ? '✓ 암기완료' : '암기 체크'}
        </button>
      </div>
      <h3 className="detail-term">{renderHighlighted(card.t, search)}</h3>
      {tag && <span className="mnemo-tag">{tag}</span>}
      <p className="detail-def">{renderHighlighted(rest, search)}</p>
      <div className="detail-nav">
        <button className="btn-secondary small" onClick={onPrev}>← 이전</button>
        <button className="btn-secondary small" onClick={onNext}>다음 →</button>
      </div>
    </div>
  )
}

function FocusCard({ card, index, total, flipped, setFlipped, onNext, onPrev, known, onToggleKnown }) {
  if (!card) return null
  const { tag, rest } = extractMnemo(card.d)
  return (
    <div className="focus-wrap">
      <p className="focus-progress">{index + 1} / {total}</p>
      <div className={'flashcard' + (flipped ? ' flipped' : '')} onClick={() => setFlipped((f) => !f)}>
        <div className="flashcard-inner">
          <div className="flashcard-face front">
            <span className="focus-unit-tag">{card.unitTitle}</span>
            <p className="flashcard-term">{card.t}</p>
            <p className="flip-hint">클릭해서 설명 보기</p>
          </div>
          <div className="flashcard-face back">
            {tag && <span className="mnemo-tag">{tag}</span>}
            <p className="flashcard-def">{rest}</p>
          </div>
        </div>
      </div>
      <div className="focus-controls">
        <button className="btn-secondary" onClick={onPrev}>← 이전</button>
        <button
          className={'mark-known-btn' + (known ? ' known' : '')}
          onClick={onToggleKnown}
        >
          {known ? '✓ 암기완료' : '암기 체크'}
        </button>
        <button className="btn-primary" onClick={onNext}>다음 →</button>
      </div>
    </div>
  )
}
