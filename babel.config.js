module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        // Jest configuration is handled separately via jest.config.js
    };
};
