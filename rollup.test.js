import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import serve from 'rollup-plugin-serve'
import builtins from 'rollup-plugin-node-builtins'
import globals from 'rollup-plugin-node-globals'
import json from 'rollup-plugin-json'

export default
{
    input: 'test/viewport.test.js',
    plugins: [
        builtins(),
        json(),
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
            contentBase: 'test',
            verbose: true
        })
    ],
    output:
    {
        file: 'test/index.js',
        format: 'iife',
        name: 'test',
        sourcemap: true,
    }
}