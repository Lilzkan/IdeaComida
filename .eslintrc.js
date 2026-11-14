module.exports = {
  extends: 'expo',
  ignorePatterns: ['/dist/*', '/node_modules/*', '/.expo/*'],
  settings: {
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
};
