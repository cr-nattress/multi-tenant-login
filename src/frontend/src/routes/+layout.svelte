<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { authStore, type AuthState } from '../lib/store';
  import Logger from '$lib/components/Logger.svelte';
  import { logger } from '../lib/services/loggerService';
  
  let isLoggedIn: boolean = false;
  let isAdmin: boolean = false;
  let showLoginModal: boolean = false;
  
  // Subscribe to the auth store
  onMount(() => {
    logger.info('Layout component mounted');
    
    const unsubscribe = authStore.subscribe((auth: AuthState) => {
      isLoggedIn = auth.isLoggedIn;
      isAdmin = auth.user?.role === 'admin';
      logger.debug('Auth state updated', { isLoggedIn, isAdmin });
    });
    
    return () => {
      logger.debug('Layout component unmounting');
      unsubscribe();
    };
  });
  
  function toggleLoginModal(): void {
    logger.debug('Toggling login modal', { currentState: showLoginModal });
    showLoginModal = !showLoginModal;
  }
  
  function logout(): void {
    logger.info('User logging out');
    // Simple logout function
    authStore.update(state => ({ ...state, isLoggedIn: false, user: null }));
    window.location.href = '/';
  }
</script>

<header class="flex justify-between items-center p-4 absolute w-full z-10">
  <div class="flex items-center">
    <a href="/" class="text-netflix-red font-bold text-4xl">NETFLIX</a>
  </div>
  
  <div>
    {#if isLoggedIn}
      <div class="flex items-center gap-4">
        {#if isAdmin}
          <a href="/admin" class="text-white hover:text-netflix-red">Admin Dashboard</a>
        {/if}
        <a href="/dashboard" class="text-white hover:text-netflix-red">Dashboard</a>
        <button on:click={logout} class="btn-netflix">Sign Out</button>
      </div>
    {:else}
      <button on:click={toggleLoginModal} class="btn-netflix">Sign In</button>
    {/if}
  </div>
</header>

<main>
  <slot />
</main>

<footer class="bg-netflix-black text-netflix-light-gray p-8 mt-8">
  <div class="container mx-auto">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
      <div>
        <h3 class="text-lg mb-4">Questions? Contact us.</h3>
        <ul>
          <li class="mb-2"><a href="#" class="hover:underline">FAQ</a></li>
          <li class="mb-2"><a href="#" class="hover:underline">Investor Relations</a></li>
          <li class="mb-2"><a href="#" class="hover:underline">Privacy</a></li>
          <li class="mb-2"><a href="#" class="hover:underline">Speed Test</a></li>
        </ul>
      </div>
      <div>
        <h3 class="text-lg mb-4">Help Center</h3>
        <ul>
          <li class="mb-2"><a href="#" class="hover:underline">Jobs</a></li>
          <li class="mb-2"><a href="#" class="hover:underline">Cookie Preferences</a></li>
          <li class="mb-2"><a href="#" class="hover:underline">Legal Notices</a></li>
        </ul>
      </div>
      <div>
        <h3 class="text-lg mb-4">Account</h3>
        <ul>
          <li class="mb-2"><a href="#" class="hover:underline">Ways to Watch</a></li>
          <li class="mb-2"><a href="#" class="hover:underline">Corporate Information</a></li>
          <li class="mb-2"><a href="#" class="hover:underline">Only on Netflix</a></li>
        </ul>
      </div>
      <div>
        <h3 class="text-lg mb-4">Media Center</h3>
        <ul>
          <li class="mb-2"><a href="#" class="hover:underline">Terms of Use</a></li>
          <li class="mb-2"><a href="#" class="hover:underline">Contact Us</a></li>
        </ul>
      </div>
    </div>
    <div class="mt-8 text-center">
      <p>&#xa9; 2025 Netflix-Inspired App. All rights reserved.</p>
    </div>
  </div>
</footer>

{#if showLoginModal}
  <div class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
    <div class="bg-netflix-dark-gray p-8 rounded-lg w-full max-w-md">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">Sign In</h2>
        <button on:click={toggleLoginModal} class="text-netflix-light-gray hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <!-- Login Form Placeholder - Will be replaced with LoginModal component -->
      <div class="space-y-4">
        <button 
          class="w-full btn bg-blue-600 hover:bg-blue-700 text-white py-3 rounded flex items-center justify-center gap-2"
          on:click={() => {
            logger.info('User attempting to sign in with Google');
            // In a real app, this would trigger Google OAuth
          }}
        >
          <span>Sign in with Google</span>
        </button>
        <button 
          class="w-full btn bg-blue-800 hover:bg-blue-900 text-white py-3 rounded flex items-center justify-center gap-2"
          on:click={() => {
            logger.info('User attempting to sign in with Facebook');
            // In a real app, this would trigger Facebook OAuth
          }}
        >
          <span>Sign in with Facebook</span>
        </button>
        <div class="relative my-4">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-600"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-netflix-dark-gray text-netflix-light-gray">Or</span>
          </div>
        </div>
        <form 
          class="space-y-4"
          on:submit|preventDefault={() => {
            logger.info('User attempting to sign in with email/password');
            // In a real app, this would validate and submit the form
          }}
        >
          <div>
            <input type="email" placeholder="Email" class="w-full p-3 bg-gray-700 text-white rounded" />
          </div>
          <div>
            <input type="password" placeholder="Password" class="w-full p-3 bg-gray-700 text-white rounded" />
          </div>
          <button type="submit" class="w-full btn-netflix">Sign In</button>
        </form>
      </div>
    </div>
  </div>
{/if}

<!-- Include the Logger component -->
<Logger />
