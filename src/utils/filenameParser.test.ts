import { describe, it, expect } from 'vitest';
import { parseFilename, isValidDate } from './filenameParser';

describe('isValidDate', () => {
	it('should accept valid dates in range 1970-2100', () => {
		expect(isValidDate(1970, 1, 1)).toBe(true);
		expect(isValidDate(2024, 3, 15)).toBe(true);
		expect(isValidDate(2100, 12, 31)).toBe(true);
	});

	it('should reject dates before 1970', () => {
		expect(isValidDate(1969, 12, 31)).toBe(false);
	});

	it('should reject dates after 2100', () => {
		expect(isValidDate(2101, 1, 1)).toBe(false);
	});

	it('should reject invalid month', () => {
		expect(isValidDate(2024, 0, 15)).toBe(false);
		expect(isValidDate(2024, 13, 15)).toBe(false);
	});

	it('should reject invalid day', () => {
		expect(isValidDate(2024, 2, 30)).toBe(false);
		expect(isValidDate(2024, 4, 31)).toBe(false);
	});

	it('should accept leap year dates', () => {
		expect(isValidDate(2024, 2, 29)).toBe(true);
	});

	it('should reject Feb 29 on non-leap years', () => {
		expect(isValidDate(2023, 2, 29)).toBe(false);
	});
});

describe('parseFilename', () => {
	it('should parse IMG_YYYYMMDD_HHMMSS.jpg format', () => {
		const result = parseFilename('IMG_20240315_143045.jpg');
		expect(result).not.toBeNull();
		expect(result?.year).toBe(2024);
		expect(result?.month).toBe(3);
		expect(result?.day).toBe(15);
		expect(result?.hour).toBe(14);
		expect(result?.minute).toBe(30);
		expect(result?.second).toBe(45);
	});

	it('should parse Screenshot YYYY-MM-DD at HH.MM.SS.png format (macOS)', () => {
		const result = parseFilename('Screenshot 2024-03-15 at 14.30.45.png');
		expect(result).not.toBeNull();
		expect(result?.year).toBe(2024);
		expect(result?.month).toBe(3);
		expect(result?.day).toBe(15);
		expect(result?.hour).toBe(14);
		expect(result?.minute).toBe(30);
		expect(result?.second).toBe(45);
	});

	it('should parse IMG-YYYYMMDD-WA#### format (WhatsApp)', () => {
		const result = parseFilename('IMG-20240315-WA0001.jpg');
		expect(result).not.toBeNull();
		expect(result?.year).toBe(2024);
		expect(result?.month).toBe(3);
		expect(result?.day).toBe(15);
		expect(result?.hour).toBeUndefined();
	});

	it('should parse generic YYYY-MM-DD format', () => {
		const result = parseFilename('photo_2024-03-15.jpg');
		expect(result).not.toBeNull();
		expect(result?.year).toBe(2024);
		expect(result?.month).toBe(3);
		expect(result?.day).toBe(15);
	});

	it('should parse generic YYYYMMDD format', () => {
		const result = parseFilename('20240315_photo.jpg');
		expect(result).not.toBeNull();
		expect(result?.year).toBe(2024);
		expect(result?.month).toBe(3);
		expect(result?.day).toBe(15);
	});

	it('should return null for unparseable filename', () => {
		expect(parseFilename('random.jpg')).toBeNull();
		expect(parseFilename('photo.png')).toBeNull();
		expect(parseFilename('')).toBeNull();
	});

	it('should reject invalid dates (e.g., 20241332)', () => {
		expect(parseFilename('IMG_20241332_000000.jpg')).toBeNull();
	});

	it('should reject dates before 1970', () => {
		expect(parseFilename('IMG_19691231_000000.jpg')).toBeNull();
	});

	it('should reject dates after 2100', () => {
		expect(parseFilename('IMG_21011101_000000.jpg')).toBeNull();
	});

	it('should be case-insensitive for format detection', () => {
		const result1 = parseFilename('img_20240315_143045.jpg');
		const result2 = parseFilename('IMG_20240315_143045.jpg');
		expect(result1).toEqual(result2);
	});

	it('should handle various file extensions', () => {
		const jpgResult = parseFilename('IMG_20240315_143045.jpg');
		const jpegResult = parseFilename('IMG_20240315_143045.jpeg');
		const pngResult = parseFilename('IMG_20240315_143045.png');
		const heicResult = parseFilename('IMG_20240315_143045.heic');

		expect(jpgResult?.year).toBe(2024);
		expect(jpegResult?.year).toBe(2024);
		expect(pngResult?.year).toBe(2024);
		expect(heicResult?.year).toBe(2024);
	});

	it('should parse filename with spaces', () => {
		const result = parseFilename('photo 2024-03-15 test.jpg');
		expect(result).not.toBeNull();
		expect(result?.year).toBe(2024);
		expect(result?.month).toBe(3);
		expect(result?.day).toBe(15);
	});

	it('should handle filenames with path separators (use basename)', () => {
		const result = parseFilename('/path/to/IMG_20240315_143045.jpg');
		expect(result).not.toBeNull();
		expect(result?.year).toBe(2024);
	});

	it('should reject invalid times', () => {
		expect(parseFilename('IMG_20240315_251000.jpg')).toBeNull();
		expect(parseFilename('IMG_20240315_146000.jpg')).toBeNull();
		expect(parseFilename('IMG_20240315_140060.jpg')).toBeNull();
	});
});
