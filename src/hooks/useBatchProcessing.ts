import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import type { TimestampConfig } from '@/utils/imageProcessor';
import { renderTimestamp } from '@/utils/imageProcessor';
import type { DateSource, Confidence } from '@/hooks/useTimestamp';
import { generateFilename } from '@/utils/filenameGenerator';

export interface ProcessedImage {
	id: string;
	file: File;
	originalFile: File | null;
	imageUrl: string;
	date: Date | null; // Store original Date for reformatting
	timestamp: string | null;
	config: TimestampConfig;
	dateSource: DateSource;
	confidence: Confidence;
	status: 'pending' | 'processing' | 'completed' | 'error';
	canvas?: HTMLCanvasElement;
	error?: string;
	cachedFilename?: string; // Cached filename to avoid recalculating hash
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
			fontSizeScale: 1.0,
		}),
		[]
	);

	/**
	 * Generates a unique ID for an image
	 */
	const generateId = useCallback(() => {
		return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
	}, []);

	/**
	 * Adds new images to the batch
	 * Returns the IDs of the newly added images
	 */
	const addImages = useCallback(
		(
			files: File[],
			originalFiles?: (File | null)[],
			timestamps?: Array<{
				date: Date | null;
				timestamp: string | null;
				source: DateSource;
				confidence: Confidence;
			}>
		): string[] => {
			if (files.length === 0) return [];

			const newImages: ProcessedImage[] = files.map((file, i) => ({
				id: generateId(),
				file,
				originalFile: originalFiles?.[i] ?? null,
				imageUrl: URL.createObjectURL(file),
				date: timestamps?.[i]?.date ?? null,
				timestamp: timestamps?.[i]?.timestamp ?? null,
				config: { ...defaultConfig },
				dateSource: timestamps?.[i]?.source ?? 'none',
				confidence: timestamps?.[i]?.confidence ?? 'none',
				status: 'pending',
			}));

			setImages((prev) => [...prev, ...newImages]);
			return newImages.map((img) => img.id);
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
	 * Reformats timestamps for all images using their individual dates
	 * Used when date format changes
	 */
	const reformatAllTimestamps = useCallback(
		(formatFunc: (date: Date) => string) => {
			setImages((prev) =>
				prev.map((img) => ({
					...img,
					timestamp: img.date ? formatFunc(img.date) : img.timestamp,
				}))
			);
		},
		[]
	);

	/**
	 * Updates timestamp for a specific image by ID
	 */
	const updateImageTimestamp = useCallback(
		(
			imageId: string,
			timestamp: string | null,
			dateSource: DateSource,
			confidence: Confidence
		) => {
			setImages((prev) =>
				prev.map((img) =>
					img.id === imageId
						? {
								...img,
								timestamp,
								dateSource,
								confidence,
							}
						: img
				)
			);
		},
		[]
	);

	/**
	 * Re-render completed images with updated timestamp
	 * Uses chunked processing to avoid memory spikes with large batches
	 */
	const rerenderCompletedImages = useCallback(async () => {
		// Get completed images that need re-rendering
		const completedImages = imagesRef.current.filter(
			(img) => img.status === 'completed' && img.canvas && img.timestamp
		);

		if (completedImages.length === 0) return;

		// Process in chunks to avoid memory spikes for large batches
		const CHUNK_SIZE = 20;
		const allUpdates: Array<{ id: string; canvas: HTMLCanvasElement } | null> =
			[];

		for (let i = 0; i < completedImages.length; i += CHUNK_SIZE) {
			const chunk = completedImages.slice(i, i + CHUNK_SIZE);

			// Process chunk in parallel
			const chunkUpdates = await Promise.all(
				chunk.map(
					(img) =>
						new Promise<{ id: string; canvas: HTMLCanvasElement } | null>(
							(resolve) => {
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
										resolve({ id: img.id, canvas: newCanvas });
									} else {
										resolve(null);
									}
								};
								imageElement.onerror = () => resolve(null);
							}
						)
				)
			);

			allUpdates.push(...chunkUpdates);
		}

		// Batch update all canvases in a single state update
		setImages((prev) =>
			prev.map((img) => {
				const update = allUpdates.find((u) => u?.id === img.id);
				return update ? { ...img, canvas: update.canvas } : img;
			})
		);
	}, []);

	/**
	 * Helper: Load an image from a URL
	 */
	const loadImage = (url: string): Promise<HTMLImageElement> => {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.src = url;
			img.onload = () => resolve(img);
			img.onerror = () => reject(new Error('Failed to load image'));
		});
	};

	/**
	 * Helper: Create and initialize a canvas from an image
	 */
	const createCanvasFromImage = (
		img: HTMLImageElement
	): HTMLCanvasElement | null => {
		const canvas = document.createElement('canvas');
		canvas.width = img.naturalWidth;
		canvas.height = img.naturalHeight;

		const ctx = canvas.getContext('2d');
		if (!ctx) {
			return null;
		}

		ctx.drawImage(img, 0, 0);
		return canvas;
	};

	/**
	 * Helper: Determine the timestamp to render with fallback logic
	 */
	const determineTimestamp = (
		imageId: string,
		currentTimestamp: string | null
	): string | null => {
		if (currentTimestamp) {
			return currentTimestamp;
		}

		// Check if timestamp was updated while we were processing
		const latestImage = imagesRef.current.find((img) => img.id === imageId);
		return latestImage?.timestamp ?? null;
	};
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
				const img = await loadImage(image.imageUrl);

				// Create canvas from image
				const canvas = createCanvasFromImage(img);
				if (!canvas) {
					throw new Error('Failed to get canvas context');
				}

				// Determine timestamp to render (with fallback logic)
				const timestampToRender = determineTimestamp(imageId, image.timestamp);

				// Render timestamp if available
				if (timestampToRender) {
					renderTimestamp(canvas, img, timestampToRender, image.config);
				}

				// Update image with canvas
				// Generate and cache filename for exports
				const cachedFilename = await generateFilename(
					image.originalFile || image.file,
					timestampToRender,
					image.dateSource
				);

				setImages((prev) =>
					prev.map((img) =>
						img.id === imageId
							? {
									...img,
									canvas,
									status: 'completed' as const,
									timestamp: timestampToRender,
									cachedFilename,
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
		updateImageTimestamp,
		reformatAllTimestamps,
		rerenderCompletedImages,
		startProcessing,
	};
}
