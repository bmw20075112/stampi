import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { renderTimestamp } from '@/utils/imageProcessor';
import DateSourceBadge from '@/components/DateSourceBadge';
import type { TimestampConfig } from '@/utils/imageProcessor';
import type { DateSource, Confidence } from '@/hooks/useTimestamp';

interface ImagePreviewProps {
	imageUrl: string;
	timestamp: string | null;
	config: TimestampConfig;
	dateSource?: DateSource;
	dateConfidence?: Confidence;
	onRequestDateInput?: () => void;
	onEditDate?: () => void;
	currentIndex?: number;
	totalImages?: number;
	onPrevious?: () => void;
	onNext?: () => void;
	preRenderedCanvas?: HTMLCanvasElement | null;
}

export default function ImagePreview({
	imageUrl,
	timestamp,
	config,
	dateSource,
	dateConfidence,
	onRequestDateInput,
	onEditDate,
	currentIndex,
	totalImages,
	onPrevious,
	onNext,
	preRenderedCanvas,
}: ImagePreviewProps) {
	const { t } = useTranslation();
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const imageRef = useRef<HTMLImageElement | null>(null);

	// Keyboard navigation support (Arrow Left/Right)
	useEffect(() => {
		if (!totalImages || totalImages <= 1) return;

		const handleKeyPress = (e: KeyboardEvent) => {
			// Ignore if user is typing in an input field
			if (
				e.target instanceof HTMLInputElement ||
				e.target instanceof HTMLTextAreaElement
			) {
				return;
			}

			if (e.key === 'ArrowLeft' && onPrevious && currentIndex !== 0) {
				e.preventDefault();
				onPrevious();
			} else if (
				e.key === 'ArrowRight' &&
				onNext &&
				currentIndex !== totalImages - 1
			) {
				e.preventDefault();
				onNext();
			}
		};

		window.addEventListener('keydown', handleKeyPress);
		return () => window.removeEventListener('keydown', handleKeyPress);
	}, [currentIndex, totalImages, onPrevious, onNext]);

	useEffect(() => {
		if (!timestamp) return;
		if (!canvasRef.current) return;

		const canvas = canvasRef.current;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		// If we have a pre-rendered canvas, copy its content directly (no flashing)
		if (preRenderedCanvas) {
			// Maintain canvas dimensions to prevent layout shift
			canvas.width = preRenderedCanvas.width;
			canvas.height = preRenderedCanvas.height;
			ctx.drawImage(preRenderedCanvas, 0, 0);
			return;
		}

		// Fallback: render from scratch (for pending images without canvas yet)
		const image = new Image();
		image.crossOrigin = 'anonymous';
		image.onload = () => {
			imageRef.current = image;
			if (canvasRef.current) {
				renderTimestamp(canvasRef.current, image, timestamp, config);
			}
		};
		image.src = imageUrl;
	}, [imageUrl, timestamp, config, preRenderedCanvas]);

	if (!timestamp) {
		return (
			<div className="flex flex-col items-center justify-center p-6 sm:p-8 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
				<svg
					className="w-10 h-10 sm:w-12 sm:h-12 text-amber-500 mb-3"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
					/>
				</svg>
				<p className="text-amber-700 dark:text-amber-300 text-center font-medium">
					{t('preview.noExifTitle')}
				</p>
				<p className="text-sm text-amber-600 dark:text-amber-400 text-center mt-1">
					{t('preview.noExifMessage')}
				</p>
				{onRequestDateInput && (
					<button
						onClick={onRequestDateInput}
						className="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors text-sm"
					>
						{t('preview.inputDateButton') || 'Input Date Manually'}
					</button>
				)}
			</div>
		);
	}

	const showNavigation =
		totalImages && totalImages > 1 && currentIndex !== undefined;

	return (
		<div className="flex flex-col items-center space-y-4">
			{dateSource && dateConfidence && (
				<div className="w-full flex justify-between items-center">
					<DateSourceBadge
						source={dateSource}
						confidence={dateConfidence}
						onEdit={onEditDate}
					/>
				</div>
			)}
			<div className="w-full flex justify-center bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
				<div className="w-full max-w-sm aspect-square overflow-hidden rounded-lg relative">
					<canvas
						ref={canvasRef}
						data-testid="preview-canvas"
						className="absolute inset-0 w-full h-full object-contain"
					/>
				</div>
			</div>
			{showNavigation && (
				<div className="w-full flex items-center justify-between gap-4">
					<button
						onClick={onPrevious}
						disabled={currentIndex === 0}
						className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg border border-gray-200 dark:border-gray-700 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
						aria-label={t('preview.previous')}
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
								d="M15 19l-7-7 7-7"
							/>
						</svg>
						<span className="hidden sm:inline">{t('preview.previous')}</span>
					</button>
					<div
						className="text-sm font-medium text-gray-600 dark:text-gray-400"
						role="status"
						aria-live="polite"
						aria-atomic="true"
					>
						{t('preview.imageCount', {
							current: currentIndex + 1,
							total: totalImages,
						})}
					</div>
					<button
						onClick={onNext}
						disabled={currentIndex === totalImages - 1}
						className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg border border-gray-200 dark:border-gray-700 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
						aria-label={t('preview.next')}
					>
						<span className="hidden sm:inline">{t('preview.next')}</span>
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
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</button>
				</div>
			)}
		</div>
	);
}
