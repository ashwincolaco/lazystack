import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so the build works whether served at the domain root or at
// ashwincolaco.github.io/lazystack (GitHub Pages project site).
export default defineConfig({
  plugins: [react()],
  base: './',
})
