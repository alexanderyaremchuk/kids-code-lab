"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import {
  ArrowRight,
  BookOpen,
  FlipHorizontal2,
  RefreshCcw,
  RotateCw,
  Scale,
  Scissors,
  Sparkles,
  TrainFront,
  Undo2,
  Users,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

type GameId = "taxman" | "polyp" | "crossed" | "dots" | "sprouts" | "sim" | "factor" | "matchstick" | "domino" | "cutbloom" | "constellation" | "switchyard" | "balance";
type Player = 0 | 1;
type Point = [number, number];
type Edge = { a: Point; b: Point };

const GAME_INFO: Record<GameId, { number: string; title: string; kicker: string; blurb: string; rules: string[]; source: string }> = {
  taxman: {
    number: "01",
    title: "Taxman",
    kicker: "NUMBER HEIST",
    blurb: "Claim a number. The Taxman sweeps up every available factor. Can you finish richer?",
    rules: [
      "Choose any bright number that still has at least one available proper factor.",
      "You collect the chosen number. The Taxman immediately collects all of its available factors.",
      "When no legal choices remain, the Taxman takes every leftover number. Highest total wins.",
    ],
    source: "https://mathwithbaddrawings.com/wp-content/uploads/2026/03/b830c-game-22-taxman.pdf",
  },
  polyp: {
    number: "02",
    title: "Square Polyp",
    kicker: "TERRITORY TANGLE",
    blurb: "Drop six-legged shapes onto the dot grid. Close a region entirely in your ink to claim its territory.",
    rules: [
      "Players alternate placing one square polyp: a unit square plus two one-unit arms.",
      "Choose a shape, then rotate or flip it. Every line must stay on the grid and no line may overlap another.",
      "A closed region scores one point per little square when every edge around it is the same player’s color.",
    ],
    source: "https://mathwithbaddrawings.com/wp-content/uploads/2026/03/d051e-game-21-square-polyp.pdf",
  },
  crossed: {
    number: "03",
    title: "Crossed",
    kicker: "LINE DUEL",
    blurb: "Stretch a line between two unused pegs. Cross theirs for one point—or dare to cross your own for two.",
    rules: [
      "Players alternate connecting two unused dots with one straight line.",
      "The two dots must be on different sides of the square. Each dot can be used only once.",
      "Score 1 for each opponent line crossed and 2 for each of your own. The higher total after eight lines wins.",
    ],
    source: "https://mathwithbaddrawings.com/wp-content/uploads/2026/03/c6d5a-game-20-crossed.pdf",
  },
  dots: {
    number: "04",
    title: "Dots & Boxes",
    kicker: "CHAIN REACTION",
    blurb: "Draw one edge at a time. Close a box to claim it—and keep drawing while your chain continues.",
    rules: [
      "Players alternate drawing one horizontal or vertical line between neighboring dots.",
      "Complete the fourth side of a box to claim it and immediately take another turn.",
      "When every edge is drawn, the player who claimed more boxes wins.",
    ],
    source: "https://mathworld.wolfram.com/DotsandBoxes.html",
  },
  sprouts: {
    number: "05",
    title: "Sprouts",
    kicker: "ORGANIC SHOWDOWN",
    blurb: "Connect living dots with curling vines. Never cross a line, and never give a dot more than three branches.",
    rules: [
      "Start with three dots. Join two dots—or loop a dot back to itself—then add a new dot on the vine.",
      "Vines may never cross. No dot may have more than three branches connected to it.",
      "If you leave your opponent with no legal vine, you win.",
    ],
    source: "https://nrich.maths.org/games/sprouts",
  },
  sim: {
    number: "06",
    title: "Sim",
    kicker: "TRIANGLE TRAP",
    blurb: "Connect any two of six dots in your color—but completing your own triangle loses instantly.",
    rules: [
      "Players alternate connecting any two of the six dots; the same connection cannot be used twice.",
      "Dots may be reused and lines may cross. Only triangles whose corners are original dots count.",
      "The first player to complete a triangle entirely in their own color loses.",
    ],
    source: "https://beastacademy.com/playground/sim",
  },
  factor: {
    number: "07",
    title: "Factor Game",
    kicker: "NUMBER DUEL",
    blurb: "Pick a number for yourself. Your opponent captures every available proper factor—then gets to choose next.",
    rules: [
      "On your turn, claim one available number. Your opponent claims all of its available proper factors.",
      "If your choice has no available factors, you lose the choice and score nothing for it.",
      "When no number has an available factor, add the claimed numbers. Highest total wins.",
    ],
    source: "https://connectedmath.msu.edu/families/resources-for-families/math-games/factor-game.aspx",
  },
  matchstick: {
    number: "08",
    title: "Matchstick Metro",
    kicker: "SQUARE SHIFT",
    blurb: "Lift the exact number of matches and leave the requested number of squares. Every size counts.",
    rules: [
      "Each level starts with a complete grid of matchsticks. Tap a match to lift it; tap its pale outline to put it back.",
      "Lift exactly the number shown in the challenge and leave exactly the target number of complete squares.",
      "Squares of every size count. Solve the level to unlock the next station.",
    ],
    source: "https://store.doverpublications.com/products/9780486270784",
  },
  domino: {
    number: "09",
    title: "Domino Windows",
    kicker: "PIP BALANCE",
    blurb: "Flip the dominoes around the window until all four sides add to the same glowing total.",
    rules: [
      "Each window is framed by eight dominoes. Tap any domino to reverse its two halves.",
      "The three inward-facing values along each side make that side’s total. All four totals update after every flip.",
      "Make the top, right, bottom, and left totals equal to the target to open the window.",
    ],
    source: "https://store.doverpublications.com/products/9780486270784",
  },
  cutbloom: {
    number: "10",
    title: "Cut & Bloom",
    kicker: "PAPER DISSECTION",
    blurb: "Snip a paper shape along the grid with only a few straight cuts, then turn the pieces and rebuild the target silhouette.",
    rules: [
      "Tap the seams between paper cells to cut them. Every unbroken straight line of seams counts as one cut, and each level allows only a few.",
      "Cutting splits the paper into coloured pieces. Pick a piece, rotate or flip it, then tap a cell of the target silhouette: the piece's topmost-left cell lands there.",
      "Fill the whole silhouette with no overlaps and no pieces left over. Some levels also demand that every piece is the same shape.",
    ],
    source: "https://store.doverpublications.com/products/9780486270784",
  },
  constellation: {
    number: "11",
    title: "Constellation Sums",
    kicker: "STAR ARITHMETIC",
    blurb: "Hang numbered stones on the points of a constellation so that every glowing line adds up to the same total.",
    rules: [
      "Tap a stone in the tray, then tap an empty star to hang it there. Tap a hung stone to lift it back off, or tap two stars in a row to swap them.",
      "Each line shows a live total beside it. A line lights up when its stones add exactly to the target.",
      "Use every stone once. When all lines shine at the same time, the constellation is complete.",
    ],
    source: "https://store.doverpublications.com/products/9780486270784",
  },
  switchyard: {
    number: "12",
    title: "Switchyard",
    kicker: "SHUNTING PUZZLE",
    blurb: "Shunt railway cars through a tiny yard of sidings until the main line carries them in exactly the right order.",
    rules: [
      "Every track meets at the switch. Tap a track to couple the engine to the car nearest the switch, then tap another track to push that car onto it.",
      "A car always couples nearest the switch, in front of any cars already there. Sidings hold only a few cars—watch the capacity.",
      "Match the departure order shown on the main line. Beat or equal the par to earn a perfect shunt.",
    ],
    source: "https://store.doverpublications.com/products/9780486270784",
  },
  balance: {
    number: "13",
    title: "Balance Detective",
    kicker: "COIN MYSTERY",
    blurb: "One coin is a fake and weighs differently. Load the pans, weigh with care, and accuse the culprit in only a few weighings.",
    rules: [
      "Choose LEFT PAN or RIGHT PAN, then tap coins to load them. Tap a coin on a pan to send it back to the tray.",
      "Press WEIGH to see which pan sinks. Every weighing is logged so you can reason from the evidence.",
      "Switch to ACCUSE and tap the coin you suspect. You win if you are right without exceeding the allowed weighings.",
    ],
    source: "https://store.doverpublications.com/products/9780486270784",
  },
};

const QUICK_TIPS: Record<GameId, string> = {
  taxman: "Hover a number to preview the Taxman’s take.",
  polyp: "Watch the ghost shape before you place it.",
  crossed: "Long lines make points—and tempting targets.",
  dots: "Avoid drawing the third side of a box too early.",
  sprouts: "A dot with three branches is full and cannot grow again.",
  sim: "Before drawing, check every possible triangle in your color.",
  factor: "The biggest number is not always the most profitable choice.",
  matchstick: "Count the large squares too—not only the smallest ones.",
  domino: "A corner domino changes two sides at once.",
  cutbloom: "Cuts that stop halfway across are still cuts—plan where each one ends.",
  constellation: "Stars shared by two lines carry twice the weight—place the extremes there first.",
  switchyard: "Cars come off a track in the opposite order they went on.",
  balance: "Coins left off the scale are evidence too—if the pans balance, the fake is among them.",
};

const COLORS = ["#1c88e5", "#ff684d"] as const;

function useGameSound() {
  const [soundOn, setSoundOn] = useState(true);
  const contextRef = useRef<AudioContext | null>(null);

  const tone = useCallback((frequency = 440, duration = 0.08, delay = 0) => {
    if (!soundOn || typeof window === "undefined") return;
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = contextRef.current ?? new AudioContextClass();
    contextRef.current = context;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const start = context.currentTime + delay;
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.055, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }, [soundOn]);

  return { soundOn, setSoundOn, tone };
}

function fireWin(player: Player | null = null) {
  const palette = player === null ? ["#ffc53d", "#1c88e5", "#ff684d"] : [COLORS[player], "#ffc53d", "#fffdf7"];
  confetti({ particleCount: 95, spread: 74, origin: { y: 0.72 }, colors: palette, disableForReducedMotion: true });
}

export function Arcade() {
  const [game, setGame] = useState<GameId>("taxman");
  const [rulesOpen, setRulesOpen] = useState(false);
  const { soundOn, setSoundOn, tone } = useGameSound();
  const info = GAME_INFO[game];

  const selectGame = (next: GameId) => {
    setGame(next);
    setRulesOpen(false);
    tone(330 + Object.keys(GAME_INFO).indexOf(next) * 110, 0.07);
  };

  return (
    <main className="arcade-shell" id="top">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Pencil & Plot home">
          <span className="brand-mark">P&amp;P</span>
          <span>PENCIL &amp; PLOT</span>
        </a>
        <button className="sound-pill" type="button" onClick={() => setSoundOn((value) => !value)} aria-pressed={soundOn}>
          {soundOn ? <Volume2 size={15} strokeWidth={2.5} /> : <VolumeX size={15} strokeWidth={2.5} />}
          SOUND {soundOn ? "ON" : "OFF"}
        </button>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow">THIRTEEN TINY GAMES · ENDLESS CLEVER MOVES</p>
          <h1>Pick a game.<br />Outsmart the page.</h1>
          <p className="hero-copy">Classic pencil games, rebuilt as a bright little tabletop arcade.</p>
        </div>
        <div className="hero-doodle" aria-hidden="true">
          <span className="doodle-card card-one">12</span>
          <span className="doodle-card card-two">×2</span>
          <span className="doodle-spark">✦</span>
        </div>
      </section>

      <nav className="game-tabs" aria-label="Choose a game">
        {(Object.keys(GAME_INFO) as GameId[]).map((id) => (
          <button className={`game-tab ${game === id ? "active" : ""}`} type="button" onClick={() => selectGame(id)} key={id} aria-current={game === id ? "page" : undefined}>
            <span>{GAME_INFO[id].number}</span> {GAME_INFO[id].title}
          </button>
        ))}
      </nav>

      <section className={`game-card game-${game}`}>
        <div className="game-intro">
          <div>
            <p className="kicker">{info.kicker}</p>
            <AnimatePresence mode="wait" initial={false}>
              <motion.h2 key={game} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>{info.title}</motion.h2>
            </AnimatePresence>
          </div>
          <p>{info.blurb}</p>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div className="game-stage" key={game} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.22 }}>
            {game === "taxman" && <TaxmanGame tone={tone} />}
            {game === "polyp" && <PolypGame tone={tone} />}
            {game === "crossed" && <CrossedGame tone={tone} />}
            {game === "dots" && <DotsBoxesGame tone={tone} />}
            {game === "sprouts" && <SproutsGame tone={tone} />}
            {game === "sim" && <SimGame tone={tone} />}
            {game === "factor" && <FactorGame tone={tone} />}
            {game === "matchstick" && <MatchstickGame tone={tone} />}
            {game === "domino" && <DominoWindowsGame tone={tone} />}
            {game === "cutbloom" && <CutBloomGame tone={tone} />}
            {game === "constellation" && <ConstellationGame tone={tone} />}
            {game === "switchyard" && <SwitchyardGame tone={tone} />}
            {game === "balance" && <BalanceGame tone={tone} />}
          </motion.div>
        </AnimatePresence>

        <div className="game-footer">
          <p><strong>QUICK TIP</strong> {QUICK_TIPS[game]}</p>
          <button className="rules-button" type="button" onClick={() => setRulesOpen(true)}><BookOpen size={16} /> HOW TO PLAY</button>
        </div>
      </section>

      <footer className="site-footer">
        <span>BUILT FOR CURIOUS BRAINS</span>
        <span>PASS THE DEVICE · KEEP THE SCORE · REMATCH</span>
      </footer>

      <AnimatePresence>
        {rulesOpen && <RulesModal game={game} onClose={() => setRulesOpen(false)} />}
      </AnimatePresence>
    </main>
  );
}

function RulesModal({ game, onClose }: { game: GameId; onClose: () => void }) {
  const info = GAME_INFO[game];
  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [onClose]);

  return (
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
      <motion.section className="rules-modal" role="dialog" aria-modal="true" aria-labelledby="rules-title" initial={{ opacity: 0, y: 24, rotate: -1 }} animate={{ opacity: 1, y: 0, rotate: 0 }} exit={{ opacity: 0, y: 18 }} onMouseDown={(event) => event.stopPropagation()}>
        <button className="icon-button close-button" type="button" onClick={onClose} aria-label="Close rules"><X size={20} /></button>
        <p className="kicker">{info.kicker}</p>
        <h2 id="rules-title">How to play {info.title}</h2>
        <ol>{info.rules.map((rule) => <li key={rule}>{rule}</li>)}</ol>
        <a href={info.source} target="_blank" rel="noreferrer">READ THE ORIGINAL RULE SHEET ↗</a>
      </motion.section>
    </motion.div>
  );
}

type Tone = (frequency?: number, duration?: number, delay?: number) => void;
type TaxOwner = "p0" | "p1" | "tax";
type TaxSnapshot = { taken: Record<number, TaxOwner>; turn: Player; message: string; finished: boolean };

function properFactors(number: number, available: Set<number>) {
  return [...available].filter((candidate) => candidate < number && number % candidate === 0).sort((a, b) => a - b);
}

function TaxmanGame({ tone }: { tone: Tone }) {
  const [ceiling, setCeiling] = useState(18);
  const [mode, setMode] = useState<"solo" | "duo">("solo");
  const [taken, setTaken] = useState<Record<number, TaxOwner>>({});
  const [turn, setTurn] = useState<Player>(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const [message, setMessage] = useState("Choose a bright number to begin the heist.");
  const [finished, setFinished] = useState(false);
  const [history, setHistory] = useState<TaxSnapshot[]>([]);

  const numbers = useMemo(() => Array.from({ length: ceiling }, (_, index) => index + 1), [ceiling]);
  const available = useMemo(() => new Set(numbers.filter((number) => !taken[number])), [numbers, taken]);
  const legal = useMemo(() => new Set([...available].filter((number) => properFactors(number, available).length > 0)), [available]);
  const previewFactors = hovered && legal.has(hovered) ? properFactors(hovered, available) : [];
  const scores = numbers.reduce((result, number) => {
    const owner = taken[number];
    if (owner) result[owner] += number;
    return result;
  }, { p0: 0, p1: 0, tax: 0 });

  const reset = useCallback((nextCeiling = ceiling, nextMode = mode) => {
    setCeiling(nextCeiling);
    setMode(nextMode);
    setTaken({});
    setTurn(0);
    setHovered(null);
    setMessage("Choose a bright number to begin the heist.");
    setFinished(false);
    setHistory([]);
  }, [ceiling, mode]);

  const claim = (number: number) => {
    if (!legal.has(number) || finished) return;
    const factors = properFactors(number, available);
    const picker: TaxOwner = turn === 0 ? "p0" : "p1";
    const collector: TaxOwner = mode === "solo" ? "tax" : turn === 0 ? "p1" : "p0";
    const nextTaken = { ...taken, [number]: picker };
    factors.forEach((factor) => { nextTaken[factor] = collector; });
    setHistory((items) => [...items, { taken, turn, message, finished }]);
    tone(520, 0.08);
    factors.forEach((_, index) => tone(260 - index * 14, 0.06, 0.06 + index * 0.035));

    const remaining = new Set(numbers.filter((candidate) => !nextTaken[candidate]));
    const movesRemain = [...remaining].some((candidate) => properFactors(candidate, remaining).length > 0);
    if (!movesRemain) {
      const leftovers = [...remaining];
      const finalCollector: TaxOwner = mode === "solo" ? "tax" : collector;
      leftovers.forEach((leftover) => { nextTaken[leftover] = finalCollector; });
      setFinished(true);
      const nextScores = numbers.reduce((result, candidate) => {
        const owner = nextTaken[candidate];
        if (owner) result[owner] += candidate;
        return result;
      }, { p0: 0, p1: 0, tax: 0 });
      const winner = mode === "solo" ? nextScores.p0 > nextScores.tax : nextScores.p0 > nextScores.p1;
      setMessage(leftovers.length ? `${leftovers.length} unpickable number${leftovers.length === 1 ? "" : "s"} swept to the collector. Game over!` : "No legal moves remain. Game over!");
      if (winner) window.setTimeout(() => fireWin(0), 180);
    } else {
      setMessage(`${turn === 0 ? "Blue" : "Coral"} banked ${number}; ${factors.join(", ")} went to ${mode === "solo" ? "the Taxman" : "the other player"}.`);
      if (mode === "duo") setTurn((turn === 0 ? 1 : 0) as Player);
    }
    setTaken(nextTaken);
    setHovered(null);
  };

  const undo = () => {
    const previous = history.at(-1);
    if (!previous) return;
    setTaken(previous.taken);
    setTurn(previous.turn);
    setMessage(previous.message);
    setFinished(previous.finished);
    setHistory((items) => items.slice(0, -1));
    tone(210, 0.08);
  };

  const rightScore = mode === "solo" ? scores.tax : scores.p1;
  return (
    <div>
      <ScoreStrip leftLabel={mode === "solo" ? "YOU" : "BLUE"} left={scores.p0} center={finished ? "GAME OVER" : mode === "solo" ? "YOUR PICK" : `${turn === 0 ? "BLUE" : "CORAL"} TO PICK`} rightLabel={mode === "solo" ? "TAXMAN" : "CORAL"} right={rightScore} />
      <div className="game-toolbar">
        <div className="segmented" aria-label="Game mode">
          <button className={mode === "solo" ? "selected" : ""} type="button" onClick={() => reset(ceiling, "solo")}>SOLO</button>
          <button className={mode === "duo" ? "selected" : ""} type="button" onClick={() => reset(ceiling, "duo")}><Users size={14} /> 2 PLAYERS</button>
        </div>
        <label className="number-limit">BOARD
          <select value={ceiling} onChange={(event) => reset(Number(event.target.value), mode)} aria-label="Number ceiling">
            <option value="12">1–12</option><option value="18">1–18</option><option value="24">1–24</option>
          </select>
        </label>
        <div className="toolbar-actions">
          <button className="icon-button" type="button" onClick={undo} disabled={!history.length} aria-label="Undo last move"><Undo2 size={18} /></button>
          <button className="icon-button" type="button" onClick={() => reset()} aria-label="Restart Taxman"><RefreshCcw size={18} /></button>
        </div>
      </div>
      <div className={`number-board ceiling-${ceiling}`} aria-label="Taxman number board">
        {numbers.map((number) => {
          const owner = taken[number];
          const isFactor = previewFactors.includes(number);
          const isLegal = legal.has(number);
          return (
            <button className={`number-tile ${owner ? `claimed ${owner}` : isFactor ? "factor-preview" : isLegal ? "legal" : "stranded"}`} type="button" key={number} onClick={() => claim(number)} onMouseEnter={() => setHovered(number)} onMouseLeave={() => setHovered(null)} onFocus={() => setHovered(number)} onBlur={() => setHovered(null)} disabled={Boolean(owner) || !isLegal || finished} aria-label={owner ? `${number}, collected by ${owner === "p0" ? "blue" : owner === "p1" ? "coral" : "the Taxman"}` : isLegal ? `Claim ${number}; collector receives factors ${properFactors(number, available).join(", ")}` : `${number}, unavailable`}>
              <span>{number}</span>
              {owner === "tax" && <small className="tax-owner-badge">TAX</small>}
              {!owner && isFactor && <small>TAX</small>}
            </button>
          );
        })}
      </div>
      <StatusNote>{message}</StatusNote>
    </div>
  );
}

function ScoreStrip({ leftLabel, left, center, rightLabel, right }: { leftLabel: string; left: number; center: string; rightLabel: string; right: number }) {
  return <div className="score-strip"><div><span>{leftLabel}</span><motion.strong key={left} initial={{ scale: 1.3 }} animate={{ scale: 1 }}>{left}</motion.strong></div><div className="turn-chip">{center}</div><div className="right-score"><span>{rightLabel}</span><motion.strong key={right} initial={{ scale: 1.3 }} animate={{ scale: 1 }}>{right}</motion.strong></div></div>;
}

function StatusNote({ children }: { children: React.ReactNode }) {
  return <div className="status-note" role="status"><Sparkles size={16} /> <span>{children}</span></div>;
}

const BASE_SQUARE: Edge[] = [
  { a: [0, 0], b: [1, 0] }, { a: [1, 0], b: [1, 1] },
  { a: [1, 1], b: [0, 1] }, { a: [0, 1], b: [0, 0] },
];
const SHAPES: { name: string; arms: Edge[] }[] = [
  { name: "Corner", arms: [{ a: [-1, 0], b: [0, 0] }, { a: [0, -1], b: [0, 0] }] },
  { name: "Hook", arms: [{ a: [-1, 1], b: [0, 1] }, { a: [0, -1], b: [0, 0] }] },
  { name: "Bridge", arms: [{ a: [0, -1], b: [0, 0] }, { a: [0, 1], b: [0, 2] }] },
  { name: "Comet", arms: [{ a: [0, -1], b: [0, 0] }, { a: [1, 1], b: [1, 2] }] },
  { name: "Wing", arms: [{ a: [0, -1], b: [0, 0] }, { a: [1, 1], b: [2, 1] }] },
  { name: "Crown", arms: [{ a: [0, -1], b: [0, 0] }, { a: [1, -1], b: [1, 0] }] },
];

function transformPoint([x, y]: Point, rotation: number, flip: boolean): Point {
  let tx = flip ? 1 - x : x;
  let ty = y;
  for (let index = 0; index < rotation; index += 1) [tx, ty] = [1 - ty, tx];
  return [Math.round(tx), Math.round(ty)];
}

function shapeEdges(shape: number, rotation: number, flip: boolean, anchor: Point = [0, 0]): Edge[] {
  return [...BASE_SQUARE, ...SHAPES[shape].arms].map((edge) => {
    const a = transformPoint(edge.a, rotation, flip);
    const b = transformPoint(edge.b, rotation, flip);
    return { a: [a[0] + anchor[0], a[1] + anchor[1]], b: [b[0] + anchor[0], b[1] + anchor[1]] };
  });
}

function edgeKey(edge: Edge) {
  const left = `${edge.a[0]},${edge.a[1]}`;
  const right = `${edge.b[0]},${edge.b[1]}`;
  return left < right ? `${left}|${right}` : `${right}|${left}`;
}

function validPolyp(edges: Edge[], occupied: Map<string, Player>) {
  return edges.every((edge) => edge.a.every((value) => value >= 0 && value <= 8) && edge.b.every((value) => value >= 0 && value <= 8) && !occupied.has(edgeKey(edge)));
}

function cellEdge(x: number, y: number, direction: "top" | "right" | "bottom" | "left"): Edge {
  if (direction === "top") return { a: [x, y], b: [x + 1, y] };
  if (direction === "right") return { a: [x + 1, y], b: [x + 1, y + 1] };
  if (direction === "bottom") return { a: [x, y + 1], b: [x + 1, y + 1] };
  return { a: [x, y], b: [x, y + 1] };
}

function territories(occupied: Map<string, Player>) {
  const visited = new Set<string>();
  const result: { x: number; y: number; owner: Player }[] = [];
  const directions = [
    { dx: 0, dy: -1, edge: "top" }, { dx: 1, dy: 0, edge: "right" },
    { dx: 0, dy: 1, edge: "bottom" }, { dx: -1, dy: 0, edge: "left" },
  ] as const;
  for (let startY = 0; startY < 8; startY += 1) for (let startX = 0; startX < 8; startX += 1) {
    const startKey = `${startX},${startY}`;
    if (visited.has(startKey)) continue;
    const queue: Point[] = [[startX, startY]];
    const cells: Point[] = [];
    const boundaryOwners = new Set<Player>();
    let escapes = false;
    visited.add(startKey);
    while (queue.length) {
      const [x, y] = queue.shift()!;
      cells.push([x, y]);
      directions.forEach(({ dx, dy, edge }) => {
        const owner = occupied.get(edgeKey(cellEdge(x, y, edge)));
        if (owner !== undefined) { boundaryOwners.add(owner); return; }
        const nx = x + dx; const ny = y + dy;
        if (nx < 0 || nx >= 8 || ny < 0 || ny >= 8) { escapes = true; return; }
        const key = `${nx},${ny}`;
        if (!visited.has(key)) { visited.add(key); queue.push([nx, ny]); }
      });
    }
    if (!escapes && boundaryOwners.size === 1) {
      const owner = [...boundaryOwners][0];
      cells.forEach(([x, y]) => result.push({ x, y, owner }));
    }
  }
  return result;
}

function hasPolypMove(occupied: Map<string, Player>) {
  for (let shape = 0; shape < SHAPES.length; shape += 1) for (let rotation = 0; rotation < 4; rotation += 1) for (const flip of [false, true]) for (let y = 0; y < 8; y += 1) for (let x = 0; x < 8; x += 1) {
    if (validPolyp(shapeEdges(shape, rotation, flip, [x, y]), occupied)) return true;
  }
  return false;
}

function ShapeIcon({ shape, selected }: { shape: number; selected: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const context = canvas.getContext("2d"); if (!context) return;
    const edges = shapeEdges(shape, 0, false);
    const points = edges.flatMap((edge) => [edge.a, edge.b]);
    const minX = Math.min(...points.map((point) => point[0])); const maxX = Math.max(...points.map((point) => point[0]));
    const minY = Math.min(...points.map((point) => point[1])); const maxY = Math.max(...points.map((point) => point[1]));
    const scale = 16; const offsetX = 28 - ((minX + maxX) / 2) * scale; const offsetY = 27 - ((minY + maxY) / 2) * scale;
    context.clearRect(0, 0, 56, 54); context.strokeStyle = selected ? "#fffdf7" : "#1d201b"; context.lineWidth = 3.5; context.lineCap = "round";
    edges.forEach((edge) => { context.beginPath(); context.moveTo(offsetX + edge.a[0] * scale, offsetY + edge.a[1] * scale); context.lineTo(offsetX + edge.b[0] * scale, offsetY + edge.b[1] * scale); context.stroke(); });
  }, [shape, selected]);
  return <canvas ref={ref} width="56" height="54" aria-hidden="true" />;
}

type PolypMove = { edges: Edge[]; player: Player; shape: number };

function PolypGame({ tone }: { tone: Tone }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [moves, setMoves] = useState<PolypMove[]>([]);
  const [turn, setTurn] = useState<Player>(0);
  const [shape, setShape] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [flip, setFlip] = useState(false);
  const [hover, setHover] = useState<Point | null>([3, 3]);
  const [focusCell, setFocusCell] = useState<Point>([3, 3]);
  const [message, setMessage] = useState("Pick a polyp, rotate it, then place it on the grid.");
  const [finished, setFinished] = useState(false);
  const occupied = useMemo(() => {
    const map = new Map<string, Player>();
    moves.forEach((move) => move.edges.forEach((edge) => map.set(edgeKey(edge), move.player)));
    return map;
  }, [moves]);
  const claimed = useMemo(() => territories(occupied), [occupied]);
  const scores = claimed.reduce((totals, cell) => { totals[cell.owner] += 1; return totals; }, [0, 0]);
  const preview = hover ? shapeEdges(shape, rotation, flip, hover) : null;
  const previewValid = Boolean(preview && validPolyp(preview, occupied));

  const place = useCallback((anchor: Point) => {
    if (finished) return;
    const edges = shapeEdges(shape, rotation, flip, anchor);
    if (!validPolyp(edges, occupied)) { setMessage("That polyp touches the edge or overlaps an existing line. Try another spot."); tone(145, 0.1); return; }
    const nextMoves = [...moves, { edges, player: turn, shape }];
    const nextOccupied = new Map(occupied);
    edges.forEach((edge) => nextOccupied.set(edgeKey(edge), turn));
    const nextClaimed = territories(nextOccupied);
    const nextScores = nextClaimed.reduce((totals, cell) => { totals[cell.owner] += 1; return totals; }, [0, 0]);
    const gained = nextClaimed.filter((cell) => cell.owner === turn).length - claimed.filter((cell) => cell.owner === turn).length;
    setMoves(nextMoves);
    tone(gained ? 720 : 430, gained ? 0.13 : 0.07);
    setMessage(gained ? `${turn === 0 ? "Blue" : "Coral"} enclosed ${gained} new square${gained === 1 ? "" : "s"}!` : `${turn === 0 ? "Blue" : "Coral"} placed a ${SHAPES[shape].name}.`);
    if (!hasPolypMove(nextOccupied)) {
      setFinished(true);
      window.setTimeout(() => fireWin(nextScores[0] === nextScores[1] ? null : nextScores[0] > nextScores[1] ? 0 : 1), 180);
    } else setTurn((turn === 0 ? 1 : 0) as Player);
  }, [claimed, finished, flip, moves, occupied, rotation, shape, tone, turn]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const context = canvas.getContext("2d"); if (!context) return;
    const size = 640; const pad = 40; const step = 70;
    context.clearRect(0, 0, size, size);
    context.fillStyle = "#fffdf7"; context.fillRect(0, 0, size, size);
    claimed.forEach((cell) => { context.fillStyle = cell.owner === 0 ? "rgba(28,136,229,.16)" : "rgba(255,104,77,.16)"; context.fillRect(pad + cell.x * step + 5, pad + cell.y * step + 5, step - 10, step - 10); });
    const drawEdge = (edge: Edge, color: string, alpha = 1, dashed = false, width = 7) => {
      context.save(); context.globalAlpha = alpha; context.strokeStyle = color; context.lineWidth = width; context.lineCap = "round"; if (dashed) context.setLineDash([11, 8]);
      context.beginPath(); context.moveTo(pad + edge.a[0] * step, pad + edge.a[1] * step); context.lineTo(pad + edge.b[0] * step, pad + edge.b[1] * step); context.stroke(); context.restore();
    };
    moves.forEach((move) => move.edges.forEach((edge) => drawEdge(edge, COLORS[move.player])));
    if (preview) preview.forEach((edge) => drawEdge(edge, previewValid ? COLORS[turn] : "#c5c0b6", 0.5, true, 6));
    for (let y = 0; y < 9; y += 1) for (let x = 0; x < 9; x += 1) {
      context.beginPath(); context.arc(pad + x * step, pad + y * step, 4.2, 0, Math.PI * 2); context.fillStyle = "#1d201b"; context.fill();
    }
    context.strokeStyle = COLORS[turn]; context.lineWidth = 2; context.setLineDash([4, 4]);
    context.strokeRect(pad + focusCell[0] * step + 7, pad + focusCell[1] * step + 7, step - 14, step - 14); context.setLineDash([]);
  }, [claimed, focusCell, moves, preview, previewValid, turn]);

  const pointFromPointer = (event: React.PointerEvent<HTMLCanvasElement>): Point => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width * 640 - 40) / 70;
    const y = ((event.clientY - rect.top) / rect.height * 640 - 40) / 70;
    return [Math.max(0, Math.min(7, Math.floor(x))), Math.max(0, Math.min(7, Math.floor(y)))];
  };
  const reset = () => { setMoves([]); setTurn(0); setFinished(false); setMessage("Pick a polyp, rotate it, then place it on the grid."); tone(260, 0.08); };
  const undo = () => { const last = moves.at(-1); if (!last) return; setMoves((items) => items.slice(0, -1)); setTurn(last.player); setFinished(false); setMessage("Last polyp lifted off the page."); tone(210, 0.08); };
  const rotate = () => { setRotation((value) => (value + 1) % 4); tone(470, 0.05); };

  return (
    <div>
      <ScoreStrip leftLabel="BLUE" left={scores[0]} center={finished ? "GAME OVER" : `${turn === 0 ? "BLUE" : "CORAL"} TO DRAW`} rightLabel="CORAL" right={scores[1]} />
      <div className="draw-layout">
        <aside className="polyp-palette">
          <p>CHOOSE A POLYP</p>
          <div className="shape-grid">
            {SHAPES.map((item, index) => <button key={item.name} type="button" className={shape === index ? "selected" : ""} onClick={() => { setShape(index); tone(360 + index * 35, 0.05); }} aria-label={`Choose ${item.name} polyp`}><ShapeIcon shape={index} selected={shape === index} /><span>{item.name}</span></button>)}
          </div>
          <div className="transform-actions">
            <button type="button" onClick={rotate}><RotateCw size={17} /> ROTATE</button>
            <button type="button" className={flip ? "active" : ""} onClick={() => { setFlip((value) => !value); tone(390, 0.05); }}><FlipHorizontal2 size={17} /> FLIP</button>
          </div>
          <div className="toolbar-actions desktop-actions">
            <button className="icon-button" type="button" onClick={undo} disabled={!moves.length} aria-label="Undo last polyp"><Undo2 size={18} /></button>
            <button className="icon-button" type="button" onClick={reset} aria-label="Restart Square Polyp"><RefreshCcw size={18} /></button>
          </div>
        </aside>
        <div className="canvas-wrap polyp-canvas-wrap">
          <canvas ref={canvasRef} width="640" height="640" tabIndex={0} aria-label={`Square Polyp grid. ${turn === 0 ? "Blue" : "Coral"} to play. Arrow keys move the placement preview; Enter places.`} onPointerMove={(event) => { const point = pointFromPointer(event); setHover(point); setFocusCell(point); }} onPointerLeave={() => setHover(focusCell)} onPointerDown={(event) => place(pointFromPointer(event))} onKeyDown={(event) => {
            let [x, y] = focusCell;
            if (event.key === "ArrowLeft") x = Math.max(0, x - 1); else if (event.key === "ArrowRight") x = Math.min(7, x + 1); else if (event.key === "ArrowUp") y = Math.max(0, y - 1); else if (event.key === "ArrowDown") y = Math.min(7, y + 1); else if (event.key === "Enter" || event.key === " ") { event.preventDefault(); place(focusCell); return; } else return;
            event.preventDefault(); const point: Point = [x, y]; setFocusCell(point); setHover(point);
          }} />
        </div>
      </div>
      <StatusNote>{finished ? `No polyp fits. ${scores[0] === scores[1] ? "It’s a tie!" : `${scores[0] > scores[1] ? "Blue" : "Coral"} wins!`}` : message}</StatusNote>
    </div>
  );
}

type CrossLine = { a: number; b: number; player: Player; points: number };
const PEGS: { x: number; y: number; side: number }[] = [
  { x: 160, y: 60, side: 0 }, { x: 267, y: 60, side: 0 }, { x: 373, y: 60, side: 0 }, { x: 480, y: 60, side: 0 },
  { x: 580, y: 160, side: 1 }, { x: 580, y: 267, side: 1 }, { x: 580, y: 373, side: 1 }, { x: 580, y: 480, side: 1 },
  { x: 480, y: 580, side: 2 }, { x: 373, y: 580, side: 2 }, { x: 267, y: 580, side: 2 }, { x: 160, y: 580, side: 2 },
  { x: 60, y: 480, side: 3 }, { x: 60, y: 373, side: 3 }, { x: 60, y: 267, side: 3 }, { x: 60, y: 160, side: 3 },
];

function crossValue(a: typeof PEGS[number], b: typeof PEGS[number], c: typeof PEGS[number], d: typeof PEGS[number]) {
  const orient = (p: typeof a, q: typeof a, r: typeof a) => (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
  return orient(a, b, c) * orient(a, b, d) < 0 && orient(c, d, a) * orient(c, d, b) < 0;
}

function lineIntersection(a: typeof PEGS[number], b: typeof PEGS[number], c: typeof PEGS[number], d: typeof PEGS[number]) {
  const denominator = (a.x - b.x) * (c.y - d.y) - (a.y - b.y) * (c.x - d.x);
  if (!denominator) return null;
  const determinant1 = a.x * b.y - a.y * b.x; const determinant2 = c.x * d.y - c.y * d.x;
  return { x: (determinant1 * (c.x - d.x) - (a.x - b.x) * determinant2) / denominator, y: (determinant1 * (c.y - d.y) - (a.y - b.y) * determinant2) / denominator };
}

function CrossedGame({ tone }: { tone: Tone }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lines, setLines] = useState<CrossLine[]>([]);
  const [turn, setTurn] = useState<Player>(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [focusPeg, setFocusPeg] = useState(0);
  const [message, setMessage] = useState("Pick any peg, then connect it to a different side.");
  const used = useMemo(() => new Set(lines.flatMap((line) => [line.a, line.b])), [lines]);
  const scores = lines.reduce((totals, line) => { totals[line.player] += line.points; return totals; }, [0, 0]);
  const unusedSides = new Set(PEGS.map((peg, index) => used.has(index) ? null : peg.side).filter((side): side is number => side !== null));
  const finished = unusedSides.size < 2;

  const choose = useCallback((index: number) => {
    if (used.has(index) || finished) return;
    if (selected === null) { setSelected(index); setMessage("Now choose an unused peg on another side."); tone(390, 0.06); return; }
    if (selected === index) { setSelected(null); setMessage("Selection cleared. Pick a peg."); return; }
    if (PEGS[selected].side === PEGS[index].side) { setMessage("Those pegs share a side. Reach across the square instead."); tone(145, 0.1); return; }
    const crossings = lines.filter((line) => crossValue(PEGS[selected], PEGS[index], PEGS[line.a], PEGS[line.b]));
    const points = crossings.reduce((total, line) => total + (line.player === turn ? 2 : 1), 0);
    const nextLines = [...lines, { a: selected, b: index, player: turn, points }];
    const nextScores = [...scores];
    nextScores[turn] += points;
    setLines(nextLines); setSelected(null); setHovered(null);
    setMessage(points ? `${turn === 0 ? "Blue" : "Coral"} sliced through ${crossings.length} line${crossings.length === 1 ? "" : "s"} for ${points} point${points === 1 ? "" : "s"}!` : "Clean line—no crossings this turn.");
    tone(points ? 680 : 430, points ? 0.12 : 0.07); if (points > 1) tone(860, 0.1, 0.08);
    const nextUsed = new Set(nextLines.flatMap((line) => [line.a, line.b]));
    const sides = new Set(PEGS.map((peg, pegIndex) => nextUsed.has(pegIndex) ? null : peg.side).filter((side): side is number => side !== null));
    if (sides.size < 2) window.setTimeout(() => fireWin(nextScores[0] === nextScores[1] ? null : nextScores[0] > nextScores[1] ? 0 : 1), 180);
    else setTurn((turn === 0 ? 1 : 0) as Player);
  }, [finished, lines, scores, selected, tone, turn, used]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return; const context = canvas.getContext("2d"); if (!context) return;
    context.clearRect(0, 0, 640, 640); context.fillStyle = "#fffdf7"; context.fillRect(0, 0, 640, 640);
    context.strokeStyle = "#ded9cf"; context.lineWidth = 2; context.setLineDash([3, 10]); context.strokeRect(60, 60, 520, 520); context.setLineDash([]);
    lines.forEach((line) => {
      const a = PEGS[line.a]; const b = PEGS[line.b]; context.strokeStyle = COLORS[line.player]; context.lineWidth = 7; context.lineCap = "round"; context.globalAlpha = 0.88; context.beginPath(); context.moveTo(a.x, a.y); context.lineTo(b.x, b.y); context.stroke();
    });
    context.globalAlpha = 1;
    for (let first = 0; first < lines.length; first += 1) for (let second = first + 1; second < lines.length; second += 1) {
      const one = lines[first]; const two = lines[second]; if (!crossValue(PEGS[one.a], PEGS[one.b], PEGS[two.a], PEGS[two.b])) continue;
      const point = lineIntersection(PEGS[one.a], PEGS[one.b], PEGS[two.a], PEGS[two.b]); if (!point) continue;
      context.beginPath(); context.arc(point.x, point.y, 8, 0, Math.PI * 2); context.fillStyle = "#ffc53d"; context.fill(); context.strokeStyle = "#1d201b"; context.lineWidth = 2; context.stroke();
    }
    if (selected !== null && hovered !== null && !used.has(hovered) && PEGS[selected].side !== PEGS[hovered].side) {
      context.save(); context.strokeStyle = COLORS[turn]; context.lineWidth = 5; context.globalAlpha = 0.38; context.setLineDash([12, 9]); context.beginPath(); context.moveTo(PEGS[selected].x, PEGS[selected].y); context.lineTo(PEGS[hovered].x, PEGS[hovered].y); context.stroke(); context.restore();
    }
    PEGS.forEach((peg, index) => {
      context.beginPath(); context.arc(peg.x, peg.y, used.has(index) ? 7 : 10, 0, Math.PI * 2); context.fillStyle = used.has(index) ? "#aaa69d" : index === selected ? COLORS[turn] : "#1d201b"; context.fill();
      if (index === selected || index === focusPeg) { context.beginPath(); context.arc(peg.x, peg.y, 17, 0, Math.PI * 2); context.strokeStyle = index === selected ? COLORS[turn] : "#ffc53d"; context.lineWidth = 3; context.stroke(); }
    });
  }, [focusPeg, hovered, lines, selected, turn, used]);

  const nearestPeg = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect(); const x = (event.clientX - rect.left) / rect.width * 640; const y = (event.clientY - rect.top) / rect.height * 640;
    let nearest = -1; let distance = 30;
    PEGS.forEach((peg, index) => { const next = Math.hypot(peg.x - x, peg.y - y); if (next < distance) { nearest = index; distance = next; } });
    return nearest;
  };
  const undo = () => { const last = lines.at(-1); if (!last) return; setLines((items) => items.slice(0, -1)); setTurn(last.player); setSelected(null); setMessage("Last line erased."); tone(210, 0.08); };
  const reset = () => { setLines([]); setTurn(0); setSelected(null); setMessage("Pick any peg, then connect it to a different side."); tone(260, 0.08); };

  return (
    <div>
      <ScoreStrip leftLabel="BLUE" left={scores[0]} center={finished ? "GAME OVER" : `${turn === 0 ? "BLUE" : "CORAL"} TO DRAW`} rightLabel="CORAL" right={scores[1]} />
      <div className="crossed-layout">
        <div className="crossed-sidebar">
          <p className="mini-kicker">SCORING</p>
          <div className="score-rule"><span className="one-point">+1</span><p>cross an<br /><strong>opponent</strong></p></div>
          <div className="score-rule"><span className="two-points">+2</span><p>cross your<br /><strong>own line</strong></p></div>
          <div className="toolbar-actions desktop-actions">
            <button className="icon-button" type="button" onClick={undo} disabled={!lines.length} aria-label="Undo last line"><Undo2 size={18} /></button>
            <button className="icon-button" type="button" onClick={reset} aria-label="Restart Crossed"><RefreshCcw size={18} /></button>
          </div>
        </div>
        <div className="canvas-wrap crossed-canvas-wrap">
          <canvas ref={canvasRef} width="640" height="640" tabIndex={0} aria-label={`Crossed board. ${turn === 0 ? "Blue" : "Coral"} to play. Use left and right arrows to choose a peg, Enter to select.`} onPointerMove={(event) => { const index = nearestPeg(event); setHovered(index >= 0 ? index : null); if (index >= 0) setFocusPeg(index); }} onPointerLeave={() => setHovered(null)} onPointerDown={(event) => { const index = nearestPeg(event); if (index >= 0) choose(index); }} onKeyDown={(event) => {
            if (event.key === "ArrowRight" || event.key === "ArrowDown") { event.preventDefault(); setFocusPeg((value) => (value + 1) % PEGS.length); }
            else if (event.key === "ArrowLeft" || event.key === "ArrowUp") { event.preventDefault(); setFocusPeg((value) => (value + PEGS.length - 1) % PEGS.length); }
            else if (event.key === "Enter" || event.key === " ") { event.preventDefault(); choose(focusPeg); }
          }} />
        </div>
      </div>
      <StatusNote>{finished ? `${scores[0] === scores[1] ? "Perfect tie" : `${scores[0] > scores[1] ? "Blue" : "Coral"} wins`}—final score ${scores[0]}–${scores[1]}.` : message}</StatusNote>
    </div>
  );
}

type DotEdge = { orientation: "h" | "v"; x: number; y: number; player: Player };
type BoxClaim = { x: number; y: number; player: Player };
type DotsSnapshot = { edges: DotEdge[]; boxes: BoxClaim[]; turn: Player; message: string };
const DOT_EDGE_COUNT = 40;

function dotEdgeKey(edge: Pick<DotEdge, "orientation" | "x" | "y">) {
  return `${edge.orientation}:${edge.x}:${edge.y}`;
}

function boxIsClosed(x: number, y: number, edges: Set<string>) {
  return edges.has(`h:${x}:${y}`) && edges.has(`h:${x}:${y + 1}`) && edges.has(`v:${x}:${y}`) && edges.has(`v:${x + 1}:${y}`);
}

function DotsBoxesGame({ tone }: { tone: Tone }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [edges, setEdges] = useState<DotEdge[]>([]);
  const [boxes, setBoxes] = useState<BoxClaim[]>([]);
  const [turn, setTurn] = useState<Player>(0);
  const [hovered, setHovered] = useState<Omit<DotEdge, "player"> | null>(null);
  const [focusEdge, setFocusEdge] = useState(0);
  const [message, setMessage] = useState("Draw any edge between two neighboring dots.");
  const [history, setHistory] = useState<DotsSnapshot[]>([]);
  const occupied = useMemo(() => new Set(edges.map(dotEdgeKey)), [edges]);
  const allEdges = useMemo(() => {
    const result: Omit<DotEdge, "player">[] = [];
    for (let y = 0; y < 5; y += 1) for (let x = 0; x < 4; x += 1) result.push({ orientation: "h", x, y });
    for (let y = 0; y < 4; y += 1) for (let x = 0; x < 5; x += 1) result.push({ orientation: "v", x, y });
    return result;
  }, []);
  const scores = boxes.reduce((totals, box) => { totals[box.player] += 1; return totals; }, [0, 0]);
  const finished = edges.length === DOT_EDGE_COUNT;

  const playEdge = useCallback((candidate: Omit<DotEdge, "player">) => {
    if (finished || occupied.has(dotEdgeKey(candidate))) return;
    const edge: DotEdge = { ...candidate, player: turn };
    const nextEdges = [...edges, edge];
    const nextOccupied = new Set(nextEdges.map(dotEdgeKey));
    const adjacent: Point[] = candidate.orientation === "h"
      ? [[candidate.x, candidate.y - 1], [candidate.x, candidate.y]]
      : [[candidate.x - 1, candidate.y], [candidate.x, candidate.y]];
    const existingBoxes = new Set(boxes.map((box) => `${box.x},${box.y}`));
    const completed = adjacent.filter(([x, y]) => x >= 0 && x < 4 && y >= 0 && y < 4 && !existingBoxes.has(`${x},${y}`) && boxIsClosed(x, y, nextOccupied));
    const nextBoxes = [...boxes, ...completed.map(([x, y]) => ({ x, y, player: turn }))];
    setHistory((items) => [...items, { edges, boxes, turn, message }]);
    setEdges(nextEdges); setBoxes(nextBoxes);
    tone(completed.length ? 720 : 420, completed.length ? 0.12 : 0.06);
    if (completed.length) {
      setMessage(`${turn === 0 ? "Blue" : "Coral"} closed ${completed.length === 2 ? "two boxes" : "a box"} and draws again.`);
      if (completed.length === 2) tone(880, 0.1, 0.08);
    } else {
      setTurn((turn === 0 ? 1 : 0) as Player);
      setMessage(`${turn === 0 ? "Blue" : "Coral"} added an edge. Turn passes.`);
    }
    if (nextEdges.length === DOT_EDGE_COUNT) {
      const nextScores = nextBoxes.reduce((totals, box) => { totals[box.player] += 1; return totals; }, [0, 0]);
      window.setTimeout(() => fireWin(nextScores[0] === nextScores[1] ? null : nextScores[0] > nextScores[1] ? 0 : 1), 180);
    }
  }, [boxes, edges, finished, message, occupied, tone, turn]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return; const context = canvas.getContext("2d"); if (!context) return;
    const pad = 80; const step = 120;
    context.clearRect(0, 0, 640, 640); context.fillStyle = "#fffdf7"; context.fillRect(0, 0, 640, 640);
    boxes.forEach((box) => {
      context.fillStyle = box.player === 0 ? "rgba(28,136,229,.2)" : "rgba(255,104,77,.2)"; context.fillRect(pad + box.x * step + 8, pad + box.y * step + 8, step - 16, step - 16);
      context.fillStyle = COLORS[box.player]; context.font = "900 25px Georgia"; context.textAlign = "center"; context.textBaseline = "middle"; context.fillText(box.player === 0 ? "B" : "C", pad + (box.x + .5) * step, pad + (box.y + .5) * step);
    });
    const draw = (edge: Pick<DotEdge, "orientation" | "x" | "y">, color: string, alpha = 1, width = 8) => {
      const x1 = pad + edge.x * step; const y1 = pad + edge.y * step; const x2 = x1 + (edge.orientation === "h" ? step : 0); const y2 = y1 + (edge.orientation === "v" ? step : 0);
      context.save(); context.globalAlpha = alpha; context.strokeStyle = color; context.lineWidth = width; context.lineCap = "round"; context.beginPath(); context.moveTo(x1, y1); context.lineTo(x2, y2); context.stroke(); context.restore();
    };
    edges.forEach((edge) => draw(edge, COLORS[edge.player]));
    if (hovered && !occupied.has(dotEdgeKey(hovered))) draw(hovered, COLORS[turn], .42, 7);
    const keyboardEdge = allEdges[focusEdge]; if (keyboardEdge && !occupied.has(dotEdgeKey(keyboardEdge))) draw(keyboardEdge, "#ffc53d", .75, 4);
    for (let y = 0; y < 5; y += 1) for (let x = 0; x < 5; x += 1) { context.beginPath(); context.arc(pad + x * step, pad + y * step, 7, 0, Math.PI * 2); context.fillStyle = "#1d201b"; context.fill(); }
  }, [allEdges, boxes, edges, focusEdge, hovered, occupied, turn]);

  const edgeFromPointer = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect(); const px = (event.clientX - rect.left) / rect.width * 640; const py = (event.clientY - rect.top) / rect.height * 640; const pad = 80; const step = 120;
    let best: Omit<DotEdge, "player"> | null = null; let bestDistance = 25;
    allEdges.forEach((edge) => {
      const x1 = pad + edge.x * step; const y1 = pad + edge.y * step; const x2 = x1 + (edge.orientation === "h" ? step : 0); const y2 = y1 + (edge.orientation === "v" ? step : 0);
      const lengthSquared = (x2 - x1) ** 2 + (y2 - y1) ** 2; const amount = Math.max(0, Math.min(1, ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / lengthSquared));
      const distance = Math.hypot(px - (x1 + amount * (x2 - x1)), py - (y1 + amount * (y2 - y1)));
      if (distance < bestDistance) { best = edge; bestDistance = distance; }
    });
    return best;
  };
  const undo = () => { const previous = history.at(-1); if (!previous) return; setEdges(previous.edges); setBoxes(previous.boxes); setTurn(previous.turn); setMessage(previous.message); setHistory((items) => items.slice(0, -1)); tone(210, .08); };
  const reset = () => { setEdges([]); setBoxes([]); setTurn(0); setHistory([]); setMessage("Draw any edge between two neighboring dots."); tone(260, .08); };

  return <div>
    <ScoreStrip leftLabel="BLUE BOXES" left={scores[0]} center={finished ? "GAME OVER" : `${turn === 0 ? "BLUE" : "CORAL"} TO DRAW`} rightLabel="CORAL BOXES" right={scores[1]} />
    <div className="simple-canvas-layout">
      <div className="simple-game-sidebar"><p className="mini-kicker">BOX CHAIN</p><strong>{DOT_EDGE_COUNT - edges.length}</strong><span>edges remain</span><div className="toolbar-actions desktop-actions"><button className="icon-button" type="button" onClick={undo} disabled={!history.length} aria-label="Undo last edge"><Undo2 size={18} /></button><button className="icon-button" type="button" onClick={reset} aria-label="Restart Dots and Boxes"><RefreshCcw size={18} /></button></div></div>
      <div className="canvas-wrap"><canvas ref={canvasRef} width="640" height="640" tabIndex={0} aria-label={`Dots and Boxes board. ${turn === 0 ? "Blue" : "Coral"} to draw. Arrow keys move through edges; Enter draws.`} onPointerMove={(event) => setHovered(edgeFromPointer(event))} onPointerLeave={() => setHovered(null)} onPointerDown={(event) => { const edge = edgeFromPointer(event); if (edge) playEdge(edge); }} onKeyDown={(event) => { if (event.key === "ArrowRight" || event.key === "ArrowDown") { event.preventDefault(); setFocusEdge((value) => (value + 1) % allEdges.length); } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") { event.preventDefault(); setFocusEdge((value) => (value + allEdges.length - 1) % allEdges.length); } else if (event.key === "Enter" || event.key === " ") { event.preventDefault(); playEdge(allEdges[focusEdge]); } }} /></div>
    </div>
    <StatusNote>{finished ? `${scores[0] === scores[1] ? "It’s a tie" : `${scores[0] > scores[1] ? "Blue" : "Coral"} wins`}—${scores[0]} to ${scores[1]}.` : message}</StatusNote>
  </div>;
}

type CanvasPoint = { x: number; y: number };
type SproutNode = CanvasPoint & { degree: number };
type SproutCurve = { a: number; b: number; c1: CanvasPoint; c2: CanvasPoint; player: Player };
type SproutCandidate = { c1: CanvasPoint; c2: CanvasPoint; midpoint: CanvasPoint };
type SproutSnapshot = { nodes: SproutNode[]; curves: SproutCurve[]; turn: Player; message: string };

function cubicPoint(start: CanvasPoint, c1: CanvasPoint, c2: CanvasPoint, end: CanvasPoint, amount: number): CanvasPoint {
  const inverse = 1 - amount;
  return {
    x: inverse ** 3 * start.x + 3 * inverse ** 2 * amount * c1.x + 3 * inverse * amount ** 2 * c2.x + amount ** 3 * end.x,
    y: inverse ** 3 * start.y + 3 * inverse ** 2 * amount * c1.y + 3 * inverse * amount ** 2 * c2.y + amount ** 3 * end.y,
  };
}

function curveSamples(start: CanvasPoint, c1: CanvasPoint, c2: CanvasPoint, end: CanvasPoint, count = 28) {
  return Array.from({ length: count + 1 }, (_, index) => cubicPoint(start, c1, c2, end, index / count));
}

function segmentsCross(a: CanvasPoint, b: CanvasPoint, c: CanvasPoint, d: CanvasPoint) {
  const orient = (p: CanvasPoint, q: CanvasPoint, r: CanvasPoint) => (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
  return orient(a, b, c) * orient(a, b, d) < -0.01 && orient(c, d, a) * orient(c, d, b) < -0.01;
}

function findSproutCurve(a: number, b: number, nodes: SproutNode[], curves: SproutCurve[]): SproutCandidate | null {
  const start = nodes[a]; const end = nodes[b];
  if (!start || !end || (a === b ? start.degree > 1 : start.degree > 2 || end.degree > 2)) return null;
  const candidates: { c1: CanvasPoint; c2: CanvasPoint }[] = [];
  if (a === b) {
    for (let index = 0; index < 12; index += 1) {
      const angle = index * Math.PI / 6; const radius = 118;
      candidates.push({
        c1: { x: start.x + Math.cos(angle - .63) * radius, y: start.y + Math.sin(angle - .63) * radius },
        c2: { x: start.x + Math.cos(angle + .63) * radius, y: start.y + Math.sin(angle + .63) * radius },
      });
    }
  } else {
    const dx = end.x - start.x; const dy = end.y - start.y; const length = Math.max(1, Math.hypot(dx, dy)); const nx = -dy / length; const ny = dx / length;
    [0, 55, -55, 105, -105, 155, -155].forEach((offset) => candidates.push({
      c1: { x: start.x + dx / 3 + nx * offset, y: start.y + dy / 3 + ny * offset },
      c2: { x: start.x + dx * 2 / 3 + nx * offset, y: start.y + dy * 2 / 3 + ny * offset },
    }));
  }
  for (const candidate of candidates) {
    const samples = curveSamples(start, candidate.c1, candidate.c2, end);
    if (samples.some((point) => point.x < 35 || point.x > 605 || point.y < 35 || point.y > 605)) continue;
    const midpoint = cubicPoint(start, candidate.c1, candidate.c2, end, .5);
    if (nodes.some((node, index) => index !== a && index !== b && Math.hypot(node.x - midpoint.x, node.y - midpoint.y) < 25)) continue;
    if (samples.slice(2, -2).some((point) => nodes.some((node, index) => index !== a && index !== b && Math.hypot(node.x - point.x, node.y - point.y) < 15))) continue;
    let crossed = false;
    for (const curve of curves) {
      const existing = curveSamples(nodes[curve.a], curve.c1, curve.c2, nodes[curve.b]);
      for (let first = 0; first < samples.length - 1 && !crossed; first += 1) for (let second = 0; second < existing.length - 1; second += 1) {
        if (segmentsCross(samples[first], samples[first + 1], existing[second], existing[second + 1])) { crossed = true; break; }
      }
      if (crossed) break;
    }
    if (!crossed) return { ...candidate, midpoint };
  }
  return null;
}

function hasSproutMove(nodes: SproutNode[], curves: SproutCurve[]) {
  for (let a = 0; a < nodes.length; a += 1) for (let b = a; b < nodes.length; b += 1) if (findSproutCurve(a, b, nodes, curves)) return true;
  return false;
}

function SproutsGame({ tone }: { tone: Tone }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const initialNodes = useMemo<SproutNode[]>(() => [{ x: 190, y: 350, degree: 0 }, { x: 320, y: 205, degree: 0 }, { x: 465, y: 365, degree: 0 }], []);
  const [nodes, setNodes] = useState<SproutNode[]>(initialNodes);
  const [curves, setCurves] = useState<SproutCurve[]>([]);
  const [turn, setTurn] = useState<Player>(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [focusNode, setFocusNode] = useState(0);
  const [message, setMessage] = useState("Choose a dot, then choose where its vine should end.");
  const [finished, setFinished] = useState(false);
  const [history, setHistory] = useState<SproutSnapshot[]>([]);
  const preview = selected !== null && hovered !== null ? findSproutCurve(selected, hovered, nodes, curves) : null;
  const scores = curves.reduce((totals, curve) => { totals[curve.player] += 1; return totals; }, [0, 0]);

  const choose = useCallback((index: number) => {
    if (finished || nodes[index].degree >= 3) return;
    if (selected === null) { setSelected(index); setMessage("Choose another dot—or the same dot for a loop."); tone(390, .06); return; }
    const candidate = findSproutCurve(selected, index, nodes, curves);
    if (!candidate) { setMessage("No uncrossed vine fits between those dots. Try another pair."); tone(145, .1); return; }
    const nextNodes = nodes.map((node) => ({ ...node }));
    if (selected === index) nextNodes[selected].degree += 2;
    else { nextNodes[selected].degree += 1; nextNodes[index].degree += 1; }
    nextNodes.push({ ...candidate.midpoint, degree: 2 });
    const nextCurves = [...curves, { a: selected, b: index, c1: candidate.c1, c2: candidate.c2, player: turn }];
    setHistory((items) => [...items, { nodes, curves, turn, message }]);
    setNodes(nextNodes); setCurves(nextCurves); setSelected(null); setHovered(null); tone(510, .09);
    if (!hasSproutMove(nextNodes, nextCurves)) {
      setFinished(true); setMessage(`${turn === 0 ? "Blue" : "Coral"} grew the final legal vine and wins!`); window.setTimeout(() => fireWin(turn), 180);
    } else {
      setMessage(`${turn === 0 ? "Blue" : "Coral"} grew a new sprout. Turn passes.`); setTurn((turn === 0 ? 1 : 0) as Player);
    }
  }, [curves, finished, message, nodes, selected, tone, turn]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return; const context = canvas.getContext("2d"); if (!context) return;
    context.clearRect(0, 0, 640, 640); context.fillStyle = "#fffdf7"; context.fillRect(0, 0, 640, 640);
    context.fillStyle = "rgba(42,157,115,.07)"; for (let y = 45; y < 640; y += 65) for (let x = 45; x < 640; x += 65) { context.beginPath(); context.arc(x + (y % 2 ? 12 : 0), y, 2.5, 0, Math.PI * 2); context.fill(); }
    const drawCurve = (start: CanvasPoint, c1: CanvasPoint, c2: CanvasPoint, end: CanvasPoint, color: string, alpha = 1, dashed = false) => {
      context.save(); context.strokeStyle = color; context.globalAlpha = alpha; context.lineWidth = 7; context.lineCap = "round"; if (dashed) context.setLineDash([12, 9]); context.beginPath(); context.moveTo(start.x, start.y); context.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, end.x, end.y); context.stroke(); context.restore();
    };
    curves.forEach((curve) => drawCurve(nodes[curve.a], curve.c1, curve.c2, nodes[curve.b], COLORS[curve.player]));
    if (selected !== null && hovered !== null && preview) drawCurve(nodes[selected], preview.c1, preview.c2, nodes[hovered], COLORS[turn], .4, true);
    nodes.forEach((node, index) => {
      context.beginPath(); context.arc(node.x, node.y, 13, 0, Math.PI * 2); context.fillStyle = node.degree >= 3 ? "#1d201b" : "#fffdf7"; context.fill(); context.strokeStyle = node.degree >= 3 ? "#1d201b" : index === selected ? COLORS[turn] : "#2a9d73"; context.lineWidth = 5; context.stroke();
      context.fillStyle = node.degree >= 3 ? "#fffdf7" : "#1d201b"; context.font = "900 9px Arial"; context.textAlign = "center"; context.textBaseline = "middle"; context.fillText(String(node.degree), node.x, node.y + .5);
      if (index === focusNode) { context.beginPath(); context.arc(node.x, node.y, 21, 0, Math.PI * 2); context.strokeStyle = "#ffc53d"; context.lineWidth = 3; context.stroke(); }
    });
  }, [curves, focusNode, hovered, nodes, preview, selected, turn]);

  const nodeFromPointer = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect(); const x = (event.clientX - rect.left) / rect.width * 640; const y = (event.clientY - rect.top) / rect.height * 640;
    let nearest = -1; let distance = 28; nodes.forEach((node, index) => { const next = Math.hypot(node.x - x, node.y - y); if (next < distance) { nearest = index; distance = next; } }); return nearest;
  };
  const undo = () => { const previous = history.at(-1); if (!previous) return; setNodes(previous.nodes); setCurves(previous.curves); setTurn(previous.turn); setMessage(previous.message); setHistory((items) => items.slice(0, -1)); setSelected(null); setFinished(false); tone(210, .08); };
  const reset = () => { setNodes(initialNodes.map((node) => ({ ...node }))); setCurves([]); setTurn(0); setSelected(null); setHistory([]); setFinished(false); setMessage("Choose a dot, then choose where its vine should end."); tone(260, .08); };

  return <div>
    <ScoreStrip leftLabel="BLUE VINES" left={scores[0]} center={finished ? "FINAL VINE" : `${turn === 0 ? "BLUE" : "CORAL"} TO GROW`} rightLabel="CORAL VINES" right={scores[1]} />
    <div className="simple-canvas-layout sprouts-layout"><div className="simple-game-sidebar sprouts-sidebar"><p className="mini-kicker">DOT CAPACITY</p><strong>3</strong><span>branches maximum</span><p className="sidebar-copy">The number inside each dot shows how many branches it already has.</p><div className="toolbar-actions desktop-actions"><button className="icon-button" type="button" onClick={undo} disabled={!history.length} aria-label="Undo last vine"><Undo2 size={18} /></button><button className="icon-button" type="button" onClick={reset} aria-label="Restart Sprouts"><RefreshCcw size={18} /></button></div></div>
      <div className="canvas-wrap"><canvas ref={canvasRef} width="640" height="640" tabIndex={0} aria-label={`Sprouts board. ${turn === 0 ? "Blue" : "Coral"} to grow. Arrow keys choose a dot; Enter selects.`} onPointerMove={(event) => { const index = nodeFromPointer(event); setHovered(index >= 0 ? index : null); if (index >= 0) setFocusNode(index); }} onPointerLeave={() => setHovered(null)} onPointerDown={(event) => { const index = nodeFromPointer(event); if (index >= 0) choose(index); }} onKeyDown={(event) => { if (event.key === "ArrowRight" || event.key === "ArrowDown") { event.preventDefault(); setFocusNode((value) => (value + 1) % nodes.length); } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") { event.preventDefault(); setFocusNode((value) => (value + nodes.length - 1) % nodes.length); } else if (event.key === "Enter" || event.key === " ") { event.preventDefault(); choose(focusNode); } }} /></div>
    </div>
    <StatusNote>{message}</StatusNote>
  </div>;
}

type SimLine = { a: number; b: number; player: Player };

function simLineKey(a: number, b: number) {
  return a < b ? `${a}:${b}` : `${b}:${a}`;
}

function findSimTriangle(lines: SimLine[], player: Player): [number, number, number] | null {
  const owned = new Set(lines.filter((line) => line.player === player).map((line) => simLineKey(line.a, line.b)));
  for (let a = 0; a < 6; a += 1) for (let b = a + 1; b < 6; b += 1) for (let c = b + 1; c < 6; c += 1) {
    if (owned.has(simLineKey(a, b)) && owned.has(simLineKey(a, c)) && owned.has(simLineKey(b, c))) return [a, b, c];
  }
  return null;
}

function SimGame({ tone }: { tone: Tone }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const points = useMemo(() => Array.from({ length: 6 }, (_, index) => ({ x: 320 + Math.cos(-Math.PI / 2 + index * Math.PI / 3) * 235, y: 320 + Math.sin(-Math.PI / 2 + index * Math.PI / 3) * 235 })), []);
  const [lines, setLines] = useState<SimLine[]>([]);
  const [turn, setTurn] = useState<Player>(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [focusDot, setFocusDot] = useState(0);
  const [losingTriangle, setLosingTriangle] = useState<[number, number, number] | null>(null);
  const [message, setMessage] = useState("Choose any dot, then connect it to another.");
  const used = useMemo(() => new Set(lines.map((line) => simLineKey(line.a, line.b))), [lines]);
  const counts = lines.reduce((totals, line) => { totals[line.player] += 1; return totals; }, [0, 0]);
  const finished = losingTriangle !== null;

  const choose = useCallback((index: number) => {
    if (finished) return;
    if (selected === null) { setSelected(index); setMessage("Choose a second dot—but check for your triangle first."); tone(390, .06); return; }
    if (selected === index) { setSelected(null); setMessage("Selection cleared. Choose any dot."); return; }
    if (used.has(simLineKey(selected, index))) { setMessage("That connection is already colored. Choose another dot."); tone(145, .1); return; }
    const nextLines = [...lines, { a: selected, b: index, player: turn }];
    const triangle = findSimTriangle(nextLines, turn);
    setLines(nextLines); setSelected(null); setHovered(null); tone(triangle ? 150 : 490, triangle ? .18 : .07);
    if (triangle) {
      setLosingTriangle(triangle); setMessage(`${turn === 0 ? "Blue" : "Coral"} completed their own triangle—${turn === 0 ? "Coral" : "Blue"} wins!`); window.setTimeout(() => fireWin((turn === 0 ? 1 : 0) as Player), 180);
    } else {
      setMessage(`Safe line. ${turn === 0 ? "Coral" : "Blue"} is next.`); setTurn((turn === 0 ? 1 : 0) as Player);
    }
  }, [finished, lines, selected, tone, turn, used]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return; const context = canvas.getContext("2d"); if (!context) return;
    context.clearRect(0, 0, 640, 640); context.fillStyle = "#fffdf7"; context.fillRect(0, 0, 640, 640);
    context.strokeStyle = "#e1ddd4"; context.lineWidth = 2; context.setLineDash([4, 9]); context.beginPath(); points.forEach((point, index) => index ? context.lineTo(point.x, point.y) : context.moveTo(point.x, point.y)); context.closePath(); context.stroke(); context.setLineDash([]);
    if (losingTriangle) { context.beginPath(); losingTriangle.forEach((index, position) => position ? context.lineTo(points[index].x, points[index].y) : context.moveTo(points[index].x, points[index].y)); context.closePath(); context.fillStyle = turn === 0 ? "rgba(28,136,229,.18)" : "rgba(255,104,77,.18)"; context.fill(); }
    lines.forEach((line) => { context.strokeStyle = COLORS[line.player]; context.lineWidth = 7; context.lineCap = "round"; context.beginPath(); context.moveTo(points[line.a].x, points[line.a].y); context.lineTo(points[line.b].x, points[line.b].y); context.stroke(); });
    if (selected !== null && hovered !== null && selected !== hovered && !used.has(simLineKey(selected, hovered))) { context.save(); context.globalAlpha = .38; context.strokeStyle = COLORS[turn]; context.lineWidth = 5; context.setLineDash([12, 9]); context.beginPath(); context.moveTo(points[selected].x, points[selected].y); context.lineTo(points[hovered].x, points[hovered].y); context.stroke(); context.restore(); }
    points.forEach((point, index) => { context.beginPath(); context.arc(point.x, point.y, 13, 0, Math.PI * 2); context.fillStyle = index === selected ? COLORS[turn] : "#1d201b"; context.fill(); context.fillStyle = "#fffdf7"; context.font = "900 10px Arial"; context.textAlign = "center"; context.textBaseline = "middle"; context.fillText(String(index + 1), point.x, point.y + .5); if (index === focusDot) { context.beginPath(); context.arc(point.x, point.y, 21, 0, Math.PI * 2); context.strokeStyle = "#ffc53d"; context.lineWidth = 3; context.stroke(); } });
  }, [focusDot, hovered, lines, losingTriangle, points, selected, turn, used]);

  const pointFromPointer = (event: React.PointerEvent<HTMLCanvasElement>) => { const rect = event.currentTarget.getBoundingClientRect(); const x = (event.clientX - rect.left) / rect.width * 640; const y = (event.clientY - rect.top) / rect.height * 640; let nearest = -1; let distance = 30; points.forEach((point, index) => { const next = Math.hypot(point.x - x, point.y - y); if (next < distance) { nearest = index; distance = next; } }); return nearest; };
  const undo = () => { const last = lines.at(-1); if (!last) return; setLines((items) => items.slice(0, -1)); setTurn(last.player); setSelected(null); setLosingTriangle(null); setMessage("Last connection erased."); tone(210, .08); };
  const reset = () => { setLines([]); setTurn(0); setSelected(null); setLosingTriangle(null); setMessage("Choose any dot, then connect it to another."); tone(260, .08); };

  return <div>
    <ScoreStrip leftLabel="BLUE LINES" left={counts[0]} center={finished ? `${turn === 0 ? "BLUE" : "CORAL"} MADE A TRIANGLE` : `${turn === 0 ? "BLUE" : "CORAL"} TO CONNECT`} rightLabel="CORAL LINES" right={counts[1]} />
    <div className="simple-canvas-layout sim-layout"><div className="simple-game-sidebar sim-sidebar"><p className="mini-kicker">AVOID</p><strong>△</strong><span>your own triangle</span><p className="sidebar-copy">Crossings do not matter. Only triangles joining three numbered dots count.</p><div className="toolbar-actions desktop-actions"><button className="icon-button" type="button" onClick={undo} disabled={!lines.length} aria-label="Undo last connection"><Undo2 size={18} /></button><button className="icon-button" type="button" onClick={reset} aria-label="Restart Sim"><RefreshCcw size={18} /></button></div></div>
      <div className="canvas-wrap"><canvas ref={canvasRef} width="640" height="640" tabIndex={0} aria-label={`Sim board. ${turn === 0 ? "Blue" : "Coral"} to connect. Arrow keys choose a dot; Enter selects.`} onPointerMove={(event) => { const index = pointFromPointer(event); setHovered(index >= 0 ? index : null); if (index >= 0) setFocusDot(index); }} onPointerLeave={() => setHovered(null)} onPointerDown={(event) => { const index = pointFromPointer(event); if (index >= 0) choose(index); }} onKeyDown={(event) => { if (event.key === "ArrowRight" || event.key === "ArrowDown") { event.preventDefault(); setFocusDot((value) => (value + 1) % 6); } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") { event.preventDefault(); setFocusDot((value) => (value + 5) % 6); } else if (event.key === "Enter" || event.key === " ") { event.preventDefault(); choose(focusDot); } }} /></div>
    </div>
    <StatusNote>{message}</StatusNote>
  </div>;
}

type FactorOwner = "p0" | "p1" | "lost";
type FactorSnapshot = { owned: Record<number, FactorOwner>; turn: Player; message: string; finished: boolean };

function FactorGame({ tone }: { tone: Tone }) {
  const [ceiling, setCeiling] = useState(30);
  const [owned, setOwned] = useState<Record<number, FactorOwner>>({});
  const [turn, setTurn] = useState<Player>(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const [message, setMessage] = useState("Blue chooses first. Coral will collect the available factors.");
  const [finished, setFinished] = useState(false);
  const [history, setHistory] = useState<FactorSnapshot[]>([]);
  const numbers = useMemo(() => Array.from({ length: ceiling }, (_, index) => index + 1), [ceiling]);
  const available = useMemo(() => new Set(numbers.filter((number) => !owned[number])), [numbers, owned]);
  const factorPreview = hovered ? properFactors(hovered, available) : [];
  const scores = numbers.reduce((totals, number) => { const owner = owned[number]; if (owner === "p0") totals[0] += number; if (owner === "p1") totals[1] += number; return totals; }, [0, 0]);

  const reset = useCallback((nextCeiling = ceiling) => { setCeiling(nextCeiling); setOwned({}); setTurn(0); setHovered(null); setMessage("Blue chooses first. Coral will collect the available factors."); setFinished(false); setHistory([]); tone(260, .08); }, [ceiling, tone]);
  const choose = (number: number) => {
    if (finished || owned[number]) return;
    const factors = properFactors(number, available);
    const nextOwned = { ...owned };
    setHistory((items) => [...items, { owned, turn, message, finished }]);
    if (!factors.length) {
      nextOwned[number] = "lost"; setMessage(`${turn === 0 ? "Blue" : "Coral"} chose ${number}, but no factors remained—zero points and turn lost.`); tone(150, .12);
    } else {
      nextOwned[number] = turn === 0 ? "p0" : "p1";
      factors.forEach((factor) => { nextOwned[factor] = turn === 0 ? "p1" : "p0"; });
      setMessage(`${turn === 0 ? "Blue" : "Coral"} claimed ${number}; ${turn === 0 ? "Coral" : "Blue"} collected ${factors.join(", ")}.`); tone(520, .08); factors.forEach((_, index) => tone(300 - index * 12, .055, .05 + index * .03));
    }
    const remaining = new Set(numbers.filter((candidate) => !nextOwned[candidate]));
    const movesRemain = [...remaining].some((candidate) => properFactors(candidate, remaining).length > 0);
    setOwned(nextOwned); setHovered(null);
    if (!movesRemain) {
      setFinished(true);
      const nextScores = numbers.reduce((totals, candidate) => { const owner = nextOwned[candidate]; if (owner === "p0") totals[0] += candidate; if (owner === "p1") totals[1] += candidate; return totals; }, [0, 0]);
      window.setTimeout(() => fireWin(nextScores[0] === nextScores[1] ? null : nextScores[0] > nextScores[1] ? 0 : 1), 180);
    } else setTurn((turn === 0 ? 1 : 0) as Player);
  };
  const undo = () => { const previous = history.at(-1); if (!previous) return; setOwned(previous.owned); setTurn(previous.turn); setMessage(previous.message); setFinished(previous.finished); setHistory((items) => items.slice(0, -1)); tone(210, .08); };

  return <div>
    <ScoreStrip leftLabel="BLUE" left={scores[0]} center={finished ? "GAME OVER" : `${turn === 0 ? "BLUE" : "CORAL"} TO CHOOSE`} rightLabel="CORAL" right={scores[1]} />
    <div className="game-toolbar"><label className="number-limit">BOARD<select value={ceiling} onChange={(event) => reset(Number(event.target.value))} aria-label="Factor Game board size"><option value="20">1–20</option><option value="30">1–30</option></select></label><div className="factor-legend"><span><i className="legend-blue" /> BLUE</span><span><i className="legend-coral" /> CORAL</span><span><i className="legend-lost" /> NO POINTS</span></div><div className="toolbar-actions"><button className="icon-button" type="button" onClick={undo} disabled={!history.length} aria-label="Undo last choice"><Undo2 size={18} /></button><button className="icon-button" type="button" onClick={() => reset()} aria-label="Restart Factor Game"><RefreshCcw size={18} /></button></div></div>
    <div className={`number-board factor-board ceiling-${ceiling}`} aria-label="Factor Game number board">{numbers.map((number) => {
      const owner = owned[number]; const isFactor = factorPreview.includes(number); const hasFactors = properFactors(number, available).length > 0;
      return <button key={number} type="button" className={`number-tile ${owner ? `claimed ${owner}` : isFactor ? "factor-preview rival-preview" : hasFactors ? "legal" : "factor-dead"}`} onClick={() => choose(number)} onMouseEnter={() => setHovered(number)} onMouseLeave={() => setHovered(null)} onFocus={() => setHovered(number)} onBlur={() => setHovered(null)} disabled={Boolean(owner) || finished} aria-label={owner ? `${number}, ${owner === "p0" ? "Blue" : owner === "p1" ? "Coral" : "no points"}` : hasFactors ? `Choose ${number}; opponent receives ${properFactors(number, available).join(", ")}` : `Choose ${number}, but no available factors means zero points`}><span>{number}</span>{!owner && isFactor && <small>THEIRS</small>}{owner === "lost" && <small className="lost-badge">0</small>}</button>;
    })}</div>
    <StatusNote>{finished ? `${scores[0] === scores[1] ? "It’s a tie" : `${scores[0] > scores[1] ? "Blue" : "Coral"} wins`}—${scores[0]} to ${scores[1]}. Unclaimed numbers score nothing.` : message}</StatusNote>
  </div>;
}

type MatchEdge = { key: string; orientation: "h" | "v"; x: number; y: number };
type MatchLevel = { name: string; size: number; lift: number; target: number };

const MATCH_LEVELS: MatchLevel[] = [
  { name: "Corner Lift", size: 2, lift: 2, target: 3 },
  { name: "Nine Lives", size: 3, lift: 3, target: 9 },
  { name: "Vanishing Ring", size: 3, lift: 4, target: 9 },
  { name: "Grand Station", size: 4, lift: 4, target: 23 },
];

function makeMatchEdges(size: number): MatchEdge[] {
  const edges: MatchEdge[] = [];
  for (let y = 0; y <= size; y += 1) for (let x = 0; x < size; x += 1) edges.push({ key: `h:${x}:${y}`, orientation: "h", x, y });
  for (let x = 0; x <= size; x += 1) for (let y = 0; y < size; y += 1) edges.push({ key: `v:${x}:${y}`, orientation: "v", x, y });
  return edges;
}

function countMatchSquares(size: number, removed: Set<string>) {
  let squares = 0;
  for (let side = 1; side <= size; side += 1) for (let y = 0; y + side <= size; y += 1) for (let x = 0; x + side <= size; x += 1) {
    let complete = true;
    for (let offset = 0; offset < side; offset += 1) {
      if (removed.has(`h:${x + offset}:${y}`) || removed.has(`h:${x + offset}:${y + side}`) || removed.has(`v:${x}:${y + offset}`) || removed.has(`v:${x + side}:${y + offset}`)) complete = false;
    }
    if (complete) squares += 1;
  }
  return squares;
}

function MatchstickGame({ tone }: { tone: Tone }) {
  const [levelIndex, setLevelIndex] = useState(0);
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const [history, setHistory] = useState<string[]>([]);
  const [message, setMessage] = useState("Lift the exact number of matches without forgetting the larger squares.");
  const level = MATCH_LEVELS[levelIndex];
  const edges = useMemo(() => makeMatchEdges(level.size), [level.size]);
  const squares = useMemo(() => countMatchSquares(level.size, removed), [level.size, removed]);
  const solved = removed.size === level.lift && squares === level.target;

  const reset = useCallback(() => {
    setRemoved(new Set());
    setHistory([]);
    setMessage("Lift the exact number of matches without forgetting the larger squares.");
    tone(260, .08);
  }, [tone]);

  const openLevel = (nextIndex: number) => {
    setLevelIndex(nextIndex);
    setRemoved(new Set());
    setHistory([]);
    setMessage("New station. Count every square before you start lifting.");
    tone(360 + nextIndex * 55, .08);
  };

  const toggleMatch = (key: string) => {
    if (solved) return;
    const isRemoved = removed.has(key);
    if (!isRemoved && removed.size >= level.lift) {
      setMessage(`You have already lifted ${level.lift}. Put one back before trying another.`);
      tone(145, .1);
      return;
    }
    const next = new Set(removed);
    if (isRemoved) next.delete(key); else next.add(key);
    const nextSquares = countMatchSquares(level.size, next);
    setRemoved(next);
    setHistory((items) => [...items, key]);
    tone(isRemoved ? 330 : 470, .06);
    if (next.size === level.lift && nextSquares === level.target) {
      setMessage(`Station cleared! ${level.target} complete squares remain.`);
      tone(660, .12, .06);
      window.setTimeout(() => fireWin(null), 150);
    } else if (next.size === level.lift) {
      setMessage(`${nextSquares} squares remain. You need ${level.target}—swap one of the lifted matches.`);
    } else {
      setMessage(`${next.size} of ${level.lift} lifted · ${nextSquares} squares currently remain.`);
    }
  };

  const undo = () => {
    const key = history.at(-1);
    if (!key) return;
    const next = new Set(removed);
    if (next.has(key)) next.delete(key); else next.add(key);
    setRemoved(next);
    setHistory((items) => items.slice(0, -1));
    setMessage("Last lift reversed. Keep counting.");
    tone(210, .08);
  };

  const unit = 78 / level.size;
  return <div>
    <ScoreStrip leftLabel="LEVEL" left={levelIndex + 1} center={solved ? "STATION CLEARED" : level.name.toUpperCase()} rightLabel="SQUARES" right={squares} />
    <div className="puzzle-layout matchstick-layout">
      <aside className="puzzle-sidebar matchstick-sidebar">
        <p className="mini-kicker">YOUR CHALLENGE</p>
        <div className="challenge-number"><strong>{level.lift}</strong><span>MATCHES<br />TO LIFT</span></div>
        <div className="challenge-arrow">→</div>
        <div className="challenge-number"><strong>{level.target}</strong><span>SQUARES<br />TO LEAVE</span></div>
        <div className="level-dots" aria-label="Matchstick Metro levels">{MATCH_LEVELS.map((item, index) => <button key={item.name} className={index === levelIndex ? "active" : index < levelIndex ? "passed" : ""} type="button" onClick={() => openLevel(index)} aria-label={`Open level ${index + 1}: ${item.name}`}>{index + 1}</button>)}</div>
        <div className="toolbar-actions puzzle-actions">
          <button className="icon-button" type="button" onClick={undo} disabled={!history.length || solved} aria-label="Undo last match"><Undo2 size={18} /></button>
          <button className="icon-button" type="button" onClick={reset} aria-label="Restart Matchstick Metro level"><RefreshCcw size={18} /></button>
        </div>
        {solved && levelIndex < MATCH_LEVELS.length - 1 && <button className="next-level-button" type="button" onClick={() => openLevel(levelIndex + 1)}>NEXT STATION <ArrowRight size={16} /></button>}
      </aside>
      <div className="match-board-wrap">
        <div className={`match-board grid-${level.size}`} role="group" aria-label={`${level.name}: ${removed.size} of ${level.lift} matches lifted, ${squares} squares remain`}>
          {edges.map((edge) => {
            const style = edge.orientation === "h"
              ? { left: `${11 + edge.x * unit}%`, top: `${11 + edge.y * unit}%`, width: `${unit}%` }
              : { left: `${11 + edge.x * unit}%`, top: `${11 + edge.y * unit}%`, height: `${unit}%` };
            return <button key={edge.key} className={`match-stick ${edge.orientation === "h" ? "horizontal" : "vertical"} ${removed.has(edge.key) ? "removed" : ""}`} style={style} type="button" onClick={() => toggleMatch(edge.key)} disabled={solved} aria-label={`${removed.has(edge.key) ? "Replace" : "Lift"} ${edge.orientation === "h" ? "horizontal" : "vertical"} match at ${edge.x + 1}, ${edge.y + 1}`} aria-pressed={!removed.has(edge.key)}><span /></button>;
          })}
          <div className="match-board-stamp" aria-hidden="true">{solved ? "CLEARED!" : `${squares} □`}</div>
        </div>
      </div>
    </div>
    <StatusNote>{message}</StatusNote>
  </div>;
}

type Domino = readonly [number, number];
type DominoLevel = { name: string; tiles: Domino[]; solution: number; start: number; target: number; par: number };

const DOMINO_LEVELS: DominoLevel[] = [
  { name: "Blue Shutters", tiles: [[4, 5], [5, 6], [3, 4], [0, 5], [3, 6], [0, 6], [0, 4], [0, 3]], solution: 2, start: 226, target: 12, par: 3 },
  { name: "Market Window", tiles: [[3, 5], [0, 4], [1, 4], [4, 5], [1, 3], [1, 6], [2, 3], [3, 4]], solution: 151, start: 4, target: 9, par: 4 },
  { name: "Quiet Courtyard", tiles: [[3, 5], [1, 3], [1, 2], [3, 6], [0, 2], [0, 4], [2, 3], [0, 1]], solution: 216, start: 164, target: 7, par: 5 },
  { name: "Midnight Glass", tiles: [[2, 3], [2, 6], [0, 2], [3, 5], [1, 3], [0, 1], [0, 3], [3, 6]], solution: 230, start: 157, target: 6, par: 6 },
];

const DOMINO_POSITIONS = ["nw", "n", "ne", "e", "se", "s", "sw", "w"] as const;
const PIP_CELLS: Record<number, number[]> = { 0: [], 1: [5], 2: [1, 9], 3: [1, 5, 9], 4: [1, 3, 7, 9], 5: [1, 3, 5, 7, 9], 6: [1, 3, 4, 6, 7, 9] };

function maskToFlips(mask: number) {
  return Array.from({ length: 8 }, (_, index) => Boolean(mask & (1 << index)));
}

function dominoTotals(tiles: Domino[], flips: boolean[]) {
  const shown = tiles.map((tile, index) => flips[index] ? [tile[1], tile[0]] : [tile[0], tile[1]]);
  return [
    shown[0][0] + shown[1][1] + shown[2][0],
    shown[2][1] + shown[3][1] + shown[4][0],
    shown[4][1] + shown[5][1] + shown[6][0],
    shown[6][1] + shown[7][1] + shown[0][1],
  ];
}

function DominoPips({ value }: { value: number }) {
  const cells = PIP_CELLS[value];
  return <span className="domino-pips" aria-hidden="true">{Array.from({ length: 9 }, (_, index) => <i key={index} className={cells.includes(index + 1) ? "filled" : ""} />)}</span>;
}

function DominoWindowsGame({ tone }: { tone: Tone }) {
  const [levelIndex, setLevelIndex] = useState(0);
  const level = DOMINO_LEVELS[levelIndex];
  const [flips, setFlips] = useState<boolean[]>(() => maskToFlips(DOMINO_LEVELS[0].start));
  const [history, setHistory] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [message, setMessage] = useState("Tap a domino to flip it. Watch which two side totals change.");
  const totals = useMemo(() => dominoTotals(level.tiles, flips), [flips, level.tiles]);
  const solved = totals.every((total) => total === level.target);

  const openLevel = (nextIndex: number) => {
    const next = DOMINO_LEVELS[nextIndex];
    setLevelIndex(nextIndex);
    setFlips(maskToFlips(next.start));
    setHistory([]);
    setMoves(0);
    setMessage("New window. Flip the frame until every side reaches the target.");
    tone(390 + nextIndex * 45, .08);
  };

  const reset = useCallback(() => {
    setFlips(maskToFlips(level.start));
    setHistory([]);
    setMoves(0);
    setMessage("Window reset. Corners affect two sides; edge pieces affect one.");
    tone(260, .08);
  }, [level.start, tone]);

  const flipDomino = (index: number) => {
    if (solved) return;
    const next = flips.map((flip, itemIndex) => itemIndex === index ? !flip : flip);
    const nextTotals = dominoTotals(level.tiles, next);
    const nextMoves = moves + 1;
    setFlips(next);
    setHistory((items) => [...items, index]);
    setMoves(nextMoves);
    tone(430 + index * 22, .055);
    if (nextTotals.every((total) => total === level.target)) {
      setMessage(`Window open! Every side makes ${level.target}${nextMoves <= level.par ? "—perfect solve." : "."}`);
      tone(680, .14, .06);
      window.setTimeout(() => fireWin(null), 150);
    } else {
      const ready = nextTotals.filter((total) => total === level.target).length;
      setMessage(ready ? `${ready} side${ready === 1 ? " is" : "s are"} balanced. Keep the glowing total${ready === 1 ? "" : "s"} steady.` : "No side is balanced yet. Try a corner to change two totals together.");
    }
  };

  const undo = () => {
    const index = history.at(-1);
    if (index === undefined) return;
    setFlips((items) => items.map((flip, itemIndex) => itemIndex === index ? !flip : flip));
    setHistory((items) => items.slice(0, -1));
    setMoves((value) => Math.max(0, value - 1));
    setMessage("Last domino flipped back.");
    tone(210, .08);
  };

  return <div>
    <ScoreStrip leftLabel="LEVEL" left={levelIndex + 1} center={solved ? "WINDOW OPEN" : level.name.toUpperCase()} rightLabel="FLIPS" right={moves} />
    <div className="puzzle-layout domino-layout">
      <aside className="puzzle-sidebar domino-sidebar">
        <p className="mini-kicker">MAKE EVERY SIDE</p>
        <div className="domino-target"><strong>{level.target}</strong><span>TARGET<br />TOTAL</span></div>
        <p className="sidebar-copy">The inward pips along each edge count. A glowing badge means that side is balanced.</p>
        <div className="level-dots" aria-label="Domino Windows levels">{DOMINO_LEVELS.map((item, index) => <button key={item.name} className={index === levelIndex ? "active" : index < levelIndex ? "passed" : ""} type="button" onClick={() => openLevel(index)} aria-label={`Open level ${index + 1}: ${item.name}`}>{index + 1}</button>)}</div>
        <div className="toolbar-actions puzzle-actions">
          <button className="icon-button" type="button" onClick={undo} disabled={!history.length || solved} aria-label="Undo last domino flip"><Undo2 size={18} /></button>
          <button className="icon-button" type="button" onClick={reset} aria-label="Restart Domino Windows level"><RefreshCcw size={18} /></button>
        </div>
        {solved && levelIndex < DOMINO_LEVELS.length - 1 && <button className="next-level-button" type="button" onClick={() => openLevel(levelIndex + 1)}>NEXT WINDOW <ArrowRight size={16} /></button>}
      </aside>
      <div className="domino-board-wrap">
        <div className="domino-window-board" role="group" aria-label={`${level.name}. Side totals: top ${totals[0]}, right ${totals[1]}, bottom ${totals[2]}, left ${totals[3]}. Target ${level.target}.`}>
          <div className="window-center" aria-hidden="true"><span>{solved ? "OPEN" : "BALANCE"}</span><strong>{level.target}</strong></div>
          {totals.map((total, index) => <div key={index} className={`side-total total-${["top", "right", "bottom", "left"][index]} ${total === level.target ? "ready" : total > level.target ? "over" : "under"}`}><span>{["TOP", "RIGHT", "BOTTOM", "LEFT"][index]}</span><strong>{total}</strong></div>)}
          {level.tiles.map((tile, index) => {
            const shown: Domino = flips[index] ? [tile[1], tile[0]] : tile;
            const position = DOMINO_POSITIONS[index];
            const vertical = position === "n" || position === "s";
            return <button key={`${levelIndex}-${position}`} className={`domino-piece domino-${position} ${vertical ? "vertical" : ""}`} type="button" onClick={() => flipDomino(index)} disabled={solved} aria-label={`Flip ${position.toUpperCase()} domino, currently ${shown[0]} and ${shown[1]}`}>
              <span className="domino-half"><DominoPips value={shown[0]} /><b>{shown[0]}</b></span>
              <span className="domino-half"><DominoPips value={shown[1]} /><b>{shown[1]}</b></span>
            </button>;
          })}
        </div>
      </div>
    </div>
    <StatusNote>{message}</StatusNote>
  </div>;
}

type Cell = readonly [number, number];
type CutLevel = { name: string; shape: Cell[]; target: Cell[]; cuts: number; equal?: boolean; hint: string };
type Seam = { key: string; orientation: "h" | "v"; line: number; along: number };
type Placement = { piece: number; cells: Cell[] };
type CutSnapshot = { cuts: Set<string>; placements: Placement[] };

function rectCells(width: number, height: number, x0 = 0, y0 = 0): Cell[] {
  const cells: Cell[] = [];
  for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) cells.push([x0 + x, y0 + y]);
  return cells;
}

function cellKey([x, y]: Cell) {
  return `${x},${y}`;
}

const PLUS_SHAPE: Cell[] = [[2, 0], [2, 1], [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [2, 3], [2, 4]];
const HOOK_SHAPE: Cell[] = rectCells(4, 4).filter(([x, y]) => !(x >= 2 && y >= 2));
const RING_SHAPE: Cell[] = rectCells(6, 6).filter(([x, y]) => !(x >= 2 && x <= 3 && y >= 2 && y <= 3));

const CUT_LEVELS: CutLevel[] = [
  { name: "Pinwheel Cross", shape: PLUS_SHAPE, target: rectCells(3, 3), cuts: 4, hint: "Snip around the middle: five small pieces can spin into a square." },
  { name: "Corner Garden", shape: HOOK_SHAPE, target: rectCells(4, 3), cuts: 6, equal: true, hint: "Split the garden into four identical three-cell hooks, then pack them into the bed." },
  { name: "Staircase", shape: rectCells(9, 4), target: rectCells(6, 6), cuts: 3, equal: true, hint: "One zigzag of three straight cuts makes two matching steps that slide into a square." },
  { name: "Ring of Four", shape: RING_SHAPE, target: rectCells(8, 4), cuts: 4, equal: true, hint: "Four equal bars circle the hole like a pinwheel. Lay them side by side." },
];

const PIECE_COLORS = ["#1c88e5", "#ff684d", "#ffc53d", "#2a9d73", "#6948d7", "#e26fb0", "#3bb8c6", "#c07a2c", "#8f8b82"];

function shapeSeams(shape: Cell[]): Seam[] {
  const keys = new Set(shape.map(cellKey));
  const seams: Seam[] = [];
  shape.forEach(([x, y]) => {
    if (keys.has(cellKey([x + 1, y]))) seams.push({ key: `v:${x + 1}:${y}`, orientation: "v", line: x + 1, along: y });
    if (keys.has(cellKey([x, y + 1]))) seams.push({ key: `h:${y + 1}:${x}`, orientation: "h", line: y + 1, along: x });
  });
  return seams;
}

function countStraightCuts(cuts: Set<string>) {
  const groups = new Map<string, number[]>();
  cuts.forEach((key) => {
    const [orientation, line, along] = key.split(":");
    const group = groups.get(`${orientation}:${line}`) ?? [];
    group.push(Number(along));
    groups.set(`${orientation}:${line}`, group);
  });
  let count = 0;
  groups.forEach((positions) => {
    positions.sort((a, b) => a - b);
    positions.forEach((position, index) => { if (index === 0 || position !== positions[index - 1] + 1) count += 1; });
  });
  return count;
}

function splitPieces(shape: Cell[], cuts: Set<string>): Cell[][] {
  const lookup = new Map(shape.map((cell) => [cellKey(cell), cell]));
  const seen = new Set<string>();
  const pieces: Cell[][] = [];
  shape.forEach((start) => {
    if (seen.has(cellKey(start))) return;
    const piece: Cell[] = [];
    const stack: Cell[] = [start];
    seen.add(cellKey(start));
    while (stack.length) {
      const [x, y] = stack.pop() as Cell;
      piece.push([x, y]);
      const neighbours: [Cell, string][] = [
        [[x + 1, y], `v:${x + 1}:${y}`],
        [[x - 1, y], `v:${x}:${y}`],
        [[x, y + 1], `h:${y + 1}:${x}`],
        [[x, y - 1], `h:${y}:${x}`],
      ];
      neighbours.forEach(([cell, seam]) => {
        const key = cellKey(cell);
        if (lookup.has(key) && !seen.has(key) && !cuts.has(seam)) { seen.add(key); stack.push(cell); }
      });
    }
    pieces.push(piece);
  });
  return pieces.map((piece) => piece.sort((a, b) => a[1] - b[1] || a[0] - b[0])).sort((a, b) => a[0][1] - b[0][1] || a[0][0] - b[0][0]);
}

function normalizeCells(cells: Cell[]): Cell[] {
  const minX = Math.min(...cells.map(([x]) => x));
  const minY = Math.min(...cells.map(([, y]) => y));
  return cells.map(([x, y]) => [x - minX, y - minY] as Cell).sort((a, b) => a[1] - b[1] || a[0] - b[0]);
}

function transformCells(cells: Cell[], rotation: number, flip: boolean): Cell[] {
  let result = cells.map(([x, y]) => (flip ? [-x, y] : [x, y]) as Cell);
  for (let turn = 0; turn < rotation; turn += 1) result = result.map(([x, y]) => [-y, x] as Cell);
  return normalizeCells(result);
}

function canonicalShape(cells: Cell[]) {
  const forms: string[] = [];
  for (let rotation = 0; rotation < 4; rotation += 1) for (const flip of [false, true]) forms.push(transformCells(cells, rotation, flip).map(cellKey).join("|"));
  return forms.sort()[0];
}

function PieceThumb({ cells, color }: { cells: Cell[]; color: string }) {
  const normalized = normalizeCells(cells);
  const width = Math.max(...normalized.map(([x]) => x)) + 1;
  const height = Math.max(...normalized.map(([, y]) => y)) + 1;
  const size = Math.max(width, height);
  return <svg viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
    {normalized.map(([x, y]) => <rect key={cellKey([x, y])} x={x + (size - width) / 2 + 0.06} y={y + (size - height) / 2 + 0.06} width={0.88} height={0.88} rx={0.12} fill={color} stroke="#1d201b" strokeWidth={0.08} />)}
  </svg>;
}

function CutBloomGame({ tone }: { tone: Tone }) {
  const [levelIndex, setLevelIndex] = useState(0);
  const level = CUT_LEVELS[levelIndex];
  const [cuts, setCuts] = useState<Set<string>>(new Set());
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [rotation, setRotation] = useState(0);
  const [flip, setFlip] = useState(false);
  const [hover, setHover] = useState<Cell | null>(null);
  const [history, setHistory] = useState<CutSnapshot[]>([]);
  const [message, setMessage] = useState("Tap the seams between paper cells to cut. Then plant the pieces in the flower bed on the right.");

  const seams = useMemo(() => shapeSeams(level.shape), [level.shape]);
  const pieces = useMemo(() => splitPieces(level.shape, cuts), [level.shape, cuts]);
  const cutCount = useMemo(() => countStraightCuts(cuts), [cuts]);
  const overBudget = cutCount > level.cuts;
  const allEqual = useMemo(() => new Set(pieces.map(canonicalShape)).size === 1, [pieces]);
  const equalOk = !level.equal || allEqual;
  const pieceOfCell = useMemo(() => { const map = new Map<string, number>(); pieces.forEach((piece, index) => piece.forEach((cell) => map.set(cellKey(cell), index))); return map; }, [pieces]);
  const targetKeys = useMemo(() => new Set(level.target.map(cellKey)), [level.target]);
  const planted = useMemo(() => { const map = new Map<string, number>(); placements.forEach((placement) => placement.cells.forEach((cell) => map.set(cellKey(cell), placement.piece))); return map; }, [placements]);
  const plantedPieces = useMemo(() => new Set(placements.map((placement) => placement.piece)), [placements]);
  const solved = !overBudget && equalOk && pieces.length > 1 && placements.length === pieces.length && planted.size === level.target.length;

  const shapeWidth = Math.max(...level.shape.map(([x]) => x)) + 1;
  const shapeHeight = Math.max(...level.shape.map(([, y]) => y)) + 1;
  const targetWidth = Math.max(...level.target.map(([x]) => x)) + 1;
  const targetHeight = Math.max(...level.target.map(([, y]) => y)) + 1;

  const selectedShape = selected !== null && pieces[selected] ? transformCells(pieces[selected], rotation, flip) : null;
  const ghost = useMemo(() => {
    if (!selectedShape || !hover) return null;
    const [anchorX, anchorY] = selectedShape[0];
    const cells = selectedShape.map(([x, y]) => [x - anchorX + hover[0], y - anchorY + hover[1]] as Cell);
    const valid = cells.every((cell) => targetKeys.has(cellKey(cell)) && !planted.has(cellKey(cell)));
    return { cells, valid };
  }, [selectedShape, hover, targetKeys, planted]);
  const ghostKeys = useMemo(() => new Map(ghost?.cells.map((cell) => [cellKey(cell), ghost.valid]) ?? []), [ghost]);

  const snapshot = () => setHistory((items) => [...items, { cuts, placements }]);

  const openLevel = (nextIndex: number) => {
    setLevelIndex(nextIndex);
    setCuts(new Set());
    setPlacements([]);
    setSelected(null);
    setRotation(0);
    setFlip(false);
    setHover(null);
    setHistory([]);
    setMessage(CUT_LEVELS[nextIndex].hint);
    tone(380 + nextIndex * 50, .08);
  };

  const reset = useCallback(() => {
    setCuts(new Set());
    setPlacements([]);
    setSelected(null);
    setRotation(0);
    setFlip(false);
    setHover(null);
    setHistory([]);
    setMessage("Fresh sheet of paper. Count your straight cuts before you snip.");
    tone(260, .08);
  }, [tone]);

  const toggleSeam = (key: string) => {
    if (solved) return;
    snapshot();
    const next = new Set(cuts);
    if (next.has(key)) next.delete(key); else next.add(key);
    const nextCount = countStraightCuts(next);
    const nextPieces = splitPieces(level.shape, next);
    setCuts(next);
    setPlacements([]);
    setSelected(null);
    setRotation(0);
    setFlip(false);
    tone(cuts.has(key) ? 300 : 520, .05);
    if (placements.length) tone(200, .06, .05);
    if (nextCount > level.cuts) setMessage(`${nextCount} straight cuts—that is more than the ${level.cuts} allowed. Mend a seam.`);
    else if (level.equal && nextPieces.length > 1 && new Set(nextPieces.map(canonicalShape)).size > 1) setMessage(`${nextPieces.length} pieces, but they are not all the same shape yet. ${level.cuts - nextCount} cut${level.cuts - nextCount === 1 ? "" : "s"} left.`);
    else setMessage(`${nextPieces.length} piece${nextPieces.length === 1 ? "" : "s"} · ${nextCount} of ${level.cuts} straight cuts used${placements.length ? " · planted pieces were lifted" : ""}.`);
  };

  const pickPiece = (index: number) => {
    if (solved) return;
    if (plantedPieces.has(index)) {
      snapshot();
      setPlacements((items) => items.filter((placement) => placement.piece !== index));
      setMessage("Piece lifted out of the bed. Turn it and plant it again.");
    } else if (overBudget) {
      setMessage(`Mend a seam first—only ${level.cuts} straight cuts are allowed.`);
      tone(145, .1);
      return;
    } else if (!equalOk) {
      setMessage("This level needs every piece to be the same shape before planting.");
      tone(145, .1);
      return;
    }
    setSelected(selected === index && !plantedPieces.has(index) ? null : index);
    setRotation(0);
    setFlip(false);
    tone(430 + index * 30, .06);
  };

  const plant = (cell: Cell) => {
    if (solved) return;
    const key = cellKey(cell);
    const occupied = planted.get(key);
    if (occupied !== undefined) { pickPiece(occupied); return; }
    if (selected === null || !selectedShape) { setMessage("Pick a piece first—tap it on the paper or in the tray."); tone(145, .1); return; }
    const [anchorX, anchorY] = selectedShape[0];
    const cells = selectedShape.map(([x, y]) => [x - anchorX + cell[0], y - anchorY + cell[1]] as Cell);
    const valid = cells.every((item) => targetKeys.has(cellKey(item)) && !planted.has(cellKey(item)));
    if (!valid) { setMessage("That piece would spill outside the bed or overlap another. Try a different spot or rotation."); tone(145, .1); return; }
    snapshot();
    const nextPlacements = [...placements, { piece: selected, cells }];
    setPlacements(nextPlacements);
    setSelected(null);
    setHover(null);
    tone(560, .07);
    const nextPlanted = nextPlacements.reduce((sum, placement) => sum + placement.cells.length, 0);
    if (nextPlacements.length === pieces.length && nextPlanted === level.target.length && pieces.length > 1) {
      setMessage(`Bloom! ${pieces.length} pieces with ${cutCount} straight cut${cutCount === 1 ? "" : "s"} rebuilt the silhouette.`);
      tone(700, .14, .06);
      window.setTimeout(() => fireWin(null), 150);
    } else {
      setMessage(`${nextPlacements.length} of ${pieces.length} pieces planted.`);
    }
  };

  const undo = () => {
    const previous = history.at(-1);
    if (!previous) return;
    setCuts(previous.cuts);
    setPlacements(previous.placements);
    setSelected(null);
    setHover(null);
    setHistory((items) => items.slice(0, -1));
    setMessage("Last snip or planting reversed.");
    tone(210, .08);
  };

  const remaining = level.cuts - cutCount;
  return <div>
    <ScoreStrip leftLabel="LEVEL" left={levelIndex + 1} center={solved ? "IN FULL BLOOM" : level.name.toUpperCase()} rightLabel="PIECES" right={pieces.length} />
    <div className="puzzle-layout cutbloom-layout">
      <aside className="puzzle-sidebar cutbloom-sidebar">
        <p className="mini-kicker">STRAIGHT CUTS</p>
        <div className={`challenge-number cut-budget ${overBudget ? "over" : ""}`}><strong>{cutCount}</strong><span>USED OF<br />{level.cuts} ALLOWED</span></div>
        <p className="sidebar-copy">{level.equal ? "Every piece must be the same shape." : "Pieces may be different shapes."}{remaining >= 0 && !solved ? ` ${remaining} cut${remaining === 1 ? "" : "s"} left.` : ""}</p>
        <div className="level-dots" aria-label="Cut & Bloom levels">{CUT_LEVELS.map((item, index) => <button key={item.name} className={index === levelIndex ? "active" : index < levelIndex ? "passed" : ""} type="button" onClick={() => openLevel(index)} aria-label={`Open level ${index + 1}: ${item.name}`}>{index + 1}</button>)}</div>
        <div className="toolbar-actions puzzle-actions">
          <button className="icon-button" type="button" onClick={undo} disabled={!history.length || solved} aria-label="Undo last cut or planting"><Undo2 size={18} /></button>
          <button className="icon-button" type="button" onClick={reset} aria-label="Restart Cut & Bloom level"><RefreshCcw size={18} /></button>
        </div>
        {solved && levelIndex < CUT_LEVELS.length - 1 && <button className="next-level-button" type="button" onClick={() => openLevel(levelIndex + 1)}>NEXT SHEET <ArrowRight size={16} /></button>}
      </aside>
      <div className="cutbloom-stage">
        <div className="cutbloom-boards">
          <div className="cut-panel">
            <p className="board-label"><Scissors size={13} /> PAPER · TAP SEAMS TO CUT</p>
            <div className="cut-paper" style={{ width: `min(100%, ${shapeWidth * 58}px)`, aspectRatio: `${shapeWidth} / ${shapeHeight}` }} role="group" aria-label={`${level.name} paper: ${pieces.length} pieces, ${cutCount} straight cuts used of ${level.cuts}`}>
              {level.shape.map((cell) => {
                const piece = pieceOfCell.get(cellKey(cell)) ?? 0;
                const isPlanted = plantedPieces.has(piece);
                return <button key={cellKey(cell)} className={`paper-cell ${selected === piece ? "selected" : ""} ${isPlanted ? "planted" : ""}`} style={{ left: `${(cell[0] / shapeWidth) * 100}%`, top: `${(cell[1] / shapeHeight) * 100}%`, width: `${100 / shapeWidth}%`, height: `${100 / shapeHeight}%`, background: pieces.length > 1 ? PIECE_COLORS[piece % PIECE_COLORS.length] : undefined }} type="button" onClick={() => pickPiece(piece)} disabled={solved} aria-label={`${isPlanted ? "Lift" : "Pick"} piece ${piece + 1}`} />;
              })}
              {seams.map((seam) => {
                const isCut = cuts.has(seam.key);
                const style = seam.orientation === "v"
                  ? { left: `${(seam.line / shapeWidth) * 100}%`, top: `${(seam.along / shapeHeight) * 100}%`, height: `${100 / shapeHeight}%` }
                  : { left: `${(seam.along / shapeWidth) * 100}%`, top: `${(seam.line / shapeHeight) * 100}%`, width: `${100 / shapeWidth}%` };
                return <button key={seam.key} className={`paper-seam ${seam.orientation === "v" ? "vertical" : "horizontal"} ${isCut ? "cut" : ""}`} style={style} type="button" onClick={() => toggleSeam(seam.key)} disabled={solved} aria-pressed={isCut} aria-label={`${isCut ? "Mend" : "Cut"} ${seam.orientation === "v" ? "vertical" : "horizontal"} seam ${seam.line}, ${seam.along + 1}`}><span /></button>;
              })}
            </div>
          </div>
          <div className="bloom-panel">
            <p className="board-label">FLOWER BED · TAP TO PLANT</p>
            <div className={`bloom-target ${solved ? "solved" : ""}`} style={{ width: `min(100%, ${targetWidth * 58}px)`, aspectRatio: `${targetWidth} / ${targetHeight}` }} role="group" aria-label={`Target silhouette: ${planted.size} of ${level.target.length} cells filled`} onMouseLeave={() => setHover(null)}>
              {level.target.map((cell) => {
                const key = cellKey(cell);
                const piece = planted.get(key);
                const ghostState = ghostKeys.get(key);
                return <button key={key} className={`bed-cell ${piece !== undefined ? "filled" : ""} ${ghostState === true ? "ghost" : ghostState === false ? "ghost-bad" : ""}`} style={{ left: `${(cell[0] / targetWidth) * 100}%`, top: `${(cell[1] / targetHeight) * 100}%`, width: `${100 / targetWidth}%`, height: `${100 / targetHeight}%`, background: piece !== undefined ? PIECE_COLORS[piece % PIECE_COLORS.length] : undefined }} type="button" onClick={() => plant(cell)} onMouseEnter={() => setHover(cell)} onFocus={() => setHover(cell)} onBlur={() => setHover(null)} disabled={solved} aria-label={piece !== undefined ? `Lift piece ${piece + 1} from cell ${cell[0] + 1}, ${cell[1] + 1}` : `Plant selected piece with its top cell at ${cell[0] + 1}, ${cell[1] + 1}`} />;
              })}
              {solved && <div className="bloom-stamp" aria-hidden="true">BLOOM!</div>}
            </div>
          </div>
        </div>
        <div className="piece-tray">
          <div className="piece-list" role="group" aria-label="Paper pieces">
            {pieces.map((piece, index) => <button key={index} className={`piece-chip ${selected === index ? "selected" : ""} ${plantedPieces.has(index) ? "planted" : ""}`} type="button" onClick={() => pickPiece(index)} disabled={solved || pieces.length < 2} aria-pressed={selected === index} aria-label={`${plantedPieces.has(index) ? "Lift" : "Pick"} piece ${index + 1}, ${piece.length} cells`}><PieceThumb cells={piece} color={pieces.length > 1 ? PIECE_COLORS[index % PIECE_COLORS.length] : "#f9e3b6"} /><span>{piece.length}</span></button>)}
          </div>
          <div className="transform-actions piece-transforms">
            <button type="button" onClick={() => { setRotation((value) => (value + 1) % 4); tone(400, .05); }} disabled={selected === null || solved}><RotateCw size={14} /> ROTATE</button>
            <button className={flip ? "active" : ""} type="button" onClick={() => { setFlip((value) => !value); tone(360, .05); }} disabled={selected === null || solved}><FlipHorizontal2 size={14} /> FLIP</button>
          </div>
        </div>
      </div>
    </div>
    <StatusNote>{message}</StatusNote>
  </div>;
}

type StarNode = { x: number; y: number };
type StarLevel = { name: string; kind: string; nodes: StarNode[]; lines: number[][]; target: number; hint: string };
type Held = { from: "tray"; value: number } | { from: "node"; index: number } | null;

function polarNode(angle: number, radius: number, center = 50): StarNode {
  const radians = (angle * Math.PI) / 180;
  return { x: Number((center + radius * Math.cos(radians)).toFixed(2)), y: Number((center - radius * Math.sin(radians)).toFixed(2)) };
}

function lerpNode(a: StarNode, b: StarNode, amount: number): StarNode {
  return { x: Number((a.x + (b.x - a.x) * amount).toFixed(2)), y: Number((a.y + (b.y - a.y) * amount).toFixed(2)) };
}

const TRIANGLE_CORNERS: StarNode[] = [{ x: 50, y: 12 }, { x: 12, y: 82 }, { x: 88, y: 82 }];
const STAR_OUTER = Array.from({ length: 6 }, (_, index) => polarNode(90 + index * 60, 43));
const STAR_INNER = Array.from({ length: 6 }, (_, index) => polarNode(index * 60, 43 / Math.sqrt(3)));

const STAR_LEVELS: StarLevel[] = [
  {
    name: "Little Triangle", kind: "TRIANGLE", target: 9,
    nodes: [...TRIANGLE_CORNERS, lerpNode(TRIANGLE_CORNERS[0], TRIANGLE_CORNERS[1], .5), lerpNode(TRIANGLE_CORNERS[1], TRIANGLE_CORNERS[2], .5), lerpNode(TRIANGLE_CORNERS[2], TRIANGLE_CORNERS[0], .5)],
    lines: [[0, 3, 1], [1, 4, 2], [2, 5, 0]],
    hint: "Stones 1 to 6. Each side of the triangle must add up to 9.",
  },
  {
    name: "Crystal Wheel", kind: "CRYSTAL", target: 15,
    nodes: [...Array.from({ length: 8 }, (_, index) => polarNode(90 + index * 45, 36)), { x: 50, y: 50 }],
    lines: [[0, 8, 4], [1, 8, 5], [2, 8, 6], [3, 8, 7]],
    hint: "Stones 1 to 9. Every line through the heart of the crystal must total 15.",
  },
  {
    name: "Grand Triangle", kind: "TRIANGLE", target: 20,
    nodes: [...TRIANGLE_CORNERS, lerpNode(TRIANGLE_CORNERS[0], TRIANGLE_CORNERS[1], 1 / 3), lerpNode(TRIANGLE_CORNERS[0], TRIANGLE_CORNERS[1], 2 / 3), lerpNode(TRIANGLE_CORNERS[1], TRIANGLE_CORNERS[2], 1 / 3), lerpNode(TRIANGLE_CORNERS[1], TRIANGLE_CORNERS[2], 2 / 3), lerpNode(TRIANGLE_CORNERS[2], TRIANGLE_CORNERS[0], 1 / 3), lerpNode(TRIANGLE_CORNERS[2], TRIANGLE_CORNERS[0], 2 / 3)],
    lines: [[0, 3, 4, 1], [1, 5, 6, 2], [2, 7, 8, 0]],
    hint: "Stones 1 to 9, four per side. Every side must add up to 20.",
  },
  {
    name: "Six-Point Star", kind: "HEXAGRAM", target: 26,
    nodes: [...STAR_OUTER, ...STAR_INNER],
    lines: [[0, 8, 9, 2], [2, 10, 11, 4], [4, 6, 7, 0], [5, 7, 8, 1], [1, 9, 10, 3], [3, 11, 6, 5]],
    hint: "Stones 1 to 12 on the magic star. All six lines of four must total 26.",
  },
];

function lineLabelPosition(level: StarLevel, line: number[]): StarNode {
  const first = level.nodes[line[0]];
  const last = level.nodes[line[line.length - 1]];
  const mid = { x: (first.x + last.x) / 2, y: (first.y + last.y) / 2 };
  let dx = mid.x - 50;
  let dy = mid.y - 50;
  let origin = mid;
  let push = 10;
  if (Math.hypot(dx, dy) < 2) { dx = first.x - 50; dy = first.y - 50; origin = first; push = 11; }
  const length = Math.hypot(dx, dy) || 1;
  return { x: origin.x + (dx / length) * push, y: origin.y + (dy / length) * push };
}

function ConstellationGame({ tone }: { tone: Tone }) {
  const [levelIndex, setLevelIndex] = useState(0);
  const level = STAR_LEVELS[levelIndex];
  const [stones, setStones] = useState<(number | null)[]>(() => Array(STAR_LEVELS[0].nodes.length).fill(null));
  const [held, setHeld] = useState<Held>(null);
  const [moves, setMoves] = useState(0);
  const [history, setHistory] = useState<(number | null)[][]>([]);
  const [message, setMessage] = useState(STAR_LEVELS[0].hint);

  const totals = useMemo(() => level.lines.map((line) => ({ sum: line.reduce((sum, index) => sum + (stones[index] ?? 0), 0), full: line.every((index) => stones[index] !== null) })), [level.lines, stones]);
  const tray = useMemo(() => Array.from({ length: level.nodes.length }, (_, index) => index + 1).filter((value) => !stones.includes(value)), [level.nodes.length, stones]);
  const solved = stones.every((value) => value !== null) && totals.every((total) => total.sum === level.target);
  const ready = totals.filter((total) => total.full && total.sum === level.target).length;

  const openLevel = (nextIndex: number) => {
    setLevelIndex(nextIndex);
    setStones(Array(STAR_LEVELS[nextIndex].nodes.length).fill(null));
    setHeld(null);
    setMoves(0);
    setHistory([]);
    setMessage(STAR_LEVELS[nextIndex].hint);
    tone(370 + nextIndex * 55, .08);
  };

  const reset = useCallback(() => {
    setStones(Array(level.nodes.length).fill(null));
    setHeld(null);
    setMoves(0);
    setHistory([]);
    setMessage("Sky cleared. Hang the stones again.");
    tone(260, .08);
  }, [level.nodes.length, tone]);

  const commit = (next: (number | null)[], note: string) => {
    setHistory((items) => [...items, stones]);
    setStones(next);
    setMoves((value) => value + 1);
    setHeld(null);
    const nextTotals = level.lines.map((line) => ({ sum: line.reduce((sum, index) => sum + (next[index] ?? 0), 0), full: line.every((index) => next[index] !== null) }));
    const complete = next.every((value) => value !== null) && nextTotals.every((total) => total.sum === level.target);
    if (complete) {
      setMessage(`Constellation complete! Every line adds up to ${level.target}.`);
      tone(660, .12, .06);
      tone(880, .16, .18);
      window.setTimeout(() => fireWin(null), 150);
      return;
    }
    const lit = nextTotals.filter((total) => total.full && total.sum === level.target).length;
    const over = nextTotals.filter((total) => total.sum > level.target).length;
    setMessage(over ? `${note} ${over} line${over === 1 ? " is" : "s are"} already over ${level.target}.` : lit ? `${note} ${lit} of ${level.lines.length} lines shine.` : note);
  };

  const tapTray = (value: number) => {
    if (solved) return;
    if (held?.from === "tray" && held.value === value) { setHeld(null); tone(300, .05); return; }
    if (held?.from === "node") {
      const next = [...stones];
      next[held.index] = value;
      tone(500, .06);
      commit(next, `Swapped in ${value}.`);
      return;
    }
    setHeld({ from: "tray", value });
    tone(440 + value * 18, .05);
  };

  const tapNode = (index: number) => {
    if (solved) return;
    const current = stones[index];
    if (held?.from === "tray") {
      const next = [...stones];
      next[index] = held.value;
      tone(520, .06);
      commit(next, current === null ? `Stone ${held.value} hung.` : `Stone ${held.value} replaced ${current}.`);
      return;
    }
    if (held?.from === "node") {
      if (held.index === index) {
        const next = [...stones];
        next[index] = null;
        tone(320, .06);
        commit(next, `Stone ${current} lifted back to the tray.`);
        return;
      }
      const next = [...stones];
      next[index] = stones[held.index];
      next[held.index] = current;
      tone(480, .06);
      commit(next, current === null ? `Stone ${stones[held.index]} moved.` : `Stones ${stones[held.index]} and ${current} swapped.`);
      return;
    }
    if (current === null) { setMessage("Pick a stone from the tray first."); tone(145, .1); return; }
    setHeld({ from: "node", index });
    tone(400, .05);
    setMessage(`Holding ${current}. Tap another star to swap, or tap it again to lift it off.`);
  };

  const undo = () => {
    const previous = history.at(-1);
    if (!previous) return;
    setStones(previous);
    setHistory((items) => items.slice(0, -1));
    setMoves((value) => Math.max(0, value - 1));
    setHeld(null);
    setMessage("Last stone move reversed.");
    tone(210, .08);
  };

  return <div>
    <ScoreStrip leftLabel="LEVEL" left={levelIndex + 1} center={solved ? "CONSTELLATION COMPLETE" : level.name.toUpperCase()} rightLabel="MOVES" right={moves} />
    <div className="puzzle-layout constellation-layout">
      <aside className="puzzle-sidebar constellation-sidebar">
        <p className="mini-kicker">EVERY LINE MAKES</p>
        <div className="domino-target star-target"><strong>{level.target}</strong><span>TARGET<br />TOTAL</span></div>
        <p className="sidebar-copy">{ready} of {level.lines.length} lines shine. Stones 1 to {level.nodes.length}, each used once.</p>
        <div className="level-dots" aria-label="Constellation Sums levels">{STAR_LEVELS.map((item, index) => <button key={item.name} className={index === levelIndex ? "active" : index < levelIndex ? "passed" : ""} type="button" onClick={() => openLevel(index)} aria-label={`Open level ${index + 1}: ${item.name}`}>{index + 1}</button>)}</div>
        <div className="toolbar-actions puzzle-actions">
          <button className="icon-button" type="button" onClick={undo} disabled={!history.length || solved} aria-label="Undo last stone move"><Undo2 size={18} /></button>
          <button className="icon-button" type="button" onClick={reset} aria-label="Restart Constellation Sums level"><RefreshCcw size={18} /></button>
        </div>
        {solved && levelIndex < STAR_LEVELS.length - 1 && <button className="next-level-button" type="button" onClick={() => openLevel(levelIndex + 1)}>NEXT SKY <ArrowRight size={16} /></button>}
      </aside>
      <div className="constellation-stage">
        <div className={`sky-board ${solved ? "solved" : ""}`} role="group" aria-label={`${level.name}: ${ready} of ${level.lines.length} lines at ${level.target}`}>
          <svg className="sky-lines" viewBox="0 0 100 100" aria-hidden="true">
            {level.lines.map((line, index) => <polyline key={index} className={totals[index].full && totals[index].sum === level.target ? "lit" : totals[index].sum > level.target ? "over" : ""} points={line.map((node) => `${level.nodes[node].x},${level.nodes[node].y}`).join(" ")} />)}
          </svg>
          {level.lines.map((line, index) => {
            const position = lineLabelPosition(level, line);
            const state = totals[index].full && totals[index].sum === level.target ? "ready" : totals[index].sum > level.target ? "over" : "under";
            return <div key={index} className={`line-total ${state}`} style={{ left: `${position.x}%`, top: `${position.y}%` }} aria-label={`Line ${index + 1} total ${totals[index].sum}`}>{totals[index].sum}</div>;
          })}
          {level.nodes.map((node, index) => {
            const value = stones[index];
            const isHeld = held?.from === "node" && held.index === index;
            return <button key={`${levelIndex}-${index}`} className={`star-node ${value !== null ? "filled" : ""} ${isHeld ? "held" : ""} ${held?.from === "tray" && value === null ? "open" : ""}`} style={{ left: `${node.x}%`, top: `${node.y}%` }} type="button" onClick={() => tapNode(index)} disabled={solved} aria-pressed={isHeld} aria-label={value === null ? `Empty star ${index + 1}` : `Star ${index + 1} holding stone ${value}`}>{value ?? "✦"}</button>;
          })}
        </div>
        <div className="stone-tray" role="group" aria-label="Stone tray">
          {Array.from({ length: level.nodes.length }, (_, index) => index + 1).map((value) => {
            const inTray = tray.includes(value);
            const isHeld = held?.from === "tray" && held.value === value;
            return <button key={value} className={`stone ${inTray ? "" : "used"} ${isHeld ? "held" : ""}`} type="button" onClick={() => tapTray(value)} disabled={!inTray || solved} aria-pressed={isHeld} aria-label={inTray ? `${isHeld ? "Put down" : "Pick up"} stone ${value}` : `Stone ${value} is on the sky`}>{value}</button>;
          })}
        </div>
      </div>
    </div>
    <StatusNote>{message}</StatusNote>
  </div>;
}

type YardTrack = { name: string; capacity: number | null; kind: "arrival" | "siding" | "main" };
type YardLevel = { name: string; tracks: YardTrack[]; start: number[][]; goal: number[]; par: number; hint: string };

const CAR_COLORS = ["#1c88e5", "#ff684d", "#ffc53d", "#2a9d73", "#6948d7"];
const CAR_NAMES = ["BLUE", "CORAL", "GOLD", "GREEN", "PLUM"];

const YARD_LEVELS: YardLevel[] = [
  { name: "First Shunt", tracks: [{ name: "Arrival", capacity: null, kind: "arrival" }, { name: "Siding", capacity: 1, kind: "siding" }, { name: "Main Line", capacity: null, kind: "main" }], start: [[0, 1, 2], [], []], goal: [1, 2, 0], par: 4, hint: "Park one car on the siding so the others can pass it." },
  { name: "Keep the Order", tracks: [{ name: "Arrival", capacity: null, kind: "arrival" }, { name: "Siding", capacity: 2, kind: "siding" }, { name: "Main Line", capacity: null, kind: "main" }], start: [[0, 1, 2], [], []], goal: [0, 1, 2], par: 5, hint: "Pushing cars straight through reverses them. Use the siding to undo that." },
  { name: "Colour Sort", tracks: [{ name: "Arrival", capacity: null, kind: "arrival" }, { name: "Siding", capacity: 2, kind: "siding" }, { name: "Main Line", capacity: null, kind: "main" }], start: [[1, 0, 3, 2], [], []], goal: [0, 1, 2, 3], par: 7, hint: "Two pairs are swapped. The siding holds two cars at once." },
  { name: "Twin Sidings", tracks: [{ name: "Arrival", capacity: null, kind: "arrival" }, { name: "Siding 1", capacity: 2, kind: "siding" }, { name: "Siding 2", capacity: 1, kind: "siding" }, { name: "Main Line", capacity: null, kind: "main" }], start: [[2, 0, 4, 1, 3], [], [], []], goal: [0, 1, 2, 3, 4], par: 8, hint: "Five cars, two sidings. Plan which car needs to reach the main line first." },
];

function YardCar({ car, small = false }: { car: number; small?: boolean }) {
  return <span className={`yard-car ${small ? "small" : ""}`} style={{ background: CAR_COLORS[car] }} aria-hidden="true"><b>{car + 1}</b></span>;
}

function SwitchyardGame({ tone }: { tone: Tone }) {
  const [levelIndex, setLevelIndex] = useState(0);
  const level = YARD_LEVELS[levelIndex];
  const [tracks, setTracks] = useState<number[][]>(() => YARD_LEVELS[0].start.map((track) => [...track]));
  const [coupled, setCoupled] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [history, setHistory] = useState<number[][][]>([]);
  const [message, setMessage] = useState(YARD_LEVELS[0].hint);
  const mainIndex = level.tracks.findIndex((track) => track.kind === "main");
  const solved = tracks[mainIndex].length === level.goal.length && tracks[mainIndex].every((car, index) => car === level.goal[index]);

  const load = (nextIndex: number, note: string) => {
    setLevelIndex(nextIndex);
    setTracks(YARD_LEVELS[nextIndex].start.map((track) => [...track]));
    setCoupled(null);
    setMoves(0);
    setHistory([]);
    setMessage(note);
  };

  const openLevel = (nextIndex: number) => { load(nextIndex, YARD_LEVELS[nextIndex].hint); tone(340 + nextIndex * 60, .08); };
  const reset = () => { load(levelIndex, "Yard reset. Every car is back on the arrival track."); tone(260, .08); };

  const tapTrack = (index: number) => {
    if (solved) return;
    if (coupled === null) {
      if (!tracks[index].length) { setMessage(`${level.tracks[index].name} is empty—tap a track that has a car nearest the switch.`); tone(145, .1); return; }
      setCoupled(index);
      setMessage(`Engine coupled to the ${CAR_NAMES[tracks[index][0]].toLowerCase()} car. Tap the track to push it onto.`);
      tone(420, .06);
      return;
    }
    if (coupled === index) { setCoupled(null); setMessage("Uncoupled. Tap any car nearest the switch."); tone(300, .05); return; }
    const capacity = level.tracks[index].capacity;
    if (capacity !== null && tracks[index].length >= capacity) { setMessage(`${level.tracks[index].name} is full—it holds only ${capacity} car${capacity === 1 ? "" : "s"}.`); tone(145, .1); return; }
    const car = tracks[coupled][0];
    const next = tracks.map((track, trackIndex) => trackIndex === coupled ? track.slice(1) : trackIndex === index ? [car, ...track] : track);
    const nextMoves = moves + 1;
    setHistory((items) => [...items, tracks]);
    setTracks(next);
    setCoupled(null);
    setMoves(nextMoves);
    tone(500 + car * 40, .07);
    const done = next[mainIndex].length === level.goal.length && next[mainIndex].every((item, itemIndex) => item === level.goal[itemIndex]);
    if (done) {
      setMessage(nextMoves <= level.par ? `Perfect shunt! Departure order matched in ${nextMoves} moves—par was ${level.par}.` : `Train assembled in ${nextMoves} moves. Par is ${level.par}—can you shave some off?`);
      tone(660, .12, .06);
      tone(880, .16, .18);
      window.setTimeout(() => fireWin(null), 150);
    } else {
      const matched = next[mainIndex].filter((item, itemIndex) => item === level.goal[itemIndex]).length;
      setMessage(`${CAR_NAMES[car]} car moved to ${level.tracks[index].name}. ${nextMoves} move${nextMoves === 1 ? "" : "s"} used${matched ? ` · ${matched} car${matched === 1 ? "" : "s"} in position` : ""}.`);
    }
  };

  const undo = () => {
    const previous = history.at(-1);
    if (!previous) return;
    setTracks(previous);
    setHistory((items) => items.slice(0, -1));
    setMoves((value) => Math.max(0, value - 1));
    setCoupled(null);
    setMessage("Last shunt reversed.");
    tone(210, .08);
  };

  const rightTracks = level.tracks.map((track, index) => ({ track, index })).filter(({ track }) => track.kind !== "arrival");
  const arrivalIndex = level.tracks.findIndex((track) => track.kind === "arrival");
  const renderTrack = (index: number) => {
    const track = level.tracks[index];
    const cars = tracks[index];
    const isCoupled = coupled === index;
    const full = track.capacity !== null && cars.length >= track.capacity;
    const isTarget = coupled !== null && coupled !== index;
    return <button key={`${levelIndex}-${index}`} className={`yard-track ${track.kind} ${isCoupled ? "coupled" : ""} ${isTarget ? (full ? "blocked" : "target") : ""} ${index === mainIndex && solved ? "done" : ""}`} type="button" onClick={() => tapTrack(index)} disabled={solved} aria-pressed={isCoupled} aria-label={`${track.name}${track.capacity !== null ? `, holds ${track.capacity}` : ""}: ${cars.length ? cars.map((car) => CAR_NAMES[car].toLowerCase()).join(", ") + " from the switch" : "empty"}`}>
      <span className="track-name">{track.name}{track.capacity !== null && <small>MAX {track.capacity}</small>}</span>
      <span className="track-cars">{cars.map((car) => <YardCar key={car} car={car} />).concat(track.capacity !== null ? Array.from({ length: Math.max(0, track.capacity - cars.length) }, (_, slot) => <span key={`slot-${slot}`} className="yard-slot" aria-hidden="true" />) : [])}</span>
      {track.kind === "siding" && <span className="buffer-stop" aria-hidden="true" />}
    </button>;
  };

  return <div>
    <ScoreStrip leftLabel="LEVEL" left={levelIndex + 1} center={solved ? "TRAIN ASSEMBLED" : level.name.toUpperCase()} rightLabel="MOVES" right={moves} />
    <div className="puzzle-layout yard-layout">
      <aside className="puzzle-sidebar yard-sidebar">
        <p className="mini-kicker">DEPARTURE ORDER</p>
        <div className="goal-train" aria-label={`Goal order from the switch: ${level.goal.map((car) => CAR_NAMES[car].toLowerCase()).join(", ")}`}><TrainFront size={18} />{level.goal.map((car) => <YardCar key={car} car={car} small />)}</div>
        <div className="domino-target yard-par"><strong>{level.par}</strong><span>PAR<br />MOVES</span></div>
        <div className="level-dots" aria-label="Switchyard levels">{YARD_LEVELS.map((item, index) => <button key={item.name} className={index === levelIndex ? "active" : index < levelIndex ? "passed" : ""} type="button" onClick={() => openLevel(index)} aria-label={`Open level ${index + 1}: ${item.name}`}>{index + 1}</button>)}</div>
        <div className="toolbar-actions puzzle-actions">
          <button className="icon-button" type="button" onClick={undo} disabled={!history.length || solved} aria-label="Undo last shunt"><Undo2 size={18} /></button>
          <button className="icon-button" type="button" onClick={reset} aria-label="Restart Switchyard level"><RefreshCcw size={18} /></button>
        </div>
        {solved && levelIndex < YARD_LEVELS.length - 1 && <button className="next-level-button" type="button" onClick={() => openLevel(levelIndex + 1)}>NEXT YARD <ArrowRight size={16} /></button>}
      </aside>
      <div className="yard-stage">
        <div className="yard-board" role="group" aria-label={`${level.name} shunting yard`}>
          <div className="yard-left">{renderTrack(arrivalIndex)}</div>
          <div className={`yard-switch ${coupled !== null ? "armed" : ""}`} aria-hidden="true"><span>{coupled !== null ? <YardCar car={tracks[coupled][0]} small /> : "◆"}</span></div>
          <div className="yard-right">{rightTracks.map(({ index }) => renderTrack(index))}</div>
        </div>
      </div>
    </div>
    <StatusNote>{message}</StatusNote>
  </div>;
}

type BalanceLevel = { name: string; coins: number; weighings: number; fakeKind: "heavy" | "light" | "unknown"; hint: string };
type Weighing = { left: number[]; right: number[]; result: "left" | "right" | "balanced" };
type PanMode = "left" | "right" | "accuse";

const BALANCE_LEVELS: BalanceLevel[] = [
  { name: "Three Coins", coins: 3, weighings: 1, fakeKind: "heavy", hint: "Three coins, one heavier, one weighing. Which coin can you leave off the scale?" },
  { name: "Nine Coins", coins: 9, weighings: 2, fakeKind: "heavy", hint: "Nine coins, one heavier, two weighings. Think in groups of three." },
  { name: "Light Fingers", coins: 8, weighings: 2, fakeKind: "light", hint: "Eight coins, one lighter, two weighings. Three against three is a good start." },
  { name: "The Twelve", coins: 12, weighings: 3, fakeKind: "unknown", hint: "Twelve coins, one fake—heavier OR lighter, nobody knows. Three weighings. The classic." },
];

function pickFake(level: BalanceLevel) {
  const heavy = level.fakeKind === "heavy" ? true : level.fakeKind === "light" ? false : Math.random() < .5;
  return { coin: Math.floor(Math.random() * level.coins), heavy };
}

function Coin({ coin, revealed, suspect, onClick, disabled, label }: { coin: number; revealed?: "heavy" | "light" | null; suspect?: boolean; onClick: () => void; disabled?: boolean; label: string }) {
  return <button className={`coin ${revealed ? `revealed ${revealed}` : ""} ${suspect ? "suspect" : ""}`} type="button" onClick={onClick} disabled={disabled} aria-label={label}>{coin + 1}</button>;
}

function BalanceGame({ tone }: { tone: Tone }) {
  const [levelIndex, setLevelIndex] = useState(0);
  const level = BALANCE_LEVELS[levelIndex];
  const [fake, setFake] = useState<{ coin: number; heavy: boolean } | null>(() => pickFake(BALANCE_LEVELS[0]));
  const [left, setLeft] = useState<number[]>([]);
  const [right, setRight] = useState<number[]>([]);
  const [mode, setMode] = useState<PanMode>("left");
  const [log, setLog] = useState<Weighing[]>([]);
  const [tilt, setTilt] = useState<"left" | "right" | "balanced" | null>(null);
  const [outcome, setOutcome] = useState<"solved" | "failed" | null>(null);
  const [message, setMessage] = useState(BALANCE_LEVELS[0].hint);

  const newCase = (nextLevel: BalanceLevel) => {
    setFake(pickFake(nextLevel));
    setLeft([]);
    setRight([]);
    setMode("left");
    setLog([]);
    setTilt(null);
    setOutcome(null);
  };

  const openLevel = (nextIndex: number) => {
    setLevelIndex(nextIndex);
    newCase(BALANCE_LEVELS[nextIndex]);
    setMessage(BALANCE_LEVELS[nextIndex].hint);
    tone(360 + nextIndex * 60, .08);
  };

  const reset = () => { newCase(level); setMessage("New case. The fake coin has been reshuffled."); tone(260, .08); };

  const tray = Array.from({ length: level.coins }, (_, coin) => coin).filter((coin) => !left.includes(coin) && !right.includes(coin));
  const weighingsLeft = level.weighings - log.length;
  const locked = outcome !== null;

  const accuse = (coin: number) => {
    if (!fake) return;
    if (coin === fake.coin) {
      setOutcome("solved");
      setMessage(`Case closed! Coin ${coin + 1} is the fake—it is ${fake.heavy ? "heavier" : "lighter"}. Solved with ${log.length} of ${level.weighings} weighings.`);
      tone(660, .12, .06);
      tone(880, .16, .18);
      window.setTimeout(() => fireWin(null), 150);
    } else {
      setOutcome("failed");
      setMessage(`Not guilty! Coin ${coin + 1} was genuine. The fake was coin ${fake.coin + 1} (${fake.heavy ? "heavier" : "lighter"}). Restart for a fresh case.`);
      tone(150, .18);
    }
  };

  const tapCoin = (coin: number, from: "tray" | "left" | "right") => {
    if (locked) return;
    if (mode === "accuse") { accuse(coin); return; }
    if (from === "left") setLeft((items) => items.filter((item) => item !== coin));
    if (from === "right") setRight((items) => items.filter((item) => item !== coin));
    if (from === "tray") {
      if (mode === "left") setLeft((items) => [...items, coin]); else setRight((items) => [...items, coin]);
      tone(mode === "left" ? 440 : 520, .05);
      setMessage(`Coin ${coin + 1} loaded on the ${mode} pan.`);
    } else {
      tone(320, .05);
      setMessage(`Coin ${coin + 1} returned to the tray.`);
    }
    setTilt(null);
  };

  const weigh = () => {
    if (locked || !fake) return;
    if (!left.length || !right.length) { setMessage("Load coins on both pans before weighing."); tone(145, .1); return; }
    if (weighingsLeft <= 0) { setMessage(`No weighings left—switch to ACCUSE and name the fake.`); tone(145, .1); return; }
    const weight = (coin: number) => 1 + (coin === fake.coin ? (fake.heavy ? .1 : -.1) : 0);
    const leftWeight = left.reduce((sum, coin) => sum + weight(coin), 0);
    const rightWeight = right.reduce((sum, coin) => sum + weight(coin), 0);
    const result: Weighing["result"] = Math.abs(leftWeight - rightWeight) < 1e-6 ? "balanced" : leftWeight > rightWeight ? "left" : "right";
    setLog((items) => [...items, { left: [...left], right: [...right], result }]);
    setTilt(result);
    tone(result === "balanced" ? 500 : 380, .1);
    if (result !== "balanced") tone(300, .1, .1);
    const remaining = weighingsLeft - 1;
    setMessage(`${result === "balanced" ? "The pans balance." : `The ${result} pan sinks.`} ${remaining ? `${remaining} weighing${remaining === 1 ? "" : "s"} left.` : "No weighings left—time to accuse."}`);
  };

  const describeLog = (entry: Weighing) => `${entry.left.map((coin) => coin + 1).join(" ")} ${entry.result === "left" ? "▼" : entry.result === "right" ? "▲" : "="} ${entry.right.map((coin) => coin + 1).join(" ")}`;
  const revealFor = (coin: number) => outcome && fake && coin === fake.coin ? (fake.heavy ? "heavy" : "light") : null;

  return <div>
    <ScoreStrip leftLabel="LEVEL" left={levelIndex + 1} center={outcome === "solved" ? "CASE CLOSED" : outcome === "failed" ? "WRONG SUSPECT" : level.name.toUpperCase()} rightLabel="WEIGHINGS LEFT" right={Math.max(0, weighingsLeft)} />
    <div className="puzzle-layout balance-layout">
      <aside className="puzzle-sidebar balance-sidebar">
        <p className="mini-kicker">THE CASE</p>
        <div className="domino-target balance-fact"><strong>{level.coins}</strong><span>COINS<br />ONE FAKE</span></div>
        <p className="sidebar-copy">{level.fakeKind === "heavy" ? "The fake is heavier." : level.fakeKind === "light" ? "The fake is lighter." : "Heavier or lighter—unknown."} {level.weighings} weighing{level.weighings === 1 ? "" : "s"} allowed.</p>
        <div className="level-dots" aria-label="Balance Detective levels">{BALANCE_LEVELS.map((item, index) => <button key={item.name} className={index === levelIndex ? "active" : index < levelIndex ? "passed" : ""} type="button" onClick={() => openLevel(index)} aria-label={`Open level ${index + 1}: ${item.name}`}>{index + 1}</button>)}</div>
        <div className="toolbar-actions puzzle-actions">
          <button className="icon-button" type="button" onClick={reset} aria-label="New case with a reshuffled fake coin"><RefreshCcw size={18} /></button>
        </div>
        {outcome === "solved" && levelIndex < BALANCE_LEVELS.length - 1 && <button className="next-level-button" type="button" onClick={() => openLevel(levelIndex + 1)}>NEXT CASE <ArrowRight size={16} /></button>}
      </aside>
      <div className="balance-stage">
        <div className="balance-controls">
          <div className="segmented" aria-label="What tapping a coin does">
            <button className={mode === "left" ? "selected" : ""} type="button" onClick={() => setMode("left")} disabled={locked}>LEFT PAN</button>
            <button className={mode === "right" ? "selected" : ""} type="button" onClick={() => setMode("right")} disabled={locked}>RIGHT PAN</button>
            <button className={`accuse-mode ${mode === "accuse" ? "selected" : ""}`} type="button" onClick={() => { setMode("accuse"); setMessage("Tap the coin you believe is the fake."); }} disabled={locked}>ACCUSE</button>
          </div>
          <button className="weigh-button" type="button" onClick={weigh} disabled={locked || weighingsLeft <= 0 || !left.length || !right.length}><Scale size={16} /> WEIGH</button>
        </div>
        <div className={`scale ${tilt ?? "level"}`} role="group" aria-label={`Balance scale: left pan ${left.length ? left.map((coin) => coin + 1).join(", ") : "empty"}; right pan ${right.length ? right.map((coin) => coin + 1).join(", ") : "empty"}${tilt ? `; ${tilt === "balanced" ? "balanced" : `${tilt} pan down`}` : ""}`}>
          <div className="scale-beam" aria-hidden="true" />
          <div className="scale-pillar" aria-hidden="true" />
          {(["left", "right"] as const).map((side) => {
            const coins = side === "left" ? left : right;
            return <div key={side} className={`pan pan-${side} ${mode === side ? "armed" : ""}`}>
              <div className="pan-coins">{coins.map((coin) => <Coin key={coin} coin={coin} revealed={revealFor(coin)} onClick={() => tapCoin(coin, side)} disabled={locked} label={mode === "accuse" ? `Accuse coin ${coin + 1}` : `Return coin ${coin + 1} to the tray`} />)}{!coins.length && <span className="pan-empty">{side.toUpperCase()}</span>}</div>
              <div className="pan-dish" aria-hidden="true" />
            </div>;
          })}
        </div>
        <div className="coin-tray" role="group" aria-label="Coin tray">
          {tray.map((coin) => <Coin key={coin} coin={coin} revealed={revealFor(coin)} onClick={() => tapCoin(coin, "tray")} disabled={locked} label={mode === "accuse" ? `Accuse coin ${coin + 1}` : `Load coin ${coin + 1} on the ${mode} pan`} />)}
          {!tray.length && <span className="tray-empty">Every coin is on the scale.</span>}
        </div>
        <ol className="weigh-log" aria-label="Weighing log">
          {log.map((entry, index) => <li key={index} className={entry.result}><span>#{index + 1}</span><code>{describeLog(entry)}</code><em>{entry.result === "balanced" ? "balanced" : `${entry.result} down`}</em></li>)}
          {!log.length && <li className="empty">No weighings yet. ▼ means the left pan sank, ▲ the right.</li>}
        </ol>
      </div>
    </div>
    <StatusNote>{message}</StatusNote>
  </div>;
}
