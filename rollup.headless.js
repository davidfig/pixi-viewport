import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import globals from 'rollup-plugin-node-globals'
import json from 'rollup-plugin-json'

export default
{
    input: 'test/headless/code.js',
    plugins: [
        json(),
        resolve(
        {
            browser: true,
            preferBuiltins: false
        }),
        commonjs(),
        globals(),
    ],
    output:
    {
        file: 'test/headless.js',
        format: 'esm',
        name: 'test',
        sourcemap: true
    }
}