module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true
  },
  extends: [
    'standard',
    "plugin:cypress/recommended"
  ],
  ignorePatterns: ['.eslintrc.js', 'src/__tests__/', 'coverage/'],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    'indent': 'off',
    'curly': 'off',
    'no-return-assign': 'off'
  }
}
