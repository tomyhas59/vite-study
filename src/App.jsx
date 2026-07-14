import { useMemo, useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import StudyView from './components/StudyView.jsx'
import QuizView from './components/QuizView.jsx'
import WrongNoteView from './components/WrongNoteView.jsx'
import { STUDY_DATA } from './data/studyData.js'
import { flattenCards } from './utils.js'
import { useLocalStorage } from './hooks/useLocalStorage.js'

const ALL_CARDS = flattenCards(STUDY_DATA)

export default function App() {
  const [mode, setMode] = useState('study') // study | quiz | wrong
  const [selectedUnit, setSelectedUnit] = useState('all')
  const [search, setSearch] = useState('')

  const [knownArr, setKnownArr] = useLocalStorage('jpc_known_terms_v2', [])
  const knownSet = useMemo(() => new Set(knownArr), [knownArr])

  const [wrongMap, setWrongMap] = useLocalStorage('jpc_wrong_terms_v2', {})

  function toggleKnown(id) {
    setKnownArr((prev) => {
      const s = new Set(prev)
      if (s.has(id)) s.delete(id)
      else s.add(id)
      return [...s]
    })
  }

  function addWrong(card) {
    setWrongMap((prev) => ({ ...prev, [card.id]: card }))
  }

  function clearWrong() {
    if (confirm('오답노트를 전부 삭제할까요?')) {
      setWrongMap({})
    }
  }

  return (
    <div className="app">
      <Sidebar
        mode={mode}
        setMode={setMode}
        selectedUnit={selectedUnit}
        setSelectedUnit={setSelectedUnit}
        search={search}
        setSearch={setSearch}
        knownCount={knownSet.size}
        totalCount={ALL_CARDS.length}
      />

      <main className="main">
        <header className="top-tabs">
          <button className={'tab-btn' + (mode === 'study' ? ' active' : '')} onClick={() => setMode('study')}>
            📖 학습
          </button>
          <button className={'tab-btn' + (mode === 'quiz' ? ' active' : '')} onClick={() => setMode('quiz')}>
            ✏️ 실전 테스트
          </button>
          <button className={'tab-btn' + (mode === 'wrong' ? ' active' : '')} onClick={() => setMode('wrong')}>
            🔖 오답노트 {Object.keys(wrongMap).length > 0 && <span className="tab-badge">{Object.keys(wrongMap).length}</span>}
          </button>
        </header>

        {mode === 'study' && (
          <StudyView
            selectedUnit={selectedUnit}
            search={search}
            knownSet={knownSet}
            toggleKnown={toggleKnown}
          />
        )}
        {mode === 'quiz' && <QuizView addWrong={addWrong} goToWrongNote={() => setMode('wrong')} />}
        {mode === 'wrong' && <WrongNoteView wrongMap={wrongMap} clearWrong={clearWrong} />}
      </main>
    </div>
  )
}
