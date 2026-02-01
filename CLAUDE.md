# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Start development server
pnpm build            # TypeScript check + production build
pnpm test             # Run all tests once
pnpm test:watch       # Run tests in watch mode
pnpm test <pattern>   # Run tests matching pattern (e.g., pnpm test dateFormatter)
pnpm lint             # Run ESLint
```

## Architecture

**Stampi** is a pure client-side React app that adds timestamp watermarks to photos using EXIF data. Supports batch processing with intelligent date extraction, file naming, and ZIP exports.

### Components

| Component                 | Purpose                                                  |
| ------------------------- | -------------------------------------------------------- |
| **ImageUploader**         | Drag-and-drop file selection                             |
| **ImagePreview**          | Canvas preview with rendered timestamp                   |
| **TimestampEditor**       | Controls for format, position, color, fontSize, shadow   |
| **BatchProgressView**     | Shows processing progress and status for multiple images |
| **BatchDownloadControls** | ZIP download and individual image export buttons         |
| **DateSourceBadge**       | Displays date extraction source and confidence level     |
| **DateInputDialog**       | Modal for manual date input when auto-extraction fails   |
| **LanguageSwitcher**      | Language selection (EN/ZH-TW)                            |

### Data Flow

1. **ImageUploader** → User uploads image file(s)
2. **useBatchProcessing** → Stores images in queue with pending status
3. **useTimestamp** hook → Extracts date using priority fallback chain:
   - EXIF DateTimeOriginal (high confidence)
   - EXIF CreateDate (high confidence)
   - EXIF ModifyDate (medium confidence)
   - Filename parsing via `filenameParser` (medium confidence)
   - file.lastModified (low confidence)
   - User manual input via DateInputDialog (user-provided)
4. **dateFormatter** → Formats date based on selected format (8 locale options)
5. **useBatchProcessing.updateTimestampForAll()** → Updates all images with timestamp
6. **useBatchProcessing.startProcessing()** → Sequential batch processing:
   - For each image: load → renderTimestamp to canvas → compress → store
7. **ImagePreview** → Shows preview of current/first image
8. **BatchProgressView** → Displays processing status
9. **BatchDownloadControls** → Export options:
   - `exportImage()` → Compress canvas to blob
   - `generateFilename()` → Intelligent naming (original → date-based → SHA-256 hash)
   - `createZip()` → Bundle images with deduplication

### Key Types

`TimestampConfig` (in `imageProcessor.ts`) is the central config object passed between components:

- `format`: DateFormat type (8 locale variants including 'YYYY/MM/DD', 'DD/MM/YYYY', etc.)
- `position`: Position type ('bottom-right' | 'bottom-left' | 'top-right' | 'top-left')
- `color`: hex string (default: '#FFF' white)
- `fontSize`: number in pixels (default: 30, auto-calculated as ~3% of image width)
- `shadowBlur`: number (default: 8)
- `shadowOffsetX`: number (default: 3)
- `shadowOffsetY`: number (default: 3)
- `shadowColor`: string (default: 'rgba(0, 0, 0, 0.9)')

`ProcessedImage` (in `useBatchProcessing.ts`):

- `file`: File object
- `status`: 'pending' | 'processing' | 'completed' | 'error'
- `timestamp`: Formatted timestamp string
- `dateSource`: Source of date extraction
- `dateConfidence`: Confidence level
- `canvas`: Rendered canvas element (after processing)

### Canvas Rendering

`renderTimestamp()` in `imageProcessor.ts` handles the actual watermark rendering:

- Draws original image to canvas at full resolution
- Uses monospace font for classic film camera aesthetic
- Applies text shadow for visibility
- Calculates position based on text metrics and padding

### Utilities

- `imageProcessor.ts` → Canvas rendering, position/font size calculation
- `dateFormatter.ts` → Date formatting with multiple locale formats
- `imageExporter.ts` → Canvas to compressed image blob conversion
- `zipGenerator.ts` → Creates ZIP files from multiple images
- `filenameGenerator.ts` → Intelligent filename generation with fallbacks
- `filenameParser.ts` → Extracts date from image filenames using regex

### Internationalization

Supported languages: English, Traditional Chinese (stored in `src/i18n/locales/`)

## Testing

- Uses Vitest with happy-dom environment
- Tests are colocated with source files (e.g., `Component.tsx` + `Component.test.tsx`)
- 38 test files covering components, hooks, and utilities
- Mock `exifr` module in tests that need EXIF data
- Mock `URL.createObjectURL/revokeObjectURL` in App tests

## TypeScript Notes

- Uses `verbatimModuleSyntax` - type imports must use `import type`
- Separate `vitest.config.ts` to avoid type conflicts with main `vite.config.ts`
- Target: ES2022, strict mode enabled
