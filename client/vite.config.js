import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false,
            },
        },
    },
    build: {
        minify: 'esbuild',
        sourcemap: false,
        target: 'es2015',
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom'],
                    antd: ['antd', '@ant-design/icons'],
                    router: ['react-router-dom'],
                    ui: ['framer-motion', 'lucide-react'],
                    utils: ['axios', 'date-fns', 'clsx', 'tailwind-merge'],
                    state: ['zustand', 'react-query'],
                    forms: ['react-hook-form'],
                },
                chunkFileNames: 'assets/[name]-[hash].js',
                entryFileNames: 'assets/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash].[ext]'
            },
        },
        chunkSizeWarningLimit: 1000,
        cssCodeSplit: true,
    },
    optimizeDeps: {
        include: ['react', 'react-dom', 'antd'],
    },
})
