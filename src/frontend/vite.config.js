import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  return {
    plugins: [sveltekit()],
    server: {
      port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
      strictPort: true // Fail if the port is already in use
    }
  };
});
