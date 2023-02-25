// vite.config.js
import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

const globals = {
    '@pixi/core': 'PIXI',
    '@pixi/display': 'PIXI',
    '@pixi/events': 'PIXI',
    '@pixi/math': 'PIXI',
    '@pixi/ticker': 'PIXI',
};

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'pixi_viewport',
            fileName: 'pixi_viewport',
        },
        rollupOptions: {
            external: [
                'pixi.js',
                ...Object.keys(globals),
            ],
            output: {
                globals
            },
        },
    },
    plugins: [dts()]
});
