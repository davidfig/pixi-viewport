import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import { terser } from 'rollup-plugin-terser'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

export default [
{
    input: 'src/viewport.js',
    plugins: [
        peerDepsExternal(),
        resolve(
        {
            preferBuiltins: false
        }),
        commonjs(),
        terser()
    ],
    output:
    {
        file: 'dist/viewport.js',
        globals:
        {
            'pixi.js': 'PIXI'
        },
        format: 'umd',
        name: 'Viewport',
        sourcemap: true
    }
},
{
    input: 'src/viewport.js',
    plugins: [
        peerDepsExternal(),
        resolve(
        {
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
}]