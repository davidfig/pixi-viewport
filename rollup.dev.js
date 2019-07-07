import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import serve from 'rollup-plugin-serve'
import builtins from '@joseph184/rollup-plugin-node-builtins'
import globals from 'rollup-plugin-node-globals'

export default
{
    input: 'docs/code.js',
    plugins: [
        builtins(),
        resolve(
        {
            browser: true,
            preferBuiltins: false
        }),
        commonjs(
        {
            namedExports:
            {
                'resource-loader': ['Resource']
            }
        }),
        globals(),
        serve(
        {
            contentBase: 'docs',
            verbose: true
        })
    ],
    output:
    {
        file: 'docs/index.js',
        format: 'iife',
        sourcemap: true
    }
}