import { describe, it, expect } from 'vitest';
import { calculateFontSize, calculatePosition } from '@/utils/imageProcessor';
import type { Position, TimestampConfig } from '@/utils/imageProcessor';

describe('calculateFontSize', () => {
	describe('without scale (default 1.0x)', () => {
		it('should return approximately 4% of image width', () => {
			expect(calculateFontSize(1000)).toBe(40);
			expect(calculateFontSize(2000)).toBe(80);
			expect(calculateFontSize(3000)).toBe(120);
		});

		it('should return minimum size for small images', () => {
			expect(calculateFontSize(100)).toBe(12);
			expect(calculateFontSize(200)).toBe(12);
		});

		it('should cap maximum size for very large images', () => {
			expect(calculateFontSize(10000)).toBe(400);
			expect(calculateFontSize(20000)).toBe(400);
		});
	});

	describe('with scale factor', () => {
		it('should scale font size by 1.5x', () => {
			expect(calculateFontSize(1000, 1.5)).toBe(60); // 1000 * 0.04 * 1.5 = 60
			expect(calculateFontSize(2000, 1.5)).toBe(120);
		});

		it('should scale font size by 0.5x', () => {
			expect(calculateFontSize(1000, 0.5)).toBe(20); // 1000 * 0.04 * 0.5 = 20
			expect(calculateFontSize(2000, 0.5)).toBe(40);
		});

		it('should respect minimum size even with small scale', () => {
			expect(calculateFontSize(100, 0.5)).toBe(12); // Would be 2, but clamped to 12
		});

		it('should respect maximum size even with large scale', () => {
			expect(calculateFontSize(10000, 2.0)).toBe(400); // Would be 800, but clamped to 400
		});

		it('should handle scale of 2.0x', () => {
			expect(calculateFontSize(1000, 2.0)).toBe(80); // 1000 * 0.04 * 2.0 = 80
		});
	});

	describe('edge cases', () => {
		it('should handle zero width gracefully', () => {
			expect(calculateFontSize(0, 1.0)).toBe(12); // Returns MIN_FONT_SIZE
		});

		it('should handle negative width gracefully', () => {
			expect(calculateFontSize(-100, 1.0)).toBe(12); // Returns MIN_FONT_SIZE
		});

		it('should handle NaN width gracefully', () => {
			expect(calculateFontSize(NaN, 1.0)).toBe(12); // Returns MIN_FONT_SIZE
		});

		it('should handle Infinity width gracefully', () => {
			expect(calculateFontSize(Infinity, 1.0)).toBe(12); // Returns MIN_FONT_SIZE
		});

		it('should handle NaN scale gracefully', () => {
			expect(calculateFontSize(1000, NaN)).toBe(40); // Falls back to default scale
		});

		it('should handle negative scale gracefully', () => {
			expect(calculateFontSize(1000, -1.0)).toBe(40); // Falls back to default scale
		});

		it('should handle zero scale gracefully', () => {
			expect(calculateFontSize(1000, 0)).toBe(40); // Falls back to default scale
		});

		it('should handle very small scale', () => {
			expect(calculateFontSize(1000, 0.1)).toBe(12); // Would be 4, clamped to MIN
		});

		it('should handle Infinity scale gracefully', () => {
			expect(calculateFontSize(1000, Infinity)).toBe(40); // Falls back to default scale
		});
	});
});

describe('calculatePosition', () => {
	const imageSize = { width: 1000, height: 800 };
	const textSize = { width: 100, height: 30 };
	const padding = 20;

	describe('bottom-right position', () => {
		it('should position text at bottom-right with padding', () => {
			const result = calculatePosition(
				'bottom-right',
				imageSize,
				textSize,
				padding
			);
			expect(result.x).toBe(880); // 1000 - 100 - 20
			expect(result.y).toBe(750); // 800 - 30 - 20
		});
	});

	describe('bottom-left position', () => {
		it('should position text at bottom-left with padding', () => {
			const result = calculatePosition(
				'bottom-left',
				imageSize,
				textSize,
				padding
			);
			expect(result.x).toBe(20);
			expect(result.y).toBe(750);
		});
	});

	describe('top-right position', () => {
		it('should position text at top-right with padding', () => {
			const result = calculatePosition(
				'top-right',
				imageSize,
				textSize,
				padding
			);
			expect(result.x).toBe(880);
			expect(result.y).toBe(50); // 20 + 30
		});
	});

	describe('top-left position', () => {
		it('should position text at top-left with padding', () => {
			const result = calculatePosition(
				'top-left',
				imageSize,
				textSize,
				padding
			);
			expect(result.x).toBe(20);
			expect(result.y).toBe(50);
		});
	});
});

describe('Position type', () => {
	it('should accept all valid position values', () => {
		const positions: Position[] = [
			'bottom-right',
			'bottom-left',
			'top-right',
			'top-left',
		];
		expect(positions).toHaveLength(4);
	});
});

describe('TimestampConfig type', () => {
	it('should have correct structure', () => {
		const config: TimestampConfig = {
			format: 'YYYY/MM/DD',
			position: 'bottom-right',
			color: '#FF6B35',
			fontSizeScale: 1.0,
		};
		expect(config.format).toBe('YYYY/MM/DD');
		expect(config.position).toBe('bottom-right');
		expect(config.color).toBe('#FF6B35');
		expect(config.fontSizeScale).toBe(1.0);
	});

	it('should allow fontSizeScale to be optional', () => {
		const config: TimestampConfig = {
			format: 'YYYY/MM/DD',
			position: 'bottom-right',
			color: '#FF6B35',
		};
		expect(config.fontSizeScale).toBeUndefined();
	});
});
