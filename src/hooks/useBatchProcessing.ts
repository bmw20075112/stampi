import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import type { TimestampConfig } from '../utils/imageProcessor';
import { renderTimestamp } from '../utils/imageProcessor';
import type { DateSource, Confidence } from './useTimestamp';

export interface ProcessedImage {
	id: string;
	file: File;
	imageUrl: string;
	timestamp: string | null;
	config: TimestampConfig;
	dateSource: DateSource;
	confidence: Confidence;
	status: 'pending' | 'processing' | 'completed' | 'error';
	canvas?: HTMLCanvasElement;
	error?: string;
}

export interface BatchProcessingOptions {
	concurrentLimit?: number;
	onProgress?: (completed: number, total: number) => void;
	onImageComplete?: (id: string) => void;
	onImageError?: (id: string, error: Error) => void;
}

export function useBatchProcessing(options: BatchProcessingOptions = {}) {
	const [images, setImages] = useState<ProcessedImage[]>([]);
	const [processing, setProcessing] = useState(false);
	const processingRef = useRef(false);
	const imagesRef = useRef<ProcessedImage[]>([]);

	// Keep imagesRef in sync with images state
	useEffect(() => {
		imagesRef.current = images;
	}, [images]);

	// Default config (memoized to prevent recreation on every render)
	const defaultConfig: TimestampConfig = useMemo(
		() => ({
			format: 'YYYY/MM/DD',
			position: 'bottom-right',
			color: '#FF6B35',
			fontSize: 48,
		}),
		[]
	);

	/**
	 * Generates a unique ID for an image
	 */
	const generateId = useCallback(() => {
		return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	}, []);

	/**
	 * Adds new images to the batch
	 */
	const addImages = useCallback(
		(files: File[]) => {
			if (files.length === 0) return;

			const newImages: ProcessedImage[] = files.map((file) => ({
				id: generateId(),
				file,
				imageUrl: URL.createObjectURL(file),
				timestamp: null,
				config: { ...defaultConfig },
				dateSource: 'none',
				confidence: 'none',
				status: 'pending',
			}));

			setImages((prev) => [...prev, ...newImages]);
		},
		[generateId, defaultConfig]
	);

	/**
	 * Removes an image by ID
	 */
	const removeImage = useCallback((id: string) => {
		setImages((prev) => {
			const image = prev.find((img) => img.id === id);
			if (image) {
				URL.revokeObjectURL(image.imageUrl);
			}
			return prev.filter((img) => img.id !== id);
		});
	}, []);

	/**
	 * Clears all images
	 */
	const clearAll = useCallback(() => {
		setImages((prev) => {
			prev.forEach((img) => URL.revokeObjectURL(img.imageUrl));
			return [];
		});
	}, []);

	/**
	 * Updates configuration for all images
	 */
	const updateConfig = useCallback(
		(partialConfig: Partial<TimestampConfig>) => {
			setImages((prev) =>
				prev.map((img) => ({
					...img,
					config: { ...img.config, ...partialConfig },
				}))
			);
		},
		[]
	);

	/**
	 * Updates timestamp for all pending images
	 */
	const updateTimestampForAll = useCallback(
		(
			timestamp: string | null,
			dateSource: DateSource,
			confidence: Confidence
		) => {
			setImages((prev) =>
				prev.map((img) => ({
					...img,
					timestamp: timestamp || img.timestamp,
					dateSource: img.status === 'pending' ? dateSource : img.dateSource,
					confidence: img.status === 'pending' ? confidence : img.confidence,
				}))
			);
		},
		[]
	);

	/**
	 * Re-render completed images with updated timestamp
	 */
	const rerenderCompletedImages = useCallback(() => {
		setImages((prev) =>
			prev.map((img) => {
				// Only re-render if image is completed and has canvas but might have updated timestamp
				if (img.status === 'completed' && img.canvas && img.timestamp) {
					const imageElement = new Image();
					imageElement.src = img.imageUrl;
					imageElement.onload = () => {
						const newCanvas = document.createElement('canvas');
						newCanvas.width = imageElement.naturalWidth;
						newCanvas.height = imageElement.naturalHeight;
						const ctx = newCanvas.getContext('2d');
						if (ctx) {
							ctx.drawImage(imageElement, 0, 0);
							renderTimestamp(
								newCanvas,
								imageElement,
								img.timestamp ?? '',
								img.config
							);
							// Update the image with the new canvas
							setImages((latest) =>
								latest.map((i) =>
									i.id === img.id ? { ...i, canvas: newCanvas } : i
								)
							);
						}
					};
					return img;
				}
				return img;
			})
		);
	}, []);

	/**
	 * Processes a single image
	 */
	const processImage = useCallback(
		async (imageId: string) => {
			// Set status to processing
			setImages((prev) =>
				prev.map((img) =>
					img.id === imageId ? { ...img, status: 'processing' as const } : img
				)
			);

			// Get current image data from ref (not from async setState callback)
			const image = imagesRef.current.find((img) => img.id === imageId);

			if (!image) {
				return;
			}

			try {
				// Load image
				const img = new Image();
				img.src = image.imageUrl;
				await new Promise<void>((resolve, reject) => {
					img.onload = () => {
						resolve();
					};
					img.onerror = () => reject(new Error('Failed to load image'));
				});

				// Create canvas
				const canvas = document.createElement('canvas');
				canvas.width = img.naturalWidth;
				canvas.height = img.naturalHeight;

				// Draw image
				const ctx = canvas.getContext('2d');
				if (!ctx) {
					throw new Error('Failed to get canvas context');
				}
				ctx.drawImage(img, 0, 0);

				// Render timestamp if available
				let timestampToRender = image.timestamp;
				if (image.timestamp) {
					renderTimestamp(canvas, img, image.timestamp, image.config);
				} else {
					// Check if timestamp was updated while we were processing
					const latestImage = imagesRef.current.find(
						(img) => img.id === imageId
					);
					if (
						latestImage?.timestamp &&
						latestImage.timestamp !== image.timestamp
					) {
						timestampToRender = latestImage.timestamp;
						renderTimestamp(
							canvas,
							img,
							latestImage.timestamp,
							latestImage.config
						);
					}
				}

				// Update image with canvas
				setImages((prev) =>
					prev.map((img) =>
						img.id === imageId
							? {
									...img,
									canvas,
									status: 'completed' as const,
									timestamp: timestampToRender,
								}
							: img
					)
				);

				options.onImageComplete?.(imageId);
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : 'Unknown error';

				setImages((prev) =>
					prev.map((img) =>
						img.id === imageId
							? { ...img, status: 'error' as const, error: errorMessage }
							: img
					)
				);

				options.onImageError?.(
					imageId,
					error instanceof Error ? error : new Error(errorMessage)
				);
			}
		},
		[options]
	);

	/**
	 * Starts processing all pending images
	 */
	const startProcessing = useCallback(async () => {
		if (processingRef.current) {
			return;
		}

		processingRef.current = true;
		setProcessing(true);

		// Get snapshot of pending images from ref (current state)
		const pendingIds = imagesRef.current
			.filter((img) => img.status === 'pending')
			.map((img) => img.id);

		if (pendingIds.length === 0) {
			processingRef.current = false;
			setProcessing(false);
			return;
		}

		try {
			// Process images sequentially for simplicity
			for (let i = 0; i < pendingIds.length; i++) {
				await processImage(pendingIds[i]);

				// Report progress
				options.onProgress?.(i + 1, pendingIds.length);
			}
		} finally {
			processingRef.current = false;
			setProcessing(false);
		}
	}, [processImage, options]);

	// Calculate progress
	const progress = {
		completed: images.filter((img) => img.status === 'completed').length,
		total: images.length,
	};

	return {
		images,
		processing,
		progress,
		addImages,
		removeImage,
		clearAll,
		updateConfig,
		updateTimestampForAll,
		rerenderCompletedImages,
		startProcessing,
	};
}
