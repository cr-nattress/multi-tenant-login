import { writable } from 'svelte/store';
import { logger } from './services/loggerService';

logger.debug('Initializing auth store in store.ts');

// Define the User interface
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  googleId: string | null;
  facebookId: string | null;
}

// Define the AuthState interface
export interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  token: string | null;
  error: string | null;
  login: (email: string, password: string) => void;
  logout: () => void;
  register: (email: string, password: string, name: string) => void;
}

// Create the auth store with proper typing
export const authStore = writable<AuthState>({
  isLoggedIn: false,
  user: null,
  token: null,
  error: null,
  
  // Mock methods
  login: (email: string, password: string) => {
    logger.info('Login called from store', { email });
  },
  logout: () => {
    logger.info('Logout called from store');
  },
  register: (email: string, password: string, name: string) => {
    logger.info('Register called from store', { email, name });
  }
});
