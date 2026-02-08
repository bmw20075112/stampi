import { describe, it, expect } from 'vitest';
import { splitFilename, getBasename, getExtension } from './filenameUtils';

describe('filenameUtils', () => {
	describe('splitFilename', () => {
		it('should split filename with single extension', () => {
			expect(splitFilename('photo.jpg')).toEqual({
				base: 'photo',
				ext: 'jpg',
			});
		});

		it('should split filename with multiple dots', () => {
			expect(splitFilename('archive.tar.gz')).toEqual({
				base: 'archive.tar',
				ext: 'gz',
			});
		});

		it('should handle filename without extension', () => {
			expect(splitFilename('README')).toEqual({
				base: 'README',
				ext: '',
			});
		});

		it('should handle hidden files starting with dot', () => {
			expect(splitFilename('.gitignore')).toEqual({
				base: '.gitignore',
				ext: '',
			});
		});

		it('should handle empty string', () => {
			expect(splitFilename('')).toEqual({
				base: '',
				ext: '',
			});
		});

		it('should handle filename with only extension', () => {
			expect(splitFilename('.jpg')).toEqual({
				base: '.jpg',
				ext: '',
			});
		});

		it('should handle complex filenames', () => {
			expect(splitFilename('my.photo.final.v2.png')).toEqual({
				base: 'my.photo.final.v2',
				ext: 'png',
			});
		});

		it('should handle spaces in filename', () => {
			expect(splitFilename('my photo.jpg')).toEqual({
				base: 'my photo',
				ext: 'jpg',
			});
		});

		it('should handle unicode characters', () => {
			expect(splitFilename('照片_2024.jpg')).toEqual({
				base: '照片_2024',
				ext: 'jpg',
			});
		});
	});

	describe('getBasename', () => {
		it('should extract basename from filename with extension', () => {
			expect(getBasename('photo.jpg')).toBe('photo');
		});

		it('should extract basename from multiple dot filename', () => {
			expect(getBasename('archive.tar.gz')).toBe('archive.tar');
		});

		it('should return full name for files without extension', () => {
			expect(getBasename('README')).toBe('README');
		});

		it('should handle empty string', () => {
			expect(getBasename('')).toBe('');
		});

		it('should handle hidden files', () => {
			expect(getBasename('.gitignore')).toBe('.gitignore');
		});

		it('should handle complex filenames', () => {
			expect(getBasename('my.photo.final.v2.png')).toBe('my.photo.final.v2');
		});

		it('should handle unicode characters', () => {
			expect(getBasename('測試檔案.txt')).toBe('測試檔案');
		});
	});

	describe('getExtension', () => {
		it('should extract extension from filename', () => {
			expect(getExtension('photo.jpg')).toBe('jpg');
		});

		it('should extract last extension from multiple dot filename', () => {
			expect(getExtension('archive.tar.gz')).toBe('gz');
		});

		it('should return empty string for files without extension', () => {
			expect(getExtension('README')).toBe('');
		});

		it('should return empty string for empty input', () => {
			expect(getExtension('')).toBe('');
		});

		it('should return empty string for hidden files', () => {
			expect(getExtension('.gitignore')).toBe('');
		});

		it('should handle uppercase extensions', () => {
			expect(getExtension('PHOTO.JPG')).toBe('JPG');
		});

		it('should handle long extensions', () => {
			expect(getExtension('document.markdown')).toBe('markdown');
		});
	});
});
