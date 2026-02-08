import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockHeic2any } = vi.hoisted(() => ({
	mockHeic2any: vi.fn(),
}));

import {
	isHeicFile,
	convertHeicToJpeg,
	processFilesForHeic,
	setHeic2anyLoader,
} from '@/utils/heicConverter';

describe('heicConverter', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Mock the heic2any loader to avoid loading the actual library
		setHeic2anyLoader(async () => ({ default: mockHeic2any }));
	});

	describe('isHeicFile', () => {
		it('should detect file with image/heic MIME type', () => {
			const file = new File(['content'], 'photo.heic', { type: 'image/heic' });
			expect(isHeicFile(file)).toBe(true);
		});

		it('should detect file with image/heif MIME type', () => {
			const file = new File(['content'], 'photo.heif', { type: 'image/heif' });
			expect(isHeicFile(file)).toBe(true);
		});

		it('should detect .heic file with empty MIME type', () => {
			const file = new File(['content'], 'photo.heic', { type: '' });
			expect(isHeicFile(file)).toBe(true);
		});

		it('should detect .heif file with empty MIME type', () => {
			const file = new File(['content'], 'photo.heif', { type: '' });
			expect(isHeicFile(file)).toBe(true);
		});

		it('should detect .HEIC file with uppercase extension', () => {
			const file = new File(['content'], 'IMG_1234.HEIC', { type: '' });
			expect(isHeicFile(file)).toBe(true);
		});

		it('should handle files without extension', () => {
			const file = new File(['content'], 'README', { type: '' });
			expect(isHeicFile(file)).toBe(false);
		});

		it('should handle files with multiple dots', () => {
			const file = new File(['content'], 'photo.backup.heic', { type: '' });
			expect(isHeicFile(file)).toBe(true);
		});

		it('should handle hidden files with heic extension', () => {
			const file = new File(['content'], '.hidden.heic', { type: '' });
			expect(isHeicFile(file)).toBe(true);
		});

		it('should not detect JPEG files', () => {
			const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });
			expect(isHeicFile(file)).toBe(false);
		});

		it('should not detect PNG files', () => {
			const file = new File(['content'], 'photo.png', { type: 'image/png' });
			expect(isHeicFile(file)).toBe(false);
		});
	});

	describe('convertHeicToJpeg', () => {
		it('should call heic2any with correct parameters', async () => {
			const jpegBlob = new Blob(['jpeg-data'], { type: 'image/jpeg' });
			mockHeic2any.mockResolvedValue(jpegBlob);

			const file = new File(['heic-data'], 'photo.heic', {
				type: 'image/heic',
			});
			await convertHeicToJpeg(file);

			expect(mockHeic2any).toHaveBeenCalledWith({
				blob: file,
				toType: 'image/jpeg',
				quality: 0.88,
			});
		});

		it('should return converted file and original file', async () => {
			const jpegBlob = new Blob(['jpeg-data'], { type: 'image/jpeg' });
			mockHeic2any.mockResolvedValue(jpegBlob);

			const file = new File(['heic-data'], 'photo.heic', {
				type: 'image/heic',
			});
			const result = await convertHeicToJpeg(file);

			expect(result.originalFile).toBe(file);
			expect(result.convertedFile).toBeInstanceOf(File);
			expect(result.convertedFile.type).toBe('image/jpeg');
		});

		it('should rename .heic extension to .jpg', async () => {
			const jpegBlob = new Blob(['jpeg-data'], { type: 'image/jpeg' });
			mockHeic2any.mockResolvedValue(jpegBlob);

			const file = new File(['heic-data'], 'photo.heic', {
				type: 'image/heic',
			});
			const result = await convertHeicToJpeg(file);

			expect(result.convertedFile.name).toBe('photo.jpg');
		});

		it('should rename .HEIC extension to .jpg (case insensitive)', async () => {
			const jpegBlob = new Blob(['jpeg-data'], { type: 'image/jpeg' });
			mockHeic2any.mockResolvedValue(jpegBlob);

			const file = new File(['heic-data'], 'IMG_1234.HEIC', { type: '' });
			const result = await convertHeicToJpeg(file);

			expect(result.convertedFile.name).toBe('IMG_1234.jpg');
		});

		it('should rename .heif extension to .jpg', async () => {
			const jpegBlob = new Blob(['jpeg-data'], { type: 'image/jpeg' });
			mockHeic2any.mockResolvedValue(jpegBlob);

			const file = new File(['heic-data'], 'photo.heif', {
				type: 'image/heif',
			});
			const result = await convertHeicToJpeg(file);

			expect(result.convertedFile.name).toBe('photo.jpg');
		});

		it('should handle array return from heic2any (use first blob)', async () => {
			const jpegBlob1 = new Blob(['jpeg-data-1'], { type: 'image/jpeg' });
			const jpegBlob2 = new Blob(['jpeg-data-2'], { type: 'image/jpeg' });
			mockHeic2any.mockResolvedValue([jpegBlob1, jpegBlob2]);

			const file = new File(['heic-data'], 'photo.heic', {
				type: 'image/heic',
			});
			const result = await convertHeicToJpeg(file);

			expect(result.convertedFile).toBeInstanceOf(File);
			expect(result.convertedFile.type).toBe('image/jpeg');
		});

		it('should propagate errors from heic2any', async () => {
			mockHeic2any.mockRejectedValue(new Error('Conversion failed'));

			const file = new File(['heic-data'], 'photo.heic', {
				type: 'image/heic',
			});

			await expect(convertHeicToJpeg(file)).rejects.toThrow(
				'Conversion failed'
			);
		});
	});

	describe('processFilesForHeic', () => {
		it('should convert HEIC files and pass through non-HEIC files', async () => {
			const jpegBlob = new Blob(['jpeg-data'], { type: 'image/jpeg' });
			mockHeic2any.mockResolvedValue(jpegBlob);

			const heicFile = new File(['heic-data'], 'photo.heic', {
				type: 'image/heic',
			});
			const jpgFile = new File(['jpg-data'], 'photo.jpg', {
				type: 'image/jpeg',
			});

			const result = await processFilesForHeic([heicFile, jpgFile]);

			expect(result).toHaveLength(2);
			// HEIC file should be converted with original preserved
			expect(result[0].file.name).toBe('photo.jpg');
			expect(result[0].originalFile).toBe(heicFile);
			// JPG file should pass through
			expect(result[1].file).toBe(jpgFile);
			expect(result[1].originalFile).toBeNull();
		});

		it('should handle all non-HEIC files', async () => {
			const files = [
				new File(['jpg-data'], 'photo.jpg', { type: 'image/jpeg' }),
				new File(['png-data'], 'photo.png', { type: 'image/png' }),
			];

			const result = await processFilesForHeic(files);

			expect(result).toHaveLength(2);
			expect(result[0].originalFile).toBeNull();
			expect(result[1].originalFile).toBeNull();
			expect(mockHeic2any).not.toHaveBeenCalled();
		});

		it('should handle all HEIC files', async () => {
			const jpegBlob = new Blob(['jpeg-data'], { type: 'image/jpeg' });
			mockHeic2any.mockResolvedValue(jpegBlob);

			const files = [
				new File(['heic1'], 'photo1.heic', { type: 'image/heic' }),
				new File(['heic2'], 'photo2.heic', { type: 'image/heic' }),
			];

			const result = await processFilesForHeic(files);

			expect(result).toHaveLength(2);
			expect(result[0].originalFile).toBe(files[0]);
			expect(result[1].originalFile).toBe(files[1]);
			expect(mockHeic2any).toHaveBeenCalledTimes(2);
		});

		it('should handle empty array', async () => {
			const result = await processFilesForHeic([]);
			expect(result).toHaveLength(0);
		});

		it('should propagate conversion errors', async () => {
			mockHeic2any.mockRejectedValue(new Error('Conversion failed'));

			const files = [
				new File(['heic-data'], 'photo.heic', { type: 'image/heic' }),
			];

			await expect(processFilesForHeic(files)).rejects.toThrow(
				'Conversion failed'
			);
		});
	});
});
