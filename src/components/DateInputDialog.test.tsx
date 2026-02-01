import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DateInputDialog from './DateInputDialog';

describe('DateInputDialog', () => {
	it('should not render when closed', () => {
		const { container } = render(
			<DateInputDialog
				open={false}
				filename="test.jpg"
				onConfirm={vi.fn()}
				onSkip={vi.fn()}
			/>
		);

		expect(container.innerHTML).toBe('');
	});

	it('should render when open', () => {
		render(
			<DateInputDialog
				open={true}
				filename="test.jpg"
				onConfirm={vi.fn()}
				onSkip={vi.fn()}
			/>
		);

		expect(screen.getByText(/Manual Date Input/i)).toBeInTheDocument();
	});

	it('should display filename', () => {
		render(
			<DateInputDialog
				open={true}
				filename="IMG_20240315.jpg"
				onConfirm={vi.fn()}
				onSkip={vi.fn()}
			/>
		);

		expect(
			(screen.getByLabelText(/Filename/i) as HTMLInputElement).value
		).toBe('IMG_20240315.jpg');
	});

	it('should have date and time input fields', () => {
		render(
			<DateInputDialog
				open={true}
				filename="test.jpg"
				onConfirm={vi.fn()}
				onSkip={vi.fn()}
			/>
		);

		expect(screen.getByLabelText(/Date/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/Time/i)).toBeInTheDocument();
	});

	it('should call onConfirm with selected date', async () => {
		const onConfirm = vi.fn();
		const user = userEvent.setup();

		render(
			<DateInputDialog
				open={true}
				filename="test.jpg"
				onConfirm={onConfirm}
				onSkip={vi.fn()}
			/>
		);

		const dateInput = screen.getByLabelText(/Date/i) as HTMLInputElement;
		await user.clear(dateInput);
		await user.type(dateInput, '2024-03-15');

		const confirmButton = screen.getByRole('button', {
			name: /Confirm Date/i,
		});
		await user.click(confirmButton);

		expect(onConfirm).toHaveBeenCalled();

		const passedDate = onConfirm.mock.calls[0][0];
		expect(passedDate).toBeInstanceOf(Date);
		expect(passedDate.getFullYear()).toBe(2024);
		expect(passedDate.getMonth()).toBe(2); // March = 2
		expect(passedDate.getDate()).toBe(15);
	});

	it('should call onSkip when skip button clicked', async () => {
		const onSkip = vi.fn();
		const user = userEvent.setup();

		render(
			<DateInputDialog
				open={true}
				filename="test.jpg"
				onConfirm={vi.fn()}
				onSkip={onSkip}
			/>
		);

		const skipButton = screen.getByRole('button', {
			name: /Continue Without Date/i,
		});
		await user.click(skipButton);

		expect(onSkip).toHaveBeenCalled();
	});

	it('should prefill date if defaultDate provided', () => {
		const defaultDate = new Date('2024-03-15T14:30:00');

		render(
			<DateInputDialog
				open={true}
				filename="test.jpg"
				defaultDate={defaultDate}
				onConfirm={vi.fn()}
				onSkip={vi.fn()}
			/>
		);

		const dateInput = screen.getByLabelText(/Date/i) as HTMLInputElement;
		expect(dateInput.value).toBe('2024-03-15');
	});

	it('should prefill time if defaultDate provided', () => {
		const defaultDate = new Date('2024-03-15T14:30:45');

		render(
			<DateInputDialog
				open={true}
				filename="test.jpg"
				defaultDate={defaultDate}
				onConfirm={vi.fn()}
				onSkip={vi.fn()}
			/>
		);

		const timeInput = screen.getByLabelText(/Time/i) as HTMLInputElement;
		expect(timeInput.value).toBe('14:30');
	});

	it('should handle time input correctly', async () => {
		const onConfirm = vi.fn();
		const user = userEvent.setup();

		render(
			<DateInputDialog
				open={true}
				filename="test.jpg"
				onConfirm={onConfirm}
				onSkip={vi.fn()}
			/>
		);

		const dateInput = screen.getByLabelText(/Date/i) as HTMLInputElement;
		const timeInput = screen.getByLabelText(/Time/i) as HTMLInputElement;

		await user.clear(dateInput);
		await user.type(dateInput, '2024-03-15');
		await user.clear(timeInput);
		await user.type(timeInput, '14:30');

		const confirmButton = screen.getByRole('button', {
			name: /Confirm Date/i,
		});
		await user.click(confirmButton);

		expect(onConfirm).toHaveBeenCalled();

		const passedDate = onConfirm.mock.calls[0][0];
		expect(passedDate.getHours()).toBe(14);
		expect(passedDate.getMinutes()).toBe(30);
	});

	it('should close dialog on ESC key', async () => {
		const onSkip = vi.fn();

		const { container } = render(
			<DateInputDialog
				open={true}
				filename="test.jpg"
				onConfirm={vi.fn()}
				onSkip={onSkip}
			/>
		);

		const dialog = container.querySelector('dialog') as HTMLDialogElement;

		fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' });

		expect(onSkip).toHaveBeenCalled();
	});

	it('should be accessible with proper labels', () => {
		render(
			<DateInputDialog
				open={true}
				filename="test.jpg"
				onConfirm={vi.fn()}
				onSkip={vi.fn()}
			/>
		);

		expect(screen.getByLabelText(/Date/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/Time/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/Filename/i)).toBeInTheDocument();
	});
});
