import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_', // function params: (_req, res)
          varsIgnorePattern: '^_', // variables: const _unused = ...
          caughtErrorsIgnorePattern: '^_', // catch (_err) {}
          destructuredArrayIgnorePattern: '^_', // const [_first, second] = arr
          ignoreRestSiblings: true, // const { password, ...safe } = user
        },
      ],
    },
  },
  prettier, // keep last
);
