import heic2any from 'heic2any';

/**
 * Detects HEIC/HEIF files by MIME type or file extension.
 * Browsers often set empty MIME type for HEIC files, so extension check is needed.
 */
export function isHeicFile(file: File): boolean {
	const mimeType = file.type.toLowerCase();
	if (mimeType === 'image/heic' || mimeType === 'image/heif') {
		return true;
	}

	const extension = file.name.toLowerCase().split('.').pop();
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
 */
export async function convertHeicToJpeg(
	file: File
): Promise<{ convertedFile: File; originalFile: File }> {
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
