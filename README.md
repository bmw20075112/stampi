# Time Image

A client-side web application that automatically reads EXIF timestamp from photos and adds a timestamp watermark overlay.

## Features

- Upload photos via click or drag-and-drop
- Automatically extracts EXIF timestamp (DateTimeOriginal, CreateDate, or ModifyDate)
- Customizable timestamp format (YYYY/MM/DD, YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY)
- Adjustable position (four corners)
- Customizable font size and color
- Download processed image as JPEG
- Pure client-side processing - photos never leave your device
- Responsive design with dark mode support

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS v4
- exifr (EXIF parsing)
- Vitest + Testing Library (testing)

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
