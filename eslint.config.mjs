import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';

/**
 * Anti-patterns from DESIGN.md §20 that can be caught statically.
 * Matches string literals, so it covers className, cn() and cva() alike.
 */
const restrictedClasses = [
  [
    '/(^|\\s)(h|min-h|max-h)-screen(\\s|$)/',
    'Use dvh (h-dvh) — 100vh is taller than the visible area on mobile. DESIGN.md §8.4.',
  ],
  [
    '/(^|\\s)w-screen(\\s|$)/',
    'w-screen ignores the parent padding and causes horizontal overflow. Use w-full. DESIGN.md §8.3.',
  ],
  [
    '/(^|\\s)(w|h|min-w|min-h|max-w|max-h|top|left|right|bottom|m[trblxy]?|p[trblxy]?|gap|text)-\\[\\d+(px|rem)\\]/',
    'Fixed pixel sizing breaks responsive layouts. Use the scale or a max-w-* cap. DESIGN.md §3, §8.3.',
  ],
  [
    '/(^|\\s)z-\\[/',
    'Arbitrary z-index escalates. Fix the stacking context instead. DESIGN.md §20.1.',
  ],
  ['/(^|\\s)!\\w[\\w-]*/', 'No !important. Add a cva variant instead. DESIGN.md §20.1.'],
  [
    '/(^|\\s)max-(sm|md|lg|xl):/',
    'Write mobile-first: base styles then sm:/md:/lg: upward. DESIGN.md §8.1.',
  ],
  [
    '/(^|\\s)(bg|text|border|ring|fill|stroke)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\\d{2,3}(\\s|$)/',
    'Use semantic tokens (bg-background, text-muted-foreground, ...), not palette colours. DESIGN.md §3.',
  ],
  ['/(^|\\s)(bg|text|border)-\\[#/', 'No hex colours. Use the tokens in DESIGN.md §3.'],
  [
    '/(^|\\s)overflow-x-(auto|scroll)/',
    'Horizontal scroll is a bug outside a documented data grid. Stack to cards below md. DESIGN.md §8.2.',
  ],
];

export default [
  { ignores: ['.next/**', 'node_modules/**', 'coverage/**', 'playwright-report/**'] },
  ...nextCoreWebVitals,
  ...nextTypescript,
  prettier,
  {
    rules: {
      // Import hygiene
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['../../*'], message: 'Use the @/ alias instead of deep relative imports.' },
            {
              group: ['@/features/*/*'],
              message: 'Import from a feature public API (@/features/<name>) only.',
            },
          ],
          paths: [
            {
              name: 'next/link',
              message: 'Use the locale-aware Link from @/i18n/navigation.',
            },
            {
              name: 'next/navigation',
              importNames: ['redirect', 'permanentRedirect', 'usePathname', 'useRouter'],
              message: 'Use the locale-aware helpers from @/i18n/navigation.',
            },
          ],
        },
      ],

      // Type safety
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // React correctness
      'react/no-array-index-key': 'error',
      'react/jsx-no-useless-fragment': 'error',
      'react/self-closing-comp': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],

      // UI guardrails — DESIGN.md
      'no-restricted-syntax': [
        'error',
        {
          selector: "JSXAttribute[name.name='style']",
          message: 'Use Tailwind tokens instead of inline styles. DESIGN.md §3.',
        },
        {
          selector: 'JSXText[value=/[A-Za-z]{4,}/]',
          message:
            'User-facing text belongs in messages/en.json. Render it with t(). DESIGN.md §19.',
        },
        ...restrictedClasses.map(([pattern, message]) => ({
          selector: `Literal[value=${pattern}]`,
          message,
        })),
      ],
    },
  },
  {
    // Root fallbacks render outside the locale provider; their copy is hardcoded
    // on purpose. Generated primitives are vendored.
    files: [
      'src/app/not-found.tsx',
      'src/app/global-error.tsx',
      'src/components/ui/**',
      // The restricted-class patterns above are themselves string literals.
      'eslint.config.mjs',
    ],
    rules: { 'no-restricted-syntax': 'off' },
  },
  {
    files: ['e2e/**', '**/*.test.{ts,tsx}', 'scripts/**'],
    rules: { 'no-restricted-syntax': 'off', 'no-console': 'off' },
  },
];
