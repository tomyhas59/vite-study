import { extractMnemo } from '../utils.js'

export default function WrongNoteView({ wrongMap, clearWrong }) {
  const entries = Object.values(wrongMap)

  return (
    <div className="wrong-view">
      <div className="wrong-header">
        <h2>오답노트</h2>
        {entries.length > 0 && (
          <button className="btn-secondary small" onClick={clearWrong}>전체 삭제</button>
        )}
      </div>

      {entries.length === 0 ? (
        <p className="muted">아직 틀린 문제가 없어요. 테스트를 먼저 진행해보세요.</p>
      ) : (
        <div className="wrong-list">
          {entries.map((item) => {
            const { tag, rest } = extractMnemo(item.d)
            return (
              <div className="term-card open" key={item.t}>
                <div className="term-head">
                  <span className="term-name">
                    {item.t} <span className="unit-inline">· {item.unitTitle}</span>
                  </span>
                </div>
                <div className="term-def">
                  {tag && <span className="mnemo-tag">{tag}</span>}
                  {rest}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
