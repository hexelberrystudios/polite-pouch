import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import uglify from 'rollup-plugin-uglify';
import nodeResolve from 'rollup-plugin-node-resolve';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';

let plugins = [
  babel({
    babelrc: true, // rollup needs it's own preset.
    presets: ['es2015-rollup'],
    exclude: 'node_modules/**',
  }),
  nodeResolve({ browser: true, jsnext: true }),
  commonjs(),
  builtins(),
  globals()
];

let prodPlugins = [uglify(), ...plugins];

export default {
  entry: 'index.js',
  input: 'index.js',
  output: [
    {
      file: 'dist/polite-pouch-es6.js',
      format: 'es',
      name: 'politePouch',
      external: ['uuid', 'crypto', 'PouchDB']
    },
    {
      file: 'dist/polite-pouch-es5.js',
      format: 'iife',
      name: 'politePouch',
      external: ['uuid', 'crypto', 'PouchDB']
    }
  ],
  plugins
};
/*
export default [{
  input: 'index.js',
  output: [
    {
      file: 'dist/polite-pouch-es6.js',
      format: 'es6',
      moduleName: 'politePouch'
    },
    {
      file: 'dist/polite-pouch-es5.js',
      format: 'iife',
      moduleName: 'politePouch'
    }
  ],
  plugins
}, {
  input: 'index.js',
  output: [
    {
      file: 'dist/polite-pouch.min.js',
      format: 'iife',
      moduleName: 'politePouch'
    }
  ],
  prodPlugins
}];
*/