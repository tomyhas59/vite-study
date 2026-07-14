import { useMemo, useState } from 'react'
import { STUDY_DATA } from '../data/studyData.js'
import { extractMnemo, flattenCards, shuffle } from '../utils.js'

const ALL_CARDS = flattenCards(STUDY_DATA)
const COUNT_OPTIONS = [10, 20, 9999]

export default function QuizView({ addWrong, goToWrongNote }) {
  const [stage, setStage] = useState('setup') // setup | play | result
  const [unitFilter, setUnitFilter] = useState('all')
  const [count, setCount] = useState(10)
  const [queue, setQueue] = useState([])
  const [index, setIndex] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [chosen, setChosen] = useState(null)
  const [options, setOptions] = useState([])

  function startQuiz() {
    let pool = unitFilter === 'all' ? ALL_CARDS : ALL_CARDS.filter((c) => c.unitId === unitFilter)
    pool = shuffle(pool)
    const q = pool.slice(0, Math.min(count, pool.length))
    setQueue(q)
    setIndex(0)
    setCorrect(0)
    setChosen(null)
    setOptions(buildOptions(q[0]))
    setStage('play')
  }

  function buildOptions(correctCard) {
    if (!correctCard) return []
    let sameUnit = ALL_CARDS.filter((c) => c.unitId === correctCard.unitId && c.t !== correctCard.t)
    let distractors = shuffle(sameUnit).slice(0, 3)
    if (distractors.length < 3) {
      const extra = shuffle(ALL_CARDS.filter((c) => c.t !== correctCard.t && !distractors.includes(c))).slice(
        0,
        3 - distractors.length
      )
      distractors = distractors.concat(extra)
    }
    return shuffle([correctCard, ...distractors])
  }

  const current = queue[index]

  function pick(opt) {
    if (chosen) return
    setChosen(opt)
    if (opt.t === current.t) {
      setCorrect((c) => c + 1)
    } else {
      addWrong(current)
    }
  }

  function next() {
    if (index + 1 >= queue.length) {
      setStage('result')
      return
    }
    const ni = index + 1
    setIndex(ni)
    setChosen(null)
    setOptions(buildOptions(queue[ni]))
  }

  const pct = queue.length ? Math.round((index / queue.length) * 100) : 0

  return (
    <div className="quiz-view">
      {stage === 'setup' && (
        <div className="quiz-setup">
          <h2>실전 테스트 설정</h2>
          <p className="muted">
            설명을 보고 알맞은 용어를 고르세요. 두문자(암기) 표시가 있는 항목은 실기 서술형으로도 자주 나옵니다.
          </p>

          <div className="setup-row">
            <label>출제 범위</label>
            <select value={unitFilter} onChange={(e) => setUnitFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}>
              <option value="all">전체 단원</option>
              {STUDY_DATA.map((u) => (
                <option key={u.id} value={u.id}>{u.id}단원 · {u.title}</option>
              ))}
            </select>
          </div>

          <div className="setup-row">
            <label>문항 수</label>
            <div className="chip-group">
              {COUNT_OPTIONS.map((c) => (
                <button
                  key={c}
                  className={'chip' + (count === c ? ' selected' : '')}
                  onClick={() => setCount(c)}
                >
                  {c === 9999 ? '전체' : c + '문제'}
                </button>
              ))}
            </div>
          </div>

          <button className="btn-primary" onClick={startQuiz}>테스트 시작</button>
        </div>
      )}

      {stage === 'play' && current && (
        <div className="quiz-play">
          <div className="quiz-progress">
            <span>{index + 1} / {queue.length}</span>
            <div className="progress-track small">
              <div className="progress-fill" style={{ width: pct + '%' }} />
            </div>
          </div>

          <div className="quiz-card">
            <p className="quiz-eyebrow">이 설명에 해당하는 용어는?</p>
            <p className="quiz-question">{extractMnemo(current.d).rest}</p>
            <div className="quiz-options">
              {options.map((opt) => {
                let cls = 'quiz-option'
                if (chosen) {
                  if (opt.t === current.t) cls += ' correct'
                  else if (opt.t === chosen.t) cls += ' wrong'
                }
                return (
                  <button key={opt.id} className={cls} disabled={!!chosen} onClick={() => pick(opt)}>
                    {opt.t}
                  </button>
                )
              })}
            </div>
            {chosen && (
              <p className={'quiz-feedback ' + (chosen.t === current.t ? 'ok' : 'bad')}>
                {chosen.t === current.t ? '✓ 정답입니다!' : `✗ 오답 · 정답은 "${current.t}" 입니다.`}
              </p>
            )}
          </div>

          {chosen && (
            <button className="btn-primary" onClick={next}>
              {index + 1 >= queue.length ? '결과 보기' : '다음 문제 →'}
            </button>
          )}
        </div>
      )}

      {stage === 'result' && (
        <div className="quiz-result">
          <h2>테스트 결과</h2>
          <p className="score-big">
            <strong>{correct}</strong> <span>/ {queue.length}</span>
          </p>
          <p className="muted">{resultMessage(correct, queue.length)}</p>
          <div className="result-actions">
            <button className="btn-secondary" onClick={goToWrongNote}>오답노트 확인하기</button>
            <button className="btn-primary" onClick={() => setStage('setup')}>다시 테스트</button>
          </div>
        </div>
      )}
    </div>
  )
}

function resultMessage(correct, total) {
  const pct = total ? Math.round((correct / total) * 100) : 0
  if (pct === 100) return '완벽해요! 이 범위는 시험장에서도 걱정 없겠어요.'
  if (pct >= 80) return '아주 좋아요. 오답노트만 한 번 더 훑어보면 완벽할 것 같아요.'
  if (pct >= 50) return '절반 이상 맞혔어요. 오답노트를 활용해서 취약한 용어를 다시 채워보세요.'
  return '아직 낯선 용어가 많아요. 학습 모드의 두문자 암기 태그부터 다시 살펴보세요.'
}
