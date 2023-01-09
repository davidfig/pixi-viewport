// vite.config.js
import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'pixi-viewport',
            fileName: 'pixi-viewport',
        },
        rollupOptions: {
            external: [
                'pixi.js',
                '@pixi/core',
                '@pixi/display',
                '@pixi/events',
                '@pixi/math',
                '@pixi/ticker'
            ],
        },
    },
    plugins: [dts()]
});
