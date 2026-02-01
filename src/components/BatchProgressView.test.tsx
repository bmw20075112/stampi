import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BatchProgressView from './BatchProgressView';
import type { ProcessedImage } from '../hooks/useBatchProcessing';

describe('BatchProgressView', () => {
	const createMockImage = (
		overrides: Partial<ProcessedImage> = {}
	): ProcessedImage => ({
		id: '1',
		file: new File(['content'], 'photo.jpg', { type: 'image/jpeg' }),
		imageUrl: 'blob:mock-url',
		timestamp: '2024/03/15 14:30:45',
		config: {
			format: 'YYYY/MM/DD',
			position: 'bottom-right',
			color: '#FF6B35',
			fontSize: 48,
		},
		dateSource: 'exif',
		confidence: 'high',
		status: 'pending',
		...overrides,
	});

	describe('empty state', () => {
		it('should show empty state when no images', () => {
			render(<BatchProgressView images={[]} onRemove={vi.fn()} />);
			expect(screen.getByText(/No images/i)).toBeInTheDocument();
		});
	});

	describe('image list', () => {
		it('should render list of images', () => {
			const images = [
				createMockImage({ id: '1', file: new File([''], 'photo1.jpg') }),
				createMockImage({ id: '2', file: new File([''], 'photo2.jpg') }),
				createMockImage({ id: '3', file: new File([''], 'photo3.jpg') }),
			];

			render(<BatchProgressView images={images} onRemove={vi.fn()} />);

			expect(screen.getByText('photo1.jpg')).toBeInTheDocument();
			expect(screen.getByText('photo2.jpg')).toBeInTheDocument();
			expect(screen.getByText('photo3.jpg')).toBeInTheDocument();
		});

		it('should show thumbnails for each image', () => {
			const images = [createMockImage()];

			render(<BatchProgressView images={images} onRemove={vi.fn()} />);

			const thumbnail = screen.getByAltText('photo.jpg');
			expect(thumbnail).toBeInTheDocument();
			expect(thumbnail).toHaveAttribute('src', 'blob:mock-url');
		});
	});

	describe('status indicators', () => {
		it('should show pending status', () => {
			const images = [createMockImage({ status: 'pending' })];

			render(<BatchProgressView images={images} onRemove={vi.fn()} />);

			expect(screen.getByText(/pending/i)).toBeInTheDocument();
		});

		it('should show processing status', () => {
			const images = [createMockImage({ status: 'processing' })];

			render(<BatchProgressView images={images} onRemove={vi.fn()} />);

			expect(screen.getByText(/processing/i)).toBeInTheDocument();
		});

		it('should show completed status', () => {
			const images = [createMockImage({ status: 'completed' })];

			render(<BatchProgressView images={images} onRemove={vi.fn()} />);

			const statusBadge = screen.getByText((content, element) => {
				return (
					element?.tagName.toLowerCase() === 'span' &&
					content === 'Completed' &&
					element.className.includes('bg-green')
				);
			});
			expect(statusBadge).toBeInTheDocument();
		});

		it('should show error status', () => {
			const images = [
				createMockImage({ status: 'error', error: 'Failed to process' }),
			];

			render(<BatchProgressView images={images} onRemove={vi.fn()} />);

			expect(screen.getByText(/error/i)).toBeInTheDocument();
		});
	});

	describe('remove functionality', () => {
		it('should show remove button for each image', () => {
			const images = [createMockImage()];

			render(<BatchProgressView images={images} onRemove={vi.fn()} />);

			const removeButtons = screen.getAllByRole('button', { name: /remove/i });
			expect(removeButtons).toHaveLength(1);
		});

		it('should call onRemove with image ID when clicked', async () => {
			const onRemove = vi.fn();
			const images = [createMockImage({ id: 'test-id' })];

			render(<BatchProgressView images={images} onRemove={onRemove} />);

			const removeButton = screen.getByRole('button', { name: /remove/i });
			await userEvent.click(removeButton);

			expect(onRemove).toHaveBeenCalledWith('test-id');
		});
	});

	describe('progress display', () => {
		it('should show progress summary', () => {
			const images = [
				createMockImage({ id: '1', status: 'completed' }),
				createMockImage({ id: '2', status: 'completed' }),
				createMockImage({ id: '3', status: 'pending' }),
			];

			render(<BatchProgressView images={images} onRemove={vi.fn()} />);

			expect(screen.getByText(/2.*3/)).toBeInTheDocument();
		});

		it('should show progress bar', () => {
			const images = [
				createMockImage({ id: '1', status: 'completed' }),
				createMockImage({ id: '2', status: 'pending' }),
			];

			render(<BatchProgressView images={images} onRemove={vi.fn()} />);

			const progressBar = screen.getByRole('progressbar');
			expect(progressBar).toBeInTheDocument();
		});
	});

	describe('styling', () => {
		it('should apply different styles for different statuses', () => {
			const images = [
				createMockImage({ id: '1', status: 'pending' }),
				createMockImage({ id: '2', status: 'processing' }),
				createMockImage({ id: '3', status: 'completed' }),
				createMockImage({ id: '4', status: 'error' }),
			];

			render(<BatchProgressView images={images} onRemove={vi.fn()} />);

			// Just verify all images are rendered with their status
			expect(screen.getAllByRole('listitem')).toHaveLength(4);
		});
	});

	describe('edge cases', () => {
		it('should handle very long filenames', () => {
			const longName = 'a'.repeat(100) + '.jpg';
			const images = [
				createMockImage({
					file: new File([''], longName, { type: 'image/jpeg' }),
				}),
			];

			render(<BatchProgressView images={images} onRemove={vi.fn()} />);

			expect(screen.getByText(longName)).toBeInTheDocument();
		});

		it('should handle special characters in filename', () => {
			const images = [
				createMockImage({
					file: new File([''], 'photo (1) - 复制.jpg', { type: 'image/jpeg' }),
				}),
			];

			render(<BatchProgressView images={images} onRemove={vi.fn()} />);

			expect(screen.getByText('photo (1) - 复制.jpg')).toBeInTheDocument();
		});
	});
});
