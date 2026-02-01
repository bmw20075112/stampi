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

Time Image is a pure client-side React app that adds timestamp watermarks to photos using EXIF data.

### Data Flow

1. **ImageUploader** → User uploads image file
2. **useExifData** hook → Extracts date from EXIF (DateTimeOriginal → CreateDate → ModifyDate fallback)
3. **App** → Formats date using `dateFormatter` based on selected format
4. **ImagePreview** → Renders image + timestamp to canvas via `renderTimestamp`
5. **TimestampEditor** → User adjusts config (format, position, color, fontSize)

### Key Types

`TimestampConfig` (in `imageProcessor.ts`) is the central config object passed between components:
- `format`: DateFormat type ('YYYY/MM/DD' | 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY')
- `position`: Position type ('bottom-right' | 'bottom-left' | 'top-right' | 'top-left')
- `color`: hex string (default: '#FF6B35' orange-red)
- `fontSize`: number in pixels (auto-calculated as ~3% of image width)

### Canvas Rendering

`renderTimestamp()` in `imageProcessor.ts` handles the actual watermark rendering:
- Draws original image to canvas at full resolution
- Uses monospace font for classic film camera aesthetic
- Calculates position based on text metrics and padding

## Testing

- Uses Vitest with happy-dom environment
- Tests are colocated with source files (e.g., `Component.tsx` + `Component.test.tsx`)
- Mock `exifr` module in tests that need EXIF data
- Mock `URL.createObjectURL/revokeObjectURL` in App tests

## TypeScript Notes

- Uses `verbatimModuleSyntax` - type imports must use `import type`
- Separate `vitest.config.ts` to avoid type conflicts with main `vite.config.ts`
