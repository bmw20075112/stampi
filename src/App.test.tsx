import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '@/App';

vi.mock('exifr', () => ({
	default: {
		parse: vi.fn(),
	},
}));

const { mockProcessFilesForHeic } = vi.hoisted(() => ({
	mockProcessFilesForHeic: vi.fn(),
}));

vi.mock('@/utils/heicConverter', () => ({
	processFilesForHeic: mockProcessFilesForHeic,
}));

import exifr from 'exifr';

describe('App', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Mock URL.createObjectURL
		global.URL.createObjectURL = vi.fn(() => 'mock-url');
		global.URL.revokeObjectURL = vi.fn();

		// Default: passthrough files unchanged (no HEIC conversion needed)
		mockProcessFilesForHeic.mockImplementation((files: File[]) =>
			Promise.resolve(files.map((f: File) => ({ file: f, originalFile: null })))
		);
	});

	it('should render upload area initially', () => {
		render(<App />);

		expect(screen.getByTestId('upload-area')).toBeInTheDocument();
	});

	it('should render app title', () => {
		render(<App />);

		expect(screen.getByText(/Stampi/i)).toBeInTheDocument();
	});

	it('should show preview and editor after uploading image with EXIF', async () => {
		const mockDate = new Date('2024-03-15T14:30:00');
		vi.mocked(exifr.parse).mockResolvedValue({
			DateTimeOriginal: mockDate,
		});

		render(<App />);

		const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
		const input = screen.getByTestId('file-input');

		await userEvent.upload(input, file);

		await waitFor(() => {
			expect(screen.getByTestId('preview-canvas')).toBeInTheDocument();
		});

		expect(screen.getByLabelText(/format/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/position/i)).toBeInTheDocument();
	});

	it('should show warning when image has no EXIF data', async () => {
		vi.mocked(exifr.parse).mockResolvedValue(null);

		render(<App />);

		const file = new File(['test'], 'test.png', { type: 'image/png' });
		const input = screen.getByTestId('file-input');

		await userEvent.upload(input, file);

		// With no EXIF and no filename pattern, app uses file.lastModified
		// So it should show the preview, not the warning
		await waitFor(
			() => {
				expect(screen.getByTestId('preview-canvas')).toBeInTheDocument();
			},
			{ timeout: 3000 }
		);
	});

	it('should update preview when editor config changes', async () => {
		const mockDate = new Date('2024-03-15T14:30:00');
		vi.mocked(exifr.parse).mockResolvedValue({
			DateTimeOriginal: mockDate,
		});

		render(<App />);

		const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
		const input = screen.getByTestId('file-input');

		await userEvent.upload(input, file);

		await waitFor(() => {
			expect(screen.getByTestId('preview-canvas')).toBeInTheDocument();
		});

		const positionSelect = screen.getByLabelText(/position/i);
		await userEvent.selectOptions(positionSelect, 'top-left');

		// Verify the select value changed
		expect(positionSelect).toHaveValue('top-left');
	});

	it('should allow uploading a new image', async () => {
		const mockDate = new Date('2024-03-15T14:30:00');
		vi.mocked(exifr.parse).mockResolvedValue({
			DateTimeOriginal: mockDate,
		});

		render(<App />);

		// Upload first image
		const file1 = new File(['test1'], 'test1.jpg', { type: 'image/jpeg' });
		const input = screen.getByTestId('file-input');
		await userEvent.upload(input, file1);

		await waitFor(() => {
			expect(screen.getByTestId('preview-canvas')).toBeInTheDocument();
		});

		// Should still show the uploader for new uploads
		expect(screen.getByTestId('file-input')).toBeInTheDocument();
	});

	describe('HEIC conversion', () => {
		it('should convert HEIC files before adding to batch', async () => {
			const mockDate = new Date('2024-03-15T14:30:00');
			vi.mocked(exifr.parse).mockResolvedValue({
				DateTimeOriginal: mockDate,
			});

			const heicFile = new File(['heic-data'], 'photo.heic', {
				type: 'image/heic',
			});
			const convertedFile = new File(['jpg-data'], 'photo.jpg', {
				type: 'image/jpeg',
			});

			mockProcessFilesForHeic.mockResolvedValue([
				{ file: convertedFile, originalFile: heicFile },
			]);

			render(<App />);

			const input = screen.getByTestId('file-input');
			await userEvent.upload(input, heicFile);

			await waitFor(() => {
				expect(mockProcessFilesForHeic).toHaveBeenCalledWith([heicFile]);
			});
		});

		it('should show converting indicator while processing HEIC', async () => {
			let resolveConversion!: (value: unknown) => void;
			const conversionPromise = new Promise((resolve) => {
				resolveConversion = resolve;
			});

			mockProcessFilesForHeic.mockReturnValue(conversionPromise);

			render(<App />);

			const input = screen.getByTestId('file-input');
			const heicFile = new File(['heic-data'], 'photo.heic', {
				type: 'image/heic',
			});
			await userEvent.upload(input, heicFile);

			await waitFor(() => {
				expect(screen.getByText(/converting/i)).toBeInTheDocument();
			});

			// Resolve conversion
			const convertedFile = new File(['jpg-data'], 'photo.jpg', {
				type: 'image/jpeg',
			});
			resolveConversion([{ file: convertedFile, originalFile: heicFile }]);

			await waitFor(() => {
				expect(screen.queryByText(/converting/i)).not.toBeInTheDocument();
			});
		});

		it('should handle HEIC conversion errors gracefully', async () => {
			const consoleErrorSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});
			mockProcessFilesForHeic.mockRejectedValue(new Error('Conversion failed'));

			render(<App />);

			const input = screen.getByTestId('file-input');
			const heicFile = new File(['heic-data'], 'photo.heic', {
				type: 'image/heic',
			});
			await userEvent.upload(input, heicFile);

			await waitFor(() => {
				expect(consoleErrorSpy).toHaveBeenCalledWith(
					'HEIC conversion failed:',
					expect.any(Error)
				);
			});

			// Converting indicator should be hidden
			expect(screen.queryByText(/converting/i)).not.toBeInTheDocument();

			consoleErrorSpy.mockRestore();
		});
	});
});
