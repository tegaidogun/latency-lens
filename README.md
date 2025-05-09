# Latency Lens 

Latency Lens is a modern, interactive network latency testing application that provides real-time measurements and visualizations of your connection quality to various servers around the world.

**🔗 Live Site: [lens.tegaidogun.dev](https://lens.tegaidogun.dev)**

## 📊 Features

- **Real-time latency testing** to various global endpoints
- **Interactive metrics visualization** with dynamic graphs
- **Comprehensive network statistics** including latency, jitter, and packet loss
- **Advanced test options** including protocol selection and packet size configuration
- **Continuous testing mode** for extended monitoring sessions
- **Test history** to track your connection quality over time
- **Mobile-responsive design** that works on all devices

## 🏗️ Architecture

Latency Lens is built with a modern web stack:

### Frontend
- **Next.js** - React framework for server-rendered applications
- **TypeScript** - For type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **shadcn/ui** - High-quality UI components built on Radix UI
- **Framer Motion** - For smooth, interactive animations
- **Recharts** - Composable charting library for visualizing data

### Core Modules

#### 1. Test Engine (`lib/servers.ts`)
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

## 🚀 Deployment

Latency Lens is configured for deployment on Cloudflare Pages with edge functions enabled.

### Cloudflare Pages Setup

This project uses Cloudflare's Next.js adapter to optimize for edge runtime:

```bash
# Install dependencies
npm install

# Build for Cloudflare Pages
npm run pages:build

# Preview locally
npm run preview

# Deploy to Cloudflare Pages
npm run deploy
```

### Configuration

Key configuration files:
- `wrangler.toml` - Cloudflare Pages configuration
- `next.config.mjs` - Next.js configuration with Cloudflare adapter

## 💻 Development

### Prerequisites

- Node.js (version 18.18.0 or higher)
- npm or yarn

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

## 🧠 Design Decisions

### Why Test Multiple Servers?
Different server locations help identify if latency issues are specific to certain regions or global. This provides better diagnostics for network troubleshooting.

### Why Include Jitter and Packet Loss?
Latency alone doesn't tell the full story of connection quality. Jitter (variation in latency) and packet loss provide a more comprehensive view of connection stability.

### Protocol Selection
- **HTTP** - Tests application-level latency
- **TCP** - Measures lower-level network latency

### Edge Runtime
Using Cloudflare edge functions ensures the application itself has minimal latency, providing more accurate testing results.

## 🔒 Privacy

Latency Lens respects user privacy:
- All tests are performed client-side
- No personal data is collected or stored
- No third-party analytics or tracking

## 🤝 Contributing

This project welcomes technical contributions. Before submitting your PR, please ensure:

- Your code follows the project's style and TypeScript standards
- You've added tests for new functionality
- Your commits follow conventional commit format
- The build passes with `npm run pages:build`

For significant changes:
1. Open an issue first to discuss implementation approach
2. Document performance considerations for any testing-related changes
3. Include UI/UX rationale for interface modifications
4. Update the README if adding new features or changing configuration

Pull requests should target the `main` branch and require passing CI checks before review.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Cloudflare for providing the edge network
- Next.js team for the amazing framework
- shadcn for the beautiful UI components
- All open-source contributors whose work made this possible 