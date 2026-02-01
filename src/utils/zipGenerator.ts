import { zipSync } from 'fflate';

export interface ZipImage {
	filename: string;
	blob: Blob;
}

/**
 * Creates a ZIP file from multiple images
 *
 * @param images - Array of images with filenames and blobs
 * @param onProgress - Optional progress callback (0-100)
 * @returns Promise resolving to ZIP blob
 */
export async function createZip(
	images: ZipImage[],
	onProgress?: (percent: number) => void
): Promise<Blob> {
	// Validate inputs
	if (images.length === 0) {
		throw new Error('No images provided for ZIP');
	}

	if (images.some((img) => !img.filename || img.filename.trim() === '')) {
		throw new Error('All images must have valid filenames');
	}

	// Report initial progress
	onProgress?.(0);

	// Deduplicate filenames
	const deduplicatedImages = deduplicateFilenames(images);

	// Convert all blobs to Uint8Array
	const filesData: Record<string, Uint8Array> = {};

	for (let i = 0; i < deduplicatedImages.length; i++) {
		const { filename, blob } = deduplicatedImages[i];

		const arrayBuffer = await blob.arrayBuffer();
		filesData[filename] = new Uint8Array(arrayBuffer);

		// Report progress for blob conversion (0-90%)
		const progress = Math.floor(((i + 1) / deduplicatedImages.length) * 90);
		onProgress?.(progress);
	}

	// Create ZIP using fflate
	onProgress?.(95);
	const zipped = zipSync(filesData, {
		level: 6, // Good balance of speed and compression
	});

	// Convert to Blob
	onProgress?.(100);
	return new Blob([new Uint8Array(zipped)], { type: 'application/zip' });
}

/**
 * Deduplicates filenames by adding _1, _2, etc. suffixes
 */
function deduplicateFilenames(images: ZipImage[]): ZipImage[] {
	const seen = new Map<string, number>();
	const result: ZipImage[] = [];

	for (const image of images) {
		let filename = image.filename;

		if (seen.has(filename)) {
			// Extract base name and extension
			const { base, ext } = splitFilename(filename);
			const count = seen.get(filename)!;

			// Generate new filename with suffix
			filename = ext ? `${base}_${count}.${ext}` : `${base}_${count}`;
			seen.set(image.filename, count + 1);
		} else {
			seen.set(filename, 1);
		}

		result.push({
			filename,
			blob: image.blob,
		});
	}

	return result;
}

/**
 * Splits filename into base name and extension
 */
function splitFilename(filename: string): { base: string; ext: string } {
	const lastDotIndex = filename.lastIndexOf('.');

	if (lastDotIndex === -1 || lastDotIndex === 0) {
		return { base: filename, ext: '' };
	}

	return {
		base: filename.substring(0, lastDotIndex),
		ext: filename.substring(lastDotIndex + 1),
	};
}
