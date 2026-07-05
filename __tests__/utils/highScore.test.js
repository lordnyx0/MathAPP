const AsyncStorage = require('@react-native-async-storage/async-storage');
const { loadHighScore, persistHighScore } = require('../../src/utils/highScore');

describe('highScore util', () => {
    beforeEach(() => {
        AsyncStorage.__reset();
        jest.clearAllMocks();
    });

    it('returns 0 when nothing is stored', async () => {
        expect(await loadHighScore('trainer')).toBe(0);
    });

    it('persists a new record and loads it back', async () => {
        const result = await persistHighScore('trainer', 50, 0);
        expect(result).toBe(50);
        expect(await loadHighScore('trainer')).toBe(50);
    });

    it('does not overwrite a higher score', async () => {
        await persistHighScore('trainer', 100, 0);
        const result = await persistHighScore('trainer', 40, 100);
        expect(result).toBe(100);
        expect(await loadHighScore('trainer')).toBe(100);
    });

    it('treats an equal score as not a record (strictly greater wins)', async () => {
        await persistHighScore('trainer', 30, 0);
        const result = await persistHighScore('trainer', 30, 30);
        expect(result).toBe(30);
        // Only the first, record-setting call should hit storage.
        expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
    });

    it('scopes scores by storage key', async () => {
        await persistHighScore('derivatives', 10, 0);
        await persistHighScore('integrals', 20, 0);
        expect(await loadHighScore('derivatives')).toBe(10);
        expect(await loadHighScore('integrals')).toBe(20);
    });

    it('returns 0 when the stored value is malformed', async () => {
        await AsyncStorage.setItem('trainer', 'not-json');
        expect(await loadHighScore('trainer')).toBe(0);
    });

    it('reads the legacy raw-number format', async () => {
        await AsyncStorage.setItem('legacy', '7');
        expect(await loadHighScore('legacy')).toBe(7);
    });
});
