# Launchify Application

A feature-rich web application with a Netflix-inspired design, featuring a user dashboard, an administrative panel, and a modal-based login system supporting Google, Facebook, and traditional username/password authentication.

## Project Overview

This project is structured as a monorepo containing both frontend and backend components:

- **Frontend**: Built with SvelteKit, Tailwind CSS, and Daisy UI
- **Backend**: (To be implemented) Will be built with Node.js or Python

## Directory Structure

```
├── src/
│   ├── frontend/         # SvelteKit frontend application
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   ├── components/  # Reusable UI components
│   │   │   │   └── services/    # Service files for API calls and mock data
│   │   │   ├── routes/          # Application routes and pages
│   │   │   ├── app.css          # Global styles and Tailwind directives
│   │   │   └── app.html         # Main HTML template
│   │   ├── static/              # Static assets
│   │   └── ...                  # Configuration files
│   │
│   └── backend/         # Backend application (to be implemented)
│       ├── controllers/  # API endpoint controllers
│       ├── models/       # Data models
│       ├── services/     # Business logic
│       ├── middleware/   # Cross-cutting concerns
│       ├── config/       # Configuration settings
│       └── utils/        # Utility functions
│
├── docs/              # Project documentation
├── diagrams/         # Architectural diagrams
├── tests/            # Unit, integration, and end-to-end tests
├── agents/           # Agent-related functionality
└── research/         # Research and planning documents
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

### Running the Frontend

To start the frontend development server:

```bash
npm run start
# or
npm run frontend:dev
```

The application will be available at http://localhost:5173

## Features

- Netflix-inspired UI design using Tailwind CSS and Daisy UI
- Mock authentication service with email/password, Google, and Facebook login options
- User dashboard with personalized content and activity tracking
- Admin dashboard with analytics and management features
- Responsive design for all device sizes

## Mock Data

The application currently uses mock data services for authentication and dashboard content. In a real application, these would be replaced with actual API calls to a backend service.

### Mock Users

- Regular User:
  - Email: user@example.com
  - Password: password123

- Admin User:
  - Email: admin@example.com
  - Password: admin123

## Future Development

- Implement backend services with real authentication
- Connect to a database for persistent storage
- Add more features to the user and admin dashboards
- Implement real-time notifications and updates
- Add comprehensive testing
