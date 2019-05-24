import { terser } from 'rollup-plugin-terser'
import autoExternal from 'rollup-plugin-auto-external'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

export default [
    {
        input: 'src/viewport.js',
        plugins: [
            resolve(),
            commonjs(),
            terser()
        ],
        output:
        {
            file: 'dist/viewport.js',
            format: 'umd',
            name: 'Viewport',
            esModule: false
        }
    },
    {
        input: 'src/viewport.js',
        plugins: [
            resolve(),
            commonjs()
        ],
        output:
        {
            file: 'dist/viewport.es.js',
            format: 'esm'
        }
    }
]