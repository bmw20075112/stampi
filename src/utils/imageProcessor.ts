import type { DateFormat } from '@/utils/dateFormatter';

export type Position =
	| 'bottom-right'
	| 'bottom-left'
	| 'top-right'
	| 'top-left';

export interface TimestampConfig {
	format: DateFormat;
	position: Position;
	color: string;
	fontSizeScale?: number;
	shadowBlur?: number;
	shadowOffsetX?: number;
	shadowOffsetY?: number;
	shadowColor?: string;
}

export interface Size {
	width: number;
	height: number;
}

export interface Coordinates {
	x: number;
	y: number;
}

export const MIN_FONT_SIZE = 12;
export const MAX_FONT_SIZE = 400;
export const DEFAULT_FONT_SIZE_SCALE = 1.0;
export const MIN_FONT_SIZE_SCALE = 0.5;
export const MAX_FONT_SIZE_SCALE = 2.0;
const FONT_SIZE_RATIO = 0.04;

/**
 * Calculates font size based on image width and optional scale factor.
 *
 * Base calculation: imageWidth × 4% × scale
 * Result is clamped to [MIN_FONT_SIZE, MAX_FONT_SIZE] range.
 *
 * @param imageWidth - Width of the image in pixels (must be > 0)
 * @param scale - Multiplier for base font size (default: 1.0, range: 0.5-2.0)
 * @returns Computed font size in pixels, clamped to valid range
 *
 * @example
 * calculateFontSize(1000, 1.0) // Returns 40px (1000 × 0.04 × 1.0)
 * calculateFontSize(1000, 1.5) // Returns 60px (1000 × 0.04 × 1.5)
 * calculateFontSize(0, 1.0)    // Returns MIN_FONT_SIZE (guards against invalid input)
 */
export function calculateFontSize(
	imageWidth: number,
	scale: number = DEFAULT_FONT_SIZE_SCALE
): number {
	// Guard against invalid image width
	if (imageWidth <= 0 || !Number.isFinite(imageWidth)) {
		return MIN_FONT_SIZE;
	}

	// Guard against invalid scale
	if (scale <= 0 || !Number.isFinite(scale)) {
		scale = DEFAULT_FONT_SIZE_SCALE;
	}

	const size = Math.round(imageWidth * FONT_SIZE_RATIO * scale);
	return Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, size));
}

export function calculatePosition(
	position: Position,
	imageSize: Size,
	textSize: Size,
	padding: number
): Coordinates {
	let x: number;
	let y: number;

	switch (position) {
		case 'bottom-right':
			x = imageSize.width - textSize.width - padding;
			y = imageSize.height - textSize.height - padding;
			break;
		case 'bottom-left':
			x = padding;
			y = imageSize.height - textSize.height - padding;
			break;
		case 'top-right':
			x = imageSize.width - textSize.width - padding;
			y = padding + textSize.height;
			break;
		case 'top-left':
			x = padding;
			y = padding + textSize.height;
			break;
		default:
			x = imageSize.width - textSize.width - padding;
			y = imageSize.height - textSize.height - padding;
	}

	return { x, y };
}

export function renderTimestamp(
	canvas: HTMLCanvasElement,
	image: HTMLImageElement,
	timestamp: string,
	config: TimestampConfig
): void {
	const ctx = canvas.getContext('2d');
	if (!ctx) return;

	canvas.width = image.naturalWidth;
	canvas.height = image.naturalHeight;

	ctx.drawImage(image, 0, 0);

	const scale = config.fontSizeScale ?? DEFAULT_FONT_SIZE_SCALE;
	const fontSize = calculateFontSize(image.naturalWidth, scale);
	ctx.font = `${fontSize}px monospace`;
	ctx.fillStyle = config.color;

	// Apply text shadow if configured
	if (config.shadowBlur !== undefined && config.shadowBlur > 0) {
		ctx.shadowColor = config.shadowColor || 'rgba(0, 0, 0, 0.5)';
		ctx.shadowBlur = config.shadowBlur;
		ctx.shadowOffsetX = config.shadowOffsetX ?? 2;
		ctx.shadowOffsetY = config.shadowOffsetY ?? 2;
	}

	const textMetrics = ctx.measureText(timestamp);
	const textHeight = fontSize;
	const textWidth = textMetrics.width;

	const padding = Math.round(fontSize * 0.5);
	const position = calculatePosition(
		config.position,
		{ width: canvas.width, height: canvas.height },
		{ width: textWidth, height: textHeight },
		padding
	);

	ctx.fillText(timestamp, position.x, position.y);

	// Reset shadow settings
	ctx.shadowColor = 'transparent';
	ctx.shadowBlur = 0;
}
