import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';

let plugins = [
  babel({
    exclude: 'node_modules/**',
  }),
  commonjs()
];

export default [{
  input: 'index.js',
  output: [
    {
      file: 'dist/polite-pouch-es5.js',
      format: 'iife',
      name: 'politePouch',
      globals: {
        'uuid/v5': 'uuid/v5',
        crypto: 'crypto'
      }
    },
    {
      file: 'dist/polite-pouch.js',
      format: 'es',
      name: 'politePouch'
    }
  ],
  external: ['uuid', 'uuid/v5', 'crypto', 'PouchDB'],
  plugins
}];
