# Latency Lens 

Latency Lens is a modern, interactive network latency testing application that provides real-time measurements and visualizations of your connection quality to various servers around the world.

**Live Site: [lens.tegaidogun.dev](https://lens.tegaidogun.dev)**

## Features

- **Real-time latency testing** to various global endpoints
- **Interactive metrics visualization** with dynamic graphs
- **Comprehensive network statistics** including latency, jitter, and packet loss
- **Advanced test options** including protocol selection and packet size configuration
- **Continuous testing mode** for extended monitoring sessions
- **Test history** to track your connection quality over time
- **Mobile-responsive design** that works on all devices

## Architecture

Latency Lens is built with a modern web stack:

### Frontend
- **Next.js** - React framework for server-rendered applications
- **TypeScript** - For type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **shadcn/ui** - High-quality UI components built on Radix UI
- **Framer Motion** - For smooth, interactive animations
- **Recharts** - Composable charting library for visualizing data

### Core Modules

#### 1. Test Engine
The core testing logic handles:
- Server endpoint definitions
- Latency measurement algorithm
- Ping packet handling with different protocols (HTTP/TCP)
- Statistical calculations for jitter and packet loss
- Nearest server detection

#### 2. UI Components
- **Test Interface** - Interactive testing control panel with real-time feedback
- **Results Display** - Visualizes test results with color-coded quality indicators
- **Graph Visualization** - Plots latency over time with interactive tooltips
- **History Panel** - Records and displays historical test sessions

#### 3. State Management
Uses React's useState and useRef hooks to manage:
- Test execution state
- Results collection and aggregation
- User preferences
- History tracking

## Deployment

Latency Lens is configured for deployment on Cloudflare Pages with edge functions enabled.

### Configuration

Key configuration files:
- `wrangler.toml` - Cloudflare Pages configuration
- `next.config.mjs` - Next.js configuration with Cloudflare adapter

## Development

### Prerequisites

- Node.js (version 18.18.0 or higher)
- npm

### Getting Started

```bash
# Clone the repository
git clone https://github.com/tegaidogun/latency-lens.git
cd latency-lens

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:3000`.

### Project Structure

```
latency-lens/
├── app/              # Next.js App Router pages
├── components/       # Reusable UI components
│   ├── ui/           # shadcn/ui components
├── lib/              # Utility functions and core logic
│   ├── servers.ts    # Server definitions and testing logic
├── public/           # Static assets
├── styles/           # Global styles
└── ...
```

Pull requests should target the `main` branch and require passing CI checks before review.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.
