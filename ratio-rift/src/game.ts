export type WorldId = 'aurora' | 'prism' | 'comet' | 'titan'

export type ChallengeKind =
  | 'fraction-grid'
  | 'ratio-mixer'
  | 'missing-value'
  | 'number-line'
  | 'equivalence'
  | 'cargo-grid'
  | 'unit-rate'
  | 'best-deal'
  | 'rate-prediction'
  | 'scale-blueprint'
  | 'map-scale'
  | 'core-sequence'

export type Challenge = {
  id: number
  world: WorldId
  kind: ChallengeKind
  title: string
  callSign: string
  mission: string
  concept: string
  hint: string
  explanation: string
}

export type World = {
  id: WorldId
  label: string
  eyebrow: string
  color: string
  icon: string
}

export const worlds: World[] = [
  {
    id: 'aurora',
    label: 'Aurora Dock',
    eyebrow: 'Fractions & ratios',
    color: '#49e6c8',
    icon: '◫',
  },
  {
    id: 'prism',
    label: 'Prism Belt',
    eyebrow: 'Percents & decimals',
    color: '#ffcf5a',
    icon: '◇',
  },
  {
    id: 'comet',
    label: 'Comet Run',
    eyebrow: 'Rates & comparisons',
    color: '#ff7f95',
    icon: '↗',
  },
  {
    id: 'titan',
    label: 'Titan Forge',
    eyebrow: 'Scale & synthesis',
    color: '#9f8cff',
    icon: '✦',
  },
]

export const challenges: Challenge[] = [
  {
    id: 1,
    world: 'aurora',
    kind: 'fraction-grid',
    title: 'Wake the solar cells',
    callSign: 'CELL ARRAY',
    mission: 'Charge exactly 3/8 of the eight-cell array.',
    concept: 'A fraction names selected parts out of equal total parts.',
    hint: 'The bottom number tells you there are 8 equal cells. The top number tells you how many to charge.',
    explanation: 'You charged 3 of 8 equal cells. That is exactly 3/8 of the whole array.',
  },
  {
    id: 2,
    world: 'aurora',
    kind: 'ratio-mixer',
    title: 'Blend ion fuel',
    callSign: 'FUEL MIXER',
    mission: 'Make a 2 : 3 mix of cyan ions to magenta ions using exactly 5 units.',
    concept: 'A ratio compares the amounts of two things in the same mixture.',
    hint: 'The two ratio parts add to 5. So this tank needs 2 cyan units and 3 magenta units.',
    explanation: 'The tank contains 2 cyan units for every 3 magenta units: 2 : 3. Together they make 5 units.',
  },
  {
    id: 3,
    world: 'aurora',
    kind: 'missing-value',
    title: 'Amplify the signal',
    callSign: 'EQUIVALENCE',
    mission: 'A small relay uses 4 coils with 6 cells. How many cells keep the same ratio with 10 coils?',
    concept: 'Equivalent ratios grow or shrink both quantities by the same factor.',
    hint: '4 becomes 10 by multiplying by 2.5. Apply that same factor to 6.',
    explanation: '4 × 2.5 = 10, so 6 × 2.5 = 15. Both ratios simplify to 2 : 3.',
  },
  {
    id: 4,
    world: 'prism',
    kind: 'number-line',
    title: 'Tune the prism gate',
    callSign: 'PERCENT LINE',
    mission: 'Place the gate at the same point as 13/20.',
    concept: 'Fractions, decimals, and percentages can name the same point.',
    hint: 'To turn twentieths into hundredths, multiply both numbers by 5.',
    explanation: '13/20 = 65/100 = 0.65 = 65%. They are four names for the same amount.',
  },
  {
    id: 5,
    world: 'prism',
    kind: 'equivalence',
    title: 'Link the twin signals',
    callSign: 'MATCH FIELD',
    mission: 'Select the fraction and percentage that match the decimal 0.375.',
    concept: 'Equivalent forms are different descriptions of one quantity.',
    hint: '0.375 is 375 thousandths. Simplify 375/1000, then multiply the decimal by 100 for percent.',
    explanation: '0.375 = 375/1000 = 3/8, and 0.375 × 100 = 37.5%.',
  },
  {
    id: 6,
    world: 'prism',
    kind: 'cargo-grid',
    title: 'Reserve the med-kits',
    callSign: 'CARGO SPLIT',
    mission: 'Mark exactly 25% of the 24 cargo pods as medical supplies.',
    concept: 'A percentage is a part of 100, but it can describe any-sized group.',
    hint: '25% is one quarter. Divide 24 pods into four equal groups.',
    explanation: '25% = 1/4, and one quarter of 24 is 6. So 6 pods become medical supplies.',
  },
  {
    id: 7,
    world: 'comet',
    kind: 'unit-rate',
    title: 'Calibrate comet speed',
    callSign: 'UNIT RATE',
    mission: 'A survey drone crosses 18 sectors in 3 pulses. Find its sectors per pulse.',
    concept: 'A unit rate tells how much happens for exactly one unit.',
    hint: 'Split the 18 sectors equally across the 3 pulses.',
    explanation: '18 ÷ 3 = 6, so the drone moves 6 sectors per pulse.',
  },
  {
    id: 8,
    world: 'comet',
    kind: 'best-deal',
    title: 'Outsmart the supply bot',
    callSign: 'UNIT PRICE',
    mission: 'Choose the crystal pack with the lowest cost per crystal.',
    concept: 'Unit prices make differently sized offers comparable.',
    hint: 'Divide each price by its number of crystals. The smallest result is the best value.',
    explanation: 'The packs cost 3, 2.5, and 2.8 credits per crystal. The 10-crystal pack is the best deal.',
  },
  {
    id: 9,
    world: 'comet',
    kind: 'rate-prediction',
    title: 'Plot the escape burn',
    callSign: 'RATE ENGINE',
    mission: 'At 7 megameters per pulse, how far will the ship travel in 8 pulses?',
    concept: 'A constant rate scales with time: distance = rate × time.',
    hint: 'Imagine 8 equal jumps of 7. Multiply 7 by 8.',
    explanation: '8 pulses × 7 megameters per pulse = 56 megameters.',
  },
  {
    id: 10,
    world: 'titan',
    kind: 'scale-blueprint',
    title: 'Enlarge the solar wing',
    callSign: 'SCALE FACTOR',
    mission: 'Scale a 6 × 4 panel by a factor of 1.5. Set its new width and height.',
    concept: 'A scale factor multiplies every matching length by the same number.',
    hint: 'Multiply both dimensions—not just one—by 1.5.',
    explanation: '6 × 1.5 = 9 and 4 × 1.5 = 6. The shape stays proportional at 9 × 6.',
  },
  {
    id: 11,
    world: 'titan',
    kind: 'map-scale',
    title: 'Measure the moon route',
    callSign: 'MAP SCALE',
    mission: 'The route is 3.5 map tiles. Each tile represents 12 km. Find the real distance.',
    concept: 'Map scale is a rate between a drawing and the real world.',
    hint: 'Three tiles are 36 km. Half a tile is another 6 km.',
    explanation: '3.5 × 12 km = 42 km. The half tile contributes 6 of those kilometers.',
  },
  {
    id: 12,
    world: 'titan',
    kind: 'core-sequence',
    title: 'Seal the Ratio Rift',
    callSign: 'CORE SEQUENCE',
    mission: 'Solve the three linked systems and enter the core sequence.',
    concept: 'Proportional reasoning connects ratios, percentages, rates, and scale.',
    hint: 'A: scale 3 : 5 until the first part is 24. B: 25% is one quarter. C: divide credits by crystals.',
    explanation: 'A is 40, B is 20, and C is 2.5. You used a scale factor, a percent, and a unit rate.',
  },
]

export const gcd = (a: number, b: number): number => {
  let x = Math.abs(a)
  let y = Math.abs(b)
  while (y !== 0) {
    ;[x, y] = [y, x % y]
  }
  return x
}

export const ratiosEquivalent = (
  firstA: number,
  firstB: number,
  secondA: number,
  secondB: number,
): boolean => firstA * secondB === firstB * secondA

export const percentOf = (percent: number, whole: number): number =>
  (percent / 100) * whole

export const unitRate = (amount: number, units: number): number => amount / units

export const scaledDimensions = (
  width: number,
  height: number,
  factor: number,
): [number, number] => [width * factor, height * factor]

export const isChallengeUnlocked = (_id: number, _solved: number[]): boolean => true
