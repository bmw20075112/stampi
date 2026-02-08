import type { DateFormat } from '@/utils/dateFormatter';
import {
	DEFAULT_SHADOW_COLOR,
	DEFAULT_SHADOW_OFFSET_X,
	DEFAULT_SHADOW_OFFSET_Y,
} from '@/config/shadowDefaults';

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
const PADDING_RATIO = 0.015; // Fixed 1.5% of image width for consistent padding
const DEFAULT_FONT_FAMILY = 'monospace'; // Classic film camera aesthetic

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

	// Use the shorter dimension for consistent sizing across portrait/landscape images
	const minDimension = Math.min(image.naturalWidth, image.naturalHeight);
	const scale = config.fontSizeScale ?? DEFAULT_FONT_SIZE_SCALE;
	let fontSize = calculateFontSize(minDimension, scale);

	// Use fixed percentage of shorter dimension for consistent padding
	const padding = Math.round(minDimension * PADDING_RATIO);

	// Set initial font to measure text
	ctx.font = `${fontSize}px ${DEFAULT_FONT_FAMILY}`;
	let textMetrics = ctx.measureText(timestamp);
	let textWidth = textMetrics.width;

	// Ensure text fits within image bounds (with padding on both sides)
	const maxWidth = canvas.width - padding * 2;
	const maxHeight = canvas.height - padding * 2;

	// Scale down font if text is too wide
	if (textWidth > maxWidth) {
		const scaleFactor = maxWidth / textWidth;
		fontSize = Math.max(MIN_FONT_SIZE, Math.floor(fontSize * scaleFactor));
		ctx.font = `${fontSize}px ${DEFAULT_FONT_FAMILY}`;
		textMetrics = ctx.measureText(timestamp);
		textWidth = textMetrics.width;
	}

	// Scale down font if text is too tall
	if (fontSize > maxHeight) {
		fontSize = Math.max(MIN_FONT_SIZE, maxHeight);
		ctx.font = `${fontSize}px ${DEFAULT_FONT_FAMILY}`;
		textMetrics = ctx.measureText(timestamp);
		textWidth = textMetrics.width;
	}

	ctx.fillStyle = config.color;

	// Apply text shadow if configured
	if (config.shadowBlur !== undefined && config.shadowBlur > 0) {
		ctx.shadowColor = config.shadowColor ?? DEFAULT_SHADOW_COLOR;
		ctx.shadowBlur = config.shadowBlur;
		ctx.shadowOffsetX = config.shadowOffsetX ?? DEFAULT_SHADOW_OFFSET_X;
		ctx.shadowOffsetY = config.shadowOffsetY ?? DEFAULT_SHADOW_OFFSET_Y;
	}

	const textHeight = fontSize;
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
