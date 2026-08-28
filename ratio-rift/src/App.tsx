import confetti from 'canvas-confetti'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { ChallengeMechanic } from './Mechanics'
import { challenges, isChallengeUnlocked, worlds, type Challenge } from './game'

const STORAGE_KEY = 'ratioRiftAge11V2'

type SaveState = {
  solved: number[]
  sound: boolean
  introSeen: boolean
}

const defaultSave: SaveState = { solved: [], sound: true, introSeen: false }

const loadSave = (): SaveState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultSave
    const parsed = JSON.parse(raw) as Partial<SaveState>
    return {
      solved: Array.isArray(parsed.solved)
        ? parsed.solved.filter((item): item is number => Number.isInteger(item) && item >= 1 && item <= 12)
        : [],
      sound: typeof parsed.sound === 'boolean' ? parsed.sound : true,
      introSeen: parsed.introSeen === true,
    }
  } catch {
    return defaultSave
  }
}

const App = () => {
  const initialSave = useRef(loadSave())
  const [solved, setSolved] = useState<number[]>(initialSave.current.solved)
  const [sound, setSound] = useState(initialSave.current.sound)
  const [showIntro, setShowIntro] = useState(!initialSave.current.introSeen)
  const [activeId, setActiveId] = useState<number | null>(null)
  const audioContext = useRef<AudioContext | null>(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ solved, sound, introSeen: !showIntro }))
  }, [solved, sound, showIntro])

  const playTone = (kind: 'success' | 'retry' | 'open') => {
    if (!sound) return
    const Context = window.AudioContext ?? window.webkitAudioContext
    if (!Context) return
    const context = audioContext.current ?? new Context()
    audioContext.current = context
    const notes = kind === 'success' ? [440, 554, 659] : kind === 'retry' ? [220, 196] : [330]
    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.type = kind === 'retry' ? 'triangle' : 'sine'
      oscillator.frequency.value = frequency
      gain.gain.setValueAtTime(0.0001, context.currentTime + index * 0.08)
      gain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + index * 0.08 + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + index * 0.08 + 0.18)
      oscillator.connect(gain).connect(context.destination)
      oscillator.start(context.currentTime + index * 0.08)
      oscillator.stop(context.currentTime + index * 0.08 + 0.2)
    })
  }

  const openChallenge = (id: number) => {
    if (!isChallengeUnlocked(id, solved)) return
    playTone('open')
    setActiveId(id)
  }

  const solveChallenge = (id: number) => {
    setSolved((current) => current.includes(id) ? current : [...current, id].sort((a, b) => a - b))
    playTone('success')
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      confetti({
        particleCount: id === 12 ? 140 : 70,
        spread: id === 12 ? 100 : 70,
        startVelocity: id === 12 ? 45 : 34,
        colors: ['#49e6c8', '#ffcf5a', '#ff7f95', '#9f8cff'],
        scalar: 0.9,
      })
    }
  }

  const resetProgress = () => {
    if (!window.confirm('Reset all 12 mission cores and start Ratio Rift again?')) return
    setSolved([])
    setActiveId(null)
    setShowIntro(true)
  }

  const activeChallenge = activeId === null ? null : challenges.find((challenge) => challenge.id === activeId) ?? null

  return (
    <div className="app-shell">
      <div className="star-field" aria-hidden="true">
        {Array.from({ length: 34 }, (_, index) => <i key={index} />)}
      </div>
      <TopBar
        solved={solved.length}
        sound={sound}
        onToggleSound={() => setSound((value) => !value)}
        onMap={() => setActiveId(null)}
        onReset={resetProgress}
        showMapButton={activeChallenge !== null}
      />

      <main id="main-content">
        <AnimatePresence mode="wait">
          {activeChallenge ? (
            <motion.div key={`challenge-${activeChallenge.id}`} initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -28 }}>
              <ChallengeRoom
                challenge={activeChallenge}
                alreadySolved={solved.includes(activeChallenge.id)}
                onSolve={() => solveChallenge(activeChallenge.id)}
                onMap={() => setActiveId(null)}
                onNext={() => {
                  if (activeChallenge.id < challenges.length) setActiveId(activeChallenge.id + 1)
                  else setActiveId(null)
                }}
                onRetryTone={() => playTone('retry')}
              />
            </motion.div>
          ) : (
            <motion.div key="map" initial={{ opacity: 0, x: -28 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 28 }}>
              <MissionMap solved={solved} onOpen={openChallenge} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showIntro && <Intro onStart={() => setShowIntro(false)} />}
      </AnimatePresence>
    </div>
  )
}

const TopBar = ({
  solved,
  sound,
  onToggleSound,
  onMap,
  onReset,
  showMapButton,
}: {
  solved: number
  sound: boolean
  onToggleSound: () => void
  onMap: () => void
  onReset: () => void
  showMapButton: boolean
}) => (
  <header className="top-bar">
    <a className="skip-link" href="#main-content">Skip to mission</a>
    <button type="button" className="brand" onClick={onMap} aria-label="Ratio Rift mission map">
      <span className="brand__mark" aria-hidden="true">R</span>
      <span><strong>RATIO RIFT</strong><small>PROPORTION ACADEMY</small></span>
    </button>
    <div className="top-bar__status">
      {showMapButton && <button type="button" className="icon-control icon-control--text" onClick={onMap}>Mission map</button>}
      <div className="core-count" aria-label={`${solved} of 12 star cores recovered`}>
        <span aria-hidden="true">✦</span><strong>{solved}</strong><small>/ 12</small>
      </div>
      <button type="button" className="icon-control" onClick={onToggleSound} aria-pressed={sound} aria-label={sound ? 'Turn sound off' : 'Turn sound on'}>
        <span aria-hidden="true">{sound ? '◖))' : '◖×'}</span>
      </button>
      <button type="button" className="icon-control" onClick={onReset} aria-label="Reset saved progress">
        <span aria-hidden="true">↺</span>
      </button>
    </div>
  </header>
)

const Intro = ({ onStart }: { onStart: () => void }) => (
  <motion.div className="intro-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <motion.section
      className="intro-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="intro-title"
      initial={{ opacity: 0, scale: 0.92, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
    >
      <div className="intro-orbit" aria-hidden="true">
        <motion.i animate={{ rotate: 360 }} transition={{ duration: 12, repeat: Infinity, ease: 'linear' }} />
        <span>R</span>
      </div>
      <p className="eyebrow">INCOMING TRANSMISSION</p>
      <h1 id="intro-title">The universe has slipped out of proportion.</h1>
      <p>
        Ratios control every fuel mix, map, and machine in the fleet. Recover 12 star cores by spotting the relationships hidden inside the numbers.
      </p>
      <div className="intro-rules">
        <span><b>01</b> Experiment</span>
        <span><b>02</b> Test your idea</span>
        <span><b>03</b> Use hints freely</span>
      </div>
      <button type="button" className="primary-action primary-action--large" onClick={onStart} autoFocus>
        <span>Enter the Rift</span><span aria-hidden="true">→</span>
      </button>
      <small>No timer. No lost lives. Progress saves on this device.</small>
    </motion.section>
  </motion.div>
)

const MissionMap = ({ solved, onOpen }: { solved: number[]; onOpen: (id: number) => void }) => {
  const nextId = challenges.find((challenge) => !solved.includes(challenge.id))?.id ?? 12
  const allSolved = solved.length === 12
  return (
    <section className="mission-map" aria-labelledby="map-title">
      <div className="map-heading">
        <div>
          <p className="eyebrow">STARSHIP NAVIGATION</p>
          <h1 id="map-title">Choose your next mission</h1>
        </div>
        <p>{allSolved ? 'The Ratio Rift is sealed. Every mission remains open for replay.' : 'All sectors are open. Start anywhere and recover the star cores in any order.'}</p>
      </div>

      <div className="world-grid">
        {worlds.map((world, worldIndex) => {
          const missions = challenges.filter((challenge) => challenge.world === world.id)
          const complete = missions.every((mission) => solved.includes(mission.id))
          return (
            <motion.article
              className={`world-card world-card--${world.id}`}
              style={{ '--world': world.color } as React.CSSProperties}
              key={world.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: worldIndex * 0.08 }}
            >
              <div className="world-card__heading">
                <span className="world-card__icon" aria-hidden="true">{world.icon}</span>
                <div><small>SECTOR {worldIndex + 1}</small><h2>{world.label}</h2><p>{world.eyebrow}</p></div>
                {complete && <span className="world-card__complete">COMPLETE</span>}
              </div>
              <div className="mission-path">
                {missions.map((mission) => {
                  const unlocked = isChallengeUnlocked(mission.id, solved)
                  const done = solved.includes(mission.id)
                  const current = mission.id === nextId && !allSolved
                  return (
                    <div className="mission-node-wrap" key={mission.id}>
                      <button
                        type="button"
                        className={`mission-node${done ? ' is-done' : ''}${current ? ' is-current' : ''}`}
                        disabled={!unlocked}
                        onClick={() => onOpen(mission.id)}
                        aria-label={`Mission ${mission.id}: ${mission.title}${done ? ', completed' : unlocked ? ', unlocked' : ', locked'}`}
                      >
                        <span className="mission-node__number">{done ? '✓' : unlocked ? mission.id : '·'}</span>
                        <span><strong>{mission.title}</strong><small>{mission.concept}</small></span>
                        <span className="mission-node__arrow" aria-hidden="true">→</span>
                      </button>
                    </div>
                  )
                })}
              </div>
            </motion.article>
          )
        })}
      </div>
    </section>
  )
}

const ChallengeRoom = ({
  challenge,
  alreadySolved,
  onSolve,
  onMap,
  onNext,
  onRetryTone,
}: {
  challenge: Challenge
  alreadySolved: boolean
  onSolve: () => void
  onMap: () => void
  onNext: () => void
  onRetryTone: () => void
}) => {
  const [status, setStatus] = useState<'idle' | 'retry' | 'success'>('idle')
  const [attempts, setAttempts] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const world = worlds.find((item) => item.id === challenge.world)!

  const onAttempt = (correct: boolean) => {
    if (correct) {
      setStatus('success')
      onSolve()
    } else {
      setAttempts((value) => value + 1)
      setStatus('retry')
      onRetryTone()
    }
  }

  return (
    <section className={`challenge-room challenge-room--${challenge.world}`} style={{ '--world': world.color } as React.CSSProperties} aria-labelledby="challenge-title">
      <div className="challenge-progress" aria-label={`Mission ${challenge.id} of 12`}>
        <span style={{ width: `${(challenge.id / 12) * 100}%` }} />
      </div>
      <div className="challenge-header">
        <div className="challenge-index"><small>MISSION</small><strong>{String(challenge.id).padStart(2, '0')}</strong></div>
        <div>
          <p className="eyebrow">{world.label.toUpperCase()} · {challenge.callSign}</p>
          <h1 id="challenge-title">{challenge.title}</h1>
          <p>{challenge.mission}</p>
        </div>
        {alreadySolved && <span className="replay-badge">REPLAY</span>}
      </div>

      <div className="challenge-console">
        <ChallengeMechanic kind={challenge.kind} onAttempt={onAttempt} disabled={status === 'success'} />
      </div>

      <div className="challenge-help">
        <button type="button" className="hint-button" onClick={() => setShowHint((value) => !value)} aria-expanded={showHint || attempts >= 2}>
          <span aria-hidden="true">?</span> {showHint || attempts >= 2 ? 'Hide mission hint' : 'Need a hint?'}
        </button>
        <AnimatePresence>
          {(showHint || attempts >= 2) && (
            <motion.p className="hint-text" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              {challenge.hint}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="feedback-region" aria-live="assertive">
        <AnimatePresence mode="wait">
          {status === 'retry' && (
            <motion.div className="feedback feedback--retry" key={`retry-${attempts}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <span className="feedback__icon" aria-hidden="true">↻</span>
              <div><strong>Good experiment—one relationship is still off.</strong><p>Change the model and test it again. After two tries, the mission hint opens automatically.</p></div>
              <button type="button" onClick={() => setStatus('idle')}>Keep adjusting</button>
            </motion.div>
          )}
          {status === 'success' && (
            <motion.div className="feedback feedback--success" key="success" initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}>
              <span className="feedback__icon" aria-hidden="true">✦</span>
              <div><strong>{challenge.id === 12 ? 'Rift sealed. Proportion restored.' : 'Star core recovered!'}</strong><p>{challenge.explanation}</p></div>
              <div className="feedback__actions">
                <button type="button" onClick={onMap}>Map</button>
                <button type="button" className="feedback__next" onClick={onNext}>{challenge.id === 12 ? 'View completed map' : 'Next mission →'}</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext
  }
}

export default App
