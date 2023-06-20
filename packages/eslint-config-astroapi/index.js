module.exports = {
  extends: [
    'prettier', 
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
], 
  plugins: [
    // 'react',
    '@typescript-eslint'
  ],
  rules: {
    indent: [
      'warn',
      2
    ],
    'linebreak-style': [
      'warn',
      'unix'
    ],
    quotes: [
      'warn',
      'single'
    ],
    semi: [
      'warn',
      'always'
    ],
    'react/react-in-jsx-scope': 'off',
  }
};
