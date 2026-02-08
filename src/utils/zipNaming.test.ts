import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { NamingConfig } from '@/config/namingConfig';
import { generateZipFilename } from './zipNaming';

describe('zipNaming', () => {
	describe('generateZipFilename', () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it('should generate filename with explicit timestamp', () => {
			const timestamp = 1234567890;
			const filename = generateZipFilename(timestamp);
			expect(filename).toBe('stampi-batch-1234567890.zip');
		});

		it('should generate filename with default timestamp (current time)', () => {
			const now = new Date('2024-01-15T10:30:00Z');
			vi.setSystemTime(now);

			const filename = generateZipFilename();
			expect(filename).toBe(`stampi-batch-${now.getTime()}.zip`);
		});

		it('should use custom config for naming pattern', () => {
			const customConfig: NamingConfig = {
				imagePrefix: 'custom',
				imageSuffix: '',
				datePrefix: 'custom',
				hashPrefix: 'custom',
				separator: '-',
				zipPattern: 'photos-{timestamp}.zip',
			};

			const timestamp = 9876543210;
			const filename = generateZipFilename(timestamp, customConfig);
			expect(filename).toBe('photos-9876543210.zip');
		});

		it('should handle legacy config pattern', () => {
			const legacyConfig: NamingConfig = {
				imagePrefix: '',
				imageSuffix: '_timestamped',
				datePrefix: 'IMG',
				hashPrefix: 'IMG',
				separator: '_',
				zipPattern: 'images-{timestamp}.zip',
			};

			const timestamp = 1111111111;
			const filename = generateZipFilename(timestamp, legacyConfig);
			expect(filename).toBe('images-1111111111.zip');
		});
	});
});
