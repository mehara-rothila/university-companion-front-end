# Smart University Companion

> A modern Next.js web application for the Smart University Companion system - L3 Individual Project at University of Moratuwa

[![Next.js](https://img.shields.io/badge/Next.js-15.4.6-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4+-38bdf8)](https://tailwindcss.com/)

## Overview

An AI-powered digital assistant designed to enhance university life through intuitive interfaces for students to access university services, navigation, and personalized assistance with real-time data integration and secure user management.

## Features

### Core Functionality

- **🔐 Authentication** - JWT-based secure login/registration with role-based access control
- **�️ Admin Panel** - Complete user management with CRUD operations and bulk actions
- **📚 Lost & Found** - Item management with AWS S3 image upload, search, and filtering
- **💰 Financial Aid** - Application portal with multiple aid types and status tracking
- **🔔 Notifications** - Real-time WebSocket notifications with toast display
- **🎨 Theme System** - Dark/light mode with persistent user preferences
- **📱 Responsive Design** - Mobile-first approach with Tailwind CSS


## Tech Stack

- **Framework:** Next.js 15.4.6 with App Router
- **Language:** TypeScript 5.0+
- **Styling:** Tailwind CSS 3.4+
- **State Management:** React Context API
- **HTTP Client:** Axios
- **Real-time:** Socket.io, SockJS, STOMP WebSocket
- **Image Storage:** AWS S3
- **Authentication:** JWT tokens

## Getting Started

### Prerequisites

- Node.js 18.0+
- npm 8.0+ or yarn 1.22+
- Backend API running on port 8080

### Installation

1. **Clone and navigate to the project**
   ```bash
   git clone <repository-url>
   cd "3rd year project"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create `.env.local` in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080
   NEXT_PUBLIC_WS_URL=http://localhost:8080/ws
   NEXT_PUBLIC_APP_NAME=Smart University Companion
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Ensure backend is running on http://localhost:8080

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                      # Next.js App Router pages
│   ├── context/              # React Context providers
│   ├── admin/                # Admin user management
│   ├── lost-found/           # Lost & Found system
│   ├── financial-aid/        # Financial aid applications
│   ├── notifications/        # Notification center
│   ├── login/                # Authentication
│   ├── signup/               # User registration
│   └── layout.tsx            # Root layout
├── components/               # Reusable UI components
│   ├── Navigation.tsx
│   ├── ImageUpload.tsx
│   ├── NotificationToast.tsx
│   └── ...
├── services/                 # API service layer
│   ├── lostFoundService.ts
│   ├── financialAidService.ts
│   └── ...
└── types/                    # TypeScript definitions
```

## API Integration

The frontend communicates with a Spring Boot backend on port 8080.

### Key Endpoints

**Authentication**
```
POST /api/auth/login
POST /api/auth/register
```

**Admin Management**
```
GET    /api/admin/users
PUT    /api/admin/users/{id}
DELETE /api/admin/users/{id}
PATCH  /api/admin/users/{id}/toggle-status
```

**Lost & Found**
```
GET    /api/lost-found/items
POST   /api/lost-found/items
DELETE /api/lost-found/items/{id}
```

**Financial Aid**
```
GET  /api/financial-aid/applications
POST /api/financial-aid/applications
PUT  /api/financial-aid/applications/{id}
```

**Notifications (WebSocket)**
```
CONNECT    /ws
SUBSCRIBE  /topic/notifications/{userId}
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## Deployment

### Netlify

1. Set environment variables in Netlify dashboard:
   ```
   NEXT_PUBLIC_API_URL=<production-api-url>
   NEXT_PUBLIC_WS_URL=<production-ws-url>
   ```

2. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: 18.x

3. Deploy automatically on push to main branch

## Troubleshooting

### Common Issues

**Port already in use**
```bash
npx kill-port 3000
npm run dev
```

**Backend connection issues**
```bash
# Verify backend is running
curl http://localhost:8080/api/lost-found/items
```

**Authentication problems**
```javascript
// Clear stored auth data
localStorage.removeItem('token');
localStorage.removeItem('user');
```

**Build errors**
```bash
rm -rf .next node_modules
npm install
npm run build
```

## Academic Context

This project is part of the L3 Individual Project at the University of Moratuwa, focusing on:
- Human-centered design principles
- Ethical AI implementation
- Modern web development practices
- University digitalization solutions

## License

Developed for academic purposes as part of university coursework.


## 🚀 Getting Started

### Prerequisites
- **Node.js**: 18.0 or higher
- **npm**: 8.0+ or **yarn**: 1.22+
- **Backend API**: Running on port 8080
- **Browser**: Modern browser with ES6 support

### Installation

1. **Clone the Repository**
```bash
git clone <repository-url>
cd "3rd year project"
```

2. **Install Dependencies**
```bash
npm install
# or
yarn install
```

3. **Environment Setup**
Create `.env.local` file in the root directory:
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=http://localhost:8080/ws
NEXT_PUBLIC_APP_NAME=Smart University Companion

# Optional: Additional configuration
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
```

4. **Start Development Server**
```bash
npm run dev
# or
yarn dev
```

5. **Access Application**
- Frontend: `http://localhost:3000`
- Ensure backend is running on `http://localhost:8080`

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🌐 Production Deployment

### Netlify Deployment

1. **Environment Variables** (Set in Netlify Dashboard)
```env
NEXT_PUBLIC_API_URL=<your_production_api_url>
NEXT_PUBLIC_WS_URL=<your_production_ws_url>
```

2. **Build Settings**
   - Build Command: `npm run build`
   - Publish Directory: `.next`
   - Node Version: 18.x or higher

3. **Deploy Process**
```bash
# Automatic deployment on git push to main branch
git add .
git commit -m "Update frontend"
git push origin main
# Netlify automatically builds and deploys
```

### Production Features
- ✅ **HTTPS/SSL** enabled on both frontend and backend
- ✅ **CORS** properly configured for cross-origin requests
- ✅ **Environment Variables** managed securely
- ✅ **Continuous Deployment** from GitHub repository
- ✅ **PostgreSQL Database** for production data
- ✅ **AWS S3** integration for image storage
- ✅ **JWT Authentication** for secure user sessions

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── context/                  # React Context Providers
│   │   ├── AuthContext.tsx       # Authentication state management
│   │   └── DarkModeContext.tsx   # Theme management
│   ├── login/                    # Authentication Pages
│   │   └── page.tsx              # Login page
│   ├── signup/                   # User Registration
│   │   └── page.tsx              # Signup page
│   ├── lost-found/              # Lost & Found System (Fully Implemented)
│   │   └── page.tsx              # Main Lost & Found interface
│   ├── admin/                   # Admin Panel (Fully Implemented)
│   │   └── page.tsx              # Admin user management interface
│   ├── dashboard/               # User Dashboard
│   │   └── page.tsx              # Personal dashboard
│   ├── library/                 # Library Services
│   │   └── page.tsx              # Library integration
│   ├── navigation/              # University Navigation
│   │   └── page.tsx              # Interactive maps
│   ├── profile/                 # User Management
│   │   └── page.tsx              # Profile settings
│   ├── financial-aid/          # Financial Services
│   │   └── page.tsx              # Aid applications
│   ├── chatbot/                # AI Assistant
│   │   └── page.tsx              # Chatbot interface
│   ├── challenges/             # Gamification
│   │   └── page.tsx              # Challenges system
│   ├── notifications/          # Alerts & Updates
│   │   └── page.tsx              # Notification center
│   ├── layout.tsx              # Root layout component
│   ├── page.tsx                # Home page
│   ├── globals.css             # Global Tailwind styles
│   └── providers.tsx           # Context providers wrapper
├── components/                   # Reusable UI Components
│   ├── Navigation.tsx           # Main navigation bar
│   ├── AnimatedBackground.tsx   # Dynamic background component
│   ├── Footer.tsx               # Footer component
│   ├── ImageUpload.tsx          # AWS S3 image upload component
│   ├── NotificationToast.tsx    # Toast notification component
│   └── ScrollProgress.tsx       # Scroll progress indicator
├── services/                    # API Service Layer
│   ├── lostFoundService.ts      # Lost & Found API calls
│   └── financialAidService.ts   # Financial Aid API calls
└── config/                      # Configuration files
    └── (configuration files)
```

### Key Files Explanation

#### Core Components
- **`AuthContext.tsx`**: JWT authentication, login/logout state management
- **`DarkModeContext.tsx`**: Theme switching with localStorage persistence
- **`Navigation.tsx`**: Responsive navigation with user state integration
- **`Footer.tsx`**: Site footer with links and information
- **`ImageUpload.tsx`**: AWS S3 file upload with validation and preview
- **`NotificationToast.tsx`**: Toast notification display component
- **`ScrollProgress.tsx`**: Page scroll progress indicator

#### Service Layer
- **`lostFoundService.ts`**: Complete CRUD operations for Lost & Found system
  - Create, read, update, delete items
  - Image upload integration
  - Advanced filtering and search
  - User-specific item management
- **`financialAidService.ts`**: Financial aid application management
  - Submit and track applications
  - Application history
  - Statistics and metrics
  - Donation management

#### Page Components
- **`lost-found/page.tsx`**: Full-featured Lost & Found system
- **`admin/page.tsx`**: Complete admin user management panel
- **`financial-aid/page.tsx`**: Financial aid application portal
- **`notifications/page.tsx`**: Notification center with real-time updates
- **`login/page.tsx`**: Authentication with form validation
- **`signup/page.tsx`**: User registration page
- **`dashboard/page.tsx`**: Personalized user dashboard
- **`profile/page.tsx`**: User settings and preferences
- **`chatbot/page.tsx`**: AI assistant interface
- **`challenges/page.tsx`**: Gamification and challenges
- **`library/page.tsx`**: Library services integration
- **`navigation/page.tsx`**: University navigation and maps
- **`study-spaces/page.tsx`**: Study space availability
- **`wellness/page.tsx`**: Wellness and mental health resources

## 🎨 Design Features

- **Glass morphism UI** - Modern frosted glass effects
- **Responsive Design** - Mobile-first approach
- **Dark/Light Theme** - User preference system
- **Animated Backgrounds** - Dynamic visual elements
- **Gradient Accents** - Purple-blue color scheme
- **Smooth Transitions** - Enhanced user experience

## 🔌 API Integration

### Backend Communication
The frontend integrates with the Spring Boot backend (port 8080) for:

#### Authentication Endpoints
```typescript
POST /api/auth/login        // User login
POST /api/auth/register     // User registration
POST /api/auth/refresh      // Token refresh
```

#### Admin Management Endpoints
```typescript
GET    /api/admin/dashboard/stats      // Dashboard statistics
GET    /api/admin/users               // Get all users with pagination
GET    /api/admin/users/{id}          // Get specific user
PUT    /api/admin/users/{id}          // Update user details
DELETE /api/admin/users/{id}          // Delete user
PATCH  /api/admin/users/{id}/toggle-status    // Enable/disable user
PATCH  /api/admin/users/{id}/reset-password   // Reset user password
POST   /api/admin/users/bulk-action           // Bulk operations
```

#### Lost & Found Endpoints
```typescript
GET    /api/lost-found/items           // Get all items with filters
GET    /api/lost-found/items/{id}      // Get specific item
POST   /api/lost-found/items           // Create new item
PUT    /api/lost-found/items/{id}      // Update item
DELETE /api/lost-found/items/{id}      // Delete item
GET    /api/lost-found/stats           // Get statistics
GET    /api/lost-found/items/user/{id} // Get user's items
```

#### Image Upload Endpoints
```typescript
POST /api/upload/image              // Upload image to S3
GET  /api/upload/image/serve?url=   // Serve image through backend proxy
DELETE /api/upload/image?imageUrl=  // Delete image from S3
```

#### Financial Aid Endpoints
```typescript
GET    /api/financial-aid/applications           // Get all applications
GET    /api/financial-aid/applications/{id}      // Get specific application
GET    /api/financial-aid/applications/user/{userId} // Get user's applications
POST   /api/financial-aid/applications           // Submit application
PUT    /api/financial-aid/applications/{id}      // Update application
DELETE /api/financial-aid/applications/{id}      // Cancel application
GET    /api/financial-aid/stats                  // Get statistics
POST   /api/financial-aid/admin/applications/{id}/review // Admin review
GET    /api/financial-aid/admin/applications     // Admin get all applications
```

#### Notification Endpoints
```typescript
GET    /api/notifications/user/{userId}          // Get user notifications
GET    /api/notifications/user/{userId}/unread/count // Get unread count
PUT    /api/notifications/{id}/read              // Mark as read
PUT    /api/notifications/user/{userId}/read-all // Mark all as read
DELETE /api/notifications/{id}                   // Delete notification
DELETE /api/notifications/user/{userId}/read     // Delete all read
POST   /api/notifications                        // Create notification (Admin)
```

#### WebSocket Endpoints
```typescript
CONNECT    /ws                           // WebSocket connection
SUBSCRIBE  /topic/notifications/{userId} // Subscribe to user notifications
SEND       /app/notifications            // Send notification
```

### Service Layer Examples

#### Authentication Service Usage
```typescript
const { user, login, logout, isAuthenticated } = useAuth();

// Login
await login('user@email.com', 'password');

// Logout
await logout();
```

#### Lost & Found Service Usage
```typescript
import lostFoundService from '@/services/lostFoundService';

// Create item with image
const newItem = await lostFoundService.createItem({
  type: 'LOST',
  title: 'iPhone 14 Pro',
  description: 'Black iPhone with blue case',
  category: 'Electronics',
  location: 'Main Library',
  imageUrl: 'https://s3-bucket-url/image.jpg',
  contactMethod: 'DIRECT',
  priority: 'HIGH'
});

// Get filtered items
const items = await lostFoundService.getItems({
  type: 'LOST',
  category: 'Electronics',
  location: 'Main Library',
  search: 'iPhone',
  status: 'ACTIVE'
});

// Delete item
await lostFoundService.deleteItem(itemId);
```

#### Image Upload Service Usage
```typescript
// Upload image
const handleImageUpload = (file) => {
  // ImageUpload component handles S3 upload automatically
  // Returns S3 URL for database storage
};

// Display image
const imageProxyUrl = `http://localhost:8080/api/upload/image/serve?url=${encodeURIComponent(s3Url)}`;
```

## 🌐 Multilingual Support

The application supports:
- English (Default)
- Sinhala (සිංහල)
- Tamil (தමிழ்)

## 📱 Responsive Features

- Mobile-optimized navigation
- Touch-friendly interface
- Adaptive layouts for all screen sizes
- Progressive Web App capabilities

## 🔒 Security

- JWT token-based authentication
- Secure API communication
- Protected routes and components
- Input validation and sanitization

## 🚧 Development Status

### ✅ Fully Implemented Features
- **User Authentication System** - Complete JWT-based auth with context management
- **Admin Panel** - Complete user management with CRUD operations and bulk actions
- **Lost & Found Portal** - Full CRUD operations with AWS S3 image upload
- **Financial Aid System** - Complete application portal with admin review panel
- **Notification System** - Real-time WebSocket notifications with toast display
- **Dashboard Interface** - Personalized user experience
- **Theme Management** - Dark/light mode with persistence
- **Responsive Design** - Mobile-optimized layouts
- **Error Handling** - Comprehensive error management
- **Form Validation** - Real-time input validation
- **Image Upload System** - AWS S3 integration with validation
- **Modal Management** - Proper scroll lock and UI consistency
- **WebSocket Integration** - Real-time communication for notifications

### 🔄 Partially Implemented
- **Library Services** - Basic interface (backend integration pending)
- **Profile Management** - UI ready (backend integration needed)
- **AI Assistant Interface** - UI framework ready
- **University Navigation** - Basic layout implemented
- **Study Spaces** - UI structure ready
- **Wellness Hub** - Basic interface implemented

### 📋 Planned Features
- **Study Spaces Booking** - Real-time availability and booking system
- **Dining Services Integration** - Menu and meal planning
- **Enhanced AI Assistant** - More conversational capabilities
- **Social Events Platform** - Community engagement and event management
- **Academic Services** - Course registration and grades
- **Career Services** - Job opportunities and career guidance
- **Multi-language Support** - Sinhala and Tamil translations
- **Mobile App** - Native iOS and Android applications

### 🔍 Lost & Found System Details (Production Ready)
- ✅ **Item Creation**: Post lost/found items with images
- ✅ **Advanced Search**: Filter by type, category, location, status
- ✅ **Image Management**: AWS S3 upload with 10MB limit
- ✅ **User Dashboard**: Manage personal items
- ✅ **Item Removal**: Delete items with confirmation
- ✅ **Statistics**: Real-time item counts and metrics
- ✅ **Contact System**: Anonymous and direct messaging
- ✅ **Responsive UI**: Mobile-optimized interface
- ✅ **Error Handling**: Graceful error management
- ✅ **Loading States**: User feedback during operations

## 🧪 Available Scripts

```bash
# Development
npm run dev          # Start development server (port 3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint for code quality
npm run type-check   # Run TypeScript compiler check

# Maintenance
npm install          # Install dependencies
npm update          # Update dependencies
npm audit           # Security audit
npm audit fix       # Fix security vulnerabilities
```

## 🐛 Troubleshooting

### Common Issues and Solutions

#### 1. Port Already in Use
```bash
# Error: Port 3000 is already in use
npx kill-port 3000
# or
lsof -ti:3000 | xargs kill -9
npm run dev
```

#### 2. Backend Connection Issues
```bash
# Ensure backend is running on port 8080
curl http://localhost:8080/api/lost-found/items
# Expected: JSON response or authentication error
```

#### 3. Authentication Problems
```javascript
// Clear stored authentication data
localStorage.removeItem('token');
localStorage.removeItem('user');
// Refresh page and try logging in again
```

#### 4. Image Upload Failures
- **File too large**: Maximum 10MB allowed
- **Invalid format**: Only image files (JPEG, PNG, GIF, WebP)
- **S3 connection**: Check AWS credentials in backend
- **Network issues**: Verify backend is accessible

#### 5. Build Errors
```bash
# Clear Next.js cache
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

#### 6. Environment Variables Not Loading
```bash
# Ensure .env.local exists in root directory
# Restart development server after changes
# Environment variables must start with NEXT_PUBLIC_ for client-side access
```

#### 7. Dark Mode Not Persisting
```javascript
// Clear localStorage if theme switching is broken
localStorage.removeItem('darkMode');
// Refresh page to reset theme
```

#### 8. TypeScript Errors
```bash
# Check TypeScript configuration
npm run type-check
# Fix any type errors before building
```

### Performance Optimization Tips

1. **Image Optimization**: Use Next.js Image component for better performance
2. **Code Splitting**: Leverage dynamic imports for heavy components
3. **Caching**: Enable HTTP caching for API responses
4. **Bundle Analysis**: Use `npm run build` to analyze bundle size

### Browser Compatibility

- **Minimum Requirements**: Modern browsers with ES6 support
- **Recommended**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+

## 📖 Academic Context

This project is part of the L3 Individual Project at the University of Moratuwa, focusing on:
- Human-centered design principles
- Ethical AI implementation
- Modern web development practices
- User experience optimization
- University digitalization solutions

## 🤝 Contributing

This is an academic project for university coursework. All development follows university guidelines and ethical standards.

## 📄 License

This project is developed for academic purposes as part of university coursework.
