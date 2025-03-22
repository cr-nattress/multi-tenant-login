import { writable, type Writable } from 'svelte/store';
import { logger } from './loggerService';
import type { User } from '../store';

// Define the AuthState interface (matches the one in store.ts)
interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  token: string | null;
  error: string | null;
}

// Define the MockUser interface (includes password which is not in the User interface)
interface MockUser extends User {
  password: string;
}

// Define the AuthStore interface
interface AuthStore {
  subscribe: Writable<AuthState>['subscribe'];
  login: (email: string, password: string) => boolean;
  loginWithGoogle: () => void;
  loginWithFacebook: () => void;
  register: (email: string, password: string, name: string) => boolean;
  logout: () => void;
  checkAuth: () => { subscribe: Writable<AuthState>['subscribe'] };
  clearError: () => void;
}

// Mock user data
const mockUsers: MockUser[] = [
  {
    id: '1',
    email: 'user@example.com',
    password: 'password123',  // In a real app, this would be hashed
    name: 'John Doe',
    role: 'user',
    googleId: null,
    facebookId: null
  },
  {
    id: '2',
    email: 'admin@example.com',
    password: 'admin123',  // In a real app, this would be hashed
    name: 'Admin User',
    role: 'admin',
    googleId: null,
    facebookId: null
  }
];

// Initial auth state
const initialState: AuthState = {
  isLoggedIn: false,
  user: null,
  token: null,
  error: null
};

// Create the auth store
const createAuthStore = (): AuthStore => {
  logger.debug('Initializing auth store');
  
  const store = writable<AuthState>(initialState);
  const { subscribe, set, update } = store;

  return {
    subscribe,
    
    // Login with email and password
    login: (email: string, password: string): boolean => {
      logger.info('Attempting login with credentials', { email });
      
      // Clear any previous errors
      update(state => ({ ...state, error: null }));
      
      // In a real app, this would make an API call
      const user = mockUsers.find(u => u.email === email && u.password === password);
      
      if (user) {
        logger.info('Login successful', { email });
        
        // Simulate successful login
        set({
          isLoggedIn: true,
          user: { ...user, password: undefined } as User,  // Remove password from user object
          token: 'mock-jwt-token',
          error: null
        });
        return true;
      } else {
        logger.warn('Login failed: Invalid credentials', { email });
        
        // Simulate failed login
        update(state => ({ ...state, error: 'Invalid email or password' }));
        return false;
      }
    },
    
    // Login with Google
    loginWithGoogle: (): void => {
      logger.info('Attempting login with Google');
      
      // Clear any previous errors
      update(state => ({ ...state, error: null }));
      
      // In a real app, this would redirect to Google OAuth
      console.log('Logging in with Google...');
      
      // Simulate successful Google login
      setTimeout(() => {
        logger.info('Google login successful');
        set({
          isLoggedIn: true,
          user: {
            id: '3',
            email: 'google@example.com',
            name: 'Google User',
            role: 'user' as const,
            googleId: 'google-123',
            facebookId: null
          },
          token: 'mock-google-jwt-token',
          error: null
        });
      }, 1000);
    },
    
    // Login with Facebook
    loginWithFacebook: (): void => {
      logger.info('Attempting login with Facebook');
      
      // Clear any previous errors
      update(state => ({ ...state, error: null }));
      
      // In a real app, this would redirect to Facebook OAuth
      console.log('Logging in with Facebook...');
      
      // Simulate successful Facebook login
      setTimeout(() => {
        logger.info('Facebook login successful');
        set({
          isLoggedIn: true,
          user: {
            id: '4',
            email: 'facebook@example.com',
            name: 'Facebook User',
            role: 'user' as const,
            googleId: null,
            facebookId: 'facebook-123'
          },
          token: 'mock-facebook-jwt-token',
          error: null
        });
      }, 1000);
    },
    
    // Register a new user
    register: (email: string, password: string, name: string): boolean => {
      logger.info('Attempting to register new user', { email });
      
      // Clear any previous errors
      update(state => ({ ...state, error: null }));
      
      // In a real app, this would make an API call
      const userExists = mockUsers.some(u => u.email === email);
      
      if (userExists) {
        logger.warn('Registration failed: Email already in use', { email });
        
        update(state => ({ ...state, error: 'Email already in use' }));
        return false;
      } else {
        // Simulate successful registration
        const newUser: MockUser = {
          id: String(mockUsers.length + 1),
          email,
          password,  // In a real app, this would be hashed
          name,
          role: 'user',
          googleId: null,
          facebookId: null
        };
        
        mockUsers.push(newUser);
        
        logger.info('Registration successful', { email });
        set({
          isLoggedIn: true,
          user: { ...newUser, password: undefined } as User,  // Remove password from user object
          token: 'mock-jwt-token',
          error: null
        });
        
        return true;
      }
    },
    
    // Logout
    logout: (): void => {
      logger.info('User logging out');
      // In a real app, this would clear tokens, cookies, etc.
      set(initialState);
    },
    
    // Check if user is authenticated
    checkAuth: () => {
      logger.debug('Checking authentication status');
      // In a real app, this would verify the JWT token
      // For now, we'll just return the current state
      return { subscribe };
    },
    
    // Clear any error messages
    clearError: (): void => {
      logger.debug('Clearing error messages');
      update(state => ({ ...state, error: null }));
    }
  };
};

// Export the auth store as a singleton
export const authStore = createAuthStore();
