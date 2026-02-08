import { describe, it, expect } from 'vitest';
import type { NamingConfig } from '@/config/namingConfig';
import { generateFilename } from '@/utils/filenameGenerator';

describe('filenameGenerator', () => {
	describe('original filename preservation', () => {
		it('should preserve original filename and strip extension', async () => {
			const file = new File([''], 'vacation_photo.jpg', { type: 'image/jpeg' });
			const result = await generateFilename(file, null, 'none');
			expect(result).toBe('stampi_vacation_photo');
		});

		it('should handle files with multiple dots in name', async () => {
			const file = new File([''], 'photo.2024.01.15.jpg', {
				type: 'image/jpeg',
			});
			const result = await generateFilename(file, null, 'none');
			expect(result).toBe('stampi_photo.2024.01.15');
		});

		it('should handle files with no extension', async () => {
			const file = new File([''], 'myimage', { type: 'image/jpeg' });
			const result = await generateFilename(file, null, 'none');
			expect(result).toBe('stampi_myimage');
		});
	});

	describe('fallback to date-based naming', () => {
		it('should use date format for EXIF source', async () => {
			const file = new File([''], 'blob', { type: 'image/jpeg' });
			const result = await generateFilename(
				file,
				'2024/03/15 14:30:45',
				'exif-datetime-original'
			);
			expect(result).toBe('stampi_2024_03_15_14_30_45');
		});

		it('should use date format for filename source', async () => {
			const file = new File([''], 'image.jpg', { type: 'image/jpeg' });
			const result = await generateFilename(file, '2024-03-15', 'filename');
			expect(result).toBe('stampi_2024_03_15');
		});

		it('should sanitize special characters from date', async () => {
			const file = new File([''], 'blob', { type: 'image/jpeg' });
			const result = await generateFilename(
				file,
				'2024/03/15 14:30:45',
				'exif-datetime-original'
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
			expect(result).not.toBe('stampi_blob');
			expect(result).toMatch(/^stampi_[a-f0-9]{12}$/);
		});

		it('should not use "image.jpg" as filename', async () => {
			const file = new File(['test'], 'image.jpg', { type: 'image/jpeg' });
			const result = await generateFilename(file, null, 'none');
			expect(result).not.toBe('stampi_image');
			expect(result).toMatch(/^stampi_[a-f0-9]{12}$/);
		});

		it('should not use "image.png" as filename', async () => {
			const file = new File(['test'], 'image.png', { type: 'image/png' });
			const result = await generateFilename(file, null, 'none');
			expect(result).not.toBe('stampi_image');
			expect(result).toMatch(/^stampi_[a-f0-9]{12}$/);
		});
	});

	describe('hash generation fallback', () => {
		it('should generate hash for unknown source without timestamp', async () => {
			const file = new File(['test content'], 'blob', { type: 'image/jpeg' });
			const result = await generateFilename(file, null, 'none');
			expect(result).toMatch(/^stampi_[a-f0-9]{12}$/);
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
			expect(result).toBe('stampi_Photo123ABC');
		});

		it('should preserve underscores and hyphens', async () => {
			const file = new File([''], 'my-photo_2024.jpg', { type: 'image/jpeg' });
			const result = await generateFilename(file, null, 'none');
			expect(result).toBe('stampi_my-photo_2024');
		});

		it('should handle Chinese characters', async () => {
			const file = new File([''], '我的照片.jpg', { type: 'image/jpeg' });
			const result = await generateFilename(file, null, 'none');
			expect(result).toBe('stampi_我的照片');
		});
	});

	describe('edge cases', () => {
		it('should handle empty file', async () => {
			const file = new File([''], 'blob', { type: 'image/jpeg' });
			const result = await generateFilename(file, null, 'none');
			expect(result).toMatch(/^stampi_[a-f0-9]{12}$/);
		});

		it('should handle very long filenames', async () => {
			const longName = 'a'.repeat(200) + '.jpg';
			const file = new File([''], longName, { type: 'image/jpeg' });
			const result = await generateFilename(file, null, 'none');
			expect(result.length).toBeGreaterThan(0);
			expect(result).toContain('stampi_');
		});

		it('should prioritize original filename over date when available', async () => {
			const file = new File([''], 'my_photo.jpg', { type: 'image/jpeg' });
			const result = await generateFilename(
				file,
				'2024/03/15',
				'exif-datetime-original'
			);
			expect(result).toBe('stampi_my_photo');
		});
	});

	describe('configuration injection (DIP compliance)', () => {
		it('should use custom config for original filename', async () => {
			const customConfig: NamingConfig = {
				imagePrefix: 'custom',
				imageSuffix: '_processed',
				datePrefix: 'date',
				hashPrefix: 'hash',
				separator: '-',
				zipPattern: 'custom-{timestamp}.zip',
			};

			const file = new File([''], 'photo.jpg', { type: 'image/jpeg' });
			const result = await generateFilename(
				file,
				null,
				'none',
				undefined,
				customConfig
			);
			expect(result).toBe('custom-photo_processed');
		});

		it('should use custom config for date-based naming', async () => {
			const customConfig: NamingConfig = {
				imagePrefix: 'img',
				imageSuffix: '',
				datePrefix: 'DATE',
				hashPrefix: 'hash',
				separator: '_',
				zipPattern: 'archive-{timestamp}.zip',
			};

			const file = new File([''], 'blob', { type: 'image/jpeg' });
			const result = await generateFilename(
				file,
				'2024/03/15',
				'exif-datetime-original',
				undefined,
				customConfig
			);
			expect(result).toBe('DATE_2024_03_15');
		});

		it('should use custom config for hash-based naming', async () => {
			const customConfig: NamingConfig = {
				imagePrefix: 'img',
				imageSuffix: '',
				datePrefix: 'date',
				hashPrefix: 'HASH',
				separator: '-',
				zipPattern: 'archive-{timestamp}.zip',
			};

			const file = new File(['test content'], 'blob', { type: 'image/jpeg' });
			const result = await generateFilename(
				file,
				null,
				'none',
				undefined,
				customConfig
			);
			expect(result).toMatch(/^HASH-[a-f0-9]{12}$/);
		});

		it('should use cached filename when provided regardless of config', async () => {
			const customConfig: NamingConfig = {
				imagePrefix: 'custom',
				imageSuffix: '_new',
				datePrefix: 'date',
				hashPrefix: 'hash',
				separator: '-',
				zipPattern: 'archive-{timestamp}.zip',
			};

			const file = new File([''], 'photo.jpg', { type: 'image/jpeg' });
			const cachedFilename = 'cached_filename';
			const result = await generateFilename(
				file,
				null,
				'none',
				cachedFilename,
				customConfig
			);
			expect(result).toBe('cached_filename');
		});
	});
});
