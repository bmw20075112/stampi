/**
 * Default shadow configuration for timestamp watermarks
 * Centralized constants to ensure consistency across the application
 */

export const DEFAULT_SHADOW_BLUR = 8;
export const DEFAULT_SHADOW_OFFSET_X = 3;
export const DEFAULT_SHADOW_OFFSET_Y = 3;
export const DEFAULT_SHADOW_COLOR = 'rgba(0, 0, 0, 0.9)';

/**
 * Complete shadow configuration object for easy spreading
 */
export const DEFAULT_SHADOW_CONFIG = {
	shadowBlur: DEFAULT_SHADOW_BLUR,
	shadowOffsetX: DEFAULT_SHADOW_OFFSET_X,
	shadowOffsetY: DEFAULT_SHADOW_OFFSET_Y,
	shadowColor: DEFAULT_SHADOW_COLOR,
} as const;
