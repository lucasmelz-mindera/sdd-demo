/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
const base = '/sdd-demo/'

export default defineConfig({
  base,
  plugins: [react()],
  test: {
    environment: 'node',
    // Vitest serves from '/', so pin BASE_URL to what the build uses.
    env: { BASE_URL: base },
  },
})
