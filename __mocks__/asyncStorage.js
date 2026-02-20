// Mock for @react-native-async-storage/async-storage
const storage = {};

module.exports = {
    setItem: jest.fn((key, value) => {
        storage[key] = value;
        return Promise.resolve();
    }),
    getItem: jest.fn((key) => {
        return Promise.resolve(storage[key] || null);
    }),
    removeItem: jest.fn((key) => {
        delete storage[key];
        return Promise.resolve();
    }),
    clear: jest.fn(() => {
        Object.keys(storage).forEach(key => delete storage[key]);
        return Promise.resolve();
    }),
    getAllKeys: jest.fn(() => {
        return Promise.resolve(Object.keys(storage));
    }),
    // Helper for tests to reset storage
    __reset: () => {
        Object.keys(storage).forEach(key => delete storage[key]);
    },
};
