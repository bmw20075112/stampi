import { useState, useEffect } from 'react';
import exifr from 'exifr';
import { parseFilename } from '@/utils/filenameParser';

export type DateSource =
	| 'exif-datetime-original'
	| 'exif-create-date'
	| 'exif-modify-date'
	| 'filename'
	| 'file-modified'
	| 'user-input'
	| 'none';

export type Confidence = 'high' | 'medium' | 'low' | 'none';

export interface TimestampResult {
	date: Date | null;
	source: DateSource;
	loading: boolean;
	confidence: Confidence;
	needsUserInput: boolean;
}

export interface UseTimestampOptions {
	enableFilenameParser?: boolean;
	enableFileModified?: boolean;
}

export default function useTimestamp(
	file: File | null,
	options: UseTimestampOptions = {}
): TimestampResult {
	const { enableFilenameParser = true, enableFileModified = true } = options;

	const [date, setDate] = useState<Date | null>(null);
	const [source, setSource] = useState<DateSource>('none');
	const [loading, setLoading] = useState(false);
	const [confidence, setConfidence] = useState<Confidence>('none');
	const [needsUserInput, setNeedsUserInput] = useState(false);

	// Helper to set successful extraction result
	const setExtractedDate = (
		extractedDate: Date,
		extractedSource: DateSource,
		extractedConfidence: Confidence
	) => {
		setDate(extractedDate);
		setSource(extractedSource);
		setConfidence(extractedConfidence);
		setLoading(false);
	};

	// Helper to reset to initial state
	const resetTimestampState = (requiresUserInput = false) => {
		setDate(null);
		setSource('none');
		setConfidence('none');
		setNeedsUserInput(requiresUserInput);
		setLoading(false);
	};

	useEffect(() => {
		if (!file) {
			resetTimestampState(false);
			return;
		}

		const extractTimestamp = async () => {
			setLoading(true);
			setNeedsUserInput(false);

			try {
				// Step 1: Try EXIF data
				const exifData = await exifr.parse(file);

				if (exifData) {
					if (exifData.DateTimeOriginal) {
						setExtractedDate(
							exifData.DateTimeOriginal,
							'exif-datetime-original',
							'high'
						);
						return;
					}

					if (exifData.CreateDate) {
						setExtractedDate(exifData.CreateDate, 'exif-create-date', 'high');
						return;
					}

					if (exifData.ModifyDate) {
						setExtractedDate(exifData.ModifyDate, 'exif-modify-date', 'medium');
						return;
					}
				}

				// Step 2: Try filename parsing (if enabled)
				if (enableFilenameParser) {
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
						setExtractedDate(parsedDate, 'filename', 'medium');
						return;
					}
				}

				// Step 3: Try file.lastModified (if enabled)
				if (enableFileModified) {
					const lastModifiedDate = new Date(file.lastModified);
					setExtractedDate(lastModifiedDate, 'file-modified', 'low');
					return;
				}

				// Step 4: All methods failed, need user input
				resetTimestampState(true);
			} catch {
				// If EXIF parsing fails, continue with fallbacks
				try {
					// Step 2: Try filename parsing (if enabled)
					if (enableFilenameParser) {
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
							setExtractedDate(parsedDate, 'filename', 'medium');
							return;
						}
					}

					// Step 3: Try file.lastModified (if enabled)
					if (enableFileModified) {
						const lastModifiedDate = new Date(file.lastModified);
						setExtractedDate(lastModifiedDate, 'file-modified', 'low');
						return;
					}

					// Step 4: All methods failed
					resetTimestampState(true);
				} finally {
					// Ensure loading is set to false
					setLoading(false);
				}
			}
		};

		extractTimestamp();
	}, [file, enableFilenameParser, enableFileModified]);

	return { date, source, loading, confidence, needsUserInput };
}
