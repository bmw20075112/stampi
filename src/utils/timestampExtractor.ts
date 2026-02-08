import exifr from 'exifr';
import { parseFilename } from './filenameParser';
import type { DateSource, Confidence } from '../hooks/useTimestamp';

export interface ExtractedTimestamp {
	date: Date | null;
	source: DateSource;
	confidence: Confidence;
}

export interface ExtractTimestampOptions {
	enableFilenameParser?: boolean;
	enableFileModified?: boolean;
}

/**
 * Extracts timestamp from a file using multiple fallback methods.
 * This is the standalone version of useTimestamp hook for use in batch processing.
 *
 * Priority order:
 * 1. EXIF DateTimeOriginal (high confidence)
 * 2. EXIF CreateDate (high confidence)
 * 3. EXIF ModifyDate (medium confidence)
 * 4. Filename parsing (medium confidence, if enabled)
 * 5. File lastModified (low confidence, if enabled)
 */
export async function extractTimestamp(
	file: File,
	options: ExtractTimestampOptions = {}
): Promise<ExtractedTimestamp> {
	const { enableFilenameParser = true, enableFileModified = true } = options;

	try {
		// Step 1: Try EXIF data
		const exifData = await exifr.parse(file);

		if (exifData) {
			if (exifData.DateTimeOriginal) {
				return {
					date: exifData.DateTimeOriginal,
					source: 'exif-datetime-original',
					confidence: 'high',
				};
			}

			if (exifData.CreateDate) {
				return {
					date: exifData.CreateDate,
					source: 'exif-create-date',
					confidence: 'high',
				};
			}

			if (exifData.ModifyDate) {
				return {
					date: exifData.ModifyDate,
					source: 'exif-modify-date',
					confidence: 'medium',
				};
			}
		}
	} catch (error) {
		// If EXIF parsing fails, continue with fallbacks
		console.warn('EXIF parsing failed:', error);
	}

	// Step 2: Try filename parsing (if enabled)
	if (enableFilenameParser) {
		try {
			const dateComponents = parseFilename(file.name);
			if (dateComponents) {
				const parsedDate = new Date(
					dateComponents.year,
					dateComponents.month - 1,
					dateComponents.day,
					dateComponents.hour ?? 0,
					dateComponents.minute ?? 0,
					dateComponents.second ?? 0
				);
				return {
					date: parsedDate,
					source: 'filename',
					confidence: 'medium',
				};
			}
		} catch (error) {
			// Continue to next fallback
			console.warn('Filename parsing failed:', error);
		}
	}

	// Step 3: Try file.lastModified (if enabled)
	if (enableFileModified) {
		const lastModifiedDate = new Date(file.lastModified);
		return {
			date: lastModifiedDate,
			source: 'file-modified',
			confidence: 'low',
		};
	}

	// All methods failed
	return {
		date: null,
		source: 'none',
		confidence: 'none',
	};
}
