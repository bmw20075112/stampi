import { describe, it, expect } from 'vitest';
import type { NamingConfig } from './namingConfig';
import {
	DEFAULT_NAMING_CONFIG,
	LEGACY_NAMING_CONFIG,
	getNamingConfig,
} from './namingConfig';

describe('namingConfig', () => {
	describe('DEFAULT_NAMING_CONFIG', () => {
		it('should have correct production naming convention', () => {
			expect(DEFAULT_NAMING_CONFIG).toEqual({
				imagePrefix: 'stampi',
				imageSuffix: '',
				datePrefix: 'stampi',
				hashPrefix: 'stampi',
				separator: '_',
				zipPattern: 'stampi-batch-{timestamp}.zip',
			});
		});

		it('should satisfy NamingConfig interface', () => {
			const config: NamingConfig = DEFAULT_NAMING_CONFIG;
			expect(config.imagePrefix).toBeDefined();
			expect(config.imageSuffix).toBeDefined();
			expect(config.datePrefix).toBeDefined();
			expect(config.hashPrefix).toBeDefined();
			expect(config.separator).toBeDefined();
			expect(config.zipPattern).toBeDefined();
		});
	});

	describe('LEGACY_NAMING_CONFIG', () => {
		it('should have correct legacy naming convention', () => {
			expect(LEGACY_NAMING_CONFIG).toEqual({
				imagePrefix: '',
				imageSuffix: '_timestamped',
				datePrefix: 'IMG',
				hashPrefix: 'IMG',
				separator: '_',
				zipPattern: 'images-{timestamp}.zip',
			});
		});

		it('should satisfy NamingConfig interface', () => {
			const config: NamingConfig = LEGACY_NAMING_CONFIG;
			expect(config.imagePrefix).toBeDefined();
			expect(config.imageSuffix).toBeDefined();
			expect(config.datePrefix).toBeDefined();
			expect(config.hashPrefix).toBeDefined();
			expect(config.separator).toBeDefined();
			expect(config.zipPattern).toBeDefined();
		});
	});

	describe('getNamingConfig', () => {
		it('should return default config', () => {
			const config = getNamingConfig();
			expect(config).toEqual(DEFAULT_NAMING_CONFIG);
		});

		it('should be a single injection point', () => {
			const config1 = getNamingConfig();
			const config2 = getNamingConfig();
			expect(config1).toEqual(config2);
		});
	});
});
