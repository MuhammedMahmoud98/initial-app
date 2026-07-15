module.exports = {
  customSyntax: 'postcss-scss',
  extends: [
    'stylelint-config-recommended',
    'stylelint-config-recommended-scss',
  ],
  plugins: ['stylelint-scss', 'stylelint-order'],
  syntax: 'scss',
  ignoreFiles: ['node_modules/**', 'dist/**'],
  rules: {
    'no-descending-specificity': null,
    'scss/no-global-function-names': null,
    'no-empty-source': null,
    'block-no-empty': true,
    'comment-no-empty': true,
    'at-rule-empty-line-before': [
      'always',
      {
        except: [
          'first-nested',
          'inside-block',
          'blockless-after-same-name-blockless',
        ],
        ignore: ['after-comment'],
      },
    ],
    'comment-empty-line-before': [
      'always',
      {
        except: ['first-nested'],
        ignore: ['after-comment'],
      },
    ],
    'rule-empty-line-before': [
      'always',
      {
        except: ['first-nested'],
        ignore: ['after-comment'],
      },
    ],
    'declaration-empty-line-before': [
      'always',
      {
        except: ['first-nested', 'after-declaration'],
      },
    ],
    'no-invalid-position-at-import-rule': [
      true,
      {
        ignoreAtRules: ['use', 'forward'],
      },
    ],
    'number-max-precision': 10,
    'max-nesting-depth': 10,
    'property-no-vendor-prefix': [
      true,
      {
        ignoreProperties: ['box-orient'],
      },
    ],
    'selector-max-compound-selectors': 5,
    'selector-max-id': 0,
    'selector-max-universal': 0,
    'selector-no-qualifying-type': [
      true,
      {
        ignore: ['attribute', 'class'],
      },
    ],
    'property-no-unknown': true,
    'selector-type-no-unknown': [
      true,
      {
        ignoreTypes: ['/^stc-/', '/^p-/', 'app-*', 'router-outlet', 'timesicon', 'app-generic-table'],
        message: 'Only the following element namespaces are allowed: [stc, p]',
      },
    ],
    'selector-pseudo-element-no-unknown': [
      true,
      {
        ignorePseudoElements: ['ng-deep'],
      },
    ],
    'selector-class-pattern': [
      '^[a-z0-9]+(-[a-z0-9]+)*(__[a-z0-9]+)*(-?-[a-z0-9]+)*$',
      {
        resolveNestedSelectors: true,
        message: 'Use BEM-style selectors: {block}__{element}--{modifier}',
      },
    ],
    'unit-allowed-list': [
      'rem',
      '%',
      'vh',
      'dvh',
      'vw',
      'vmax',
      'vmin',
      'deg',
      'fr',
      's',
      'ms',
      'px',
    ],

    'order/properties-alphabetical-order': null,
    'order/order': [
      'dollar-variables',
      'custom-properties',
      {
        type: 'at-rule',
        name: 'extend',
      },
      {
        type: 'at-rule',
        name: 'include',
      },
      'declarations',
      'rules',
    ],

    'scss/at-mixin-pattern': '^[a-z0-9]+(-[a-z0-9]+)*$',
    'scss/at-function-pattern': '^[a-z0-9]+(-[a-z0-9]+)*$',
    'scss/percent-placeholder-pattern': '^[a-z0-9]+(-[a-z0-9]+)*$',
    'scss/dollar-variable-pattern': '^[a-z0-9]+(-[a-z0-9]+)*$',
    'scss/dollar-variable-colon-space-after': 'always',
    'scss/at-mixin-argumentless-call-parentheses': 'always',
    'scss/at-function-named-arguments': null,
    'scss/at-mixin-named-arguments': [
      'always',
      { ignore: ['single-argument'] },
    ],
    'scss/selector-nest-combinators': 'always',
    'scss/at-extend-no-missing-placeholder': true,
    'scss/no-duplicate-mixins': true,
    'scss/no-duplicate-dollar-variables': true,
    'scss/selector-no-redundant-nesting-selector': null,
  },
};
