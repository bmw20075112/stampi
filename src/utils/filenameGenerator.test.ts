import { describe, it, expect } from 'vitest';
import { generateFilename } from './filenameGenerator';

describe('filenameGenerator', () => {
	describe('original filename preservation', () => {
		it('should preserve original filename and strip extension', async () => {
			const file = new File([''], 'vacation_photo.jpg', { type: 'image/jpeg' });
			const result = await generateFilename(file, null, 'none');
			expect(result).toBe('vacation_photo_timestamped');
		});

		it('should handle files with multiple dots in name', async () => {
			const file = new File([''], 'photo.2024.01.15.jpg', {
				type: 'image/jpeg',
			});
			const result = await generateFilename(file, null, 'none');
			expect(result).toBe('photo.2024.01.15_timestamped');
		});

		it('should handle files with no extension', async () => {
			const file = new File([''], 'myimage', { type: 'image/jpeg' });
			const result = await generateFilename(file, null, 'none');
			expect(result).toBe('myimage_timestamped');
		});
	});

	describe('fallback to date-based naming', () => {
		it('should use date format for EXIF source', async () => {
			const file = new File([''], 'blob', { type: 'image/jpeg' });
			const result = await generateFilename(
				file,
				'2024/03/15 14:30:45',
				'exif'
			);
			expect(result).toBe('IMG_2024_03_15_14_30_45');
		});

		it('should use date format for filename source', async () => {
			const file = new File([''], 'image.jpg', { type: 'image/jpeg' });
			const result = await generateFilename(file, '2024-03-15', 'filename');
			expect(result).toBe('IMG_2024_03_15');
		});

		it('should sanitize special characters from date', async () => {
			const file = new File([''], 'blob', { type: 'image/jpeg' });
			const result = await generateFilename(
				file,
				'2024/03/15 14:30:45',
				'exif'
			);
			expect(result).not.toContain('/');
			expect(result).not.toContain(':');
			expect(result).not.toContain('.');
		});
	});

	describe('generic blob name detection', () => {
		it('should not use "blob" as filename', async () => {
			const file = new File(['test'], 'blob', { type: 'image/jpeg' });
			const result = await generateFilename(file, null, 'none');
			expect(result).not.toBe('blob_timestamped');
			expect(result).toMatch(/^IMG_[a-f0-9]{12}$/);
		});

		it('should not use "image.jpg" as filename', async () => {
			const file = new File(['test'], 'image.jpg', { type: 'image/jpeg' });
			const result = await generateFilename(file, null, 'none');
			expect(result).not.toBe('image_timestamped');
			expect(result).toMatch(/^IMG_[a-f0-9]{12}$/);
		});

		it('should not use "image.png" as filename', async () => {
			const file = new File(['test'], 'image.png', { type: 'image/png' });
			const result = await generateFilename(file, null, 'none');
			expect(result).not.toBe('image_timestamped');
			expect(result).toMatch(/^IMG_[a-f0-9]{12}$/);
		});
	});

	describe('hash generation fallback', () => {
		it('should generate hash for unknown source without timestamp', async () => {
			const file = new File(['test content'], 'blob', { type: 'image/jpeg' });
			const result = await generateFilename(file, null, 'none');
			expect(result).toMatch(/^IMG_[a-f0-9]{12}$/);
		});

		it('should generate consistent hash for same content', async () => {
			const file1 = new File(['test content'], 'blob', { type: 'image/jpeg' });
			const file2 = new File(['test content'], 'blob', { type: 'image/jpeg' });
			const result1 = await generateFilename(file1, null, 'none');
			const result2 = await generateFilename(file2, null, 'none');
			expect(result1).toBe(result2);
		});

		it('should generate different hashes for different content', async () => {
			const file1 = new File(['content A'], 'blob', { type: 'image/jpeg' });
			const file2 = new File(['content B'], 'blob', { type: 'image/jpeg' });
			const result1 = await generateFilename(file1, null, 'none');
			const result2 = await generateFilename(file2, null, 'none');
			expect(result1).not.toBe(result2);
		});
	});

	describe('filename sanitization', () => {
		it('should preserve alphanumeric characters', async () => {
			const file = new File([''], 'Photo123ABC.jpg', { type: 'image/jpeg' });
			const result = await generateFilename(file, null, 'none');
			expect(result).toBe('Photo123ABC_timestamped');
		});

		it('should preserve underscores and hyphens', async () => {
			const file = new File([''], 'my-photo_2024.jpg', { type: 'image/jpeg' });
			const result = await generateFilename(file, null, 'none');
			expect(result).toBe('my-photo_2024_timestamped');
		});

		it('should handle Chinese characters', async () => {
			const file = new File([''], '我的照片.jpg', { type: 'image/jpeg' });
			const result = await generateFilename(file, null, 'none');
			expect(result).toBe('我的照片_timestamped');
		});
	});

	describe('edge cases', () => {
		it('should handle empty file', async () => {
			const file = new File([''], 'blob', { type: 'image/jpeg' });
			const result = await generateFilename(file, null, 'none');
			expect(result).toMatch(/^IMG_[a-f0-9]{12}$/);
		});

		it('should handle very long filenames', async () => {
			const longName = 'a'.repeat(200) + '.jpg';
			const file = new File([''], longName, { type: 'image/jpeg' });
			const result = await generateFilename(file, null, 'none');
			expect(result.length).toBeGreaterThan(0);
			expect(result).toContain('_timestamped');
		});

		it('should prioritize original filename over date when available', async () => {
			const file = new File([''], 'my_photo.jpg', { type: 'image/jpeg' });
			const result = await generateFilename(file, '2024/03/15', 'exif');
			expect(result).toBe('my_photo_timestamped');
		});
	});
});
