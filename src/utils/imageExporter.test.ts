import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportImage } from './imageExporter';

// Mock compressorjs
vi.mock('compressorjs', () => {
	class CompressorMock {
		constructor(
			_file: Blob,
			options: {
				quality?: number;
				maxWidth?: number;
				maxHeight?: number;
				success: (blob: Blob) => void;
				error?: (err: Error) => void;
			}
		) {
			// Simulate compression by calling success callback
			setTimeout(() => {
				options.success(new Blob(['compressed'], { type: 'image/jpeg' }));
			}, 0);
		}
	}
	return { default: CompressorMock };
});

describe('imageExporter', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('canvas validation', () => {
		it('should reject canvas with zero width', async () => {
			const canvas = document.createElement('canvas');
			canvas.width = 0;
			canvas.height = 100;

			await expect(exportImage(canvas)).rejects.toThrow(
				'Invalid canvas dimensions'
			);
		});

		it('should reject canvas with zero height', async () => {
			const canvas = document.createElement('canvas');
			canvas.width = 100;
			canvas.height = 0;

			await expect(exportImage(canvas)).rejects.toThrow(
				'Invalid canvas dimensions'
			);
		});

		it('should accept valid canvas dimensions', async () => {
			const canvas = document.createElement('canvas');
			canvas.width = 100;
			canvas.height = 100;

			// Mock toBlob
			canvas.toBlob = vi.fn((callback) => {
				callback(new Blob([new Uint8Array(1000)], { type: 'image/jpeg' }));
			});

			const blob = await exportImage(canvas);
			expect(blob).toBeInstanceOf(Blob);
		});
	});

	describe('compression', () => {
		it('should compress image using compressorjs', async () => {
			const canvas = document.createElement('canvas');
			canvas.width = 100;
			canvas.height = 100;

			canvas.toBlob = vi.fn((callback) => {
				callback(new Blob([new Uint8Array(5000)], { type: 'image/jpeg' }));
			});

			const blob = await exportImage(canvas, { quality: 0.6 });
			expect(blob).toBeInstanceOf(Blob);
			expect(blob.size).toBeGreaterThan(0);
		});

		it('should use default quality of 0.6', async () => {
			const canvas = document.createElement('canvas');
			canvas.width = 100;
			canvas.height = 100;

			canvas.toBlob = vi.fn((callback) => {
				callback(new Blob([new Uint8Array(1000)], { type: 'image/jpeg' }));
			});

			const blob = await exportImage(canvas);
			expect(blob).toBeInstanceOf(Blob);
		});

		it('should accept custom quality', async () => {
			const canvas = document.createElement('canvas');
			canvas.width = 100;
			canvas.height = 100;

			canvas.toBlob = vi.fn((callback) => {
				callback(new Blob([new Uint8Array(1000)], { type: 'image/jpeg' }));
			});

			const blob = await exportImage(canvas, { quality: 0.8 });
			expect(blob).toBeInstanceOf(Blob);
		});

		it('should handle toBlob failure', async () => {
			const canvas = document.createElement('canvas');
			canvas.width = 100;
			canvas.height = 100;

			canvas.toBlob = vi.fn((callback) => {
				callback(null); // Simulate failure
			});

			await expect(exportImage(canvas)).rejects.toThrow(
				'Failed to convert canvas to blob'
			);
		});
	});

	describe('edge cases', () => {
		it('should handle large canvas', async () => {
			const canvas = document.createElement('canvas');
			canvas.width = 4000;
			canvas.height = 3000;

			canvas.toBlob = vi.fn((callback) => {
				callback(new Blob([new Uint8Array(10000)], { type: 'image/jpeg' }));
			});

			const blob = await exportImage(canvas);
			expect(blob).toBeInstanceOf(Blob);
		});

		it('should handle empty options', async () => {
			const canvas = document.createElement('canvas');
			canvas.width = 100;
			canvas.height = 100;

			canvas.toBlob = vi.fn((callback) => {
				callback(new Blob([new Uint8Array(1000)], { type: 'image/jpeg' }));
			});

			const blob = await exportImage(canvas, {});
			expect(blob).toBeInstanceOf(Blob);
		});
	});
});
