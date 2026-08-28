import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'

type MechanicProps = {
  onAttempt: (correct: boolean) => void
  disabled?: boolean
}

type StepperProps = {
  label: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
  color?: 'cyan' | 'magenta' | 'violet'
}

const Stepper = ({ label, value, min, max, onChange, color = 'violet' }: StepperProps) => (
  <div className={`stepper stepper--${color}`}>
    <span className="stepper__label">{label}</span>
    <div className="stepper__controls">
      <button
        type="button"
        aria-label={`Remove one ${label}`}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
      >
        −
      </button>
      <output aria-live="polite">{value}</output>
      <button
        type="button"
        aria-label={`Add one ${label}`}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
      >
        +
      </button>
    </div>
  </div>
)

const CheckButton = ({ onClick, disabled, label = 'Test system' }: { onClick: () => void; disabled?: boolean; label?: string }) => (
  <button type="button" className="primary-action" onClick={onClick} disabled={disabled}>
    <span>{label}</span>
    <span aria-hidden="true">→</span>
  </button>
)

const FractionGrid = ({ onAttempt, disabled }: MechanicProps) => {
  const [selected, setSelected] = useState<number[]>([])

  const toggle = (cell: number) => {
    setSelected((current) =>
      current.includes(cell) ? current.filter((item) => item !== cell) : [...current, cell],
    )
  }

  return (
    <div className="mechanic mechanic--fraction">
      <div className="fraction-readout" aria-live="polite">
        <span>{selected.length}</span>
        <span className="fraction-readout__line" />
        <span>8</span>
      </div>
      <div className="cell-array" aria-label={`${selected.length} of 8 cells charged`}>
        {Array.from({ length: 8 }, (_, index) => (
          <motion.button
            type="button"
            key={index}
            aria-pressed={selected.includes(index)}
            aria-label={`Solar cell ${index + 1}${selected.includes(index) ? ', charged' : ', empty'}`}
            className={selected.includes(index) ? 'is-active' : ''}
            onClick={() => toggle(index)}
            animate={{ scale: selected.includes(index) ? 1.03 : 1 }}
            whileTap={{ scale: 0.94 }}
            disabled={disabled}
          >
            <span aria-hidden="true" />
          </motion.button>
        ))}
      </div>
      <p className="live-equation">{selected.length} selected ÷ 8 total = {Number(((selected.length / 8) * 100).toFixed(1))}%</p>
      <CheckButton onClick={() => onAttempt(selected.length === 3)} disabled={disabled} label="Power array" />
    </div>
  )
}

const RatioMixer = ({ onAttempt, disabled }: MechanicProps) => {
  const [cyan, setCyan] = useState(1)
  const [magenta, setMagenta] = useState(1)
  const total = cyan + magenta

  return (
    <div className="mechanic mechanic--mixer">
      <div className="mixer-visual" aria-label={`Tank with ${cyan} cyan and ${magenta} magenta units`}>
        <div className="mixer-visual__glass">
          <motion.div
            className="mixer-visual__cyan"
            animate={{ flexGrow: cyan }}
            transition={{ type: 'spring', stiffness: 150, damping: 20 }}
          />
          <motion.div
            className="mixer-visual__magenta"
            animate={{ flexGrow: magenta }}
            transition={{ type: 'spring', stiffness: 150, damping: 20 }}
          />
        </div>
        <div className="mixer-visual__ratio">
          <strong>{cyan} : {magenta}</strong>
          <span>{total} total units</span>
        </div>
      </div>
      <div className="stepper-row">
        <Stepper label="cyan ions" value={cyan} min={0} max={5} onChange={setCyan} color="cyan" />
        <Stepper label="magenta ions" value={magenta} min={0} max={5} onChange={setMagenta} color="magenta" />
      </div>
      <CheckButton onClick={() => onAttempt(cyan === 2 && magenta === 3)} disabled={disabled} label="Blend fuel" />
    </div>
  )
}

const MissingValue = ({ onAttempt, disabled }: MechanicProps) => {
  const [cells, setCells] = useState(12)
  return (
    <div className="mechanic">
      <div className="ratio-machine">
        <div className="ratio-card">
          <span>coils</span><strong>4</strong>
          <span>cells</span><strong>6</strong>
        </div>
        <div className="ratio-machine__beam">
          <span>same relationship</span>
          <span aria-hidden="true">⟷</span>
        </div>
        <div className="ratio-card ratio-card--live">
          <span>coils</span><strong>10</strong>
          <span>cells</span><strong>{cells}</strong>
        </div>
      </div>
      <label className="range-control">
        <span>Set the number of cells <output>{cells}</output></span>
        <input type="range" min="6" max="24" value={cells} onChange={(event) => setCells(Number(event.target.value))} disabled={disabled} />
      </label>
      <CheckButton onClick={() => onAttempt(cells === 15)} disabled={disabled} label="Amplify signal" />
    </div>
  )
}

const NumberLine = ({ onAttempt, disabled }: MechanicProps) => {
  const [percent, setPercent] = useState(50)
  return (
    <div className="mechanic">
      <div className="number-line-display" style={{ '--position': `${percent}%` } as React.CSSProperties}>
        <div className="number-line-display__beam" />
        <motion.div className="number-line-display__gate" animate={{ left: `${percent}%` }} transition={{ type: 'spring', stiffness: 180, damping: 25 }}>
          <strong>{percent}%</strong>
          <span>{(percent / 100).toFixed(2)}</span>
        </motion.div>
        <span className="number-line-display__start">0%</span>
        <span className="number-line-display__end">100%</span>
      </div>
      <label className="range-control">
        <span>Gate position <output>{percent}%</output></span>
        <input type="range" min="0" max="100" step="5" value={percent} onChange={(event) => setPercent(Number(event.target.value))} disabled={disabled} />
      </label>
      <CheckButton onClick={() => onAttempt(percent === 65)} disabled={disabled} label="Tune gate" />
    </div>
  )
}

const Equivalence = ({ onAttempt, disabled }: MechanicProps) => {
  const options = ['3/8', '37.5%', '3/5', '62.5%']
  const [selected, setSelected] = useState<string[]>([])

  const toggle = (option: string) => {
    setSelected((current) =>
      current.includes(option)
        ? current.filter((item) => item !== option)
        : current.length < 2
          ? [...current, option]
          : [current[1], option],
    )
  }

  return (
    <div className="mechanic">
      <div className="signal-origin">
        <span>source decimal</span>
        <strong>0.375</strong>
      </div>
      <div className="equivalence-grid">
        {options.map((option) => (
          <motion.button
            type="button"
            key={option}
            aria-pressed={selected.includes(option)}
            className={selected.includes(option) ? 'is-selected' : ''}
            onClick={() => toggle(option)}
            whileTap={{ scale: 0.96 }}
            disabled={disabled}
          >
            <span className="equivalence-grid__glyph" aria-hidden="true">◈</span>
            <strong>{option}</strong>
            <span>{option.includes('%') ? 'percentage' : 'fraction'}</span>
          </motion.button>
        ))}
      </div>
      <p className="live-equation">Linked signals: {selected.length} / 2</p>
      <CheckButton
        onClick={() => onAttempt(selected.length === 2 && selected.includes('3/8') && selected.includes('37.5%'))}
        disabled={disabled || selected.length !== 2}
        label="Link signals"
      />
    </div>
  )
}

const CargoGrid = ({ onAttempt, disabled }: MechanicProps) => {
  const [selected, setSelected] = useState<number[]>([])
  const percentage = Math.round((selected.length / 24) * 1000) / 10
  const toggle = (pod: number) => {
    setSelected((current) => current.includes(pod) ? current.filter((item) => item !== pod) : [...current, pod])
  }
  return (
    <div className="mechanic">
      <div className="cargo-layout">
        <div className="cargo-grid" aria-label={`${selected.length} of 24 cargo pods marked`}>
          {Array.from({ length: 24 }, (_, index) => (
            <button
              type="button"
              key={index}
              aria-pressed={selected.includes(index)}
              aria-label={`Cargo pod ${index + 1}${selected.includes(index) ? ', medical' : ', unassigned'}`}
              className={selected.includes(index) ? 'is-medical' : ''}
              onClick={() => toggle(index)}
              disabled={disabled}
            >
              <span aria-hidden="true">{selected.includes(index) ? '+' : ''}</span>
            </button>
          ))}
        </div>
        <div className="cargo-meter">
          <span>reserved</span>
          <strong>{percentage}%</strong>
          <small>{selected.length} of 24</small>
        </div>
      </div>
      <CheckButton onClick={() => onAttempt(selected.length === 6)} disabled={disabled} label="Lock cargo" />
    </div>
  )
}

const UnitRate = ({ onAttempt, disabled }: MechanicProps) => {
  const choices = [5, 6, 9]
  const [choice, setChoice] = useState<number | null>(null)
  return (
    <div className="mechanic">
      <div className="pulse-track" aria-label="18 sectors split across 3 pulses">
        {[1, 2, 3].map((pulse) => (
          <div key={pulse}>
            <span>pulse {pulse}</span>
            <div>{Array.from({ length: 6 }, (_, index) => <i key={index} />)}</div>
          </div>
        ))}
      </div>
      <fieldset className="choice-row">
        <legend>Sectors per pulse</legend>
        {choices.map((item) => (
          <button type="button" key={item} aria-pressed={choice === item} className={choice === item ? 'is-selected' : ''} onClick={() => setChoice(item)} disabled={disabled}>
            <strong>{item}</strong><span>sectors</span>
          </button>
        ))}
      </fieldset>
      <CheckButton onClick={() => onAttempt(choice === 6)} disabled={disabled || choice === null} label="Calibrate drone" />
    </div>
  )
}

const BestDeal = ({ onAttempt, disabled }: MechanicProps) => {
  const offers = [
    { id: 'A', crystals: 6, cost: 18, unit: 3 },
    { id: 'B', crystals: 10, cost: 25, unit: 2.5 },
    { id: 'C', crystals: 15, cost: 42, unit: 2.8 },
  ]
  const [choice, setChoice] = useState<string | null>(null)
  const [scanner, setScanner] = useState(false)
  return (
    <div className="mechanic">
      <div className="deal-grid">
        {offers.map((offer) => (
          <button
            type="button"
            key={offer.id}
            aria-pressed={choice === offer.id}
            className={choice === offer.id ? 'is-selected' : ''}
            onClick={() => setChoice(offer.id)}
            disabled={disabled}
          >
            <span className="deal-grid__id">PACK {offer.id}</span>
            <span className="crystal-cluster" aria-hidden="true">{Array.from({ length: Math.min(offer.crystals, 10) }, (_, index) => <i key={index} />)}</span>
            <strong>{offer.crystals} crystals</strong>
            <span>{offer.cost} credits</span>
            <AnimatePresence>
              {scanner && (
                <motion.em initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  {offer.unit} each
                </motion.em>
              )}
            </AnimatePresence>
          </button>
        ))}
      </div>
      <button type="button" className="scanner-button" aria-pressed={scanner} onClick={() => setScanner((value) => !value)} disabled={disabled}>
        <span aria-hidden="true">⌁</span> {scanner ? 'Hide unit scanner' : 'Activate unit scanner'}
      </button>
      <CheckButton onClick={() => onAttempt(choice === 'B')} disabled={disabled || choice === null} label="Buy selected pack" />
    </div>
  )
}

const RatePrediction = ({ onAttempt, disabled }: MechanicProps) => {
  const [distance, setDistance] = useState(35)
  const jumps = Math.round(distance / 7)
  return (
    <div className="mechanic">
      <div className="orbit-jumps" aria-label={`${jumps} jumps of 7 megameters`}>
        {Array.from({ length: 8 }, (_, index) => (
          <motion.i key={index} animate={{ opacity: index < jumps ? 1 : 0.2, scale: index < jumps ? 1 : 0.7 }} />
        ))}
        <motion.span animate={{ left: `${Math.min(100, (jumps / 8) * 100)}%` }} aria-hidden="true">➤</motion.span>
      </div>
      <div className="rate-equation">
        <span><strong>7</strong><small>Mm / pulse</small></span>
        <b>×</b>
        <span><strong>8</strong><small>pulses</small></span>
        <b>=</b>
        <span className="rate-equation__answer"><strong>{distance}</strong><small>Mm</small></span>
      </div>
      <label className="range-control">
        <span>Predicted distance <output>{distance} Mm</output></span>
        <input type="range" min="7" max="70" step="7" value={distance} onChange={(event) => setDistance(Number(event.target.value))} disabled={disabled} />
      </label>
      <CheckButton onClick={() => onAttempt(distance === 56)} disabled={disabled} label="Plot escape burn" />
    </div>
  )
}

const ScaleBlueprint = ({ onAttempt, disabled }: MechanicProps) => {
  const [width, setWidth] = useState(7)
  const [height, setHeight] = useState(5)
  return (
    <div className="mechanic">
      <div className="blueprint-stage">
        <div className="blueprint-stage__original" style={{ width: '150px', height: '100px' }}>
          <span>6 × 4</span><small>original</small>
        </div>
        <span className="blueprint-stage__factor">× 1.5</span>
        <motion.div
          className="blueprint-stage__scaled"
          animate={{ width: width * 20, height: height * 20 }}
          transition={{ type: 'spring', stiffness: 160, damping: 22 }}
        >
          <span>{width} × {height}</span><small>scaled</small>
        </motion.div>
      </div>
      <div className="stepper-row">
        <Stepper label="new width" value={width} min={4} max={12} onChange={setWidth} />
        <Stepper label="new height" value={height} min={3} max={10} onChange={setHeight} />
      </div>
      <CheckButton onClick={() => onAttempt(width === 9 && height === 6)} disabled={disabled} label="Forge panel" />
    </div>
  )
}

const MapScale = ({ onAttempt, disabled }: MechanicProps) => {
  const [distance, setDistance] = useState(30)
  return (
    <div className="mechanic">
      <div className="map-route" aria-label="Route of three and a half map tiles">
        <div className="map-route__grid" />
        <svg viewBox="0 0 620 180" role="img" aria-label="A glowing route crossing three and a half grid tiles">
          <path d="M60 135 C130 40 205 48 270 110 S405 160 460 77 S530 58 570 80" />
          <circle cx="60" cy="135" r="8" />
          <circle cx="570" cy="80" r="8" />
        </svg>
        <span className="map-route__scale">1 tile = 12 km</span>
        <span className="map-route__length">route = 3.5 tiles</span>
      </div>
      <label className="range-control">
        <span>Real route distance <output>{distance} km</output></span>
        <input type="range" min="6" max="60" step="6" value={distance} onChange={(event) => setDistance(Number(event.target.value))} disabled={disabled} />
      </label>
      <CheckButton onClick={() => onAttempt(distance === 42)} disabled={disabled} label="Set navigation" />
    </div>
  )
}

const CoreSequence = ({ onAttempt, disabled }: MechanicProps) => {
  const [values, setValues] = useState(['', '', ''])
  const prompts = [
    ['A', 'Fuel : coolant = 3 : 5. Fuel is 24. Coolant?', 'units'],
    ['B', 'Reserve 25% of 80 power cells. How many?', 'cells'],
    ['C', '10 crystals cost 25 credits. Cost per crystal?', 'credits'],
  ]

  const update = (index: number, value: string) => {
    setValues((current) => current.map((item, itemIndex) => itemIndex === index ? value : item))
  }

  const correct = useMemo(
    () => Number(values[0]) === 40 && Number(values[1]) === 20 && Number(values[2]) === 2.5,
    [values],
  )

  return (
    <div className="mechanic">
      <div className="core-stage" aria-hidden="true">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 16, repeat: Infinity, ease: 'linear' }} />
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }} />
        <span>RIFT CORE</span>
      </div>
      <div className="sequence-grid">
        {prompts.map(([label, prompt, unit], index) => (
          <label key={label}>
            <span className="sequence-grid__label">SYSTEM {label}</span>
            <span>{prompt}</span>
            <span className="sequence-grid__input">
              <input
                type="number"
                inputMode="decimal"
                step={index === 2 ? '0.1' : '1'}
                value={values[index]}
                onChange={(event) => update(index, event.target.value)}
                disabled={disabled}
                aria-label={`Answer for system ${label}`}
              />
              <small>{unit}</small>
            </span>
          </label>
        ))}
      </div>
      <CheckButton onClick={() => onAttempt(correct)} disabled={disabled || values.some((value) => value === '')} label="Seal the rift" />
    </div>
  )
}

export const ChallengeMechanic = ({ kind, onAttempt, disabled }: MechanicProps & { kind: string }) => {
  switch (kind) {
    case 'fraction-grid': return <FractionGrid onAttempt={onAttempt} disabled={disabled} />
    case 'ratio-mixer': return <RatioMixer onAttempt={onAttempt} disabled={disabled} />
    case 'missing-value': return <MissingValue onAttempt={onAttempt} disabled={disabled} />
    case 'number-line': return <NumberLine onAttempt={onAttempt} disabled={disabled} />
    case 'equivalence': return <Equivalence onAttempt={onAttempt} disabled={disabled} />
    case 'cargo-grid': return <CargoGrid onAttempt={onAttempt} disabled={disabled} />
    case 'unit-rate': return <UnitRate onAttempt={onAttempt} disabled={disabled} />
    case 'best-deal': return <BestDeal onAttempt={onAttempt} disabled={disabled} />
    case 'rate-prediction': return <RatePrediction onAttempt={onAttempt} disabled={disabled} />
    case 'scale-blueprint': return <ScaleBlueprint onAttempt={onAttempt} disabled={disabled} />
    case 'map-scale': return <MapScale onAttempt={onAttempt} disabled={disabled} />
    case 'core-sequence': return <CoreSequence onAttempt={onAttempt} disabled={disabled} />
    default: return null
  }
}
