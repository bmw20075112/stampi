import type { DateSource } from '@/hooks/useTimestamp';
import type { NamingConfig } from '@/config/namingConfig';
import { getNamingConfig } from '@/config/namingConfig';
import { getBasename } from '@/utils/filenameUtils';

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
 * 0. Cached filename (if provided)
 * 1. Original filename (if not generic)
 * 2. Date-based naming for EXIF/filename sources
 * 3. SHA-256 hash fallback
 *
 * @param config - Naming configuration (defaults to production config)
 */
export async function generateFilename(
	file: File,
	timestamp: string | null,
	dateSource: DateSource,
	cachedFilename?: string,
	config: NamingConfig = getNamingConfig()
): Promise<string> {
	// 0. Use cached filename if available
	if (cachedFilename) {
		return cachedFilename;
	}

	// 1. Try original filename (if not generic)
	if (!isGenericName(file.name)) {
		const basename = getBasename(file.name);
		if (basename) {
			return `${config.imagePrefix}${config.separator}${basename}${config.imageSuffix}`;
		}
	}

	// 2-3. Try date-based naming for EXIF or filename sources
	if (
		timestamp &&
		(dateSource.startsWith('exif-') || dateSource === 'filename')
	) {
		const sanitizedDate = sanitizeDateString(timestamp);
		return `${config.datePrefix}${config.separator}${sanitizedDate}`;
	}

	// 4. Fallback to hash
	return await generateHashFilename(file, config);
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
async function generateHashFilename(
	file: File,
	config: NamingConfig
): Promise<string> {
	const buffer = await file.arrayBuffer();
	const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashHex = hashArray
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');

	return `${config.hashPrefix}${config.separator}${hashHex.substring(0, 12)}`;
}
