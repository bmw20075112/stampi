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

export function isValidDate(year: number, month: number, day: number): boolean {
	// Check year range
	if (year < 1970 || year > 2100) {
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
			const year = parseInt(match[1], 10);
			const month = parseInt(match[2], 10);
			const day = parseInt(match[3], 10);
			const hour = parseInt(match[4], 10);
			const minute = parseInt(match[5], 10);
			const second = parseInt(match[6], 10);

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
			const year = parseInt(match[1], 10);
			const month = parseInt(match[2], 10);
			const day = parseInt(match[3], 10);
			const hour = parseInt(match[4], 10);
			const minute = parseInt(match[5], 10);
			const second = parseInt(match[6], 10);

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
			const year = parseInt(match[1], 10);
			const month = parseInt(match[2], 10);
			const day = parseInt(match[3], 10);

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
			const year = parseInt(match[1], 10);
			const month = parseInt(match[2], 10);
			const day = parseInt(match[3], 10);

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
			const year = parseInt(match[1], 10);
			const month = parseInt(match[2], 10);
			const day = parseInt(match[3], 10);

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
