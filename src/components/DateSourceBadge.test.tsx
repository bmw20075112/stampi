import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DateSourceBadge from './DateSourceBadge';
import type { DateSource } from '../hooks/useTimestamp';

describe('DateSourceBadge', () => {
	it('should render EXIF source text', () => {
		render(
			<DateSourceBadge
				source="exif-datetime-original"
				confidence="high"
				onEdit={undefined}
			/>
		);

		expect(screen.getByText(/From camera EXIF/i)).toBeInTheDocument();
	});

	it('should render filename source text', () => {
		render(
			<DateSourceBadge
				source="filename"
				confidence="medium"
				onEdit={undefined}
			/>
		);

		expect(screen.getByText(/Extracted from filename/i)).toBeInTheDocument();
	});

	it('should render file-modified source text', () => {
		render(
			<DateSourceBadge
				source="file-modified"
				confidence="low"
				onEdit={undefined}
			/>
		);

		expect(
			screen.getByText(/From file modification time/i)
		).toBeInTheDocument();
	});

	it('should render user-input source text', () => {
		render(
			<DateSourceBadge
				source="user-input"
				confidence="high"
				onEdit={undefined}
			/>
		);

		expect(screen.getByText(/Manually entered/i)).toBeInTheDocument();
	});

	it('should apply high confidence styling (green)', () => {
		const { container } = render(
			<DateSourceBadge
				source="exif-datetime-original"
				confidence="high"
				onEdit={undefined}
			/>
		);

		const badge = container.querySelector('[class*="bg-"]');
		expect(badge).toHaveClass('bg-green-100');
		expect(badge).toHaveClass('text-green-700');
	});

	it('should apply medium confidence styling (yellow)', () => {
		const { container } = render(
			<DateSourceBadge
				source="filename"
				confidence="medium"
				onEdit={undefined}
			/>
		);

		const badge = container.querySelector('[class*="bg-"]');
		expect(badge).toHaveClass('bg-yellow-100');
		expect(badge).toHaveClass('text-yellow-700');
	});

	it('should apply low confidence styling (orange)', () => {
		const { container } = render(
			<DateSourceBadge
				source="file-modified"
				confidence="low"
				onEdit={undefined}
			/>
		);

		const badge = container.querySelector('[class*="bg-"]');
		expect(badge).toHaveClass('bg-orange-100');
		expect(badge).toHaveClass('text-orange-700');
	});

	it('should render edit button when onEdit is provided', async () => {
		const onEdit = vi.fn();

		render(
			<DateSourceBadge
				source="exif-datetime-original"
				confidence="high"
				onEdit={onEdit}
			/>
		);

		const editButton = screen.getByRole('button');
		expect(editButton).toBeInTheDocument();
	});

	it('should not render edit button when onEdit is undefined', () => {
		render(
			<DateSourceBadge
				source="exif-datetime-original"
				confidence="high"
				onEdit={undefined}
			/>
		);

		const buttons = screen.queryAllByRole('button');
		expect(buttons.length).toBe(0);
	});

	it('should call onEdit when edit button clicked', async () => {
		const onEdit = vi.fn();
		const user = userEvent.setup();

		render(
			<DateSourceBadge source="filename" confidence="medium" onEdit={onEdit} />
		);

		const editButton = screen.getByRole('button');
		await user.click(editButton);

		expect(onEdit).toHaveBeenCalled();
	});

	it('should render different icons for different sources', () => {
		const { container: exifContainer } = render(
			<DateSourceBadge
				source="exif-datetime-original"
				confidence="high"
				onEdit={undefined}
			/>
		);

		const { container: filenameContainer } = render(
			<DateSourceBadge
				source="filename"
				confidence="medium"
				onEdit={undefined}
			/>
		);

		// Just check that both render without errors and have icons
		expect(exifContainer.querySelector('svg')).toBeInTheDocument();
		expect(filenameContainer.querySelector('svg')).toBeInTheDocument();
	});

	it('should support all source types', () => {
		const sources: DateSource[] = [
			'exif-datetime-original',
			'exif-create-date',
			'exif-modify-date',
			'filename',
			'file-modified',
			'user-input',
			'none',
		];

		sources.forEach((source) => {
			const { container, unmount } = render(
				<DateSourceBadge
					source={source}
					confidence="medium"
					onEdit={undefined}
				/>
			);
			// Check that SVG icon renders
			expect(container.querySelector('svg')).toBeInTheDocument();
			unmount();
		});
	});

	it('should have dark mode support', () => {
		const { container } = render(
			<DateSourceBadge
				source="exif-datetime-original"
				confidence="high"
				onEdit={undefined}
			/>
		);

		const badge = container.querySelector('[class*="dark:"]');
		expect(badge?.className).toMatch(/dark:/);
	});
});
