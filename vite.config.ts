import { defineConfig } from 'vite';

export default defineConfig({
    base: './',
    root: 'docs/',
    build: {
        outDir: 'dist/original/',
        emptyOutDir: true,
        copyPublicDir: false,
        chunkSizeWarningLimit: 1000,
    },
});
