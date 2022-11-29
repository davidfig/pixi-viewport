import { defineConfig } from 'vite';

export default defineConfig({
    root: 'docs/',
    build: {
        outDir: 'dist/original/',
        emptyOutDir: true,
        copyPublicDir: false,
        chunkSizeWarningLimit: 1000,
    },
});
