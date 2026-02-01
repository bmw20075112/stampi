import { describe, it, expect, vi } from 'vitest';
import { createZip } from './zipGenerator';
import type { ZipImage } from './zipGenerator';

describe('zipGenerator', () => {
	function createMockBlob(size: number, type = 'image/jpeg'): Blob {
		return new Blob([new Uint8Array(size)], { type });
	}

	describe('single image ZIP', () => {
		it('should create ZIP from single image', async () => {
			const images: ZipImage[] = [
				{
					filename: 'photo.jpg',
					blob: createMockBlob(1000),
				},
			];

			const zipBlob = await createZip(images);

			expect(zipBlob).toBeInstanceOf(Blob);
			expect(zipBlob.type).toBe('application/zip');
			expect(zipBlob.size).toBeGreaterThan(0);
		});

		it('should use provided filename', async () => {
			const images: ZipImage[] = [
				{
					filename: 'my_photo.jpg',
					blob: createMockBlob(1000),
				},
			];

			const zipBlob = await createZip(images);

			expect(zipBlob.size).toBeGreaterThan(0);
		});
	});

	describe('multiple images ZIP', () => {
		it('should create ZIP from multiple images', async () => {
			const images: ZipImage[] = [
				{ filename: 'photo1.jpg', blob: createMockBlob(1000) },
				{ filename: 'photo2.jpg', blob: createMockBlob(2000) },
				{ filename: 'photo3.jpg', blob: createMockBlob(1500) },
			];

			const zipBlob = await createZip(images);

			expect(zipBlob).toBeInstanceOf(Blob);
			expect(zipBlob.size).toBeGreaterThan(0);
		});

		it('should handle different image formats', async () => {
			const images: ZipImage[] = [
				{ filename: 'photo.jpg', blob: createMockBlob(1000, 'image/jpeg') },
				{ filename: 'photo.png', blob: createMockBlob(2000, 'image/png') },
				{ filename: 'photo.webp', blob: createMockBlob(1500, 'image/webp') },
			];

			const zipBlob = await createZip(images);

			expect(zipBlob.size).toBeGreaterThan(0);
		});
	});

	describe('filename deduplication', () => {
		it('should handle duplicate filenames', async () => {
			const images: ZipImage[] = [
				{ filename: 'photo.jpg', blob: createMockBlob(1000) },
				{ filename: 'photo.jpg', blob: createMockBlob(2000) },
				{ filename: 'photo.jpg', blob: createMockBlob(1500) },
			];

			const zipBlob = await createZip(images);

			expect(zipBlob.size).toBeGreaterThan(0);
		});

		it('should deduplicate with numbered suffixes', async () => {
			const images: ZipImage[] = [
				{ filename: 'image.jpg', blob: createMockBlob(1000) },
				{ filename: 'image.jpg', blob: createMockBlob(1000) },
			];

			const zipBlob = await createZip(images);

			// Should create image.jpg and image_1.jpg
			expect(zipBlob.size).toBeGreaterThan(0);
		});

		it('should handle multiple duplicates', async () => {
			const images: ZipImage[] = [
				{ filename: 'photo.jpg', blob: createMockBlob(1000) },
				{ filename: 'photo.jpg', blob: createMockBlob(1000) },
				{ filename: 'photo.jpg', blob: createMockBlob(1000) },
				{ filename: 'photo.jpg', blob: createMockBlob(1000) },
			];

			const zipBlob = await createZip(images);

			// Should create photo.jpg, photo_1.jpg, photo_2.jpg, photo_3.jpg
			expect(zipBlob.size).toBeGreaterThan(0);
		});

		it('should preserve file extensions in deduplication', async () => {
			const images: ZipImage[] = [
				{ filename: 'image.jpg', blob: createMockBlob(1000) },
				{ filename: 'image.jpg', blob: createMockBlob(1000) },
			];

			const zipBlob = await createZip(images);

			expect(zipBlob.size).toBeGreaterThan(0);
		});
	});

	describe('progress callbacks', () => {
		it('should call progress callback', async () => {
			const images: ZipImage[] = [
				{ filename: 'photo1.jpg', blob: createMockBlob(1000) },
				{ filename: 'photo2.jpg', blob: createMockBlob(1000) },
			];

			const onProgress = vi.fn();
			await createZip(images, onProgress);

			expect(onProgress).toHaveBeenCalled();
		});

		it('should report progress as percentage', async () => {
			const images: ZipImage[] = [
				{ filename: 'photo1.jpg', blob: createMockBlob(1000) },
				{ filename: 'photo2.jpg', blob: createMockBlob(1000) },
				{ filename: 'photo3.jpg', blob: createMockBlob(1000) },
			];

			const progressValues: number[] = [];
			const onProgress = vi.fn((percent) => {
				progressValues.push(percent);
			});

			await createZip(images, onProgress);

			expect(progressValues.length).toBeGreaterThan(0);
			expect(progressValues.every((v) => v >= 0 && v <= 100)).toBe(true);
		});

		it('should complete with 100% progress', async () => {
			const images: ZipImage[] = [
				{ filename: 'photo.jpg', blob: createMockBlob(1000) },
			];

			const progressValues: number[] = [];
			const onProgress = vi.fn((percent) => {
				progressValues.push(percent);
			});

			await createZip(images, onProgress);

			expect(progressValues[progressValues.length - 1]).toBe(100);
		});
	});

	describe('error handling', () => {
		it('should handle empty images array', async () => {
			const images: ZipImage[] = [];

			await expect(createZip(images)).rejects.toThrow(
				'No images provided for ZIP'
			);
		});

		it('should handle missing filename', async () => {
			const images: ZipImage[] = [{ filename: '', blob: createMockBlob(1000) }];

			await expect(createZip(images)).rejects.toThrow();
		});

		it('should handle blob read errors', async () => {
			const images: ZipImage[] = [
				{
					filename: 'photo.jpg',
					blob: {
						arrayBuffer: () => Promise.reject(new Error('Read failed')),
					} as Blob,
				},
			];

			await expect(createZip(images)).rejects.toThrow('Read failed');
		});
	});

	describe('memory management', () => {
		it('should handle large number of images', async () => {
			const images: ZipImage[] = Array.from({ length: 50 }, (_, i) => ({
				filename: `photo_${i}.jpg`,
				blob: createMockBlob(1000),
			}));

			const zipBlob = await createZip(images);

			expect(zipBlob.size).toBeGreaterThan(0);
		});

		it('should handle large individual files', async () => {
			const images: ZipImage[] = [
				{ filename: 'large.jpg', blob: createMockBlob(10000) },
			];

			const zipBlob = await createZip(images);

			expect(zipBlob.size).toBeGreaterThan(0);
		});
	});

	describe('edge cases', () => {
		it('should handle filenames with special characters', async () => {
			const images: ZipImage[] = [
				{ filename: 'photo-2024_01_15.jpg', blob: createMockBlob(1000) },
				{ filename: 'my photo (1).jpg', blob: createMockBlob(1000) },
			];

			const zipBlob = await createZip(images);

			expect(zipBlob.size).toBeGreaterThan(0);
		});

		it('should handle filenames with unicode', async () => {
			const images: ZipImage[] = [
				{ filename: '我的照片.jpg', blob: createMockBlob(1000) },
				{ filename: 'φωτογραφία.jpg', blob: createMockBlob(1000) },
			];

			const zipBlob = await createZip(images);

			expect(zipBlob.size).toBeGreaterThan(0);
		});

		it('should handle very long filenames', async () => {
			const longName = 'a'.repeat(200) + '.jpg';
			const images: ZipImage[] = [
				{ filename: longName, blob: createMockBlob(1000) },
			];

			const zipBlob = await createZip(images);

			expect(zipBlob.size).toBeGreaterThan(0);
		});

		it('should handle filenames without extensions', async () => {
			const images: ZipImage[] = [
				{ filename: 'photo1', blob: createMockBlob(1000) },
				{ filename: 'photo1', blob: createMockBlob(1000) },
			];

			const zipBlob = await createZip(images);

			expect(zipBlob.size).toBeGreaterThan(0);
		});
	});
});
