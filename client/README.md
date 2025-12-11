# Cryptalyst.ai Client

AI-Powered Cryptocurrency Analysis Platform - Frontend Application

## Tech Stack

- **React 18.2.0** - UI library
- **Vite 5.0.0** - Build tool and development server
- **React Router DOM 6.20.0** - Client-side routing
- **TailwindCSS 3.3.6** - Utility-first CSS framework
- **ShadCN UI** - Accessible component library built on Radix UI
- **Framer Motion 10.16.16** - Animation library
- **Axios 1.6.2** - HTTP client for API requests
- **Lucide React 0.294.0** - Icon library

## Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── ui/              # ShadCN UI components
│   │   ├── magicui/         # Custom animated components
│   │   └── layout/          # Layout components (Navbar, etc.)
│   ├── pages/               # Page components
│   │   ├── Home.jsx
│   │   ├── Dashboard.jsx
│   │   ├── About.jsx
│   │   └── NotFound.jsx
│   ├── services/            # API services
│   │   └── api.js
│   ├── hooks/               # Custom React hooks
│   │   ├── useLocalStorage.js
│   │   └── useFetch.js
│   ├── utils/               # Utility functions
│   │   ├── formatters.js
│   │   └── constants.js
│   ├── lib/                 # Library utilities
│   │   └── utils.js
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── .env.example             # Environment variables template
├── components.json          # ShadCN UI configuration
├── jsconfig.json            # Path aliases configuration
├── tailwind.config.js       # Tailwind configuration
├── postcss.config.js        # PostCSS configuration
├── vite.config.js           # Vite configuration
└── package.json             # Dependencies and scripts
```

## Features

### Components

#### ShadCN UI Components
- Button - Multiple variants (default, destructive, outline, secondary, ghost, link)
- Card - Card layouts with header, content, and footer
- Input - Form input fields
- Label - Form labels
- Dialog - Modal dialogs
- Select - Dropdown select menus
- Toast - Notification toasts with provider
- Tabs - Tabbed interfaces
- Switch - Toggle switches
- Avatar - User avatars with fallback
- Dropdown Menu - Context menus with items, separators, and shortcuts

#### Magic UI Components
- FadeIn - Animated fade-in with directional movement
- GradientText - Gradient text effects
- AnimatedGrid - Staggered grid animations
- ShimmerButton - Buttons with shimmer effect
- Particles - Interactive particle background

### Pages
- **Home** - Landing page with hero section and features
- **Dashboard** - Main application dashboard with crypto market overview
- **About** - About the platform and features
- **404** - Not found page

### Services
- **API Service** - Axios instance with interceptors for authentication and error handling
- **Crypto API** - Endpoints for cryptocurrency data
- **Portfolio API** - Portfolio management endpoints
- **User API** - Authentication and user profile endpoints

### Custom Hooks
- **useLocalStorage** - Manage localStorage with React state
- **useFetch** - Simplified data fetching with loading and error states

### Utilities
- **Formatters** - Currency, number, percentage, and date formatting functions
- **Constants** - Application-wide constants and configuration

## Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies (already done):
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
VITE_API_URL=http://localhost:5000/api
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

Build the application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

### Linting

Run ESLint:
```bash
npm run lint
```

## Styling

### TailwindCSS
The project uses TailwindCSS with a custom configuration for dark mode support. All color variables are defined using CSS custom properties in `src/index.css`.

### Theme Variables
The application supports light and dark themes with the following CSS variables:
- `--background`, `--foreground`
- `--card`, `--card-foreground`
- `--primary`, `--primary-foreground`
- `--secondary`, `--secondary-foreground`
- `--muted`, `--muted-foreground`
- `--accent`, `--accent-foreground`
- `--destructive`, `--destructive-foreground`
- `--border`, `--input`, `--ring`

### Component Styling
Components use the `cn()` utility function (from `lib/utils.js`) to merge Tailwind classes with class-variance-authority.

## API Integration

The application is configured to connect to a backend API. Update the `VITE_API_URL` environment variable to point to your API server.

### API Structure
```javascript
// Example usage
import { cryptoAPI } from '@/services/api';

const data = await cryptoAPI.getCryptos();
```

## Path Aliases

The project uses path aliases configured in `vite.config.js` and `jsconfig.json`:
- `@/` - Maps to `src/`
- `@/components` - Maps to `src/components`
- `@/utils` - Maps to `src/lib/utils`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Copyright 2024 Cryptalyst.ai

## Next Steps

1. Connect to backend API
2. Implement authentication flow
3. Add real cryptocurrency data integration
4. Implement portfolio management features
5. Add advanced analytics and AI predictions
6. Implement real-time updates with WebSockets
7. Add user settings and preferences
8. Implement responsive design improvements
9. Add comprehensive error handling
10. Write unit and integration tests
