<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore } from '$lib/services/authService';
  import { dashboardService } from '$lib/services/dashboardService';
  import { goto } from '$app/navigation';
  
  let user = null;
  let adminData = null;
  let isLoading = true;
  let activeTab = 'overview';
  
  onMount(async () => {
    // Subscribe to auth store to get current user
    const unsubscribe = authStore.subscribe(auth => {
      user = auth.user;
      
      // Redirect if not logged in or not an admin
      if (!auth.isLoggedIn || auth.user?.role !== 'admin') {
        goto('/');
      }
    });
    
    // Get admin dashboard data
    try {
      adminData = await dashboardService.getAdminDashboardData();
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      isLoading = false;
    }
    
    return unsubscribe;
  });
  
  function setActiveTab(tab) {
    activeTab = tab;
  }
</script>

<svelte:head>
  <title>Admin Dashboard</title>
</svelte:head>

<div class="pt-24 pb-12 px-4 md:px-8">
  <div class="container mx-auto">
    {#if isLoading}
      <div class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-netflix-red"></div>
      </div>
    {:else}
      <div class="mb-8">
        <h1 class="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p class="text-netflix-light-gray">Manage your platform</p>
      </div>
      
      <!-- Admin Navigation Tabs -->
      <div class="mb-8 border-b border-gray-700">
        <nav class="flex space-x-8">
          <button 
            class="py-4 px-1 font-medium text-sm border-b-2 {activeTab === 'overview' ? 'border-netflix-red text-white' : 'border-transparent text-netflix-light-gray hover:text-white'}"
            on:click={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            class="py-4 px-1 font-medium text-sm border-b-2 {activeTab === 'users' ? 'border-netflix-red text-white' : 'border-transparent text-netflix-light-gray hover:text-white'}"
            on:click={() => setActiveTab('users')}
          >
            Users
          </button>
          <button 
            class="py-4 px-1 font-medium text-sm border-b-2 {activeTab === 'content' ? 'border-netflix-red text-white' : 'border-transparent text-netflix-light-gray hover:text-white'}"
            on:click={() => setActiveTab('content')}
          >
            Content
          </button>
          <button 
            class="py-4 px-1 font-medium text-sm border-b-2 {activeTab === 'analytics' ? 'border-netflix-red text-white' : 'border-transparent text-netflix-light-gray hover:text-white'}"
            on:click={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
          <button 
            class="py-4 px-1 font-medium text-sm border-b-2 {activeTab === 'settings' ? 'border-netflix-red text-white' : 'border-transparent text-netflix-light-gray hover:text-white'}"
            on:click={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </nav>
      </div>
      
      <!-- Tab Content -->
      {#if activeTab === 'overview'}
        <div>
          <!-- Revenue Stats -->
          <div class="mb-8">
            <h2 class="text-2xl font-bold mb-4">Revenue Overview</h2>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div class="bg-netflix-dark-gray p-6 rounded-lg shadow-lg">
                <h3 class="text-lg font-semibold mb-2">Current Month</h3>
                <p class="text-3xl font-bold text-netflix-red">{adminData.revenueData.currentMonth}</p>
                <p class="text-netflix-light-gray mt-2 text-sm">Revenue</p>
              </div>
              <div class="bg-netflix-dark-gray p-6 rounded-lg shadow-lg">
                <h3 class="text-lg font-semibold mb-2">Previous Month</h3>
                <p class="text-3xl font-bold text-netflix-red">{adminData.revenueData.previousMonth}</p>
                <p class="text-netflix-light-gray mt-2 text-sm">Revenue</p>
              </div>
              <div class="bg-netflix-dark-gray p-6 rounded-lg shadow-lg">
                <h3 class="text-lg font-semibold mb-2">Year to Date</h3>
                <p class="text-3xl font-bold text-netflix-red">{adminData.revenueData.yearToDate}</p>
                <p class="text-netflix-light-gray mt-2 text-sm">Total Revenue</p>
              </div>
              <div class="bg-netflix-dark-gray p-6 rounded-lg shadow-lg">
                <h3 class="text-lg font-semibold mb-2">Growth</h3>
                <p class="text-3xl font-bold text-green-500">{adminData.revenueData.percentageChange}</p>
                <p class="text-netflix-light-gray mt-2 text-sm">Month over Month</p>
              </div>
            </div>
          </div>
          
          <!-- User Stats -->
          <div class="mb-8">
            <h2 class="text-2xl font-bold mb-4">User Statistics</h2>
            <div class="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div class="bg-netflix-dark-gray p-6 rounded-lg shadow-lg">
                <h3 class="text-lg font-semibold mb-2">Total Users</h3>
                <p class="text-3xl font-bold text-netflix-red">{adminData.userStats.totalUsers}</p>
              </div>
              <div class="bg-netflix-dark-gray p-6 rounded-lg shadow-lg">
                <h3 class="text-lg font-semibold mb-2">Active Users</h3>
                <p class="text-3xl font-bold text-netflix-red">{adminData.userStats.activeUsers}</p>
              </div>
              <div class="bg-netflix-dark-gray p-6 rounded-lg shadow-lg">
                <h3 class="text-lg font-semibold mb-2">Premium</h3>
                <p class="text-3xl font-bold text-netflix-red">{adminData.userStats.premiumUsers}</p>
              </div>
              <div class="bg-netflix-dark-gray p-6 rounded-lg shadow-lg">
                <h3 class="text-lg font-semibold mb-2">Standard</h3>
                <p class="text-3xl font-bold text-netflix-red">{adminData.userStats.standardUsers}</p>
              </div>
              <div class="bg-netflix-dark-gray p-6 rounded-lg shadow-lg">
                <h3 class="text-lg font-semibold mb-2">Basic</h3>
                <p class="text-3xl font-bold text-netflix-red">{adminData.userStats.basicUsers}</p>
              </div>
            </div>
          </div>
          
          <!-- Recent Activity -->
          <div>
            <h2 class="text-2xl font-bold mb-4">Recent Activity</h2>
            
            <div class="bg-netflix-dark-gray rounded-lg overflow-hidden">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-gray-700">
                    <th class="p-4 text-left">Date</th>
                    <th class="p-4 text-left">Activity</th>
                    <th class="p-4 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {#each adminData.recentActivity as activity}
                    <tr class="border-b border-gray-700 hover:bg-gray-800">
                      <td class="p-4">{activity.date}</td>
                      <td class="p-4">{activity.description}</td>
                      <td class="p-4">
                        <span class="px-2 py-1 rounded-full text-xs font-medium
                          {activity.status === 'Completed' ? 'bg-green-900 text-green-200' : 
                           activity.status === 'Pending' ? 'bg-yellow-900 text-yellow-200' : 
                           'bg-red-900 text-red-200'}"
                        >
                          {activity.status}
                        </span>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      {:else if activeTab === 'users'}
        <div>
          <h2 class="text-2xl font-bold mb-4">User Management</h2>
          <p class="text-netflix-light-gray mb-8">This tab would contain user management functionality in a real application.</p>
          
          <div class="bg-netflix-dark-gray p-6 rounded-lg">
            <p>Features would include:</p>
            <ul class="list-disc pl-5 mt-2 space-y-2">
              <li>User search and filtering</li>
              <li>User profile management</li>
              <li>Subscription management</li>
              <li>User permissions and roles</li>
              <li>Account status (active/suspended)</li>
            </ul>
          </div>
        </div>
      {:else if activeTab === 'content'}
        <div>
          <h2 class="text-2xl font-bold mb-4">Content Management</h2>
          <p class="text-netflix-light-gray mb-8">This tab would contain content management functionality in a real application.</p>
          
          <div class="bg-netflix-dark-gray p-6 rounded-lg">
            <p>Features would include:</p>
            <ul class="list-disc pl-5 mt-2 space-y-2">
              <li>Content upload and management</li>
              <li>Category and tag management</li>
              <li>Featured content selection</li>
              <li>Content analytics</li>
              <li>Content moderation</li>
            </ul>
          </div>
        </div>
      {:else if activeTab === 'analytics'}
        <div>
          <h2 class="text-2xl font-bold mb-4">Analytics Dashboard</h2>
          <p class="text-netflix-light-gray mb-8">This tab would contain detailed analytics in a real application.</p>
          
          <div class="bg-netflix-dark-gray p-6 rounded-lg">
            <p>Features would include:</p>
            <ul class="list-disc pl-5 mt-2 space-y-2">
              <li>User engagement metrics</li>
              <li>Content performance analytics</li>
              <li>Revenue and subscription analytics</li>
              <li>Geographic distribution of users</li>
              <li>Custom reports and exports</li>
            </ul>
          </div>
        </div>
      {:else if activeTab === 'settings'}
        <div>
          <h2 class="text-2xl font-bold mb-4">Platform Settings</h2>
          <p class="text-netflix-light-gray mb-8">This tab would contain platform settings in a real application.</p>
          
          <div class="bg-netflix-dark-gray p-6 rounded-lg">
            <p>Features would include:</p>
            <ul class="list-disc pl-5 mt-2 space-y-2">
              <li>Authentication settings</li>
              <li>Email templates and notifications</li>
              <li>API keys and integrations</li>
              <li>Billing and payment settings</li>
              <li>System maintenance options</li>
            </ul>
          </div>
        </div>
      {/if}
    {/if}
  </div>
</div>
