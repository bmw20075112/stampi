import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface DateInputDialogProps {
	open: boolean;
	filename: string;
	defaultDate?: Date;
	onConfirm: (date: Date) => void;
	onSkip: () => void;
}

export default function DateInputDialog({
	open,
	filename,
	defaultDate,
	onConfirm,
	onSkip,
}: DateInputDialogProps) {
	const { t } = useTranslation();
	const dialogRef = useRef<HTMLDialogElement>(null);

	const [date, setDate] = useState<string>('');
	const [time, setTime] = useState<string>('');

	// Initialize form with default date if provided
	// eslint-disable-next-line react-hooks/set-state-in-effect
	useEffect(() => {
		if (defaultDate && open) {
			const year = defaultDate.getFullYear();
			const month = String(defaultDate.getMonth() + 1).padStart(2, '0');
			const day = String(defaultDate.getDate()).padStart(2, '0');
			const hours = String(defaultDate.getHours()).padStart(2, '0');
			const minutes = String(defaultDate.getMinutes()).padStart(2, '0');

			setDate(`${year}-${month}-${day}`);
			setTime(`${hours}:${minutes}`);
		}
	}, [defaultDate, open]);

	// Handle dialog open/close with fallback for test environments
	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;

		if (open && dialog.showModal) {
			try {
				dialog.showModal();
			} catch {
				// Fallback if showModal is not supported
			}
		} else if (!open && dialog.close) {
			dialog.close();
		}
	}, [open]);

	const handleConfirm = (e: React.FormEvent) => {
		e.preventDefault();

		if (!date) {
			return;
		}

		// Parse date string (YYYY-MM-DD)
		const [year, month, day] = date.split('-').map(Number);
		const confirmDate = new Date(year, month - 1, day);

		// Add time if provided
		if (time) {
			const [hours, minutes] = time.split(':').map(Number);
			confirmDate.setHours(hours || 0, minutes || 0, 0);
		}

		onConfirm(confirmDate);
		setDate('');
		setTime('');
	};

	const handleSkip = () => {
		setDate('');
		setTime('');
		onSkip();
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLDialogElement>) => {
		if (e.key === 'Escape') {
			e.preventDefault();
			handleSkip();
		}
	};

	if (!open) {
		return null;
	}

	return (
		<dialog
			ref={dialogRef}
			onKeyDown={handleKeyDown}
			className="fixed inset-0 z-50 max-w-md mx-auto p-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 backdrop:bg-black/50"
		>
			<form onSubmit={handleConfirm} className="space-y-4">
				<div>
					<h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
						{t('dateInput.title')}
					</h2>
					<p className="text-sm text-gray-600 dark:text-gray-400">
						{t('dateInput.subtitle')}
					</p>
				</div>

				<div>
					<label htmlFor="filename" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						{t('dateInput.filenameLabel')}
					</label>
					<input
						id="filename"
						type="text"
						value={filename}
						disabled
						className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg border border-gray-300 dark:border-gray-600 cursor-not-allowed text-sm"
					/>
				</div>

				<div>
					<label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						{t('dateInput.dateLabel')} *
					</label>
					<input
						id="date"
						type="date"
						value={date}
						onChange={(e) => setDate(e.target.value)}
						required
						className="w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
					/>
				</div>

				<div>
					<label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						{t('dateInput.timeLabel')}
					</label>
					<input
						id="time"
						type="time"
						value={time}
						onChange={(e) => setTime(e.target.value)}
						className="w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
					/>
				</div>

				<div className="flex gap-3 pt-4">
					<button
						type="button"
						onClick={handleSkip}
						className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors text-sm"
					>
						{t('dateInput.skipButton')}
					</button>
					<button
						type="submit"
						className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
					>
						{t('dateInput.confirmButton')}
					</button>
				</div>
			</form>
		</dialog>
	);
}
