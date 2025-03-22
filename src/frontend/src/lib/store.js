import { writable } from 'svelte/store';
import { logger } from './services/loggerService';

logger.debug('Initializing auth store in store.js');

export const authStore = writable({
  isLoggedIn: false,
  user: null,
  token: null,
  error: null,
  
  // Mock methods
  login: (email, password) => {
    logger.info('Login called from store', { email });
  },
  logout: () => {
    logger.info('Logout called from store');
  },
  register: (email, password, name) => {
    logger.info('Register called from store', { email, name });
  }
});
