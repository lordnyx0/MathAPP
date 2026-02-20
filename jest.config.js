module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.test.js'],
    collectCoverageFrom: [
        'src/learning/**/*.js',
        'src/utils/**/*.js',
        'src/hooks/**/*.js',
        '!src/**/*.test.js',
    ],
    moduleNameMapper: {
        '^@react-native-async-storage/async-storage$': '<rootDir>/__mocks__/asyncStorage.js',
    },
    transformIgnorePatterns: [
        '/node_modules/(?!(@react-native|react-native)/)',
    ],
};
