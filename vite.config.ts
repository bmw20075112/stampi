import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
	base: '/stampi/',
	plugins: [react()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					// React core
					'react-vendor': ['react', 'react-dom', 'react/jsx-runtime'],
					// i18n library
					'i18n-vendor': ['react-i18next', 'i18next'],
					// Image processing libraries (exifr for EXIF data)
					'image-vendor': ['exifr'],
					// Compression library
					'compressor-vendor': ['compressorjs'],
					// ZIP generation (fflate)
					'zip-vendor': ['fflate'],
					// heic2any lazy-loaded separately via dynamic import
				},
			},
		},
		// Increase chunk size warning limit since we're splitting properly now
		chunkSizeWarningLimit: 600,
	},
});
