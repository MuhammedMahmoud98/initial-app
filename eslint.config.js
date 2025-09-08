const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const eslintConfigPrettier = require('eslint-config-prettier');

module.exports = tseslint.config(
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
      eslintConfigPrettier,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      'no-console': 'warn',
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
      "import/prefer-default-export": "off",
      "max-len": ["error", { "code": 200 }],
      "no-param-reassign": ["error", { "props": true, "ignorePropertyModificationsFor": ["bar"] }],
      "comma-dangle": ["error", "only-multiline"],
      "import/no-unresolved": "off",
      "no-underscore-dangle": 0,
      "linebreak-style": 0,
      "eslint object-curly-newline": 0,
      "padded-blocks": ["error", "never"],
      "quotes": ["error","single"],
      "class-methods-use-this": "off",
      "no-useless-constructor": 0,
      "lines-between-class-members": ["error", "always", { "exceptAfterSingleLine": true }],
    },
    ignores: ['node_modules', 'dist', 'coverage'],
  },
  {
    files: ['**/*.html'],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
      eslintConfigPrettier,
    ],
    rules: {},
  },
);
