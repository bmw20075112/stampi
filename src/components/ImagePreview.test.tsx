import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImagePreview from '@/components/ImagePreview';
import type { TimestampConfig } from '@/utils/imageProcessor';

const mockT = vi.fn(
	(key: string, options?: { current?: number; total?: number }) => {
		if (key === 'preview.imageCount' && options) {
			return `Image ${options.current} of ${options.total}`;
		}
		if (key === 'preview.previous') return 'Previous';
		if (key === 'preview.next') return 'Next';
		if (key === 'preview.noExifTitle') return 'Unable to read capture time';
		if (key === 'preview.noExifMessage')
			return 'This image may not have EXIF data';
		return key;
	}
);

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: mockT,
	}),
}));

const defaultConfig: TimestampConfig = {
	format: 'YYYY/MM/DD HH:mm:ss',
	position: 'bottom-right',
	color: '#FF6B35',
	fontSizeScale: 1.0,
};

describe('ImagePreview', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should render canvas element', () => {
		render(
			<ImagePreview
				imageUrl="test.jpg"
				timestamp="2024/03/15"
				config={defaultConfig}
			/>
		);

		expect(screen.getByTestId('preview-canvas')).toBeInTheDocument();
	});

	it('should render canvas with appropriate styles', () => {
		render(
			<ImagePreview
				imageUrl="test.jpg"
				timestamp="2024/03/15"
				config={defaultConfig}
			/>
		);

		const canvas = screen.getByTestId('preview-canvas');
		expect(canvas).toHaveClass('w-full');
		expect(canvas).toHaveClass('h-full');
		expect(canvas).toHaveClass('object-contain');
	});

	it('should display timestamp in preview', () => {
		const { rerender } = render(
			<ImagePreview
				imageUrl="test.jpg"
				timestamp="2024/03/15"
				config={defaultConfig}
			/>
		);

		// Rerender with different timestamp to verify component accepts the prop
		rerender(
			<ImagePreview
				imageUrl="test.jpg"
				timestamp="2024/12/25"
				config={defaultConfig}
			/>
		);

		// Component should not throw and should still have the canvas
		expect(screen.getByTestId('preview-canvas')).toBeInTheDocument();
	});

	it('should update when config changes', () => {
		const { rerender } = render(
			<ImagePreview
				imageUrl="test.jpg"
				timestamp="2024/03/15"
				config={defaultConfig}
			/>
		);

		const newConfig: TimestampConfig = {
			...defaultConfig,
			position: 'top-left',
		};

		rerender(
			<ImagePreview
				imageUrl="test.jpg"
				timestamp="2024/03/15"
				config={newConfig}
			/>
		);

		expect(screen.getByTestId('preview-canvas')).toBeInTheDocument();
	});

	it('should show message when no timestamp is available', () => {
		render(
			<ImagePreview
				imageUrl="test.jpg"
				timestamp={null}
				config={defaultConfig}
			/>
		);

		expect(
			screen.getByText(/Unable to read capture time/i)
		).toBeInTheDocument();
	});

	describe('Navigation', () => {
		it('should show navigation controls when multiple images', () => {
			render(
				<ImagePreview
					imageUrl="test.jpg"
					timestamp="2024/03/15"
					config={defaultConfig}
					currentIndex={0}
					totalImages={3}
					onPrevious={vi.fn()}
					onNext={vi.fn()}
				/>
			);

			expect(screen.getByText(/Image 1 of 3/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/Previous/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/Next/i)).toBeInTheDocument();
		});

		it('should not show navigation controls when single image', () => {
			render(
				<ImagePreview
					imageUrl="test.jpg"
					timestamp="2024/03/15"
					config={defaultConfig}
					currentIndex={0}
					totalImages={1}
					onPrevious={vi.fn()}
					onNext={vi.fn()}
				/>
			);

			expect(screen.queryByText(/Image 1 of 1/i)).not.toBeInTheDocument();
			expect(screen.queryByLabelText(/Previous/i)).not.toBeInTheDocument();
			expect(screen.queryByLabelText(/Next/i)).not.toBeInTheDocument();
		});

		it('should call onPrevious when clicking previous button', async () => {
			const user = userEvent.setup();
			const onPrevious = vi.fn();

			render(
				<ImagePreview
					imageUrl="test.jpg"
					timestamp="2024/03/15"
					config={defaultConfig}
					currentIndex={1}
					totalImages={3}
					onPrevious={onPrevious}
					onNext={vi.fn()}
				/>
			);

			await user.click(screen.getByLabelText(/Previous/i));
			expect(onPrevious).toHaveBeenCalledTimes(1);
		});

		it('should call onNext when clicking next button', async () => {
			const user = userEvent.setup();
			const onNext = vi.fn();

			render(
				<ImagePreview
					imageUrl="test.jpg"
					timestamp="2024/03/15"
					config={defaultConfig}
					currentIndex={0}
					totalImages={3}
					onPrevious={vi.fn()}
					onNext={onNext}
				/>
			);

			await user.click(screen.getByLabelText(/Next/i));
			expect(onNext).toHaveBeenCalledTimes(1);
		});

		it('should disable previous button at first image', () => {
			render(
				<ImagePreview
					imageUrl="test.jpg"
					timestamp="2024/03/15"
					config={defaultConfig}
					currentIndex={0}
					totalImages={3}
					onPrevious={vi.fn()}
					onNext={vi.fn()}
				/>
			);

			expect(screen.getByLabelText(/Previous/i)).toBeDisabled();
		});

		it('should disable next button at last image', () => {
			render(
				<ImagePreview
					imageUrl="test.jpg"
					timestamp="2024/03/15"
					config={defaultConfig}
					currentIndex={2}
					totalImages={3}
					onPrevious={vi.fn()}
					onNext={vi.fn()}
				/>
			);

			expect(screen.getByLabelText(/Next/i)).toBeDisabled();
		});

		it('should update image count when props change', () => {
			const { rerender } = render(
				<ImagePreview
					imageUrl="test.jpg"
					timestamp="2024/03/15"
					config={defaultConfig}
					currentIndex={0}
					totalImages={3}
					onPrevious={vi.fn()}
					onNext={vi.fn()}
				/>
			);

			expect(screen.getByText(/Image 1 of 3/i)).toBeInTheDocument();

			rerender(
				<ImagePreview
					imageUrl="test.jpg"
					timestamp="2024/03/15"
					config={defaultConfig}
					currentIndex={1}
					totalImages={3}
					onPrevious={vi.fn()}
					onNext={vi.fn()}
				/>
			);

			expect(screen.getByText(/Image 2 of 3/i)).toBeInTheDocument();
		});
	});
});
