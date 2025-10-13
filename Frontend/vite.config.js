import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import copy from 'rollup-plugin-copy'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    copy({
      targets: [
        { src: './staticwebapp.config.json', dest: 'dist' }
      ],
      hook: 'writeBundle'
    })
  ],
})
