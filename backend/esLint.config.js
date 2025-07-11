export default [
    {
      files: ['**/*.js'],
      languageOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        globals: { require: 'readonly', module: 'readonly', process: 'readonly' },
      },
      rules: {
        // Add your rules here
        'no-unused-vars': 'warn',
        'no-console': 'off',
      },
    },
  ];