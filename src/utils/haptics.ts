/**
 * Haptics Utility — Centralized haptic feedback for the app.
 * Uses expo-haptics; gracefully degrades on unsupported platforms.
 */
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Haptics are only available on iOS and Android
const isSupported = Platform.OS === 'ios' || Platform.OS === 'android';

let hapticsEnabled = true;

/** Enable or disable haptic feedback globally */
export const setHapticsEnabled = (enabled: boolean): void => {
    hapticsEnabled = enabled;
};

/** Check if haptics are currently enabled */
export const isHapticsEnabled = (): boolean => hapticsEnabled;

// ============================================================
// FEEDBACK FUNCTIONS
// ============================================================

/** Light tap — for selections, toggles, chip presses */
export const tapLight = async (): Promise<void> => {
    if (!isSupported || !hapticsEnabled) return;
    try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
        // Silent fail on unsupported device
    }
};

/** Medium tap — for button presses, card taps */
export const tapMedium = async (): Promise<void> => {
    if (!isSupported || !hapticsEnabled) return;
    try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
        // Silent fail
    }
};

/** Heavy tap — for drag-drop, significant interactions */
export const tapHeavy = async (): Promise<void> => {
    if (!isSupported || !hapticsEnabled) return;
    try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {
        // Silent fail
    }
};

/** Success notification — correct answer, achievement unlocked */
export const notifySuccess = async (): Promise<void> => {
    if (!isSupported || !hapticsEnabled) return;
    try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
        // Silent fail
    }
};

/** Error notification — wrong answer, validation failure */
export const notifyError = async (): Promise<void> => {
    if (!isSupported || !hapticsEnabled) return;
    try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch {
        // Silent fail
    }
};

/** Warning notification — streak lost, time running out */
export const notifyWarning = async (): Promise<void> => {
    if (!isSupported || !hapticsEnabled) return;
    try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {
        // Silent fail
    }
};

/** Selection tick — for picker scrolling, option changes */
export const selectionTick = async (): Promise<void> => {
    if (!isSupported || !hapticsEnabled) return;
    try {
        await Haptics.selectionAsync();
    } catch {
        // Silent fail
    }
};

export default {
    tapLight,
    tapMedium,
    tapHeavy,
    notifySuccess,
    notifyError,
    notifyWarning,
    selectionTick,
    setHapticsEnabled,
    isHapticsEnabled,
};
