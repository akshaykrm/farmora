import { defineConfig } from 'vitest/config'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@routes': path.join(root, 'src/routes'),
      '@utils': path.join(root, 'src/utils'),
      '@controllers': path.join(root, 'src/controllers'),
      '@middlewares': path.join(root, 'src/middlewares'),
      '@validators': path.join(root, 'src/validators'),
      '@models': path.join(root, 'models'),
      '@services': path.join(root, 'src/services'),
      '@errors': path.join(root, 'src/errors'),
    },
  },
  test: {
    reporters: ['dot'],
    silent: true,
  },
})
