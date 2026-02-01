# Weather Checker App

A modern, responsive weather application built with React, TypeScript, and Vite. Get real-time weather information for any city worldwide with an intuitive search interface and clean design.

## 🌤️ Features

- **Real-time Weather Data** - Powered by Open-Meteo API
- **City Search** - Smart autocomplete with city suggestions
- **Responsive Design** - Beautiful UI with Tailwind CSS
- **Type-Safe** - Built with TypeScript strict mode
- **Fully Tested** - 92 tests with comprehensive coverage
- **Fast Performance** - Optimized with Vite and React Query

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the app.

## 📦 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (TypeScript + Vite)
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality
- `npm test` - Run all tests with Jest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report

## 🧪 Testing

The app includes comprehensive test coverage:
- **Unit Tests** - Error utilities, API layer
- **Component Tests** - SearchBar, WeatherCard with React Testing Library
- **Integration Tests** - Full app workflows

```bash
# Run all 92 tests
npm test

# Watch mode for development
npm run test:watch

# Coverage report
npm run test:coverage
```

## 🏗️ Tech Stack

- **React 19** - UI library with latest features
- **TypeScript** - Type safety and better DX
- **Vite** - Fast build tool and dev server
- **TanStack Query** - Data fetching and caching
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icons
- **Jest + RTL** - Testing framework

## 📁 Project Structure

```
src/
├── api/           # API layer with weather services
├── components/    # React components (SearchBar, WeatherCard)
├── config/        # API configuration
├── constants/     # App constants and text
└── utils/         # Utility functions and error handling
```

## 🌐 API

This app uses the free [Open-Meteo API](https://open-meteo.com/) - no API key required!

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
