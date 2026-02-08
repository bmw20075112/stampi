import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { downloadBlob } from './downloadUtils';

describe('downloadUtils', () => {
	describe('downloadBlob', () => {
		let createObjectURLSpy: ReturnType<typeof vi.spyOn>;
		let revokeObjectURLSpy: ReturnType<typeof vi.spyOn>;
		let createElementSpy: ReturnType<typeof vi.spyOn>;
		let mockLink: {
			href: string;
			download: string;
			click: ReturnType<typeof vi.fn>;
		};

		beforeEach(() => {
			// Mock URL methods
			createObjectURLSpy = vi
				.spyOn(URL, 'createObjectURL')
				.mockReturnValue('blob:mock-url-123');
			revokeObjectURLSpy = vi
				.spyOn(URL, 'revokeObjectURL')
				.mockImplementation(() => {});

			// Mock link element
			mockLink = {
				href: '',
				download: '',
				click: vi.fn(),
			};

			// Mock document.createElement
			createElementSpy = vi
				.spyOn(document, 'createElement')
				.mockReturnValue(mockLink as unknown as HTMLAnchorElement);
		});

		afterEach(() => {
			vi.restoreAllMocks();
		});

		it('should create object URL from blob', () => {
			const blob = new Blob(['test content'], { type: 'text/plain' });
			downloadBlob(blob, 'test.txt');

			expect(createObjectURLSpy).toHaveBeenCalledWith(blob);
		});

		it('should create anchor element', () => {
			const blob = new Blob(['test'], { type: 'text/plain' });
			downloadBlob(blob, 'test.txt');

			expect(createElementSpy).toHaveBeenCalledWith('a');
		});

		it('should set href to object URL', () => {
			const blob = new Blob(['test'], { type: 'text/plain' });
			downloadBlob(blob, 'test.txt');

			expect(mockLink.href).toBe('blob:mock-url-123');
		});

		it('should set download attribute to filename', () => {
			const blob = new Blob(['test'], { type: 'text/plain' });
			downloadBlob(blob, 'my-file.txt');

			expect(mockLink.download).toBe('my-file.txt');
		});

		it('should trigger click on link', () => {
			const blob = new Blob(['test'], { type: 'text/plain' });
			downloadBlob(blob, 'test.txt');

			expect(mockLink.click).toHaveBeenCalledTimes(1);
		});

		it('should revoke object URL after download', () => {
			const blob = new Blob(['test'], { type: 'text/plain' });
			downloadBlob(blob, 'test.txt');

			expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url-123');
		});

		it('should handle image blobs', () => {
			const blob = new Blob(['fake-image-data'], { type: 'image/jpeg' });
			downloadBlob(blob, 'photo.jpg');

			expect(createObjectURLSpy).toHaveBeenCalledWith(blob);
			expect(mockLink.download).toBe('photo.jpg');
			expect(mockLink.click).toHaveBeenCalled();
			expect(revokeObjectURLSpy).toHaveBeenCalled();
		});

		it('should handle ZIP blobs', () => {
			const blob = new Blob(['fake-zip-data'], { type: 'application/zip' });
			downloadBlob(blob, 'archive.zip');

			expect(createObjectURLSpy).toHaveBeenCalledWith(blob);
			expect(mockLink.download).toBe('archive.zip');
			expect(mockLink.click).toHaveBeenCalled();
			expect(revokeObjectURLSpy).toHaveBeenCalled();
		});

		it('should handle filenames with spaces', () => {
			const blob = new Blob(['test'], { type: 'text/plain' });
			downloadBlob(blob, 'my photo.jpg');

			expect(mockLink.download).toBe('my photo.jpg');
		});

		it('should handle unicode filenames', () => {
			const blob = new Blob(['test'], { type: 'text/plain' });
			downloadBlob(blob, '照片_2024.jpg');

			expect(mockLink.download).toBe('照片_2024.jpg');
		});

		it('should complete full download flow in correct order', () => {
			const blob = new Blob(['test'], { type: 'text/plain' });
			const callOrder: string[] = [];

			createObjectURLSpy.mockImplementation(() => {
				callOrder.push('createObjectURL');
				return 'blob:test';
			});

			createElementSpy.mockImplementation(() => {
				callOrder.push('createElement');
				return mockLink as unknown as HTMLAnchorElement;
			});

			mockLink.click = vi.fn(() => {
				callOrder.push('click');
			});

			revokeObjectURLSpy.mockImplementation(() => {
				callOrder.push('revokeObjectURL');
			});

			downloadBlob(blob, 'test.txt');

			expect(callOrder).toEqual([
				'createObjectURL',
				'createElement',
				'click',
				'revokeObjectURL',
			]);
		});
	});
});
