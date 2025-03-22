# Netflix-Inspired Frontend Application

This is a SvelteKit frontend application with a Netflix-inspired design, featuring a user dashboard, admin panel, and multi-provider authentication.

## Features

- Netflix-inspired UI design using Tailwind CSS and Daisy UI
- Mock authentication service with email/password, Google, and Facebook login options
- User dashboard with personalized content and activity tracking
- Admin dashboard with analytics and management features
- Responsive design for all device sizes

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)

### Installation

1. Navigate to the frontend directory:

```bash
cd src/frontend
```

2. Install dependencies:

```bash
npm install
```

### Development

To start the development server:

```bash
npm run dev
```

The application will be available at http://localhost:5173

### Building for Production

To build the application for production:

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

## Project Structure

- `src/lib/components` - Reusable UI components
- `src/lib/services` - Service files for API calls and mock data
- `src/routes` - SvelteKit routes and pages
- `src/app.css` - Global styles and Tailwind directives
- `static` - Static assets like images and fonts

## Mock Data

The application currently uses mock data services for authentication and dashboard content. In a real application, these would be replaced with actual API calls to a backend service.

### Mock Users

- Regular User:
  - Email: user@example.com
  - Password: password123

- Admin User:
  - Email: admin@example.com
  - Password: admin123

## Customization

- Tailwind CSS configuration can be modified in `tailwind.config.js`
- Global styles can be adjusted in `src/app.css`
- Mock data can be updated in the service files in `src/lib/services`
