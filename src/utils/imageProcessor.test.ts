import { describe, it, expect } from 'vitest'
import {
  calculateFontSize,
  calculatePosition,
  Position,
  TimestampConfig,
} from './imageProcessor'

describe('calculateFontSize', () => {
  it('should return approximately 3% of image width', () => {
    expect(calculateFontSize(1000)).toBe(30)
    expect(calculateFontSize(2000)).toBe(60)
    expect(calculateFontSize(3000)).toBe(90)
  })

  it('should return minimum size for small images', () => {
    expect(calculateFontSize(100)).toBe(12)
    expect(calculateFontSize(200)).toBe(12)
  })

  it('should cap maximum size for very large images', () => {
    expect(calculateFontSize(10000)).toBe(150)
    expect(calculateFontSize(20000)).toBe(150)
  })
})

describe('calculatePosition', () => {
  const imageSize = { width: 1000, height: 800 }
  const textSize = { width: 100, height: 30 }
  const padding = 20

  describe('bottom-right position', () => {
    it('should position text at bottom-right with padding', () => {
      const result = calculatePosition('bottom-right', imageSize, textSize, padding)
      expect(result.x).toBe(880) // 1000 - 100 - 20
      expect(result.y).toBe(750) // 800 - 30 - 20
    })
  })

  describe('bottom-left position', () => {
    it('should position text at bottom-left with padding', () => {
      const result = calculatePosition('bottom-left', imageSize, textSize, padding)
      expect(result.x).toBe(20)
      expect(result.y).toBe(750)
    })
  })

  describe('top-right position', () => {
    it('should position text at top-right with padding', () => {
      const result = calculatePosition('top-right', imageSize, textSize, padding)
      expect(result.x).toBe(880)
      expect(result.y).toBe(50) // 20 + 30
    })
  })

  describe('top-left position', () => {
    it('should position text at top-left with padding', () => {
      const result = calculatePosition('top-left', imageSize, textSize, padding)
      expect(result.x).toBe(20)
      expect(result.y).toBe(50)
    })
  })
})

describe('Position type', () => {
  it('should accept all valid position values', () => {
    const positions: Position[] = ['bottom-right', 'bottom-left', 'top-right', 'top-left']
    expect(positions).toHaveLength(4)
  })
})

describe('TimestampConfig type', () => {
  it('should have correct structure', () => {
    const config: TimestampConfig = {
      format: 'YYYY/MM/DD',
      position: 'bottom-right',
      color: '#FF6B35',
      fontSize: 30,
    }
    expect(config.format).toBe('YYYY/MM/DD')
    expect(config.position).toBe('bottom-right')
    expect(config.color).toBe('#FF6B35')
    expect(config.fontSize).toBe(30)
  })
})
