const tsPlugin = require('@typescript-eslint/eslint-plugin')
const tsParser = require('@typescript-eslint/parser')
const prettierPlugin = require('eslint-plugin-prettier')
const importPlugin = require('eslint-plugin-import')

module.exports = [
    {
        files: ['**/*.ts'], // Include all TypeScript files
        ignores: ['node_modules/**', 'dist/**', '.history/**'], // Exclude unnecessary files
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                tsconfigRootDir: __dirname,
                project: './tsconfig.eslint.json',
                sourceType: 'module',
                ecmaVersion: 'latest',
            },
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
            prettier: prettierPlugin,
            import: importPlugin,
        },
        rules: {
            ...tsPlugin.configs.recommended.rules,
            'prettier/prettier': 'error',
            '@typescript-eslint/interface-name-prefix': 'off',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-var-requires': 'off',

            // Enforce organized imports
            'import/order': [
                'error',
                {
                    'groups': [
                        'builtin', // Built-in modules (fs, path)
                        'external', // External packages
                        'internal', // Internal modules
                        ['parent', 'sibling', 'index'], // Relative imports
                    ],
                    'newlines-between': 'always', // Add newline between groups
                    'alphabetize': {
                        'order': 'asc', // Sort imports alphabetically
                        'caseInsensitive': true, // Ignore case sensitivity
                    },
                },
            ],
        },
    },
    {
        files: ['src/ui/generated-types.ts'], // Target only the generated file
        rules: {
            '@typescript-eslint/no-namespace': 'off', // Disable namespace rule for this file
        },
    },
]
