import Compressor from 'compressorjs';

export interface ExportOptions {
	quality?: number;
	maxWidth?: number;
	maxHeight?: number;
}

/**
 * Exports a canvas to a compressed image blob using compressorjs
 * Provides reliable cross-browser image compression
 *
 * @param canvas - The canvas element to export
 * @param options - Export options
 * @returns Promise resolving to compressed image blob
 */
export async function exportImage(
	canvas: HTMLCanvasElement,
	options: ExportOptions = {}
): Promise<Blob> {
	const { quality = 0.6, maxWidth, maxHeight } = options;

	// Validate canvas
	if (canvas.width === 0 || canvas.height === 0) {
		throw new Error('Invalid canvas dimensions');
	}

	// Convert canvas to blob first
	const canvasBlob = await canvasToBlob(canvas);

	// Compress using compressorjs
	return new Promise((resolve, reject) => {
		new Compressor(canvasBlob, {
			quality,
			maxWidth,
			maxHeight,
			success(result: Blob) {
				resolve(result);
			},
			error(err: Error) {
				reject(new Error(`Image compression failed: ${err.message}`));
			},
		});
	});
}

/**
 * Converts canvas to blob using native toBlob
 */
function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
	return new Promise((resolve, reject) => {
		canvas.toBlob((blob) => {
			if (!blob) {
				reject(new Error('Failed to convert canvas to blob'));
				return;
			}
			resolve(blob);
		}, 'image/jpeg');
	});
}
