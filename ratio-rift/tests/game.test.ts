import { describe, expect, it } from 'vitest'
import {
  challenges,
  gcd,
  isChallengeUnlocked,
  percentOf,
  ratiosEquivalent,
  scaledDimensions,
  unitRate,
} from '../src/game'

describe('Ratio Rift game model', () => {
  it('contains twelve sequential missions across four worlds', () => {
    expect(challenges).toHaveLength(12)
    expect(new Set(challenges.map((challenge) => challenge.id)).size).toBe(12)
    expect(new Set(challenges.map((challenge) => challenge.world)).size).toBe(4)
  })

  it('recognises equivalent ratios', () => {
    expect(ratiosEquivalent(4, 6, 10, 15)).toBe(true)
    expect(ratiosEquivalent(2, 3, 8, 10)).toBe(false)
    expect(gcd(18, 24)).toBe(6)
  })

  it('calculates the mission quantities', () => {
    expect(percentOf(25, 24)).toBe(6)
    expect(unitRate(18, 3)).toBe(6)
    expect(scaledDimensions(6, 4, 1.5)).toEqual([9, 6])
  })

  it('keeps every mission open for free map exploration', () => {
    expect(isChallengeUnlocked(1, [])).toBe(true)
    expect(isChallengeUnlocked(2, [])).toBe(true)
    expect(isChallengeUnlocked(2, [1])).toBe(true)
    expect(isChallengeUnlocked(8, [])).toBe(true)
    expect(isChallengeUnlocked(8, [8])).toBe(true)
  })
})
