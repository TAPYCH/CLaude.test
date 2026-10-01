export default [
  {
    files: ['js/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { window: 'readonly', document: 'readonly', navigator: 'readonly', localStorage: 'readonly', location: 'readonly', performance: 'readonly', requestAnimationFrame: 'readonly', cancelAnimationFrame: 'readonly', setTimeout: 'readonly', clearTimeout: 'readonly', setInterval: 'readonly', clearInterval: 'readonly', Image: 'readonly', console: 'readonly', btoa: 'readonly', atob: 'readonly', escape: 'readonly', unescape: 'readonly' },
    },
    rules: { 'no-unused-vars': ['warn', { args: 'none' }], 'no-undef': 'error', 'no-dupe-keys': 'error', 'no-unreachable': 'error' },
  },
];
