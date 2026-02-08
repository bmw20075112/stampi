import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ImageUploader from './components/ImageUploader';
import ImagePreview from './components/ImagePreview';
import TimestampEditor from './components/TimestampEditor';
import LanguageSwitcher from './components/LanguageSwitcher';
import DateInputDialog from './components/DateInputDialog';
import BatchProgressView from './components/BatchProgressView';
import BatchDownloadControls from './components/BatchDownloadControls';
import Toast from './components/Toast';
import useTimestamp from './hooks/useTimestamp';
import { useBatchProcessing } from './hooks/useBatchProcessing';
import { formatDate } from './utils/dateFormatter';
import { calculateFontSize } from './utils/imageProcessor';
import type { TimestampConfig } from './utils/imageProcessor';
import { processFilesForHeic } from './utils/heicConverter';
import { extractTimestamp } from './utils/timestampExtractor';

const DEFAULT_CONFIG: TimestampConfig = {
	format: 'YYYY/MM/DD HH:mm:ss',
	position: 'bottom-right',
	color: '#FFF',
	fontSize: 30,
	shadowBlur: 8,
	shadowOffsetX: 3,
	shadowOffsetY: 3,
	shadowColor: 'rgba(0, 0, 0, 0.9)',
};

function App() {
	const { t, i18n } = useTranslation();
	const [config, setConfig] = useState<TimestampConfig>(DEFAULT_CONFIG);
	const [showDateInputDialog, setShowDateInputDialog] = useState(false);
	const [manualDate, setManualDate] = useState<Date | null>(null);
	const [converting, setConverting] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	// Batch processing state
	const {
		images,
		addImages,
		removeImage,
		startProcessing,
		updateTimestampForAll,
		rerenderCompletedImages,
		updateConfig,
	} = useBatchProcessing({
		concurrentLimit: 2,
	});

	// Get the first image for preview (backward compatibility with single-file mode)
	const firstImage = images.length > 0 ? images[0] : null;
	const fileForExif = firstImage?.originalFile ?? firstImage?.file ?? null;
	const imageUrl = firstImage?.imageUrl || null;

	const {
		date: extractedDate,
		loading,
		source,
		confidence,
		needsUserInput,
	} = useTimestamp(fileForExif);

	useEffect(() => {
		const preferredLanguage = localStorage.getItem('preferredLanguage');
		if (preferredLanguage && preferredLanguage !== i18n.language) {
			i18n.changeLanguage(preferredLanguage);
		}
	}, [i18n]);

	// Use manual date if provided, otherwise use extracted date
	const date = manualDate || extractedDate;

	// Apply timestamp to all images when date changes
	useEffect(() => {
		const formattedTimestamp = date ? formatDate(date, config.format) : null;
		if (formattedTimestamp && images.length > 0) {
			updateTimestampForAll(formattedTimestamp, source, confidence);
			// Re-render completed images with updated timestamp (async, no need to wait)
			void rerenderCompletedImages();
		}
	}, [
		date,
		config.format,
		source,
		confidence,
		images.length,
		updateTimestampForAll,
		rerenderCompletedImages,
	]);

	// Auto-start batch processing when new images are added
	useEffect(() => {
		const hasPendingImages = images.some((img) => img.status === 'pending');
		if (hasPendingImages) {
			startProcessing();
		}
	}, [images, startProcessing]);

	// Show dialog if automatic methods failed and user hasn't provided input
	useEffect(() => {
		if (needsUserInput && !manualDate && fileForExif) {
			setShowDateInputDialog(true);
		}
	}, [needsUserInput, manualDate, fileForExif]);

	const timestamp = useMemo(() => {
		if (!date) return null;
		return formatDate(date, config.format);
	}, [date, config.format]);

	const handleImageSelect = async (selectedFiles: File[]) => {
		if (selectedFiles.length === 0) return;

		// Convert HEIC files to JPEG (preserving originals for EXIF)
		setConverting(true);
		let processed;
		try {
			processed = await processFilesForHeic(selectedFiles);
		} catch (error) {
			console.error('HEIC conversion failed:', error);
			// Fallback: treat all files as non-HEIC and continue
			processed = selectedFiles.map((f) => ({ file: f, originalFile: null }));
			// Show error notification to user
			setErrorMessage(
				'Failed to convert HEIC images. Processing images without conversion.'
			);
		} finally {
			setConverting(false);
		}

		// Extract timestamps for each image BEFORE adding to batch
		const timestampExtractionPromises = processed.map(async (p) => {
			const fileForExif = p.originalFile || p.file;
			try {
				const result = await extractTimestamp(fileForExif);
				if (result.date) {
					return {
						timestamp: formatDate(result.date, config.format),
						source: result.source,
						confidence: result.confidence,
					};
				}
				return {
					timestamp: null,
					source: result.source,
					confidence: result.confidence,
				};
			} catch (error) {
				console.error('Failed to extract timestamp:', error);
				return {
					timestamp: null,
					source: 'none' as const,
					confidence: 'none' as const,
				};
			}
		});

		const timestamps = await Promise.all(timestampExtractionPromises);

		// Add files to batch with timestamps
		addImages(
			processed.map((p) => p.file),
			processed.map((p) => p.originalFile),
			timestamps
		);

		// Sync current config to newly added images (except fontSize, calculated below)
		updateConfig(config);

		// Reset manual date and dialog when new images uploaded
		setManualDate(null);
		setShowDateInputDialog(false);

		// Calculate default font size based on first image
		const firstFile = processed[0].file;
		const img = new Image();
		img.onload = () => {
			const fontSize = calculateFontSize(img.naturalWidth);
			setConfig((prev) => ({ ...prev, fontSize }));
		};
		img.src = URL.createObjectURL(firstFile);
	};

	const handleDateInputConfirm = (confirmedDate: Date) => {
		setManualDate(confirmedDate);
		setShowDateInputDialog(false);
	};

	const handleDateInputSkip = () => {
		setShowDateInputDialog(false);
	};

	const handleEditDate = () => {
		setShowDateInputDialog(true);
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 py-6 sm:py-8 px-4">
			<div className="max-w-5xl mx-auto">
				<header className="mb-6 sm:mb-8">
					<div className="flex justify-between items-start mb-4">
						<div />
						<LanguageSwitcher />
					</div>
					<div className="text-center">
						<h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-2">
							<svg
								className="w-7 h-7 sm:w-8 sm:h-8 text-orange-500"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							{t('app.title')}
						</h1>
						<p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
							{t('app.subtitle')}
						</p>
					</div>
				</header>

				<div className="space-y-6">
					<ImageUploader onImageSelect={handleImageSelect} />

					{converting && (
						<div className="flex items-center justify-center gap-3 py-8">
							<svg
								className="animate-spin w-5 h-5 text-blue-500"
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
							<p className="text-gray-600 dark:text-gray-400">
								{t('uploader.converting')}
							</p>
						</div>
					)}

					{/* Batch Progress View */}
					{images.length > 0 && (
						<BatchProgressView images={images} onRemove={removeImage} />
					)}

					{/* Single Image Preview (show first image) */}
					{loading && (
						<div className="flex items-center justify-center gap-3 py-8">
							<svg
								className="animate-spin w-5 h-5 text-blue-500"
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
							<p className="text-gray-600 dark:text-gray-400">
								{t('editor.loading')}
							</p>
						</div>
					)}

					{imageUrl && !loading && (
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
							<div className="lg:col-span-2 order-2 lg:order-1">
								<ImagePreview
									imageUrl={imageUrl}
									timestamp={timestamp}
									config={config}
									dateSource={source}
									dateConfidence={confidence}
									onRequestDateInput={() => setShowDateInputDialog(true)}
									onEditDate={handleEditDate}
								/>
							</div>
							<div className="order-1 lg:order-2">
								<TimestampEditor config={config} onChange={setConfig} />
							</div>
						</div>
					)}

					{/* Batch Download Controls */}
					{images.length > 0 && <BatchDownloadControls images={images} />}
				</div>

				<footer className="mt-12 text-center text-sm text-gray-500 dark:text-gray-600">
					<p>{t('app.privateNotice')}</p>
				</footer>
			</div>

			<DateInputDialog
				key={fileForExif?.name || 'no-file'}
				open={showDateInputDialog}
				filename={fileForExif?.name || 'unknown'}
				defaultDate={manualDate || extractedDate || undefined}
				onConfirm={handleDateInputConfirm}
				onSkip={handleDateInputSkip}
			/>

			{errorMessage && (
				<Toast
					message={errorMessage}
					type="error"
					onClose={() => setErrorMessage(null)}
				/>
			)}
		</div>
	);
}

export default App;
