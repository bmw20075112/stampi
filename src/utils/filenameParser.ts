/**
 * Valid year range for date validation
 * MIN_YEAR: Unix epoch start (1970-01-01)
 * MAX_YEAR: Reasonable upper bound for photo timestamps
 */
export const MIN_YEAR = 1970;
export const MAX_YEAR = 2100;

export interface DateComponents {
	year: number;
	month: number;
	day: number;
	hour?: number;
	minute?: number;
	second?: number;
}

interface FilenamePattern {
	name: string;
	regex: RegExp;
	extract: (match: RegExpMatchArray) => DateComponents | null;
}

/**
 * Helper to extract date and time components from regex match array
 * Reduces boilerplate code in pattern extractors
 *
 * @param match - RegExpMatchArray from pattern regex
 * @param indices - Object mapping component names to match indices
 * @returns DateComponents object with all time components as required numbers
 */
function extractDateTimeComponents(
	match: RegExpMatchArray,
	indices: {
		year: number;
		month: number;
		day: number;
		hour: number;
		minute: number;
		second: number;
	}
): Required<DateComponents> {
	return {
		year: parseInt(match[indices.year], 10),
		month: parseInt(match[indices.month], 10),
		day: parseInt(match[indices.day], 10),
		hour: parseInt(match[indices.hour], 10),
		minute: parseInt(match[indices.minute], 10),
		second: parseInt(match[indices.second], 10),
	};
}

/**
 * Helper to extract date-only components from regex match array
 * Reduces boilerplate code in pattern extractors
 *
 * @param match - RegExpMatchArray from pattern regex
 * @param indices - Object mapping component names to match indices
 * @returns DateComponents object with only date fields
 */
function extractDateOnlyComponents(
	match: RegExpMatchArray,
	indices: {
		year: number;
		month: number;
		day: number;
	}
): Pick<DateComponents, 'year' | 'month' | 'day'> {
	return {
		year: parseInt(match[indices.year], 10),
		month: parseInt(match[indices.month], 10),
		day: parseInt(match[indices.day], 10),
	};
}

export function isValidDate(year: number, month: number, day: number): boolean {
	// Check year range
	if (year < MIN_YEAR || year > MAX_YEAR) {
		return false;
	}

	// Check month range
	if (month < 1 || month > 12) {
		return false;
	}

	// Days in each month (non-leap year)
	const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

	// Check for leap year
	const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
	if (isLeapYear) {
		daysInMonth[1] = 29;
	}

	// Check day range
	if (day < 1 || day > daysInMonth[month - 1]) {
		return false;
	}

	return true;
}

function isValidTime(hour: number, minute: number, second: number): boolean {
	return (
		hour >= 0 &&
		hour <= 23 &&
		minute >= 0 &&
		minute <= 59 &&
		second >= 0 &&
		second <= 59
	);
}

const FILENAME_PATTERNS: FilenamePattern[] = [
	// IMG_YYYYMMDD_HHMMSS.jpg (standard cameras like GoPro)
	{
		name: 'standard-camera',
		regex: /(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/,
		extract: (match) => {
			const { year, month, day, hour, minute, second } =
				extractDateTimeComponents(match, {
					year: 1,
					month: 2,
					day: 3,
					hour: 4,
					minute: 5,
					second: 6,
				});

			if (!isValidDate(year, month, day)) {
				return null;
			}

			if (!isValidTime(hour, minute, second)) {
				return null;
			}

			return { year, month, day, hour, minute, second };
		},
	},
	// Screenshot YYYY-MM-DD at HH.MM.SS.png (macOS/Windows)
	{
		name: 'screenshot-macos',
		regex: /(\d{4})-(\d{2})-(\d{2})\s+at\s+(\d{1,2})\.(\d{2})\.(\d{2})/i,
		extract: (match) => {
			const { year, month, day, hour, minute, second } =
				extractDateTimeComponents(match, {
					year: 1,
					month: 2,
					day: 3,
					hour: 4,
					minute: 5,
					second: 6,
				});

			if (!isValidDate(year, month, day)) {
				return null;
			}

			if (!isValidTime(hour, minute, second)) {
				return null;
			}

			return { year, month, day, hour, minute, second };
		},
	},
	// IMG-YYYYMMDD-WA#### (WhatsApp)
	{
		name: 'whatsapp',
		regex: /(\d{4})(\d{2})(\d{2})-WA\d+/i,
		extract: (match) => {
			const { year, month, day } = extractDateOnlyComponents(match, {
				year: 1,
				month: 2,
				day: 3,
			});

			if (!isValidDate(year, month, day)) {
				return null;
			}

			return { year, month, day };
		},
	},
	// Generic YYYY-MM-DD format
	{
		name: 'generic-dash',
		regex: /(\d{4})-(\d{2})-(\d{2})/,
		extract: (match) => {
			const { year, month, day } = extractDateOnlyComponents(match, {
				year: 1,
				month: 2,
				day: 3,
			});

			if (!isValidDate(year, month, day)) {
				return null;
			}

			return { year, month, day };
		},
	},
	// Generic YYYYMMDD format (not followed by more digits)
	{
		name: 'generic-compact',
		regex: /(\d{4})(\d{2})(\d{2})(?!\d)/,
		extract: (match) => {
			const { year, month, day } = extractDateOnlyComponents(match, {
				year: 1,
				month: 2,
				day: 3,
			});

			if (!isValidDate(year, month, day)) {
				return null;
			}

			return { year, month, day };
		},
	},
];

/**
 * Parse a filename to extract date components
 * Tries multiple common filename patterns used by cameras, screenshots, and apps
 * @param filename - The filename to parse (e.g., 'IMG_20240315_143045.jpg')
 * @returns DateComponents with extracted date, or null if no date found
 */
export function parseFilename(filename: string): DateComponents | null {
	if (!filename) {
		return null;
	}

	// Extract basename if full path provided
	const basename = filename.split('/').pop() || filename;

	// Try each pattern in order
	for (const pattern of FILENAME_PATTERNS) {
		const match = basename.match(pattern.regex);
		if (match) {
			const result = pattern.extract(match);
			if (result) {
				// For generic-compact pattern, don't match if followed by underscore and 6+ digits
				if (pattern.name === 'generic-compact' && match.index !== undefined) {
					const matchPos = match.index;
					const afterMatch = basename.slice(matchPos + 8); // 8 = YYYYMMDD
					if (/^_\d{6}/.test(afterMatch)) {
						continue; // Try next pattern
					}
				}
				return result;
			}
		}
	}

	return null;
}
