import { STUDY_DATA } from '../data/studyData.js'

export default function Sidebar({
  mode,
  setMode,
  selectedUnit,
  setSelectedUnit,
  search,
  setSearch,
  knownCount,
  totalCount,
}) {
  const pct = totalCount ? Math.round((knownCount / totalCount) * 100) : 0

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">기</span>
        <div>
          <h1>합격노트</h1>
          <p>정보처리기사 실기</p>
        </div>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="용어 검색... (예: RAID, 응집도)"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            if (mode !== 'study') setMode('study')
            setSelectedUnit('all')
          }}
        />
      </div>

      <nav className="unit-nav">
        <div
          className={'unit-nav-item' + (selectedUnit === 'all' ? ' active' : '')}
          onClick={() => {
            setSelectedUnit('all')
            setMode('study')
          }}
        >
          <span>전체 단원</span>
          <span className="count">{totalCount}</span>
        </div>
        {STUDY_DATA.map((unit) => (
          <div
            key={unit.id}
            className={'unit-nav-item' + (selectedUnit === unit.id ? ' active' : '')}
            onClick={() => {
              setSelectedUnit(unit.id)
              setSearch('')
              setMode('study')
            }}
          >
            <span>{unit.id}. {unit.title}</span>
            <span className="count">{unit.cards.length}</span>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="stat-line">
          <span>학습한 용어</span>
          <strong>{knownCount}</strong>
        </div>
        <div className="stat-line">
          <span>전체 용어</span>
          <strong>{totalCount}</strong>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: pct + '%' }} />
        </div>
      </div>
    </aside>
  )
}
