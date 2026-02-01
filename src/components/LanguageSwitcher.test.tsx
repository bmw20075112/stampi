import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LanguageSwitcher from './LanguageSwitcher';

const mockChangeLanguage = vi.fn();
const mockI18n = {
	language: 'en',
	changeLanguage: mockChangeLanguage,
};

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		i18n: mockI18n,
	}),
}));

describe('LanguageSwitcher', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockI18n.language = 'en';
		localStorage.clear();
	});

	it('should render both language buttons', () => {
		render(<LanguageSwitcher />);

		expect(screen.getByRole('button', { name: 'English' })).toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: '繁體中文' })
		).toBeInTheDocument();
	});

	it('should highlight the current language button', () => {
		render(<LanguageSwitcher />);

		const englishButton = screen.getByRole('button', { name: 'English' });
		expect(englishButton).toHaveClass('bg-blue-600');
	});

	it('should call changeLanguage when clicking a language button', async () => {
		const user = userEvent.setup();
		render(<LanguageSwitcher />);

		const chineseButton = screen.getByRole('button', { name: '繁體中文' });
		await user.click(chineseButton);

		expect(mockChangeLanguage).toHaveBeenCalledWith('zh-TW');
	});

	it('should save language preference to localStorage', async () => {
		const user = userEvent.setup();
		render(<LanguageSwitcher />);

		const chineseButton = screen.getByRole('button', { name: '繁體中文' });
		await user.click(chineseButton);

		expect(localStorage.getItem('preferredLanguage')).toBe('zh-TW');
	});

	it('should highlight different button when language changes', async () => {
		const user = userEvent.setup();
		const { rerender } = render(<LanguageSwitcher />);

		const chineseButton = screen.getByRole('button', { name: '繁體中文' });
		await user.click(chineseButton);

		// Simulate language change
		mockI18n.language = 'zh-TW';
		rerender(<LanguageSwitcher />);

		expect(chineseButton).toHaveClass('bg-blue-600');
	});

	it('should save English preference to localStorage when clicking English button', async () => {
		const user = userEvent.setup();
		mockI18n.language = 'zh-TW';
		render(<LanguageSwitcher />);

		const englishButton = screen.getByRole('button', { name: 'English' });
		await user.click(englishButton);

		expect(localStorage.getItem('preferredLanguage')).toBe('en');
	});
});
