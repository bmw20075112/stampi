import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractTimestamp } from '@/utils/timestampExtractor';

// Mock exifr
vi.mock('exifr', () => ({
	default: {
		parse: vi.fn(),
	},
}));

// Mock filenameParser
vi.mock('@/utils/filenameParser', () => ({
	parseFilename: vi.fn(),
}));

import exifr from 'exifr';
import { parseFilename } from '@/utils/filenameParser';

describe('timestampExtractor', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('extractTimestamp', () => {
		it('should extract from EXIF DateTimeOriginal with high confidence', async () => {
			const mockDate = new Date('2024-03-15T14:30:00');
			vi.mocked(exifr.parse).mockResolvedValue({
				DateTimeOriginal: mockDate,
			});

			const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });
			const result = await extractTimestamp(file);

			expect(result).toEqual({
				date: mockDate,
				source: 'exif-datetime-original',
				confidence: 'high',
			});
		});

		it('should extract from EXIF CreateDate with high confidence', async () => {
			const mockDate = new Date('2024-03-15T14:30:00');
			vi.mocked(exifr.parse).mockResolvedValue({
				CreateDate: mockDate,
			});

			const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });
			const result = await extractTimestamp(file);

			expect(result).toEqual({
				date: mockDate,
				source: 'exif-create-date',
				confidence: 'high',
			});
		});

		it('should extract from EXIF ModifyDate with medium confidence', async () => {
			const mockDate = new Date('2024-03-15T14:30:00');
			vi.mocked(exifr.parse).mockResolvedValue({
				ModifyDate: mockDate,
			});

			const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });
			const result = await extractTimestamp(file);

			expect(result).toEqual({
				date: mockDate,
				source: 'exif-modify-date',
				confidence: 'medium',
			});
		});

		it('should fall back to filename parsing when EXIF fails', async () => {
			vi.mocked(exifr.parse).mockResolvedValue(null);
			vi.mocked(parseFilename).mockReturnValue({
				year: 2024,
				month: 3,
				day: 15,
				hour: 14,
				minute: 30,
				second: 45,
			});

			const file = new File(['content'], 'IMG_20240315_143045.jpg', {
				type: 'image/jpeg',
			});
			const result = await extractTimestamp(file);

			expect(result.date).toBeInstanceOf(Date);
			expect(result.date?.getFullYear()).toBe(2024);
			expect(result.date?.getMonth()).toBe(2); // 0-indexed
			expect(result.date?.getDate()).toBe(15);
			expect(result.source).toBe('filename');
			expect(result.confidence).toBe('medium');
		});

		it('should fall back to file.lastModified when all else fails', async () => {
			vi.mocked(exifr.parse).mockResolvedValue(null);
			vi.mocked(parseFilename).mockReturnValue(null);

			const file = new File(['content'], 'photo.jpg', {
				type: 'image/jpeg',
				lastModified: 1710512400000,
			});
			const result = await extractTimestamp(file);

			expect(result.date).toBeInstanceOf(Date);
			expect(result.source).toBe('file-modified');
			expect(result.confidence).toBe('low');
		});

		it('should return none when all methods fail and fileModified is disabled', async () => {
			vi.mocked(exifr.parse).mockResolvedValue(null);
			vi.mocked(parseFilename).mockReturnValue(null);

			const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });
			const result = await extractTimestamp(file, {
				enableFileModified: false,
			});

			expect(result).toEqual({
				date: null,
				source: 'none',
				confidence: 'none',
			});
		});

		it('should skip filename parsing when disabled', async () => {
			vi.mocked(exifr.parse).mockResolvedValue(null);
			vi.mocked(parseFilename).mockReturnValue({
				year: 2024,
				month: 3,
				day: 15,
			});

			const file = new File(['content'], 'IMG_20240315.jpg', {
				type: 'image/jpeg',
				lastModified: 1710512400000,
			});
			const result = await extractTimestamp(file, {
				enableFilenameParser: false,
			});

			expect(result.source).toBe('file-modified');
			expect(vi.mocked(parseFilename)).not.toHaveBeenCalled();
		});

		it('should handle EXIF parsing errors gracefully', async () => {
			vi.mocked(exifr.parse).mockRejectedValue(new Error('EXIF parse error'));
			vi.mocked(parseFilename).mockReturnValue({
				year: 2024,
				month: 3,
				day: 15,
			});

			const file = new File(['content'], 'IMG_20240315.jpg', {
				type: 'image/jpeg',
			});
			const result = await extractTimestamp(file);

			expect(result.source).toBe('filename');
			expect(result.confidence).toBe('medium');
		});
	});
});
