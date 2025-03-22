import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';

const config: UserConfig = {
  plugins: [sveltekit()],
  server: {
    port: 3000,          // explicit port
    strictPort: true,    // fail if port is already in use
    hmr: {
      protocol: 'ws',    // websocket protocol
      host: 'localhost', // ensure this matches your setup
    }
  }
};

export default config;
