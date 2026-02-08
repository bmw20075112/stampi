/**
 * Centralized naming configuration for file exports
 * Follows Dependency Inversion Principle (DIP) - depend on abstractions, not hardcoded strings
 */

export interface NamingConfig {
	/** Prefix for individual images with preserved original names */
	imagePrefix: string;
	/** Suffix for preserved filenames (e.g., "_timestamped" for legacy, "" for current) */
	imageSuffix: string;
	/** Prefix for date-based filenames */
	datePrefix: string;
	/** Prefix for hash-based fallback filenames */
	hashPrefix: string;
	/** Separator character between prefix and name */
	separator: string;
	/** ZIP filename pattern with {timestamp} placeholder */
	zipPattern: string;
}

/**
 * Current production naming convention
 * - Individual images: stampi_{basename}.jpg
 * - Date-based: stampi_{date}.jpg
 * - Hash-based: stampi_{hash}.jpg
 * - ZIP files: stampi-batch-{timestamp}.zip
 */
export const DEFAULT_NAMING_CONFIG: NamingConfig = {
	imagePrefix: 'stampi',
	imageSuffix: '',
	datePrefix: 'stampi',
	hashPrefix: 'stampi',
	separator: '_',
	zipPattern: 'stampi-batch-{timestamp}.zip',
};

/**
 * Legacy naming convention for backward compatibility
 * - Individual images: {basename}_timestamped.jpg
 * - Date-based: IMG_{date}.jpg
 * - Hash-based: IMG_{hash}.jpg
 * - ZIP files: images-{timestamp}.zip
 */
export const LEGACY_NAMING_CONFIG: NamingConfig = {
	imagePrefix: '',
	imageSuffix: '_timestamped',
	datePrefix: 'IMG',
	hashPrefix: 'IMG',
	separator: '_',
	zipPattern: 'images-{timestamp}.zip',
};

/**
 * Single injection point for naming configuration
 * Follows Open/Closed Principle (OCP) - extend behavior via config, not code modification
 */
export function getNamingConfig(): NamingConfig {
	return DEFAULT_NAMING_CONFIG;
}
