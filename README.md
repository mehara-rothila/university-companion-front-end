# Smart Campus Companion - Frontend

A Next.js web application for the Smart Campus Companion system - L3 Individual Project at University of Moratuwa.

## 🎯 Project Overview

The Smart Campus Companion is an AI-powered digital assistant designed to enhance university life through human-centered design and ethical AI implementation. This frontend provides an intuitive interface for students to access campus services, navigation, and personalized assistance.

## ✨ Features

### Core Features
- **User Authentication** - Secure login and registration system
- **Interactive Dashboard** - Personalized campus experience
- **AI Assistant** - Intelligent chatbot for campus queries
- **Campus Navigation** - Interactive maps and directions
- **Study Spaces** - Real-time availability tracking
- **Lost & Found** - Report and search for lost items
- **Financial Aid Portal** - Scholarship and support applications
- **Profile Management** - Personal information and preferences
- **Challenges & Rewards** - Gamified campus engagement

### Additional Services
- **Library Integration** - Book search and reservation
- **Wellness Hub** - Mental health and wellness resources
- **Social Events** - Campus events and community features
- **Dining Services** - Menu and meal planning
- **Career Services** - Job opportunities and career guidance
- **Academic Hub** - Course materials and academic support

## 🛠️ Tech Stack

- **Framework**: Next.js 15.4.6
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Lucide React Icons
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Authentication**: JWT tokens with localStorage

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0 or higher
- npm or yarn package manager

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Configure environment variables in `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Running the Application

Development mode:
```bash
npm run dev
```

Build for production:
```bash
npm run build
npm start
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
src/
├── app/
│   ├── challenges/          # Challenges and rewards system
│   ├── chatbot/            # AI assistant interface
│   ├── context/            # React context providers
│   ├── dashboard/          # Main dashboard page
│   ├── financial-aid/      # Financial aid portal
│   ├── library/            # Library services
│   ├── login/              # User authentication
│   ├── lost-found/         # Lost and found system
│   ├── navigation/         # Campus navigation
│   ├── notifications/      # Notification center
│   ├── profile/            # User profile management
│   ├── signup/             # User registration
│   ├── layout.tsx          # Root layout component
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/
│   ├── AnimatedBackground.tsx  # Dynamic background effects
│   └── Navigation.tsx          # Main navigation component
└── config/                 # Configuration files
```

## 🎨 Design Features

- **Glass morphism UI** - Modern frosted glass effects
- **Responsive Design** - Mobile-first approach
- **Dark/Light Theme** - User preference system
- **Animated Backgrounds** - Dynamic visual elements
- **Gradient Accents** - Purple-blue color scheme
- **Smooth Transitions** - Enhanced user experience

## 🔌 API Integration

The frontend integrates with the Spring Boot backend for:
- User authentication and authorization
- Data persistence and retrieval
- Real-time updates and notifications

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

### Currently Available
- ✅ User Authentication System
- ✅ Dashboard Interface
- ✅ Lost & Found Portal
- ✅ Financial Aid System
- ✅ Profile Management
- ✅ Challenges & Rewards
- ✅ AI Assistant
- ✅ Library Services

### Coming Soon
- 🔄 Study Spaces Booking
- 🔄 Campus Navigation Maps
- 🔄 Dining Services Integration
- 🔄 Wellness Hub
- 🔄 Social Events Platform
- 🔄 Real-time Notifications

## 📖 Academic Context

This project is part of the L3 Individual Project at the University of Moratuwa, focusing on:
- Human-centered design principles
- Ethical AI implementation
- Modern web development practices
- User experience optimization
- Campus digitalization solutions

## 🤝 Contributing

This is an academic project for university coursework. All development follows university guidelines and ethical standards.

## 📄 License

This project is developed for academic purposes as part of university coursework.
