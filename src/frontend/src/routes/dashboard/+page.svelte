<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore } from '$lib/services/authService';
  import { dashboardService } from '$lib/services/dashboardService';
  import { goto } from '$app/navigation';
  
  let user = null;
  let dashboardData = [];
  let isLoading = true;
  
  onMount(async () => {
    // Subscribe to auth store to get current user
    const unsubscribe = authStore.subscribe(auth => {
      user = auth.user;
      if (!auth.isLoggedIn) {
        goto('/');
      }
    });
    
    // Get dashboard data
    try {
      dashboardData = await dashboardService.getUserDashboardData();
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      isLoading = false;
    }
    
    return unsubscribe;
  });
</script>

<svelte:head>
  <title>User Dashboard</title>
</svelte:head>

<div class="pt-24 pb-12 px-4 md:px-8">
  <div class="container mx-auto">
    {#if isLoading}
      <div class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-netflix-red"></div>
      </div>
    {:else}
      <div class="mb-8">
        <h1 class="text-3xl font-bold mb-2">Welcome, {user?.name || 'User'}!</h1>
        <p class="text-netflix-light-gray">Here's your personalized dashboard</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {#each dashboardData.stats || [] as stat}
          <div class="bg-netflix-dark-gray p-6 rounded-lg shadow-lg">
            <h3 class="text-xl font-semibold mb-2">{stat.title}</h3>
            <p class="text-3xl font-bold text-netflix-red">{stat.value}</p>
            <p class="text-netflix-light-gray mt-2">{stat.description}</p>
          </div>
        {/each}
      </div>
      
      <div class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Recent Activity</h2>
        
        {#if dashboardData.recentActivity?.length}
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
                {#each dashboardData.recentActivity as activity}
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
        {:else}
          <p class="text-netflix-light-gray">No recent activity to display.</p>
        {/if}
      </div>
      
      <div>
        <h2 class="text-2xl font-bold mb-4">Recommended Content</h2>
        
        {#if dashboardData.recommendedContent?.length}
          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {#each dashboardData.recommendedContent as content}
              <div class="bg-netflix-dark-gray rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300">
                <img src={content.imageUrl} alt={content.title} class="w-full h-40 object-cover" />
                <div class="p-3">
                  <h3 class="font-medium truncate">{content.title}</h3>
                  <p class="text-xs text-netflix-light-gray">{content.category}</p>
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <p class="text-netflix-light-gray">No recommended content to display.</p>
        {/if}
      </div>
    {/if}
  </div>
</div>
