import { useState } from 'react';
import type { ProcessedImage } from '../hooks/useBatchProcessing';
import { createZip } from '../utils/zipGenerator';
import { exportImage } from '../utils/imageExporter';
import { generateFilename } from '../utils/filenameGenerator';

interface BatchDownloadControlsProps {
	images: ProcessedImage[];
}

export default function BatchDownloadControls({
	images,
}: BatchDownloadControlsProps) {
	const [downloadingZip, setDownloadingZip] = useState(false);
	const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());

	const completedImages = images.filter(
		(img) => img.status === 'completed' && img.canvas
	);

	const handleDownloadAll = async () => {
		if (completedImages.length === 0) {
			return;
		}

		setDownloadingZip(true);

		try {
			// Export all canvases to blobs
			const zipImages = await Promise.all(
				completedImages.map(async (image) => {
					const blob = await exportImage(image.canvas!);
					const filename = await generateFilename(
						image.file,
						image.timestamp,
						image.dateSource
					);

					return {
						filename: `${filename}.jpg`,
						blob,
					};
				})
			);

			// Create ZIP
			const zipBlob = await createZip(zipImages);

			// Trigger download
			const url = URL.createObjectURL(zipBlob);
			const link = document.createElement('a');
			link.href = url;
			link.download = `time-image-batch-${new Date().getTime()}.zip`;
			link.click();
			URL.revokeObjectURL(url);
		} catch {
			// Silently handle errors
		} finally {
			setDownloadingZip(false);
		}
	};

	const handleDownloadIndividual = async (image: ProcessedImage) => {
		if (!image.canvas) {
			return;
		}

		setDownloadingIds((prev) => new Set(prev).add(image.id));

		try {
			// Export canvas to blob
			const blob = await exportImage(image.canvas);

			// Generate filename
			const filename = await generateFilename(
				image.file,
				image.timestamp,
				image.dateSource
			);

			// Trigger download
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = `${filename}.jpg`;
			link.click();
			URL.revokeObjectURL(url);
		} catch {
			// Silently handle errors
		} finally {
			setDownloadingIds((prev) => {
				const next = new Set(prev);
				next.delete(image.id);
				return next;
			});
		}
	};

	return (
		<div className="space-y-4">
			{/* Download all as ZIP */}
			<div>
				<button
					onClick={handleDownloadAll}
					disabled={completedImages.length === 0 || downloadingZip}
					className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium
            hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors flex items-center justify-center gap-2"
				>
					{downloadingZip ? (
						<>
							<svg
								className="animate-spin h-5 w-5"
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
							Preparing ZIP...
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
									d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
								/>
							</svg>
							Download All as ZIP ({completedImages.length}{' '}
							{completedImages.length === 1 ? 'file' : 'files'})
						</>
					)}
				</button>
			</div>

			{/* Individual downloads */}
			{completedImages.length > 0 && (
				<div className="space-y-2">
					<p className="text-sm text-gray-600 dark:text-gray-400">
						Or download individually:
					</p>
					<div className="grid gap-2">
						{completedImages.map((image) => (
							<button
								key={image.id}
								onClick={() => handleDownloadIndividual(image)}
								disabled={downloadingIds.has(image.id)}
								className="flex items-center justify-between px-4 py-2 border border-gray-300 dark:border-gray-600
                  rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50
                  disabled:cursor-not-allowed transition-colors text-left"
							>
								<span className="text-sm text-gray-900 dark:text-gray-100 truncate flex-1">
									{image.file.name}
								</span>
								{downloadingIds.has(image.id) ? (
									<svg
										className="animate-spin h-4 w-4 text-gray-600"
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
								) : (
									<svg
										className="w-4 h-4 text-gray-600 dark:text-gray-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
										/>
									</svg>
								)}
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
