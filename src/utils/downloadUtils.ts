/**
 * Utility functions for triggering file downloads in the browser
 */

/**
 * Triggers a download of a Blob in the browser
 *
 * Creates a temporary object URL, creates an invisible anchor element,
 * clicks it to trigger the download, then cleans up the object URL.
 *
 * @param blob - The Blob to download
 * @param filename - The filename for the downloaded file (browser handles sanitization
 *                   automatically, preventing path traversal and invalid characters)
 *
 * @example
 * const blob = new Blob(['Hello'], { type: 'text/plain' });
 * downloadBlob(blob, 'hello.txt');
 *
 * @security Filename sanitization is handled by the browser's download mechanism.
 *           Browsers automatically strip path separators (/, \) and invalid characters
 *           from the download attribute to prevent directory traversal attacks.
 */
export function downloadBlob(blob: Blob, filename: string): void {
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	link.click();
	URL.revokeObjectURL(url);
}
