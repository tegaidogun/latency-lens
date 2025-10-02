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

## Development

### Prerequisites

- Node.js (version 18.18.0 or higher)
- npm

```bash
git clone https://github.com/tegaidogun/latency-lens.git
cd latency-lens

npm install

npm run dev
```

The site will be up at `http://localhost:3000`.

### Project Structure

```
latency-lens/
├── app/              
├── components/       
│   ├── ui/           
├── lib/              
│   ├── servers.ts    
├── public/           
├── styles/           
└── ...
```

Pull requests should target the `main` branch and require passing CI checks before review.
