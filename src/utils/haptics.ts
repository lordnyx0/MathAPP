/**
 * Haptics Utility — Centralized haptic feedback for the app.
 * Uses expo-haptics; gracefully degrades on unsupported platforms.
 */
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';

// Haptics are only available on iOS and Android
const isSupported = Platform.OS === 'ios' || Platform.OS === 'android';

let hapticsEnabled = true;

/** Enable or disable haptic feedback globally (persisted across launches) */
export const setHapticsEnabled = (enabled: boolean): void => {
    hapticsEnabled = enabled;
    // Persist; fire-and-forget since this is a UX preference, not critical state
    AsyncStorage.setItem(STORAGE_KEYS.HAPTICS_ENABLED, JSON.stringify(enabled)).catch(() => {
        // Silent fail — preference will simply revert to default next launch
    });
};

/** Check if haptics are currently enabled */
export const isHapticsEnabled = (): boolean => hapticsEnabled;

/** Load the persisted haptics preference. Call once on app boot. */
export const loadHapticsPreference = async (): Promise<void> => {
    try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.HAPTICS_ENABLED);
        if (stored !== null) {
            hapticsEnabled = JSON.parse(stored);
        }
    } catch {
        // Keep default (enabled) on failure
    }
};

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
    loadHapticsPreference,
};
