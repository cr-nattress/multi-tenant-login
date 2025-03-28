// @ts-check
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Enable TypeScript preprocessing
	preprocess: vitePreprocess({
		typescript: true
	}),
	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter(),
		alias: {
			'$lib': './src/lib',
			'$components': './src/lib/components',
			'$services': './src/lib/services'
		}
	}
};

export default config;
