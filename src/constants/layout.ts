// Layout constants — Centralized measurements for consistent spacing
import { Platform } from 'react-native';

// ============================================================
// TAB BAR DIMENSIONS
// ============================================================

/** Height of the floating tab bar (matches TabNavigator style) */
export const TAB_BAR_HEIGHT = 72;

/** Bottom margin of the tab bar from the screen edge */
export const TAB_BAR_BOTTOM_MARGIN = Platform.OS === 'ios' ? 20 : 12;

/**
 * Total clearance needed below scrollable content to avoid
 * overlap with the floating tab bar.
 * Includes tab bar height + bottom margin + extra visual padding.
 */
export const TAB_BAR_CLEARANCE = TAB_BAR_HEIGHT + TAB_BAR_BOTTOM_MARGIN + 24;

// ============================================================
// SCREEN LAYOUT
// ============================================================

/** Standard horizontal padding for screen content */
export const SCREEN_HORIZONTAL_PADDING = 20;
