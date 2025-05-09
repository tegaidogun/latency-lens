"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Activity, BarChart3, Clock, Gauge, History, Settings, Zap } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Server, servers, findNearestServer, testLatency, TestOptions } from "@/lib/servers"

export default function LatencyTester() {
  const [isRunning, setIsRunning] = useState(false)
  const [currentLatency, setCurrentLatency] = useState<number | null>(null)
  const [averageLatency, setAverageLatency] = useState<number | null>(null)
  const [jitter, setJitter] = useState<number | null>(null)
  const [packetLoss, setPacketLoss] = useState<number | null>(null)
  const [testCount, setTestCount] = useState(0)
  const [testHistory, setTestHistory] = useState<Array<{ 
    time: string; 
    latency: number;
    jitter: number;
    packetLoss: number;
  }>>([])
  const [graphData, setGraphData] = useState<Array<{ 
    time: string; 
    latency: number;
  }>>([])
  const [selectedServer, setSelectedServer] = useState<Server | null>(servers[0])
  const [testDuration, setTestDuration] = useState(5)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [continuousTesting, setContinuousTesting] = useState(false)
  const continuousTestRef = useRef(false)
  const [packetSize, setPacketSize] = useState<'small' | 'medium' | 'large'>('medium')
  const [protocol, setProtocol] = useState<'http' | 'tcp'>('http')
  
  const testDataRef = useRef<{
    latencies: number[],
    jitters: number[],
    packetLosses: number[]
  }>({
    latencies: [],
    jitters: [],
    packetLosses: []
  })
  const [showFinalResult, setShowFinalResult] = useState(false)

  // Initialize with nearest server
  useEffect(() => {
    const initServer = async () => {
      const nearest = await findNearestServer()
      setSelectedServer(nearest)
    }
    initServer()
  }, [])

  // Handle starting a test
  const startTest = () => {
    // Update continuous testing state based on switch
    continuousTestRef.current = continuousTesting;
    
    // Start the actual test
    if (continuousTesting) {
      runContinuousTest();
    } else {
      runSingleTest();
    }
  }
  
  // Handle stopping a test
  const stopTest = () => {
    // Signal the test to stop
    continuousTestRef.current = false;
  }

  // Run a single test for the set duration
  const runSingleTest = async () => {
    if (!selectedServer) return

    setIsRunning(true)
    setShowFinalResult(false)
    
    // Reset displays
    setCurrentLatency(null)
    setAverageLatency(null)
    setJitter(null)
    setPacketLoss(null)
    
    // Reset test data collection
    testDataRef.current = {
      latencies: [],
      jitters: [],
      packetLosses: []
    }
    
    // Clear graph data for this session
    setGraphData([])
    
    const startTime = Date.now()
    let testsCompleted = 0
    
    // Set up test options from advanced settings
    const testOptions: TestOptions = {
      packetSize,
      protocol
    }
    
    // This flag will let us detect early stops
    continuousTestRef.current = true;
    
    // Run tests until the duration is reached or until explicitly stopped
    while (continuousTestRef.current && (Date.now() - startTime) < testDuration * 1000) {
      try {
        const results = await testLatency(selectedServer, testOptions)
        
        // Display current results
        setCurrentLatency(results.latency)
        
        // Store results
        testDataRef.current.latencies.push(results.latency)
        testDataRef.current.jitters.push(results.jitter)
        testDataRef.current.packetLosses.push(results.packetLoss)
        
        // Add point to graph
        const now = new Date()
        const timeString = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().substring(0, 2)}`
        
        setGraphData(prev => [...prev, { time: timeString, latency: results.latency }])
        
        testsCompleted++
      } catch (error) {
        console.error('Error in latency test:', error)
      }
    }
    
    // Calculate and record final results, even if stopped early
    if (testDataRef.current.latencies.length > 0) {
      recordFinalResults();
    } else {
      // If no tests were completed, just reset UI
      setIsRunning(false);
    }
  }
  
  // Run continuous tests until stopped
  const runContinuousTest = async () => {
    if (!selectedServer) return

    setIsRunning(true)
    setShowFinalResult(false)
    
    // Reset displays
    setCurrentLatency(null)
    setAverageLatency(null)
    setJitter(null)
    setPacketLoss(null)
    
    // Reset test data collection
    testDataRef.current = {
      latencies: [],
      jitters: [],
      packetLosses: []
    }
    
    // Clear graph data for this session
    setGraphData([])
    
    let testsCompleted = 0
    
    // Set up test options from advanced settings
    const testOptions: TestOptions = {
      packetSize,
      protocol
    }
    
    // Run tests until stopped
    while (continuousTestRef.current) {
      try {
        const results = await testLatency(selectedServer, testOptions)
        
        // Display current results
        setCurrentLatency(results.latency)
        
        // Store results
        testDataRef.current.latencies.push(results.latency)
        testDataRef.current.jitters.push(results.jitter)
        testDataRef.current.packetLosses.push(results.packetLoss)
        
        // Add point to graph
        const now = new Date()
        const timeString = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().substring(0, 2)}`
        
        setGraphData(prev => {
          // Keep only the last 20 points for continuous testing
          const newData = [...prev, { time: timeString, latency: results.latency }];
          if (newData.length > 20) {
            return newData.slice(newData.length - 20);
          }
          return newData;
        })
        
        testsCompleted++
        
        // Short delay to prevent overwhelming the UI in continuous mode
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error('Error in latency test:', error)
        // If there's an error, pause briefly to avoid rapid failure loops
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    // If we collected at least a few results, record them
    if (testsCompleted > 0) {
      recordFinalResults();
    } else {
      setIsRunning(false);
    }
  }
  
  // Helper to record final results and update history
  const recordFinalResults = () => {
    // Skip if no results
    if (testDataRef.current.latencies.length === 0) {
      setIsRunning(false);
      return;
    }
    
    // Calculate final averages
    const finalAverageLatency = Math.round(
      testDataRef.current.latencies.reduce((sum, val) => sum + val, 0) / 
      testDataRef.current.latencies.length
    )
    
    const finalAverageJitter = Math.round(
      testDataRef.current.jitters.reduce((sum, val) => sum + val, 0) / 
      testDataRef.current.jitters.length
    )
    
    const finalAveragePacketLoss = Math.round(
      testDataRef.current.packetLosses.reduce((sum, val) => sum + val, 0) / 
      testDataRef.current.packetLosses.length * 10
    ) / 10 // Round to 1 decimal place
    
    // Update final values
    setAverageLatency(finalAverageLatency)
    setJitter(finalAverageJitter)
    setPacketLoss(finalAveragePacketLoss)
    
    // Create history entry with timestamp
    const now = new Date()
    const timeString = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
    
    // Add to history - just ONE entry per test session
    setTestHistory(prev => {
      return [...prev, {
        time: timeString,
        latency: finalAverageLatency,
        jitter: finalAverageJitter,
        packetLoss: finalAveragePacketLoss
      }]
    })
    
    // Increase test count by 1 (one complete session)
    setTestCount(prev => prev + 1)
    
    setIsRunning(false)
    setShowFinalResult(true)
  }

  // Handle button click based on running state
  const handleButtonClick = () => {
    if (isRunning) {
      stopTest();
    } else {
      startTest();
    }
  }

  return (
    <main className="container mx-auto p-4 max-w-5xl">
      <div className="flex flex-col items-center justify-center mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Latency Lens</h1>
        <p className="text-muted-foreground max-w-2xl">
          Test your network latency, jitter, and packet loss to various servers around the world
        </p>
      </div>

      <Tabs defaultValue="test" className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="test" className="flex items-center gap-2">
            <Gauge className="h-4 w-4" />
            <span>Test</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span>History</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="test" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Latency Test
                </CardTitle>
                <CardDescription>
                  Test your connection to {selectedServer?.location || "loading..."} [{selectedServer?.company || "Cloudflare"}]
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-6">
                <div className="relative mb-8">
                  <div className="w-48 h-48 rounded-full border-8 border-muted flex items-center justify-center">
                    <AnimatePresence mode="wait">
                      {isRunning && (
                        <motion.div 
                          key="testing"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-center"
                        >
                          {currentLatency ? (
                            <>
                              <div className="text-4xl font-bold">{currentLatency}</div>
                              <div className="text-sm text-muted-foreground">ms</div>
                            </>
                          ) : (
                            <div className="text-xl text-muted-foreground">Testing...</div>
                          )}
                        </motion.div>
                      )}
                      
                      {!isRunning && showFinalResult && (
                        <motion.div 
                          key="result"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ 
                            type: "spring",
                            stiffness: 300,
                            damping: 20
                          }}
                          className="text-center"
                        >
                          <div className="text-4xl font-bold text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">{averageLatency}</div>
                          <div className="text-sm text-amber-400 font-medium">ms (avg)</div>
                        </motion.div>
                      )}
                      
                      {!isRunning && !showFinalResult && (
                        <motion.div
                          key="ready"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-center"
                        >
                          <div className="text-xl text-muted-foreground">Ready</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  {isRunning && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-48 h-48 rounded-full border-t-8 border-primary animate-spin"></div>
                    </div>
                  )}
                </div>
                <Button 
                  size="lg" 
                  className="gap-2 px-8" 
                  onClick={handleButtonClick} 
                  disabled={false}
                >
                  <Zap className="h-4 w-4" />
                  {isRunning ? "Stop Test" : "Start Test"}
                </Button>
              </CardContent>
              <CardFooter className="flex justify-between text-sm text-muted-foreground">
                <div>Tests completed: {testCount}</div>
                <div>Duration: {testDuration}s</div>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Results
                </CardTitle>
                <CardDescription>Your network performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="py-6">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="text-sm font-medium">Average Latency</div>
                      <div className="text-2xl font-bold">{averageLatency !== null ? `${averageLatency} ms` : "—"}</div>
                    </div>
                    <Badge
                      variant={
                        averageLatency && averageLatency < 50
                          ? "success"
                          : averageLatency && averageLatency < 100
                            ? "warning"
                            : "destructive"
                      }
                      className="px-3 py-1"
                    >
                      {averageLatency && averageLatency < 50
                        ? "Excellent"
                        : averageLatency && averageLatency < 100
                          ? "Good"
                          : averageLatency
                            ? "Poor"
                            : "—"}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="text-sm font-medium">Jitter</div>
                      <div className="text-2xl font-bold">{jitter !== null ? `${jitter} ms` : "—"}</div>
                    </div>
                    <Badge
                      variant={jitter && jitter < 5 ? "success" : jitter && jitter < 15 ? "warning" : "destructive"}
                      className="px-3 py-1"
                    >
                      {jitter && jitter < 5
                        ? "Stable"
                        : jitter && jitter < 15
                          ? "Acceptable"
                          : jitter
                            ? "Unstable"
                            : "—"}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="text-sm font-medium">Packet Loss</div>
                      <div className="text-2xl font-bold">{packetLoss !== null ? `${packetLoss}%` : "—"}</div>
                    </div>
                    <Badge
                      variant={
                        packetLoss && packetLoss < 1
                          ? "success"
                          : packetLoss && packetLoss < 2.5
                            ? "warning"
                            : "destructive"
                      }
                      className="px-3 py-1"
                    >
                      {packetLoss && packetLoss < 1
                        ? "None"
                        : packetLoss && packetLoss < 2.5
                          ? "Minimal"
                          : packetLoss
                            ? "Significant"
                            : "—"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Latency Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={graphData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[0, "dataMax + 20"]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="latency"
                      stroke="#0ea5e9"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Test History</CardTitle>
              <CardDescription>Your recent latency test results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {testCount === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No tests have been run yet. Start a test to see results here.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {testHistory.slice().reverse().map((test, i) => (
                      <div key={i} className="flex items-center justify-between border-b pb-4">
                        <div>
                          <div className="font-medium">Test #{testCount - i}</div>
                          <div className="text-sm text-muted-foreground">
                            {test.time} • {selectedServer?.location || "Unknown"}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{test.latency} ms</div>
                          <div className="text-sm text-muted-foreground">
                            Jitter: {test.jitter} ms • Loss: {test.packetLoss}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Test Settings</CardTitle>
              <CardDescription>Configure your latency test parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="server">Test Server</Label>
                <Select
                  value={selectedServer?.id}
                  onValueChange={(value) => setSelectedServer(servers.find(s => s.id === value) || null)}
                >
                  <SelectTrigger id="server">
                    <SelectValue placeholder="Select a server" />
                  </SelectTrigger>
                  <SelectContent>
                    {servers.map((server) => (
                      <SelectItem key={server.id} value={server.id}>
                        {server.name} ({server.location}) - {server.company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label 
                    htmlFor="duration" 
                    className={continuousTesting ? "text-muted-foreground" : ""}
                  >
                    Test Duration: {testDuration} seconds
                    {continuousTesting && " (Disabled in continuous mode)"}
                  </Label>
                </div>
                <Slider
                  id="duration"
                  min={1}
                  max={9}
                  step={1}
                  value={[testDuration]}
                  onValueChange={(value) => setTestDuration(value[0])}
                  disabled={continuousTesting}
                  className={continuousTesting ? "opacity-50" : ""}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>1s</span>
                  <span>5s</span>
                  <span>9s</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="advanced">Advanced Settings</Label>
                  <div className="text-sm text-muted-foreground">Show additional test parameters</div>
                </div>
                <Switch id="advanced" checked={showAdvanced} onCheckedChange={setShowAdvanced} />
              </div>

              {showAdvanced && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Packet Size</Label>
                      <div className="text-sm text-muted-foreground">Size of test packets</div>
                    </div>
                    <Select value={packetSize} onValueChange={(value) => setPacketSize(value as 'small' | 'medium' | 'large')}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Packet size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small (32 bytes)</SelectItem>
                        <SelectItem value="medium">Medium (64 bytes)</SelectItem>
                        <SelectItem value="large">Large (1500 bytes)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Test Protocol</Label>
                      <div className="text-sm text-muted-foreground">Network protocol for testing</div>
                    </div>
                    <Select value={protocol} onValueChange={(value) => setProtocol(value as 'http' | 'tcp')}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Protocol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tcp">TCP</SelectItem>
                        <SelectItem value="http">HTTP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="continuous">Continuous Testing</Label>
                      <div className="text-sm text-muted-foreground">Run tests indefinitely until stopped</div>
                    </div>
                    <Switch 
                      id="continuous" 
                      checked={continuousTesting}
                      onCheckedChange={(checked) => setContinuousTesting(checked)}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}
