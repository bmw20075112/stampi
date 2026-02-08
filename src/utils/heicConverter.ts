// Lazy-load heic2any (~1.5MB) only when needed
let heic2anyLoader: (() => Promise<typeof import('heic2any')>) | null = null;

/**
 * Get the heic2any loader function. Can be overridden in tests.
 * Lazy loads heic2any (~1.5MB) only when needed, reducing initial bundle size.
 */
export function getHeic2anyLoader() {
	if (!heic2anyLoader) {
		heic2anyLoader = () => import('heic2any');
	}
	return heic2anyLoader;
}

/**
 * Set a custom heic2any loader (for testing).
 */
export function setHeic2anyLoader(
	loader: () => Promise<typeof import('heic2any')>
) {
	heic2anyLoader = loader;
}

/**
 * Detects HEIC/HEIF files by MIME type or file extension.
 * Browsers often set empty MIME type for HEIC files, so extension check is needed.
 */
export function isHeicFile(file: File): boolean {
	const mimeType = file.type.toLowerCase();
	if (mimeType === 'image/heic' || mimeType === 'image/heif') {
		return true;
	}

	// Handle extension check with edge cases:
	// - Files without extension (e.g., "README") -> no extension
	// - Hidden files (e.g., ".gitignore") -> extension is "gitignore"
	// - Multiple dots (e.g., "photo.backup.heic") -> extension is "heic"
	const parts = file.name.toLowerCase().split('.');
	if (parts.length < 2) return false; // No extension

	const extension = parts[parts.length - 1];
	return extension === 'heic' || extension === 'heif';
}

/**
 * Converts a HEIC file to JPEG using heic2any.
 * Returns the converted file and preserves the original for EXIF extraction.
 *
 * Quality: 0.88 is used for HEIC → JPEG conversion to maintain good visual quality
 * while reducing file size. Final resizing/compression happens during export via
 * compressorjs (see imageExporter.ts).
 *
 * Note: heic2any doesn't support maxWidth parameter. Large files (48MP+) are handled
 * during the export phase where compressorjs applies maxWidth: 2000 to prevent memory
 * issues while maintaining quality suitable for web/mobile viewing.
 *
 * Lazy loads heic2any (~1.5MB) only when needed, reducing initial bundle size.
 */
export async function convertHeicToJpeg(
	file: File
): Promise<{ convertedFile: File; originalFile: File }> {
	const loader = getHeic2anyLoader();
	const heic2anyModule = await loader();
	const heic2any = heic2anyModule.default;

	const result = await heic2any({
		blob: file,
		toType: 'image/jpeg',
		quality: 0.88,
	});

	const blob = Array.isArray(result) ? result[0] : result;
	const newName = file.name
		.replace(/\.heic$/i, '.jpg')
		.replace(/\.heif$/i, '.jpg');
	const convertedFile = new File([blob], newName, { type: 'image/jpeg' });

	return { convertedFile, originalFile: file };
}

/**
 * Processes an array of files, converting any HEIC files to JPEG.
 * Non-HEIC files pass through unchanged with originalFile set to null.
 */
export async function processFilesForHeic(
	files: File[]
): Promise<Array<{ file: File; originalFile: File | null }>> {
	return Promise.all(
		files.map(async (file) => {
			if (isHeicFile(file)) {
				const { convertedFile, originalFile } = await convertHeicToJpeg(file);
				return { file: convertedFile, originalFile };
			}
			return { file, originalFile: null };
		})
	);
}
