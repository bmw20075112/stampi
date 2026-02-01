export interface ExportOptions {
	quality?: number;
	format?: 'jpeg' | 'webp';
}

/**
 * Exports a canvas to an optimized image blob
 * Uses native browser compression with high quality settings
 *
 * @param canvas - The canvas element to export
 * @param options - Export options
 * @returns Promise resolving to compressed image blob
 */
export async function exportImage(
	canvas: HTMLCanvasElement,
	options: ExportOptions = {}
): Promise<Blob> {
	// Default to aggressive compression: 0.75 quality for better file sizes
	// while maintaining good visual quality
	const { quality = 0.75, format = 'jpeg' } = options;

	// Validate canvas
	if (canvas.width === 0 || canvas.height === 0) {
		throw new Error('Invalid canvas dimensions');
	}

	// Use native canvas compression
	return canvasToBlob(canvas, format, quality);
}

/**
 * Converts canvas to blob using native browser API
 * Quality parameter (0-1) controls JPEG compression level
 */
function canvasToBlob(
	canvas: HTMLCanvasElement,
	format: 'jpeg' | 'webp',
	quality: number
): Promise<Blob> {
	return new Promise((resolve, reject) => {
		const mimeType = format === 'webp' ? 'image/webp' : 'image/jpeg';

		// canvas.toBlob applies quality for JPEG/WebP formats
		canvas.toBlob(
			(blob) => {
				if (!blob) {
					reject(new Error('Failed to export canvas to blob'));
					return;
				}
				resolve(blob);
			},
			mimeType,
			quality
		);
	});
}
