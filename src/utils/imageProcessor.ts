import type { DateFormat } from './dateFormatter';

export type Position =
	| 'bottom-right'
	| 'bottom-left'
	| 'top-right'
	| 'top-left';

export interface TimestampConfig {
	format: DateFormat;
	position: Position;
	color: string;
	fontSize: number;
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

const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 150;
const FONT_SIZE_RATIO = 0.03;

export function calculateFontSize(imageWidth: number): number {
	const size = Math.round(imageWidth * FONT_SIZE_RATIO);
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

	const fontSize = config.fontSize || calculateFontSize(image.naturalWidth);
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
