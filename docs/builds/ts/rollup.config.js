import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import builtins from '@joseph184/rollup-plugin-node-builtins'
import globals from 'rollup-plugin-node-globals'
import sucrase from '@rollup/plugin-sucrase'

export default {
    input: 'docs/builds/ts/code.ts',
    plugins: [
        sucrase({
            include: ["**/*.ts"],
            transforms: ['typescript']
        }),
        builtins(),
        resolve({
            preferBuiltins: false,
            browser: true
        }),
        commonjs(),
        globals()
    ],
    output: {
        file: 'docs/builds/ts/index.js',
        format: 'iife',
        sourcemap: true
    }
}