import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TimestampEditor from './TimestampEditor';
import type { TimestampConfig } from '../utils/imageProcessor';

const defaultConfig: TimestampConfig = {
	format: 'YYYY/MM/DD',
	position: 'bottom-right',
	color: '#FF6B35',
	fontSize: 30,
};

describe('TimestampEditor', () => {
	it('should render all configuration fields', () => {
		render(<TimestampEditor config={defaultConfig} onChange={vi.fn()} />);

		expect(screen.getByLabelText(/格式/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/位置/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/字體大小/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/顏色/i)).toBeInTheDocument();
	});

	describe('format selector', () => {
		it('should display current format value', () => {
			render(<TimestampEditor config={defaultConfig} onChange={vi.fn()} />);

			const formatSelect = screen.getByLabelText(/格式/i) as HTMLSelectElement;
			expect(formatSelect.value).toBe('YYYY/MM/DD');
		});

		it('should have all format options', () => {
			render(<TimestampEditor config={defaultConfig} onChange={vi.fn()} />);

			const formatSelect = screen.getByLabelText(/格式/i);
			expect(formatSelect).toContainHTML('YYYY/MM/DD');
			expect(formatSelect).toContainHTML('YYYY-MM-DD');
			expect(formatSelect).toContainHTML('DD/MM/YYYY');
			expect(formatSelect).toContainHTML('MM/DD/YYYY');
		});

		it('should call onChange when format is changed', () => {
			const onChange = vi.fn();
			render(<TimestampEditor config={defaultConfig} onChange={onChange} />);

			const formatSelect = screen.getByLabelText(/格式/i);
			fireEvent.change(formatSelect, { target: { value: 'YYYY-MM-DD' } });

			expect(onChange).toHaveBeenCalledWith({
				...defaultConfig,
				format: 'YYYY-MM-DD',
			});
		});
	});

	describe('position selector', () => {
		it('should display current position value', () => {
			render(<TimestampEditor config={defaultConfig} onChange={vi.fn()} />);

			const positionSelect = screen.getByLabelText(
				/位置/i
			) as HTMLSelectElement;
			expect(positionSelect.value).toBe('bottom-right');
		});

		it('should have all position options', () => {
			render(<TimestampEditor config={defaultConfig} onChange={vi.fn()} />);

			const positionSelect = screen.getByLabelText(/位置/i);
			expect(positionSelect).toContainHTML('右下');
			expect(positionSelect).toContainHTML('左下');
			expect(positionSelect).toContainHTML('右上');
			expect(positionSelect).toContainHTML('左上');
		});

		it('should call onChange when position is changed', () => {
			const onChange = vi.fn();
			render(<TimestampEditor config={defaultConfig} onChange={onChange} />);

			const positionSelect = screen.getByLabelText(/位置/i);
			fireEvent.change(positionSelect, { target: { value: 'top-left' } });

			expect(onChange).toHaveBeenCalledWith({
				...defaultConfig,
				position: 'top-left',
			});
		});
	});

	describe('font size slider', () => {
		it('should display current font size value', () => {
			render(<TimestampEditor config={defaultConfig} onChange={vi.fn()} />);

			const slider = screen.getByLabelText(/字體大小/i) as HTMLInputElement;
			expect(slider.value).toBe('30');
		});

		it('should call onChange when font size is changed', () => {
			const onChange = vi.fn();
			render(<TimestampEditor config={defaultConfig} onChange={onChange} />);

			const slider = screen.getByLabelText(/字體大小/i);
			fireEvent.change(slider, { target: { value: '50' } });

			expect(onChange).toHaveBeenCalledWith({
				...defaultConfig,
				fontSize: 50,
			});
		});
	});

	describe('color picker', () => {
		it('should display current color value', () => {
			render(<TimestampEditor config={defaultConfig} onChange={vi.fn()} />);

			const colorPicker = screen.getByLabelText(/顏色/i) as HTMLInputElement;
			expect(colorPicker.value).toBe('#ff6b35');
		});

		it('should call onChange when color is changed', () => {
			const onChange = vi.fn();
			render(<TimestampEditor config={defaultConfig} onChange={onChange} />);

			const colorPicker = screen.getByLabelText(/顏色/i);
			fireEvent.change(colorPicker, { target: { value: '#00ff00' } });

			expect(onChange).toHaveBeenCalledWith({
				...defaultConfig,
				color: '#00ff00',
			});
		});
	});
});
