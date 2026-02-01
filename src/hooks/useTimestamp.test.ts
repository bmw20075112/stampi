import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import useTimestamp from './useTimestamp';

vi.mock('exifr', () => ({
	default: {
		parse: vi.fn(),
	},
}));

vi.mock('../utils/filenameParser', () => ({
	parseFilename: vi.fn(),
}));

import exifr from 'exifr';
import { parseFilename } from '../utils/filenameParser';

describe('useTimestamp', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return null state when no file is provided', () => {
		const { result } = renderHook(() => useTimestamp(null));

		expect(result.current.date).toBeNull();
		expect(result.current.source).toBe('none');
		expect(result.current.loading).toBe(false);
		expect(result.current.confidence).toBe('none');
		expect(result.current.needsUserInput).toBe(false);
	});

	it('should read DateTimeOriginal from EXIF with high confidence', async () => {
		const mockDate = new Date('2024-03-15T14:30:00');
		vi.mocked(exifr.parse).mockResolvedValue({
			DateTimeOriginal: mockDate,
		});

		const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
		const { result } = renderHook(() => useTimestamp(file));

		expect(result.current.loading).toBe(true);

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.date).toEqual(mockDate);
		expect(result.current.source).toBe('exif-datetime-original');
		expect(result.current.confidence).toBe('high');
		expect(result.current.needsUserInput).toBe(false);
	});

	it('should fallback to CreateDate from EXIF', async () => {
		const mockDate = new Date('2024-03-15T10:00:00');
		vi.mocked(exifr.parse).mockResolvedValue({
			CreateDate: mockDate,
		});

		const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
		const { result } = renderHook(() => useTimestamp(file));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.date).toEqual(mockDate);
		expect(result.current.source).toBe('exif-create-date');
		expect(result.current.confidence).toBe('high');
	});

	it('should fallback to ModifyDate from EXIF', async () => {
		const mockDate = new Date('2024-03-15T08:00:00');
		vi.mocked(exifr.parse).mockResolvedValue({
			ModifyDate: mockDate,
		});

		const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
		const { result } = renderHook(() => useTimestamp(file));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.date).toEqual(mockDate);
		expect(result.current.source).toBe('exif-modify-date');
		expect(result.current.confidence).toBe('medium');
	});

	it('should fallback to filename parsing when EXIF fails', async () => {
		vi.mocked(exifr.parse).mockResolvedValue({});
		vi.mocked(parseFilename).mockReturnValue({
			year: 2024,
			month: 3,
			day: 15,
			hour: 14,
			minute: 30,
			second: 0,
		});

		const file = new File(['test'], 'IMG_20240315_143000.jpg', {
			type: 'image/jpeg',
		});
		const { result } = renderHook(() => useTimestamp(file));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.date).not.toBeNull();
		expect(result.current.date?.getFullYear()).toBe(2024);
		expect(result.current.date?.getMonth()).toBe(2); // March = month 2
		expect(result.current.date?.getDate()).toBe(15);
		expect(result.current.source).toBe('filename');
		expect(result.current.confidence).toBe('medium');
	});

	it('should fallback to file.lastModified when EXIF and filename fail', async () => {
		vi.mocked(exifr.parse).mockResolvedValue({});
		vi.mocked(parseFilename).mockReturnValue(null);

		const lastModifiedTime = new Date('2024-03-10T10:00:00').getTime();
		const file = new File(['test'], 'random.jpg', { type: 'image/jpeg' });
		Object.defineProperty(file, 'lastModified', {
			value: lastModifiedTime,
		});

		const { result } = renderHook(() => useTimestamp(file));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.date).not.toBeNull();
		expect(result.current.date?.getTime()).toBe(lastModifiedTime);
		expect(result.current.source).toBe('file-modified');
		expect(result.current.confidence).toBe('low');
	});

	it('should set needsUserInput when all automatic methods fail', async () => {
		vi.mocked(exifr.parse).mockResolvedValue({});
		vi.mocked(parseFilename).mockReturnValue(null);

		const file = new File(['test'], 'random.jpg', { type: 'image/jpeg' });
		const { result } = renderHook(() =>
			useTimestamp(file, {
				enableFileModified: false,
				enableFilenameParser: false,
			})
		);

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.date).toBeNull();
		expect(result.current.source).toBe('none');
		expect(result.current.confidence).toBe('none');
		expect(result.current.needsUserInput).toBe(true);
	});

	it('should show loading state while processing', () => {
		vi.mocked(exifr.parse).mockImplementation(
			() => new Promise((resolve) => setTimeout(() => resolve({}), 100))
		);

		const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
		const { result } = renderHook(() => useTimestamp(file));

		expect(result.current.loading).toBe(true);
	});

	it('should respect enableFilenameParser option', async () => {
		vi.mocked(exifr.parse).mockResolvedValue({});
		vi.mocked(parseFilename).mockReturnValue({
			year: 2024,
			month: 3,
			day: 15,
		});

		const file = new File(['test'], 'IMG_20240315.jpg', {
			type: 'image/jpeg',
		});
		const { result } = renderHook(() =>
			useTimestamp(file, { enableFilenameParser: false })
		);

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		// Should skip to file-modified instead of using filename
		expect(result.current.source).toBe('file-modified');
	});

	it('should respect enableFileModified option', async () => {
		vi.mocked(exifr.parse).mockResolvedValue({});
		vi.mocked(parseFilename).mockReturnValue(null);

		const file = new File(['test'], 'random.jpg', { type: 'image/jpeg' });
		const { result } = renderHook(() =>
			useTimestamp(file, {
				enableFileModified: false,
				enableFilenameParser: false,
			})
		);

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		// Should require user input instead of using file-modified
		expect(result.current.needsUserInput).toBe(true);
		expect(result.current.source).toBe('none');
	});

	it('should handle EXIF parsing errors gracefully', async () => {
		vi.mocked(exifr.parse).mockRejectedValue(new Error('Parse error'));

		const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
		const { result } = renderHook(() => useTimestamp(file));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		// Should fallback to filename/file-modified
		expect(result.current.source).toBe('file-modified');
	});

	it('should return null date with none source when file is cleared', async () => {
		const mockDate = new Date('2024-03-15T14:30:00');
		vi.mocked(exifr.parse).mockResolvedValue({
			DateTimeOriginal: mockDate,
		});

		const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
		const { result, rerender } = renderHook(
			(f: File | null) => useTimestamp(f),
			{ initialProps: file as File | null }
		);

		await waitFor(() => {
			expect(result.current.date).toEqual(mockDate);
		});

		rerender(null);

		expect(result.current.date).toBeNull();
		expect(result.current.source).toBe('none');
		expect(result.current.confidence).toBe('none');
	});
});
