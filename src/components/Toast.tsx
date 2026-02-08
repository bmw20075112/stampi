import { useEffect } from 'react';

export interface ToastProps {
	message: string;
	type?: 'error' | 'success' | 'info';
	duration?: number;
	onClose: () => void;
}

export default function Toast({
	message,
	type = 'error',
	duration = 5000,
	onClose,
}: ToastProps) {
	useEffect(() => {
		const timer = setTimeout(() => {
			onClose();
		}, duration);

		return () => clearTimeout(timer);
	}, [duration, onClose]);

	const bgColor =
		type === 'error'
			? 'bg-red-600'
			: type === 'success'
				? 'bg-green-600'
				: 'bg-blue-600';

	return (
		<div className="fixed bottom-4 right-4 z-50 animate-slide-in">
			<div
				className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 max-w-md`}
			>
				{type === 'error' && (
					<svg
						className="w-6 h-6 flex-shrink-0"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				)}
				{type === 'success' && (
					<svg
						className="w-6 h-6 flex-shrink-0"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				)}
				<p className="text-sm font-medium">{message}</p>
				<button
					onClick={onClose}
					className="ml-auto flex-shrink-0 hover:bg-white/20 rounded p-1 transition-colors"
					aria-label="Close"
				>
					<svg
						className="w-5 h-5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>
		</div>
	);
}
