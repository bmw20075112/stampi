import type { NamingConfig } from '@/config/namingConfig';
import { getNamingConfig } from '@/config/namingConfig';

/**
 * Generates a filename for ZIP batch download
 *
 * Follows Single Responsibility Principle (SRP) - extracted from component
 *
 * @param timestamp - Optional timestamp (defaults to current time)
 * @param config - Naming configuration (defaults to production config)
 * @returns ZIP filename with timestamp
 */
export function generateZipFilename(
	timestamp?: number,
	config: NamingConfig = getNamingConfig()
): string {
	const actualTimestamp = timestamp ?? new Date().getTime();
	return config.zipPattern.replace('{timestamp}', actualTimestamp.toString());
}
