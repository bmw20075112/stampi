import { useState, useEffect } from 'react';
import exifr from 'exifr';
import { parseFilename } from '../utils/filenameParser';

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

	useEffect(() => {
		if (!file) {
			setDate(null);
			setSource('none');
			setLoading(false);
			setConfidence('none');
			setNeedsUserInput(false);
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
						setDate(exifData.DateTimeOriginal);
						setSource('exif-datetime-original');
						setConfidence('high');
						setLoading(false);
						return;
					}

					if (exifData.CreateDate) {
						setDate(exifData.CreateDate);
						setSource('exif-create-date');
						setConfidence('high');
						setLoading(false);
						return;
					}

					if (exifData.ModifyDate) {
						setDate(exifData.ModifyDate);
						setSource('exif-modify-date');
						setConfidence('medium');
						setLoading(false);
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
						setDate(parsedDate);
						setSource('filename');
						setConfidence('medium');
						setLoading(false);
						return;
					}
				}

				// Step 3: Try file.lastModified (if enabled)
				if (enableFileModified) {
					const lastModifiedDate = new Date(file.lastModified);
					setDate(lastModifiedDate);
					setSource('file-modified');
					setConfidence('low');
					setLoading(false);
					return;
				}

				// Step 4: All methods failed, need user input
				setDate(null);
				setSource('none');
				setConfidence('none');
				setNeedsUserInput(true);
				setLoading(false);
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
							setDate(parsedDate);
							setSource('filename');
							setConfidence('medium');
							setLoading(false);
							return;
						}
					}

					// Step 3: Try file.lastModified (if enabled)
					if (enableFileModified) {
						const lastModifiedDate = new Date(file.lastModified);
						setDate(lastModifiedDate);
						setSource('file-modified');
						setConfidence('low');
						setLoading(false);
						return;
					}

					// Step 4: All methods failed
					setDate(null);
					setSource('none');
					setConfidence('none');
					setNeedsUserInput(true);
					setLoading(false);
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
