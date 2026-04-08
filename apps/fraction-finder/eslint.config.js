const sharedExpoConfig = require('@education/eslint-config/expo');

module.exports = [
  ...sharedExpoConfig,
  {
    ignores: ['dist/*'],
  },
];
