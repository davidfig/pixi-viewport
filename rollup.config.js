import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import { terser } from 'rollup-plugin-terser'
import { babel } from '@rollup/plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

export default [
    {
        input: 'src/Viewport.ts',
        plugins: [
            peerDepsExternal(),
            resolve(
                {
                    preferBuiltins: false
                }),
            commonjs(),
            terser(),
            babel({
                babelHelpers: 'bundled',
                presets: ['@babel/preset-env']
            }),
        ],
        output:
        {
            file: 'dist/Viewport.ts',
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
        input: 'src/Viewport.ts',
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