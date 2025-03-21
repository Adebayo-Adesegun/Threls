module.exports = {
    env: {
        node: true,
        es2021: true,
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
    },
    extends: [
        'airbnb-base',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
    ],
    plugins: ['@typescript-eslint', 'prettier'],
    rules: {
        'prettier/prettier': ['error'],
        '@typescript-eslint/no-unused-vars': ['warn'],
        '@typescript-eslint/explicit-function-return-type': 'off',
        'import/extensions': 'off',
        'import/no-unresolved': 'off',
        'no-console': 'warn',
        'class-methods-use-this': 'off',
        'no-underscore-dangle': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/ban-ts-comment': 'off',
    },
    overrides: [
        {
            files: ['*.ts'],
            rules: {
                'no-undef': 'off',
            },
        },
    ],
};
