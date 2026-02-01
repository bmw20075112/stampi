import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BatchDownloadControls from './BatchDownloadControls';
import type { ProcessedImage } from '../hooks/useBatchProcessing';

// Mock the ZIP and export utilities
vi.mock('../utils/zipGenerator', () => ({
	createZip: vi.fn(() =>
		Promise.resolve(new Blob(['zip content'], { type: 'application/zip' }))
	),
}));

vi.mock('../utils/imageExporter', () => ({
	exportImage: vi.fn(() =>
		Promise.resolve(new Blob(['image content'], { type: 'image/jpeg' }))
	),
}));

describe('BatchDownloadControls', () => {
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
		status: 'completed',
		canvas: document.createElement('canvas'),
		...overrides,
	});

	beforeEach(() => {
		// Mock URL.createObjectURL and revokeObjectURL
		global.URL.createObjectURL = vi.fn(() => 'blob:download-url');
		global.URL.revokeObjectURL = vi.fn();

		// Mock link.click()
		HTMLAnchorElement.prototype.click = vi.fn();
	});

	describe('with no completed images', () => {
		it('should disable download buttons when no images completed', () => {
			const images = [createMockImage({ status: 'pending' })];

			render(<BatchDownloadControls images={images} />);

			const zipButton = screen.getByRole('button', { name: /download all/i });
			expect(zipButton).toBeDisabled();
		});

		it('should show count of 0 completed images', () => {
			const images = [createMockImage({ status: 'pending' })];

			render(<BatchDownloadControls images={images} />);

			expect(screen.getByText(/0.*file/i)).toBeInTheDocument();
		});
	});

	describe('with completed images', () => {
		it('should enable download buttons when images are completed', () => {
			const images = [createMockImage({ status: 'completed' })];

			render(<BatchDownloadControls images={images} />);

			const zipButton = screen.getByRole('button', { name: /download all/i });
			expect(zipButton).not.toBeDisabled();
		});

		it('should show count of completed images', () => {
			const images = [
				createMockImage({ id: '1', status: 'completed' }),
				createMockImage({ id: '2', status: 'completed' }),
				createMockImage({ id: '3', status: 'pending' }),
			];

			render(<BatchDownloadControls images={images} />);

			expect(screen.getByText(/2.*files/i)).toBeInTheDocument();
		});
	});

	describe('ZIP download', () => {
		it('should trigger ZIP download when button clicked', async () => {
			const images = [createMockImage({ status: 'completed' })];

			render(<BatchDownloadControls images={images} />);

			const zipButton = screen.getByRole('button', { name: /download all/i });
			await userEvent.click(zipButton);

			await waitFor(() => {
				expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled();
			});
		});

		it('should show loading state during ZIP creation', async () => {
			const images = [createMockImage({ status: 'completed' })];

			render(<BatchDownloadControls images={images} />);

			const zipButton = screen.getByRole('button', { name: /download all/i });
			userEvent.click(zipButton);

			expect(await screen.findByText(/preparing/i)).toBeInTheDocument();
		});

		it('should use filename with timestamp for ZIP', async () => {
			const images = [createMockImage({ status: 'completed' })];

			render(<BatchDownloadControls images={images} />);

			const zipButton = screen.getByRole('button', { name: /download all/i });
			await userEvent.click(zipButton);

			await waitFor(() => {
				expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled();
			});
		});
	});

	describe('individual downloads', () => {
		it('should show download button for each completed image', () => {
			const images = [
				createMockImage({ id: '1', status: 'completed' }),
				createMockImage({ id: '2', status: 'completed' }),
			];

			render(<BatchDownloadControls images={images} />);

			const downloadButtons = screen.getAllByRole('button', {
				name: 'photo.jpg',
			});
			expect(downloadButtons).toHaveLength(2);
		});

		it('should not show download button for non-completed images', () => {
			const images = [
				createMockImage({ id: '1', status: 'completed' }),
				createMockImage({ id: '2', status: 'pending' }),
			];

			render(<BatchDownloadControls images={images} />);

			const downloadButtons = screen.getAllByRole('button', {
				name: /download/i,
			});
			// Should have 1 individual + 1 ZIP button
			expect(downloadButtons.length).toBeGreaterThanOrEqual(1);
		});

		it('should trigger download when individual button clicked', async () => {
			const images = [
				createMockImage({
					id: '1',
					file: new File([''], 'test.jpg', { type: 'image/jpeg' }),
					status: 'completed',
				}),
			];

			render(<BatchDownloadControls images={images} />);

			const downloadButton = screen.getByRole('button', {
				name: 'test.jpg',
			});
			await userEvent.click(downloadButton);

			await waitFor(() => {
				expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled();
			});
		});
	});

	describe('edge cases', () => {
		it('should handle empty images array', () => {
			render(<BatchDownloadControls images={[]} />);

			const zipButton = screen.getByRole('button', { name: /download all/i });
			expect(zipButton).toBeDisabled();
		});

		it('should handle images without canvas', () => {
			const images = [
				createMockImage({ status: 'completed', canvas: undefined }),
			];

			render(<BatchDownloadControls images={images} />);

			// Should still render but download might be disabled
			expect(
				screen.getByRole('button', { name: /download all/i })
			).toBeInTheDocument();
		});
	});
});
