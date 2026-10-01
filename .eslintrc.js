module.exports = {
  root: true,
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  env: {
    browser: true,
    node: true,
    es6: true,
    es2020: true,
    es2022: true,
  },
  overrides: [{ files: ['scripts/**'], rules: { 'no-console': 'off' } }],
  rules: {
    'no-unused-vars': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
  // Arquivos TypeScript são verificados pelo `tsc` estrito (typescript-eslint ainda não suporta o TypeScript 7).
  ignorePatterns: ['*.ts', '*.tsx', 'App.js', 'dist/', 'node_modules/'],
};
