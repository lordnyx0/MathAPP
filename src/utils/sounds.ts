// Sound Effects Utility
// Uses expo-audio for native mobile support with local assets

import { createAudioPlayer, setAudioModeAsync, AudioPlayer } from 'expo-audio';

type SoundKey = 'correct' | 'incorrect' | 'click';

// Local sound assets (bundled with the app)
const SOUNDS: Record<SoundKey, ReturnType<typeof require>> = {
    correct: require('../../assets/sounds/correct.mp3'),
    incorrect: require('../../assets/sounds/incorrect.mp3'),
    click: require('../../assets/sounds/click.mp3'),
};

// Sound settings
let soundEnabled = true;

// Cache for loaded audio players
const playerCache: Map<SoundKey, AudioPlayer> = new Map();

/**
 * Enable or disable all sounds
 */
export const setSoundEnabled = (enabled: boolean): void => {
    soundEnabled = enabled;
};

/**
 * Check if sounds are enabled
 */
export const isSoundEnabled = (): boolean => soundEnabled;

/**
 * Initialize audio settings
 */
export const initAudio = async (): Promise<void> => {
    try {
        await setAudioModeAsync({
            playsInSilentMode: true,
        });
    } catch (error) {
        console.warn('Failed to initialize audio:', error);
    }
};

/**
 * Play a sound by key
 */
const playSound = async (key: SoundKey, volume: number = 0.5): Promise<void> => {
    if (!soundEnabled) return;

    try {
        // Check cache first
        let player = playerCache.get(key);

        if (!player) {
            // Create and cache the player
            player = createAudioPlayer(SOUNDS[key]);
            playerCache.set(key, player);
        }

        player.volume = volume;
        player.seekTo(0); // Rewind to start
        player.play();
    } catch (error) {
        // Silent fail - sound is optional UX enhancement
        console.warn('Sound playback failed:', error);
    }
};

/**
 * Play a success/correct sound
 */
export const playCorrect = async (): Promise<void> => {
    await playSound('correct', 0.5);
};

/**
 * Play an error/incorrect sound
 */
export const playIncorrect = async (): Promise<void> => {
    await playSound('incorrect', 0.4);
};

/**
 * Play a click/tap sound
 */
export const playClick = async (): Promise<void> => {
    await playSound('click', 0.3);
};

/**
 * Cleanup all sounds (call on app unmount)
 */
export const unloadSounds = async (): Promise<void> => {
    for (const player of playerCache.values()) {
        try {
            player.remove();
        } catch (error) {
            // Ignore cleanup errors
        }
    }
    playerCache.clear();
};

export interface SoundsAPI {
    playCorrect: typeof playCorrect;
    playIncorrect: typeof playIncorrect;
    playClick: typeof playClick;
    setSoundEnabled: typeof setSoundEnabled;
    isSoundEnabled: typeof isSoundEnabled;
    initAudio: typeof initAudio;
    unloadSounds: typeof unloadSounds;
}

const sounds: SoundsAPI = {
    playCorrect,
    playIncorrect,
    playClick,
    setSoundEnabled,
    isSoundEnabled,
    initAudio,
    unloadSounds,
};

export default sounds;
