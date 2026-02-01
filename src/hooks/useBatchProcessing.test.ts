import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBatchProcessing } from './useBatchProcessing';

// Mock the useTimestamp hook
vi.mock('./useTimestamp', () => ({
	useTimestamp: () => ({
		timestamp: '2024/03/15 14:30:45',
		dateSource: 'exif' as const,
		confidence: 'high' as const,
	}),
}));

// Mock renderTimestamp
vi.mock('../utils/imageProcessor', () => ({
	renderTimestamp: vi.fn((canvas) => {
		// Simple mock implementation
		const ctx = canvas.getContext('2d');
		if (ctx) {
			ctx.fillStyle = '#FF6B35';
			ctx.fillRect(0, 0, canvas.width, canvas.height);
		}
	}),
}));

describe('useBatchProcessing', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Mock URL.createObjectURL
		global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
		global.URL.revokeObjectURL = vi.fn();
	});

	describe('initial state', () => {
		it('should initialize with empty images array', () => {
			const { result } = renderHook(() => useBatchProcessing());

			expect(result.current.images).toEqual([]);
			expect(result.current.processing).toBe(false);
			expect(result.current.progress).toEqual({ completed: 0, total: 0 });
		});
	});

	describe('adding images', () => {
		it('should add single file', () => {
			const { result } = renderHook(() => useBatchProcessing());

			act(() => {
				const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });
				result.current.addImages([file]);
			});

			expect(result.current.images).toHaveLength(1);
			expect(result.current.images[0].file.name).toBe('photo.jpg');
			expect(result.current.images[0].status).toBe('pending');
		});

		it('should add multiple files', () => {
			const { result } = renderHook(() => useBatchProcessing());

			act(() => {
				const files = [
					new File(['content1'], 'photo1.jpg', { type: 'image/jpeg' }),
					new File(['content2'], 'photo2.jpg', { type: 'image/jpeg' }),
					new File(['content3'], 'photo3.jpg', { type: 'image/jpeg' }),
				];
				result.current.addImages(files);
			});

			expect(result.current.images).toHaveLength(3);
			expect(result.current.progress.total).toBe(3);
		});

		it('should generate unique IDs for each image', () => {
			const { result } = renderHook(() => useBatchProcessing());

			act(() => {
				const files = [
					new File(['content1'], 'photo.jpg', { type: 'image/jpeg' }),
					new File(['content2'], 'photo.jpg', { type: 'image/jpeg' }),
				];
				result.current.addImages(files);
			});

			const ids = result.current.images.map((img) => img.id);
			const uniqueIds = new Set(ids);
			expect(uniqueIds.size).toBe(2);
		});

		it('should create object URLs for images', () => {
			const { result } = renderHook(() => useBatchProcessing());

			act(() => {
				const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });
				result.current.addImages([file]);
			});

			expect(global.URL.createObjectURL).toHaveBeenCalled();
			expect(result.current.images[0].imageUrl).toBe('blob:mock-url');
		});
	});

	describe('removing images', () => {
		it('should remove image by ID', () => {
			const { result } = renderHook(() => useBatchProcessing());

			act(() => {
				const files = [
					new File(['content1'], 'photo1.jpg', { type: 'image/jpeg' }),
					new File(['content2'], 'photo2.jpg', { type: 'image/jpeg' }),
				];
				result.current.addImages(files);
			});

			const idToRemove = result.current.images[0].id;

			act(() => {
				result.current.removeImage(idToRemove);
			});

			expect(result.current.images).toHaveLength(1);
			expect(result.current.images[0].id).not.toBe(idToRemove);
		});

		it('should revoke object URL when removing', () => {
			const { result } = renderHook(() => useBatchProcessing());

			act(() => {
				const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });
				result.current.addImages([file]);
			});

			const imageUrl = result.current.images[0].imageUrl;

			act(() => {
				result.current.removeImage(result.current.images[0].id);
			});

			expect(global.URL.revokeObjectURL).toHaveBeenCalledWith(imageUrl);
		});
	});

	describe('clearing all images', () => {
		it('should clear all images', () => {
			const { result } = renderHook(() => useBatchProcessing());

			act(() => {
				const files = [
					new File(['content1'], 'photo1.jpg', { type: 'image/jpeg' }),
					new File(['content2'], 'photo2.jpg', { type: 'image/jpeg' }),
				];
				result.current.addImages(files);
			});

			act(() => {
				result.current.clearAll();
			});

			expect(result.current.images).toHaveLength(0);
			expect(result.current.progress).toEqual({ completed: 0, total: 0 });
		});

		it('should revoke all object URLs when clearing', () => {
			const { result } = renderHook(() => useBatchProcessing());

			act(() => {
				const files = [
					new File(['content1'], 'photo1.jpg', { type: 'image/jpeg' }),
					new File(['content2'], 'photo2.jpg', { type: 'image/jpeg' }),
				];
				result.current.addImages(files);
			});

			const urlCount = result.current.images.length;

			act(() => {
				result.current.clearAll();
			});

			expect(global.URL.revokeObjectURL).toHaveBeenCalledTimes(urlCount);
		});
	});

	describe('progress tracking', () => {
		it('should track total count', () => {
			const { result } = renderHook(() => useBatchProcessing());

			act(() => {
				const files = [
					new File(['content1'], 'photo1.jpg', { type: 'image/jpeg' }),
					new File(['content2'], 'photo2.jpg', { type: 'image/jpeg' }),
					new File(['content3'], 'photo3.jpg', { type: 'image/jpeg' }),
				];
				result.current.addImages(files);
			});

			expect(result.current.progress.total).toBe(3);
			expect(result.current.progress.completed).toBe(0);
		});

		it('should initialize with zero progress', () => {
			const { result } = renderHook(() => useBatchProcessing());

			expect(result.current.progress).toEqual({ completed: 0, total: 0 });
		});
	});

	describe('status management', () => {
		it('should not set processing flag with no images', () => {
			const { result } = renderHook(() => useBatchProcessing());

			act(() => {
				result.current.startProcessing();
			});

			expect(result.current.processing).toBe(false);
		});

		it('should initialize with processing false', () => {
			const { result } = renderHook(() => useBatchProcessing());

			expect(result.current.processing).toBe(false);
		});
	});

	describe('configuration updates', () => {
		it('should apply config to all images', () => {
			const { result } = renderHook(() => useBatchProcessing());

			act(() => {
				const files = [
					new File(['content1'], 'photo1.jpg', { type: 'image/jpeg' }),
					new File(['content2'], 'photo2.jpg', { type: 'image/jpeg' }),
				];
				result.current.addImages(files);
			});

			act(() => {
				result.current.updateConfig({
					position: 'top-left',
					color: '#FFFFFF',
				});
			});

			expect(result.current.images[0].config.position).toBe('top-left');
			expect(result.current.images[0].config.color).toBe('#FFFFFF');
			expect(result.current.images[1].config.position).toBe('top-left');
			expect(result.current.images[1].config.color).toBe('#FFFFFF');
		});
	});

	describe('edge cases', () => {
		it('should handle adding empty array', () => {
			const { result } = renderHook(() => useBatchProcessing());

			act(() => {
				result.current.addImages([]);
			});

			expect(result.current.images).toHaveLength(0);
		});

		it('should handle removing non-existent ID', () => {
			const { result } = renderHook(() => useBatchProcessing());

			act(() => {
				const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });
				result.current.addImages([file]);
			});

			const initialLength = result.current.images.length;

			act(() => {
				result.current.removeImage('non-existent-id');
			});

			expect(result.current.images).toHaveLength(initialLength);
		});

		it('should handle starting processing with no images', () => {
			const { result } = renderHook(() => useBatchProcessing());

			act(() => {
				result.current.startProcessing();
			});

			expect(result.current.processing).toBe(false);
		});
	});
});
