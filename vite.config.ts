import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  // Library build configuration
  if (mode === 'lib') {
    return {
      plugins: [
        react(),
        dts({
          include: ['src/index.ts', 'src/components/**/*', 'src/hooks/**/*', 'src/utils/**/*'],
          exclude: ['src/main.tsx', 'src/App.tsx'],
          rollupTypes: true,
        }),
      ],
      build: {
        lib: {
          entry: resolve(__dirname, 'src/index.ts'),
          name: 'WysiwygEditor',
          fileName: 'wysiwyg-editor',
        },
        rollupOptions: {
          // Externalize peer dependencies
          external: ['react', 'react-dom', 'react/jsx-runtime'],
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM',
              'react/jsx-runtime': 'jsxRuntime',
            },
          },
        },
        cssCodeSplit: false,
        sourcemap: true,
      },
    }
  }

  // Development configuration
  return {
    plugins: [react()],
    server: {
      port: 3000,
      open: true,
    },
  }
})
