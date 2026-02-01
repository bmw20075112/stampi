import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImageUploader from './ImageUploader';

describe('ImageUploader', () => {
	it('should render upload area', () => {
		render(<ImageUploader onImageSelect={vi.fn()} />);
		expect(screen.getByText(/Upload Photo/i)).toBeInTheDocument();
	});

	it('should render file input with accept attribute for images', () => {
		render(<ImageUploader onImageSelect={vi.fn()} />);
		const input = screen.getByTestId('file-input');
		expect(input).toHaveAttribute('accept', 'image/*');
	});

	it('should call onImageSelect when file is selected', async () => {
		const onImageSelect = vi.fn();
		render(<ImageUploader onImageSelect={onImageSelect} />);

		const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
		const input = screen.getByTestId('file-input');

		await userEvent.upload(input, file);

		expect(onImageSelect).toHaveBeenCalledWith(file);
	});

	it('should trigger file input when clicking upload area', async () => {
		render(<ImageUploader onImageSelect={vi.fn()} />);

		const uploadArea = screen.getByTestId('upload-area');
		const input = screen.getByTestId('file-input') as HTMLInputElement;

		const clickSpy = vi.spyOn(input, 'click');
		await userEvent.click(uploadArea);

		expect(clickSpy).toHaveBeenCalled();
	});

	describe('drag and drop', () => {
		it('should handle dragover event', () => {
			render(<ImageUploader onImageSelect={vi.fn()} />);
			const uploadArea = screen.getByTestId('upload-area');

			fireEvent.dragOver(uploadArea);

			expect(uploadArea).toHaveClass('border-blue-500');
		});

		it('should handle dragleave event', () => {
			render(<ImageUploader onImageSelect={vi.fn()} />);
			const uploadArea = screen.getByTestId('upload-area');

			fireEvent.dragOver(uploadArea);
			fireEvent.dragLeave(uploadArea);

			expect(uploadArea).not.toHaveClass('border-blue-500');
		});

		it('should call onImageSelect when file is dropped', () => {
			const onImageSelect = vi.fn();
			render(<ImageUploader onImageSelect={onImageSelect} />);

			const uploadArea = screen.getByTestId('upload-area');
			const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

			fireEvent.drop(uploadArea, {
				dataTransfer: {
					files: [file],
				},
			});

			expect(onImageSelect).toHaveBeenCalledWith(file);
		});

		it('should not call onImageSelect when non-image file is dropped', () => {
			const onImageSelect = vi.fn();
			render(<ImageUploader onImageSelect={onImageSelect} />);

			const uploadArea = screen.getByTestId('upload-area');
			const file = new File(['test'], 'test.txt', { type: 'text/plain' });

			fireEvent.drop(uploadArea, {
				dataTransfer: {
					files: [file],
				},
			});

			expect(onImageSelect).not.toHaveBeenCalled();
		});
	});
});
