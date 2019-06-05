import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import { terser } from 'rollup-plugin-terser'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import builtins from 'rollup-plugin-node-builtins'
import globals from 'rollup-plugin-node-globals'

export default [
    {
        input: 'src/viewport.js',
        plugins: [
            peerDepsExternal(),
            resolve({
                preferBuiltins: false
            }),
            commonjs(),
            terser()
        ],
        output:
        {
            file: 'dist/viewport.js',
            format: 'umd',
            name: 'Viewport',
            sourcemap: true
        }
    },
    {
        input: 'src/viewport.js',
        plugins: [
            peerDepsExternal(),
            resolve({
                preferBuiltins: false
            }),
            commonjs()
        ],
        output:
        {
            file: 'dist/viewport.es.js',
            format: 'esm',
            sourcemap: true
        }
    },
    {
        input: 'docs/rollup/code.js',
        plugins: [
            builtins(),
            resolve({
                preferBuiltins: false,
                browser: true
            }),
            commonjs({
                namedExports: {
                    'resource-loader': [ 'Resource' ]
                }
            }),
            globals()
        ],
        output:
        {
            file: 'docs/rollup/index.js',
            format: 'iife',
            sourcemap: true
        }
    }
]