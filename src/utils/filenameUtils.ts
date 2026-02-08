/**
 * Shared utilities for filename manipulation
 * Centralized to avoid duplication across the codebase
 */

export interface FilenameParts {
	base: string;
	ext: string;
}

/**
 * Splits a filename into base name and extension
 *
 * @param filename - The filename to split (e.g., "photo.jpg", "archive.tar.gz")
 * @returns Object with base and ext properties
 *
 * @example
 * splitFilename("photo.jpg")        // { base: "photo", ext: "jpg" }
 * splitFilename("archive.tar.gz")   // { base: "archive.tar", ext: "gz" }
 * splitFilename("README")           // { base: "README", ext: "" }
 * splitFilename(".gitignore")       // { base: ".gitignore", ext: "" }
 */
export function splitFilename(filename: string): FilenameParts {
	const lastDotIndex = filename.lastIndexOf('.');

	// No extension or hidden file (starts with dot)
	if (lastDotIndex === -1 || lastDotIndex === 0) {
		return { base: filename, ext: '' };
	}

	return {
		base: filename.substring(0, lastDotIndex),
		ext: filename.substring(lastDotIndex + 1),
	};
}

/**
 * Extracts the base name from a filename (removes extension)
 *
 * @param filename - The filename to process
 * @returns The base name without extension
 *
 * @example
 * getBasename("photo.jpg")      // "photo"
 * getBasename("archive.tar.gz") // "archive.tar"
 * getBasename("README")         // "README"
 * getBasename("")               // ""
 */
export function getBasename(filename: string): string {
	if (!filename) return '';

	const { base } = splitFilename(filename);
	return base;
}

/**
 * Gets the extension from a filename (without the dot)
 *
 * @param filename - The filename to process
 * @returns The extension without the leading dot
 *
 * @example
 * getExtension("photo.jpg")      // "jpg"
 * getExtension("archive.tar.gz") // "gz"
 * getExtension("README")         // ""
 */
export function getExtension(filename: string): string {
	const { ext } = splitFilename(filename);
	return ext;
}
