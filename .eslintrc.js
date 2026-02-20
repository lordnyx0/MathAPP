module.exports = {
    root: true,
    env: {
        es2021: true,
        'react-native/react-native': true,
        jest: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'prettier',
    ],
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    plugins: ['react', 'react-hooks'],
    settings: {
        react: {
            version: 'detect',
        },
    },
    rules: {
        // React
        'react/prop-types': 'off', // We're not using PropTypes (consider TypeScript)
        'react/react-in-jsx-scope': 'off', // Not needed in React 17+
        'react/display-name': 'off',

        // React Hooks
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',

        // General
        'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        'no-console': ['warn', { allow: ['warn', 'error'] }],
        'prefer-const': 'warn',
        'no-var': 'error',
    },
    ignorePatterns: [
        'node_modules/',
        '.expo/',
        'babel.config.js',
        'jest.config.js',
        '__mocks__/',
    ],
};
