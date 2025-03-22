<script lang="ts">
  import { onMount } from 'svelte';
  import { logger } from '../lib/services/loggerService';
  
  let email = '';
  let showLoginModal = false;
  let activeQuestion = -1;
  
  function toggleLoginModal() {
    showLoginModal = !showLoginModal;
  }
  
  function handleGetStarted() {
    logger.info('User clicked Get Started button', { email });
    if (email) {
      // In a real app, this would navigate to sign up page or trigger modal
      toggleLoginModal();
    }
  }
  
  function toggleQuestion(index) {
    logger.debug('FAQ question toggled', { index, previousState: activeQuestion });
    activeQuestion = activeQuestion === index ? -1 : index;
  }
  
  // FAQ data
  const faqItems = [
    {
      question: 'What is this application?',
      answer: 'This is a Netflix-inspired multi-tenant login application with logging capabilities.'
    },
    {
      question: 'How does the logging system work?',
      answer: 'The application uses a custom logging service that captures events at different severity levels (debug, info, warn, error) and displays them in a UI component.'
    },
    {
      question: 'What content is available?',
      answer: 'Our application offers a wide variety of award-winning content, including documentaries, films, and TV series.'
    },
    {
      question: 'How much does it cost?',
      answer: 'The basic plan starts at $8.99 per month. Our standard plan is $13.99 per month, and our premium plan is $17.99 per month.'
    },
    {
      question: 'Where can I watch?',
      answer: 'Watch anywhere, anytime. Sign in with your account to watch instantly on the web from your personal computer or on any internet-connected device.'
    },
    {
      question: 'How do I cancel?',
      answer: 'Our platform is flexible. There are no pesky contracts and no commitments. You can easily cancel your account online in two clicks.'
    },
    {
      question: 'What can I watch?',
      answer: 'Our application offers a wide variety of award-winning content, including documentaries, films, and TV series.'
    }
  ];
  
  onMount(() => {
    // Test various log levels
    logger.debug('Debug message from home page');
    logger.info('Info message from home page');
    logger.warn('Warning message from home page', { source: 'HomePage', timestamp: new Date() });
    logger.error('Error message from home page', { errorCode: 'TEST-001' });
    
    // Log that the component was mounted
    logger.info('Home page component mounted');
  });
  
  function testLogging() {
    logger.info('User clicked the test logging button');
    logger.debug('Test logging function called', { buttonClicked: true });
  }
</script>

<svelte:head>
  <title>Netflix-Inspired App</title>
</svelte:head>

<!-- Hero Section -->
<div class="min-h-screen flex flex-col">
  <section class="relative h-screen flex items-center justify-center hero-gradient">
    <div class="absolute inset-0 z-0">
      <img 
        src="https://assets.nflxext.com/ffe/siteui/vlv3/9c5457b8-9ab0-4a04-9fc1-e608d5670f1a/710d74e0-7158-408e-8d9b-23c219dee5df/US-en-20210719-popsignuptwoweeks-perspective_alpha_website_small.jpg" 
        alt="Background" 
        class="w-full h-full object-cover opacity-60"
      />
    </div>
    
    <div class="z-10 text-center px-6 max-w-3xl">
      <h1 class="text-5xl md:text-6xl font-bold mb-4">Unlimited movies, TV shows, and more.</h1>
      <p class="text-xl md:text-2xl mb-8">Watch anywhere. Cancel anytime.</p>
      <button class="btn-netflix text-xl" on:click={testLogging}>Test Logging</button>
    </div>
  </section>
  
  <!-- Features Section -->
  <section class="py-16 bg-netflix-black">
    <div class="container mx-auto px-6">
      <div class="flex flex-col md:flex-row items-center justify-between mb-16">
        <div class="md:w-1/2 mb-8 md:mb-0">
          <h2 class="text-4xl font-bold mb-4">Enjoy on your TV.</h2>
          <p class="text-xl">Watch on Smart TVs, Playstation, Xbox, Chromecast, Apple TV, Blu-ray players, and more.</p>
        </div>
        <div class="md:w-1/2">
          <div class="relative">
            <img src="https://assets.nflxext.com/ffe/siteui/acquisition/ourStory/fuji/desktop/tv.png" alt="TV" class="relative z-10" />
            <div class="absolute top-[20%] left-[13%] right-[13%] bottom-[20%] z-0 bg-netflix-black">
              <video class="w-full h-full" autoplay playsinline muted loop>
                <source src="https://assets.nflxext.com/ffe/siteui/acquisition/ourStory/fuji/desktop/video-tv-0819.m4v" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      </div>
      
      <div class="flex flex-col md:flex-row-reverse items-center justify-between">
        <div class="md:w-1/2 mb-8 md:mb-0">
          <h2 class="text-4xl font-bold mb-4">Download your shows to watch offline.</h2>
          <p class="text-xl">Save your favorites easily and always have something to watch.</p>
        </div>
        <div class="md:w-1/2">
          <img src="https://assets.nflxext.com/ffe/siteui/acquisition/ourStory/fuji/desktop/mobile-0819.jpg" alt="Mobile" />
        </div>
      </div>
    </div>
  </section>
  
  <!-- FAQ Section -->
  <section class="py-16 border-b-8 border-gray-800">
    <div class="container mx-auto px-4 max-w-4xl">
      <h2 class="text-3xl md:text-5xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
      
      <div class="space-y-4">
        {#each faqItems as item, index}
          <div class="bg-netflix-dark-gray">
            <button 
              on:click={() => toggleQuestion(index)} 
              class="w-full p-5 text-left text-xl flex justify-between items-center focus:outline-none"
            >
              <span>{item.question}</span>
              <span class="transform transition-transform duration-300 {activeQuestion === index ? 'rotate-45' : ''}">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </span>
            </button>
            
            {#if activeQuestion === index}
              <div class="p-5 border-t border-gray-700 text-lg">
                {item.answer}
              </div>
            {/if}
          </div>
        {/each}
      </div>
      
      <div class="mt-12 text-center">
        <p class="text-lg md:text-xl mb-6">Ready to watch? Enter your email to create or restart your membership.</p>
        <div class="flex flex-col md:flex-row gap-2 justify-center">
          <input 
            type="email" 
            bind:value={email} 
            placeholder="Email address" 
            class="p-4 w-full md:w-96 text-black rounded-md"
          />
          <button on:click={handleGetStarted} class="btn-netflix text-lg">Get Started &rarr;</button>
        </div>
      </div>
    </div>
  </section>
</div>
