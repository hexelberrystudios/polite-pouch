import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import uglify from 'rollup-plugin-uglify';

let plugins = [
  babel({
    babelrc: true, // rollup needs it's own preset.
    presets: ['es2015-rollup'],
    exclude: 'node_modules/**',
  }),
  commonjs()
];

let prodPlugins = [uglify(), ...plugins];

export default [{
  entry: 'index.js',
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
      file: 'dist/polite-pouch-es6.js',
      format: 'es',
      name: 'politePouch'
    }
  ],
  external: ['uuid', 'uuid/v5', 'crypto', 'PouchDB'],
  plugins
}, {
  entry: 'index.js',
  input: 'index.js',
  output: [
    {
      file: 'dist/polite-pouch.min.js',
      format: 'iife',
      name: 'politePouch',
      globals: {
        'uuid/v5': 'uuid/v5',
        crypto: 'crypto'
      }
    }
  ],
  external: ['uuid', 'uuid/v5', 'crypto', 'PouchDB'],
  plugins: prodPlugins
}];
