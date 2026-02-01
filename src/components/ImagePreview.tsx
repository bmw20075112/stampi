import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { renderTimestamp } from '../utils/imageProcessor';
import { exportImage } from '../utils/imageExporter';
import DateSourceBadge from './DateSourceBadge';
import type { TimestampConfig } from '../utils/imageProcessor';
import type { DateSource, Confidence } from '../hooks/useTimestamp';

interface ImagePreviewProps {
	imageUrl: string;
	timestamp: string | null;
	config: TimestampConfig;
	dateSource?: DateSource;
	dateConfidence?: Confidence;
	onRequestDateInput?: () => void;
	onEditDate?: () => void;
}

export default function ImagePreview({
	imageUrl,
	timestamp,
	config,
	dateSource,
	dateConfidence,
	onRequestDateInput,
	onEditDate,
}: ImagePreviewProps) {
	const { t } = useTranslation();
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const imageRef = useRef<HTMLImageElement | null>(null);
	const [downloading, setDownloading] = useState(false);

	const handleDownload = async () => {
		if (!canvasRef.current) return;

		setDownloading(true);
		try {
			const blob = await exportImage(canvasRef.current);
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.download = 'time-image.jpg';
			link.href = url;
			link.click();
			URL.revokeObjectURL(url);
		} catch {
			// Silently handle errors
		} finally {
			setDownloading(false);
		}
	};

	useEffect(() => {
		if (!timestamp) return;

		const image = new Image();
		image.crossOrigin = 'anonymous';
		image.onload = () => {
			imageRef.current = image;
			if (canvasRef.current) {
				renderTimestamp(canvasRef.current, image, timestamp, config);
			}
		};
		image.src = imageUrl;
	}, [imageUrl, timestamp, config]);

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
			<div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
				<canvas
					ref={canvasRef}
					data-testid="preview-canvas"
					className="max-w-full h-auto rounded-lg mx-auto"
				/>
			</div>
			<button
				onClick={handleDownload}
				disabled={downloading}
				className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{downloading ? (
					<>
						<svg
							className="animate-spin w-5 h-5"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
							/>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							/>
						</svg>
						Downloading...
					</>
				) : (
					<>
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
								d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
							/>
						</svg>
						{t('preview.downloadButton')}
					</>
				)}
			</button>
		</div>
	);
}
