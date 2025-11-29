import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  server: {
    host: '0.0.0.0',  // This allows external access
    port: 5173,
    strictPort: false,
    // allowedHosts: [
    //   'annett-orthopterous-unmorbidly.ngrok-free.dev',
    //   'localhost',
    //   '127.0.0.1',
    //   '*'
    // ],
    // hmr: {
    //   host: 'annett-orthopterous-unmorbidly.ngrok-free.dev'
    // }
  }
})
