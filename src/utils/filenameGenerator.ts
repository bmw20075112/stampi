import type { DateSource } from '../hooks/useTimestamp';

const GENERIC_NAMES = [
	'blob',
	'image.jpg',
	'image.png',
	'image.jpeg',
	'image.webp',
];

/**
 * Generates an intelligent filename for a processed image
 *
 * Priority waterfall:
 * 1. Original filename (if not generic)
 * 2. Date-based naming for EXIF/filename sources
 * 3. SHA-256 hash fallback
 */
export async function generateFilename(
	file: File,
	timestamp: string | null,
	dateSource: DateSource
): Promise<string> {
	// 1. Try original filename (if not generic)
	const basename = getBasename(file.name);
	if (basename && !isGenericName(file.name)) {
		return `${basename}_timestamped`;
	}

	// 2-3. Try date-based naming for EXIF or filename sources
	if (
		timestamp &&
		(dateSource.startsWith('exif-') || dateSource === 'filename')
	) {
		const sanitizedDate = sanitizeDateString(timestamp);
		return `IMG_${sanitizedDate}`;
	}

	// 4. Fallback to hash
	return await generateHashFilename(file);
}

/**
 * Extracts basename from filename (removes extension)
 */
function getBasename(filename: string): string {
	if (!filename) return '';

	// Find last dot for extension
	const lastDotIndex = filename.lastIndexOf('.');
	if (lastDotIndex === -1) return filename;

	return filename.substring(0, lastDotIndex);
}

/**
 * Checks if filename is a generic placeholder name
 */
function isGenericName(filename: string): boolean {
	return GENERIC_NAMES.includes(filename.toLowerCase());
}

/**
 * Sanitizes date string for use in filename
 * Replaces special characters with underscores
 */
function sanitizeDateString(dateStr: string): string {
	return dateStr.replace(/[/:.\s-]/g, '_');
}

/**
 * Generates a filename based on SHA-256 hash of file content
 */
async function generateHashFilename(file: File): Promise<string> {
	const buffer = await file.arrayBuffer();
	const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashHex = hashArray
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');

	return `IMG_${hashHex.substring(0, 12)}`;
}
