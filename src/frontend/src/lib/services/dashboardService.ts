// Mock dashboard data service

// Helper function to generate random dates within the last 30 days
const getRandomRecentDate = () => {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 30);
  const date = new Date(now.setDate(now.getDate() - daysAgo));
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// Mock dashboard data
const mockDashboardData = {
  stats: [
    {
      title: 'Watchlist Items',
      value: '27',
      description: 'Movies and shows you want to watch'
    },
    {
      title: 'Watched',
      value: '142',
      description: 'Total content you have watched'
    },
    {
      title: 'Subscription',
      value: 'Premium',
      description: 'Your current subscription plan'
    }
  ],
  recentActivity: [
    {
      date: getRandomRecentDate(),
      description: 'Watched "Stranger Things" Season 4 Episode 1',
      status: 'Completed'
    },
    {
      date: getRandomRecentDate(),
      description: 'Added "The Witcher" to your watchlist',
      status: 'Completed'
    },
    {
      date: getRandomRecentDate(),
      description: 'Started watching "Breaking Bad"',
      status: 'In Progress'
    },
    {
      date: getRandomRecentDate(),
      description: 'Subscription payment processed',
      status: 'Completed'
    },
    {
      date: getRandomRecentDate(),
      description: 'Password changed',
      status: 'Completed'
    }
  ],
  recommendedContent: [
    {
      id: '1',
      title: 'Stranger Things',
      category: 'Sci-Fi & Fantasy',
      imageUrl: 'https://via.placeholder.com/300x450?text=Stranger+Things'
    },
    {
      id: '2',
      title: 'The Crown',
      category: 'Drama',
      imageUrl: 'https://via.placeholder.com/300x450?text=The+Crown'
    },
    {
      id: '3',
      title: 'Money Heist',
      category: 'Crime',
      imageUrl: 'https://via.placeholder.com/300x450?text=Money+Heist'
    },
    {
      id: '4',
      title: 'The Witcher',
      category: 'Fantasy',
      imageUrl: 'https://via.placeholder.com/300x450?text=The+Witcher'
    },
    {
      id: '5',
      title: 'Ozark',
      category: 'Crime',
      imageUrl: 'https://via.placeholder.com/300x450?text=Ozark'
    },
    {
      id: '6',
      title: 'Dark',
      category: 'Sci-Fi & Mystery',
      imageUrl: 'https://via.placeholder.com/300x450?text=Dark'
    },
    {
      id: '7',
      title: 'The Queen\'s Gambit',
      category: 'Drama',
      imageUrl: 'https://via.placeholder.com/300x450?text=Queens+Gambit'
    },
    {
      id: '8',
      title: 'Bridgerton',
      category: 'Period Drama',
      imageUrl: 'https://via.placeholder.com/300x450?text=Bridgerton'
    }
  ]
};

// Dashboard service object
export const dashboardService = {
  // Get user dashboard data
  getUserDashboardData: async () => {
    // In a real app, this would make an API call
    // Simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockDashboardData);
      }, 800);
    });
  },
  
  // Get admin dashboard data
  getAdminDashboardData: async () => {
    // In a real app, this would make an API call to get admin-specific data
    // For now, we'll return the same data with some additions
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          ...mockDashboardData,
          userStats: {
            totalUsers: 1254,
            activeUsers: 876,
            premiumUsers: 543,
            standardUsers: 421,
            basicUsers: 290
          },
          revenueData: {
            currentMonth: '$45,678',
            previousMonth: '$42,345',
            yearToDate: '$342,567',
            percentageChange: '+7.8%'
          }
        });
      }, 800);
    });
  }
};
