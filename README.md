# 🤖 TaskFlow AI - Intelligent Task Management Frontend

A modern, responsive task management application with AI-powered chat interface built with Next.js and TypeScript. TaskFlow AI combines traditional task management with an intelligent conversational agent that can create, update, and manage tasks through natural language commands.

![TaskFlow AI](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38bdf8?style=for-the-badge&logo=tailwindcss)
![React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react)

## ✨ Features

### 🎯 Core Functionality
- **🤖 AI-Powered Chat Interface**: Natural language task creation and management
- **📋 Advanced Task Management**: Full CRUD operations with real-time updates
- **⚡ Real-time Synchronization**: WebSocket-powered instant updates across all clients
- **📱 Responsive Design**: Seamless experience on desktop and mobile devices
- **🌙 Dark Mode Support**: System preference detection with manual toggle

### 🚀 Advanced Features
- **🔍 Smart Filtering & Search**: Filter by status, priority, date, and text search
- **✏️ Inline Task Editing**: Edit tasks directly in the interface
- **💭 Typing Indicators**: Visual feedback when the AI agent is processing
- **🎨 Smooth Animations**: Framer Motion-powered transitions and interactions
- **🔄 Auto-reconnection**: Robust WebSocket handling with exponential backoff
- **📊 Connection Status**: Visual indicators for real-time connection state
- **🎯 Priority System**: Color-coded priority levels (low/medium/high)
- **📅 Due Date Management**: Calendar integration with overdue indicators

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [TailwindCSS 3](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Date Handling**: [date-fns](https://date-fns.org/)
- **Real-time Communication**: WebSocket with auto-reconnection

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/harxhan-n/task-management-agent-frontend.git
   cd task-management-agent-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Create environment file (optional)
   cp .env.example .env.local
   
   # Configure backend URLs (defaults are provided)
   # NEXT_PUBLIC_API_URL=https://task-management-agent-backend-production.up.railway.app
   # NEXT_PUBLIC_WS_URL=wss://task-management-agent-backend-production.up.railway.app
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage

### Getting Started with the AI Chat

1. **Meet the Agent**: Click "Meet Your AI Assistant" on the welcome screen
2. **Natural Commands**: Try these example commands:
   - "Create a high priority task to buy groceries tomorrow"
   - "Add a task to finish the project report by Friday"
   - "Mark the groceries task as completed"
   - "Show me all high priority tasks"

### Manual Task Management

- **Create Tasks**: Click the "+" button in the task panel
- **Edit Tasks**: Click the edit icon or edit inline
- **Complete Tasks**: Toggle checkboxes to mark completion
- **Filter Tasks**: Use the filter panel to find specific tasks
- **Search**: Use the search bar for text-based filtering

### Real-time Features

- **Multi-device Sync**: Changes appear instantly across all connected devices
- **Connection Status**: Monitor real-time connection in the header
- **Typing Indicators**: See when the AI is processing your requests

## 🏗️ Project Structure

```
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ChatPanel.tsx      # AI chat interface
│   ├── IntroScreen.tsx    # Welcome/onboarding screen
│   ├── Layout.tsx         # Main application layout
│   ├── TaskList.tsx       # Task list component
│   └── TaskTable.tsx      # Task table with filtering
├── hooks/                 # Custom React hooks
│   └── useWebSocket.ts    # WebSocket connection management
├── lib/                   # Utility libraries
│   └── api.ts             # API client
├── store/                 # State management
│   └── appStore.ts        # Zustand global store
├── types/                 # TypeScript type definitions
└── DEPLOYMENT.md          # Detailed deployment guide
```

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run export       # Export static files
```

### Code Quality

- **ESLint**: Configured with Next.js recommended rules
- **TypeScript**: Strict type checking enabled
- **Prettier**: Code formatting (if configured)

### Architecture Overview

#### Component Architecture
- **Layout.tsx**: Responsive layout with dark mode and connection status
- **ChatPanel.tsx**: Real-time chat with typing indicators and message history
- **TaskTable.tsx**: Advanced task management with filtering and inline editing
- **useWebSocket.ts**: Robust WebSocket connection with auto-reconnection

#### State Management
- **Zustand**: Global app state (dark mode, connection status)
- **React Hooks**: Local component state
- **WebSocket Hook**: Real-time data management

#### Styling System
- **TailwindCSS**: Utility-first CSS framework
- **Custom Color Palette**: Brand-consistent design system
- **Dark Mode**: System preference detection
- **Responsive Design**: Mobile-first approach

## 🌐 Deployment

### Vercel (Recommended)

1. **Using Vercel CLI**:
   ```bash
   npm i -g vercel
   vercel
   ```

2. **Using GitHub Integration**:
   - Connect your GitHub repository to Vercel
   - Configure environment variables:
     - `NEXT_PUBLIC_API_URL`: Backend API URL
     - `NEXT_PUBLIC_WS_URL`: WebSocket URL

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Google Cloud Platform
- Self-hosted servers

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 🧪 Testing

### Manual Testing Checklist

**Chat Functionality:**
- [ ] AI responds to natural language commands
- [ ] Tasks are created from chat messages
- [ ] Real-time updates appear instantly
- [ ] Typing indicators work correctly

**Task Management:**
- [ ] Create, edit, delete tasks manually
- [ ] Filter and search functionality
- [ ] Priority and due date handling
- [ ] Task completion toggling

**UI/UX:**
- [ ] Dark mode toggle works
- [ ] Responsive design on mobile
- [ ] Animations are smooth
- [ ] Connection status is accurate

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use semantic commit messages
- Ensure responsive design
- Test on multiple devices
- Maintain accessibility standards

## 🔗 Related Projects

- **Backend API**: [Task Management Agent Backend](https://github.com/harxhan-n/task-management-agent-backend)
- **Live Demo**: [TaskFlow AI on Vercel](https://your-deployed-app.vercel.app)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [TailwindCSS](https://tailwindcss.com/)
- Icons by [Lucide](https://lucide.dev/)
- Animations powered by [Framer Motion](https://www.framer.com/motion/)

---

<div align="center">
  Made with ❤️ by the TaskFlow AI team
</div>