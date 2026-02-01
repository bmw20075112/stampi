# Stampi

A client-side web application that automatically reads EXIF timestamp from photos and adds a timestamp watermark overlay. Supports batch processing with intelligent date extraction, custom formatting, and ZIP exports.

## Features

- **Batch Processing** - Upload multiple photos at once with progress tracking
- **Intelligent Date Extraction** - Multi-method fallback chain:
  - EXIF DateTimeOriginal/CreateDate/ModifyDate
  - Filename parsing (extracts dates from filenames)
  - File modification date
  - Manual date input for images without metadata
- **Customizable Watermarks**:
  - 8 date format options (YYYY/MM/DD, DD/MM/YYYY, locale variants)
  - Adjustable position (four corners)
  - Custom font size, color, and shadow
  - Real-time preview
- **Smart Exports**:
  - Download individual images or entire batch as ZIP
  - Intelligent filename generation (preserves original names, uses date-based fallback, SHA-256 hash)
- **Internationalization** - English and Traditional Chinese support
- **Privacy-First** - Pure client-side processing, photos never leave your device
- **Responsive Design** - Works on desktop and mobile with dark mode support

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- exifr (EXIF parsing)
- fflate (ZIP creation)
- Compressor.js (image compression)
- i18next (internationalization)
- Vitest + Testing Library (38+ tests)

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Deployment

The application is automatically deployed to GitHub Pages via GitHub Actions when changes are pushed to the `main` branch.

## License

MIT
