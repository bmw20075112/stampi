/**
 * Export and compression configuration for image processing
 * Centralized constants to ensure consistency across the application
 */

/**
 * Final export quality for stamped images
 * Balances file size and visual quality for web/mobile-friendly files
 */
export const EXPORT_QUALITY = 0.85;

/**
 * HEIC to JPEG conversion quality
 * Higher quality (0.88) to maintain visual fidelity during initial conversion
 * Final compression happens during export phase
 */
export const HEIC_QUALITY = 0.88;

/**
 * Maximum width for exported images
 * Prevents memory issues on large images while creating web/mobile-friendly files
 */
export const MAX_EXPORT_WIDTH = 2000;
