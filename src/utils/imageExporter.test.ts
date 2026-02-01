import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportImage } from './imageExporter';

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

	describe('toBlob integration', () => {
		it('should call canvas.toBlob with correct parameters', async () => {
			const canvas = document.createElement('canvas');
			canvas.width = 100;
			canvas.height = 100;

			const toBlobMock = vi.fn((callback) => {
				callback(new Blob([new Uint8Array(1000)], { type: 'image/jpeg' }));
			});
			canvas.toBlob = toBlobMock;

			await exportImage(canvas, { quality: 0.9, format: 'jpeg' });

			expect(toBlobMock).toHaveBeenCalledWith(
				expect.any(Function),
				'image/jpeg',
				0.9
			);
		});

		it('should use default quality of 0.85', async () => {
			const canvas = document.createElement('canvas');
			canvas.width = 100;
			canvas.height = 100;

			const toBlobMock = vi.fn((callback) => {
				callback(new Blob([new Uint8Array(1000)], { type: 'image/jpeg' }));
			});
			canvas.toBlob = toBlobMock;

			await exportImage(canvas);

			expect(toBlobMock).toHaveBeenCalledWith(
				expect.any(Function),
				'image/jpeg',
				0.85
			);
		});

		it('should support WebP format', async () => {
			const canvas = document.createElement('canvas');
			canvas.width = 100;
			canvas.height = 100;

			const toBlobMock = vi.fn((callback) => {
				callback(new Blob([new Uint8Array(1000)], { type: 'image/webp' }));
			});
			canvas.toBlob = toBlobMock;

			await exportImage(canvas, { format: 'webp' });

			expect(toBlobMock).toHaveBeenCalledWith(
				expect.any(Function),
				'image/webp',
				0.85
			);
		});

		it('should handle toBlob failure', async () => {
			const canvas = document.createElement('canvas');
			canvas.width = 100;
			canvas.height = 100;

			canvas.toBlob = vi.fn((callback) => {
				callback(null);
			});

			await expect(exportImage(canvas)).rejects.toThrow(
				'Failed to export canvas to blob'
			);
		});
	});

	describe('quality parameter', () => {
		it('should accept quality between 0 and 1', async () => {
			const canvas = document.createElement('canvas');
			canvas.width = 100;
			canvas.height = 100;

			const toBlobMock = vi.fn((callback) => {
				callback(new Blob([new Uint8Array(100)], { type: 'image/jpeg' }));
			});
			canvas.toBlob = toBlobMock;

			await exportImage(canvas, { quality: 0.5 });

			expect(toBlobMock).toHaveBeenCalledWith(
				expect.any(Function),
				'image/jpeg',
				0.5
			);
		});

		it('should handle very low quality', async () => {
			const canvas = document.createElement('canvas');
			canvas.width = 100;
			canvas.height = 100;

			const toBlobMock = vi.fn((callback) => {
				callback(new Blob([new Uint8Array(10)], { type: 'image/jpeg' }));
			});
			canvas.toBlob = toBlobMock;

			const blob = await exportImage(canvas, { quality: 0.01 });

			expect(blob).toBeInstanceOf(Blob);
			expect(toBlobMock).toHaveBeenCalledWith(
				expect.any(Function),
				'image/jpeg',
				0.01
			);
		});

		it('should handle maximum quality', async () => {
			const canvas = document.createElement('canvas');
			canvas.width = 100;
			canvas.height = 100;

			const toBlobMock = vi.fn((callback) => {
				callback(new Blob([new Uint8Array(2000)], { type: 'image/jpeg' }));
			});
			canvas.toBlob = toBlobMock;

			const blob = await exportImage(canvas, { quality: 1.0 });

			expect(blob).toBeInstanceOf(Blob);
			expect(toBlobMock).toHaveBeenCalledWith(
				expect.any(Function),
				'image/jpeg',
				1.0
			);
		});
	});

	describe('format parameter', () => {
		it('should default to JPEG format', async () => {
			const canvas = document.createElement('canvas');
			canvas.width = 100;
			canvas.height = 100;

			const toBlobMock = vi.fn((callback) => {
				callback(new Blob([new Uint8Array(1000)], { type: 'image/jpeg' }));
			});
			canvas.toBlob = toBlobMock;

			await exportImage(canvas);

			expect(toBlobMock).toHaveBeenCalledWith(
				expect.any(Function),
				'image/jpeg',
				expect.any(Number)
			);
		});

		it('should accept JPEG format explicitly', async () => {
			const canvas = document.createElement('canvas');
			canvas.width = 100;
			canvas.height = 100;

			const toBlobMock = vi.fn((callback) => {
				callback(new Blob([new Uint8Array(1000)], { type: 'image/jpeg' }));
			});
			canvas.toBlob = toBlobMock;

			await exportImage(canvas, { format: 'jpeg' });

			expect(toBlobMock).toHaveBeenCalledWith(
				expect.any(Function),
				'image/jpeg',
				expect.any(Number)
			);
		});
	});

	describe('edge cases', () => {
		it('should handle empty options object', async () => {
			const canvas = document.createElement('canvas');
			canvas.width = 100;
			canvas.height = 100;

			const toBlobMock = vi.fn((callback) => {
				callback(new Blob([new Uint8Array(1000)], { type: 'image/jpeg' }));
			});
			canvas.toBlob = toBlobMock;

			const blob = await exportImage(canvas, {});

			expect(blob).toBeInstanceOf(Blob);
		});

		it('should handle large canvas dimensions', async () => {
			const canvas = document.createElement('canvas');
			canvas.width = 4000;
			canvas.height = 3000;

			const toBlobMock = vi.fn((callback) => {
				callback(new Blob([new Uint8Array(10000)], { type: 'image/jpeg' }));
			});
			canvas.toBlob = toBlobMock;

			const blob = await exportImage(canvas);

			expect(blob).toBeInstanceOf(Blob);
			expect(blob.size).toBeGreaterThan(0);
		});

		it('should ignore enableCompression flag (reserved for future use)', async () => {
			const canvas = document.createElement('canvas');
			canvas.width = 100;
			canvas.height = 100;

			const toBlobMock = vi.fn((callback) => {
				callback(new Blob([new Uint8Array(1000)], { type: 'image/jpeg' }));
			});
			canvas.toBlob = toBlobMock;

			const blob = await exportImage(canvas, { enableCompression: true });

			expect(blob).toBeInstanceOf(Blob);
		});
	});
});
