export interface ExportOptions {
	quality?: number;
	format?: 'jpeg' | 'webp';
	enableCompression?: boolean;
}

/**
 * Exports a canvas to an optimized image blob
 *
 * @param canvas - The canvas element to export
 * @param options - Export options
 * @returns Promise resolving to image blob
 */
export async function exportImage(
	canvas: HTMLCanvasElement,
	options: ExportOptions = {}
): Promise<Blob> {
	const { quality = 0.85, format = 'jpeg' } = options;

	// Validate canvas
	if (canvas.width === 0 || canvas.height === 0) {
		throw new Error('Invalid canvas dimensions');
	}

	// For now, use native toBlob (Squoosh will be added in browser context later)
	return canvasToBlob(canvas, format, quality);
}

/**
 * Converts canvas to blob using native browser API
 */
function canvasToBlob(
	canvas: HTMLCanvasElement,
	format: 'jpeg' | 'webp',
	quality: number
): Promise<Blob> {
	return new Promise((resolve, reject) => {
		const mimeType = format === 'webp' ? 'image/webp' : 'image/jpeg';

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
