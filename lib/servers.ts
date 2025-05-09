export interface Server {
  id: string
  name: string
  location: string
  endpoint: string
  region: string
  company: string
}

export interface TestOptions {
  packetSize: 'small' | 'medium' | 'large'
  protocol: 'http' | 'tcp'
}

// Define packet sizes in bytes
const PACKET_SIZES = {
  small: 32,
  medium: 64,
  large: 1500
};

export const servers: Server[] = [
  {
    id: "cloudflare-us",
    name: "USA",
    location: "Cloudflare Edge",
    endpoint: "https://cloudflare-dns.com/dns-query?dns=AAABAAABAAAAAAAAA3d3dwdleGFtcGxlA2NvbQAAAQAB",
    region: "North America",
    company: "Cloudflare"
  },
  {
    id: "cloudflare-eu",
    name: "Europe",
    location: "Cloudflare Edge", 
    endpoint: "https://cloudflare-dns.com/dns-query?dns=AAABAAABAAAAAAAAA3d3dwdleGFtcGxlA2NvbQAAAQAB&ct=application/dns-json",
    region: "Europe",
    company: "Cloudflare"
  },
  {
    id: "jsonplaceholder",
    name: "Various",
    location: "Global CDN",
    endpoint: "https://jsonplaceholder.typicode.com/todos/1",
    region: "Global",
    company: "JSONPlaceholder"
  },
  {
    id: "httpbin-get",
    name: "Various",
    location: "Global CDN",
    endpoint: "https://httpbin.org/get",
    region: "Global",
    company: "HTTPBin"
  }
]

export async function findNearestServer(): Promise<Server> {
  try {
    // Test all servers with a simple HEAD request to find the fastest
    const results = await Promise.all(
      servers.map(async (server) => {
        try {
          const start = performance.now();
          await fetch(server.endpoint, {
            method: 'HEAD',
            cache: 'no-store',
            signal: AbortSignal.timeout(1000) // 1 second timeout
          });
          const end = performance.now();
          return { server, latency: end - start };
        } catch (error) {
          console.error(`Error testing server ${server.id}:`, error);
          return { server, latency: Infinity };
        }
      })
    );

    // Sort by latency and get the fastest responding server
    const fastestServer = results.sort((a, b) => a.latency - b.latency)[0];
    
    // Fall back to first server if all failed
    return fastestServer.latency === Infinity ? servers[0] : fastestServer.server;
  } catch (error) {
    console.error('Error finding nearest server:', error);
    return servers[0]; // Fallback to first server if something goes wrong
  }
}

// Helper function to perform a single fetch with timeout
async function fetchWithTimeout(
  url: string, 
  timeout: number, 
  options: TestOptions
): Promise<number> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  const startTime = performance.now();
  
  try {
    // Choose method based on protocol
    const method = options.protocol === 'tcp' ? 'POST' : 'HEAD';
    
    // Add query parameter for packet size simulation
    const packetSizeBytes = PACKET_SIZES[options.packetSize];
    const urlWithSize = url.includes('?') 
      ? `${url}&size=${packetSizeBytes}` 
      : `${url}?size=${packetSizeBytes}`;
    
    // For TCP/POST requests, create a payload of the appropriate size
    let body = undefined;
    if (options.protocol === 'tcp') {
      body = JSON.stringify({
        data: 'X'.repeat(packetSizeBytes - 20) // Rough approximation accounting for JSON overhead
      });
    }
    
    const response = await fetch(urlWithSize, {
      method,
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Content-Type': 'application/json'
      },
      signal: controller.signal,
      body
    });
    
    clearTimeout(timeoutId);
    
    // For more accurate latency measurement, we'll get the headers only
    if (options.protocol !== 'tcp') {
      // No need to read the body for HEAD requests
    } else {
      // For TCP/POST, we should read the response
      await response.text();
    }
    
    const endTime = performance.now();
    return endTime - startTime;
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Provide more detailed error information
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.error('Request timeout:', error);
    } else {
      console.error('Error in fetch:', error);
    }
    
    return -1; // Failed request
  }
}

export async function testLatency(
  server: Server, 
  options: TestOptions = { packetSize: 'medium', protocol: 'http' }
): Promise<{
  latency: number
  jitter: number
  packetLoss: number
}> {
  const numPackets = 5;
  const requestDelay = 100; // 100ms delay between starting requests
  const timeout = 1500; // 1.5 seconds timeout
  
  // Create array of promises for parallel execution
  const promises = [];
  
  // Launch requests with a small delay between them
  for (let i = 0; i < numPackets; i++) {
    // Add a small delay between launching requests
    if (i > 0) {
      await new Promise(resolve => setTimeout(resolve, requestDelay));
    }
    promises.push(fetchWithTimeout(server.endpoint, timeout, options));
  }
  
  // Execute all fetches (they'll run mostly in parallel but with staggered starts)
  const results = await Promise.all(promises);
  
  // Process results
  const successfulResults = results.filter(r => r !== -1);
  const packetLoss = ((numPackets - successfulResults.length) / numPackets) * 100;
  
  // Only continue with calculation if we have results
  if (successfulResults.length === 0) {
    return {
      latency: 0,
      jitter: 0,
      packetLoss: 100
    };
  }
  
  const latency = Math.round(successfulResults.reduce((a, b) => a + b, 0) / successfulResults.length);

  // Calculate jitter (variation in latency)
  let jitterSum = 0;
  for (let i = 1; i < successfulResults.length; i++) {
    jitterSum += Math.abs(successfulResults[i] - successfulResults[i - 1]);
  }
  
  const jitter = successfulResults.length > 1
    ? Math.round(jitterSum / (successfulResults.length - 1))
    : 0;

  return {
    latency,
    jitter,
    packetLoss
  }
} 