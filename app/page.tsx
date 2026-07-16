"use client";

import React, { useState, useMemo } from 'react';
import { Play, Plus, Trash2, Cpu, Clock, Activity, Server, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Interfaces for our data structures
interface Process {
  id: string;
  arrivalTime: number;
  burstTime: number;
  priority: number;
}

interface SimulationResult {
  id: string;
  startTime: number;
  completionTime: number;
  waitingTime: number;
  turnaroundTime: number;
}

interface Metrics {
  avgWait: number;
  avgTurnaround: number;
}

export default function CPUScheduler() {
  const [processes, setProcesses] = useState<Process[]>([
    { id: 'P1', arrivalTime: 0, burstTime: 5, priority: 1 },
    { id: 'P2', arrivalTime: 1, burstTime: 3, priority: 2 },
    { id: 'P3', arrivalTime: 2, burstTime: 8, priority: 1 },
  ]);
  
  const [algorithm, setAlgorithm] = useState('FCFS')
  const [timeQuantum, setTimeQuantum] = useState(4)
  const [simulationData, setSimulationData] = useState<{results: SimulationResult[], metrics: Metrics} | null>(null);

  const [benchmarkData, setBenchmarkData] = useState<any>(null)
  const [isBenchmarking, setIsBenchmarking] = useState(false)

  const [open, setOpen] = useState(false)
  const [noOfProcesses, setNoOfProcesses] = useState<number>(0)
  const [tQ, settQ] = useState<number>(0)

  // Form State
  const [newP, setNewP] = useState({ arrival: 0, burst: 1, priority: 1 });

  const handleAddProcess = async () => {
    const nextId = `P${processes.length + 1}`;
    setProcesses([...processes, { id: nextId, arrivalTime: newP.arrival, burstTime: newP.burst, priority: newP.priority }]);
  };

  const handleRemoveProcess = (id: string) => {
    setProcesses(processes.filter(p => p.id !== id));
    setSimulationData(null);
  };

  const handleSimulate = async () => {
    try  {
      const res = await fetch('api/simulate',{
        method: 'POST',
        body: JSON.stringify({
          mode: 'simulate',
          algorithm,
          processes,
          timeQuantum
        })
      })

      const data = await res.json();

      if(!res.ok) {
        console.log("Backend Error", data)
        alert(`Backend Error: ${data.error}`)
        return;
      }

      setSimulationData({
        results: data.processes, 
        metrics: {
          avgWait: data.metrics.averageWaitingTime,
          avgTurnaround: data.metrics.averageTurnaroundTime
        }
      })

    } catch (err) {
      console.log("Simulation Fialed.",err)
      alert("failed to connect to backedn API")
    }
  }

  const handleStressTest = async (e: React.FormEvent) => {
    e.preventDefault()
    setOpen(false)
    setIsBenchmarking(true)
    setBenchmarkData(null)
    try {
      const res = await fetch('api/simulate',{
        method: 'POST',
        body: JSON.stringify({
          mode: 'benchmark',
          numProcesses: noOfProcesses,
          timeQuantum: tQ
        })
      })

      const data = await res.json()

      if(!res.ok) {
        console.log(`Backend Error: ${data.error}`)
        alert(`Backend Error: ${data.error}`)
        return;
      }

      if(!data.numProcesses) {
        console.log("Error: The C++ engine returned the wrong data format.")
        alert(`Error: The C++ engine returned the wrong data format.`)
        return;
      }

      setBenchmarkData(data)
    } catch (err) {
      console.log("Benchmark Failed", err)
      alert("Failed to run stress test")
    } finally {
      setIsBenchmarking(false)
    }
  }


  const maxTime = useMemo(() => {
    if (!simulationData) return 0;
    return Math.max(...simulationData.results.map(r => r.completionTime));
  }, [simulationData]);

  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500'];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6 lg:space-y-8">
        
        {/* Header */}
        <header className="border-b border-slate-800 pb-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Cpu className="text-blue-400" size={28} />
                </div>
                OptiSched Engine
              </h1>
              <p className="text-slate-400 mt-1 text-sm sm:text-base">Advanced CPU Scheduling Simulator &amp; Benchmarking</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select 
                value={algorithm} 
                onChange={(e) => setAlgorithm(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm outline-none focus:border-blue-500 transition-colors"
              >
                <option value="FCFS">First-Come, First-Served (FCFS)</option>
                <option value="SJF">Shortest Job First (SJF)</option>
                <option value="RR">Round Robin (RR)</option>
                <option value="MLFQ">Multilevel Feedback Queue (MLFQ)</option>
              </select>
              {algorithm === 'RR' && (
                <input 
                  type="number" min="1" value={timeQuantum} onChange={(e) => setTimeQuantum(Number(e.target.value))}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 w-24 text-sm outline-none focus:border-blue-500 transition-colors"
                  title="Time Quantum"
                />
              )}

              <button 
                onClick={() => setOpen(true)}
                disabled={isBenchmarking}
                className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 sm:px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
              >
                <Zap size={16} /> Stress Test
              </button>

              <button 
                onClick={handleSimulate}
                disabled={isBenchmarking}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 sm:px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
              >
                <Play size={16} /> Simulate
              </button>
            </div>
          </div>
        </header>

        {/* Stress Test Dialog */}
        <Dialog open={open} onOpenChange={(v) => !isBenchmarking && setOpen(v)}>
          <DialogContent className="bg-slate-800 border border-slate-700 text-slate-100">
            <DialogHeader>
              <DialogTitle className="text-white">Stress Test</DialogTitle>
              <DialogDescription>Configure the stress test parameters and hit submit.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleStressTest}>
              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <Label htmlFor="noOfProcesses">Number of Processes</Label>
                  <Input
                    id="noOfProcesses"
                    type="number"
                    min="1"
                    value={noOfProcesses}
                    onChange={(e) => setNoOfProcesses(Number(e.target.value))}
                    className="bg-slate-900 border-slate-700 text-white focus:border-blue-500"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tQ">Time Quantum</Label>
                  <Input
                    id="tQ"
                    type="number"
                    min="1"
                    value={tQ}
                    onChange={(e) => settQ(Number(e.target.value))}
                    className="bg-slate-900 border-slate-700 text-white focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setOpen(false)} className="border-slate-700 text-slate-300 hover:bg-slate-700">Cancel</Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white border-none">Run Stress Test</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {isBenchmarking && (
          <div className="bg-slate-900 border border-purple-500/30 rounded-xl p-8 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-300 font-medium">Running stress test — please wait...</p>
            <p className="text-sm text-slate-500">This may take a while depending on the number of processes.</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Process Queue */}
          <div className="lg:col-span-1 bg-slate-900 rounded-xl p-5 border border-slate-800">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-200"><Server size={18}/> Process Queue</h2>
            
            {/* Add Process Form */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Arrival</label>
                <input type="number" min="0" value={newP.arrival} onChange={e => setNewP({...newP, arrival: Number(e.target.value)})} disabled={isBenchmarking} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 disabled:opacity-50 focus:border-blue-500 outline-none transition-colors" />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Burst</label>
                <input type="number" min="1" value={newP.burst} onChange={e => setNewP({...newP, burst: Number(e.target.value)})} disabled={isBenchmarking} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 disabled:opacity-50 focus:border-blue-500 outline-none transition-colors" />
              </div>
              <div className="flex items-end">
                <button onClick={handleAddProcess} disabled={isBenchmarking} className="w-full bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg py-2 flex justify-center items-center transition-colors">
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Process List */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {processes.map((p) => (
                <div key={p.id} className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex justify-between items-center group hover:border-slate-700 transition-colors">
                  <div>
                    <div className="font-bold text-blue-400 text-sm">{p.id}</div>
                    <div className="text-xs text-slate-500 mt-0.5">Arrival: {p.arrivalTime}ms | Burst: {p.burstTime}ms</div>
                  </div>
                  <button onClick={() => handleRemoveProcess(p.id)} disabled={isBenchmarking} className="text-slate-600 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            
            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400"><Clock size={22}/></div>
                <div className="min-w-0">
                  <div className="text-xs text-slate-500 uppercase tracking-wider">Avg Waiting Time</div>
                  <div className="text-xl sm:text-2xl font-bold text-slate-100 mt-0.5">{simulationData ? simulationData.metrics.avgWait.toFixed(2) : '--'}<span className="text-sm font-normal text-slate-500 ml-1">ms</span></div>
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400"><Activity size={22}/></div>
                <div className="min-w-0">
                  <div className="text-xs text-slate-500 uppercase tracking-wider">Avg Turnaround Time</div>
                  <div className="text-xl sm:text-2xl font-bold text-slate-100 mt-0.5">{simulationData ? simulationData.metrics.avgTurnaround.toFixed(2) : '--'}<span className="text-sm font-normal text-slate-500 ml-1">ms</span></div>
                </div>
              </div>
            </div>

            {/* Gantt Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 min-h-[300px]">
              <h2 className="text-lg font-semibold mb-5 text-slate-200">Execution Timeline (Gantt)</h2>
              
              {!simulationData ? (
                <div className="h-40 flex items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-lg">
                  Click Simulate to generate timeline
                </div>
              ) : (
                <div className="relative pt-8 pb-4 overflow-x-auto">
                  <div className="relative bg-slate-950 rounded-lg border border-slate-800 min-w-[400px]">
                    {(() => {
                      const uniqueIds = [...new Set(simulationData.results.map(r => r.id))];
                      const idColorMap: Record<string, string> = {};
                      uniqueIds.forEach((id, i) => { idColorMap[id] = colors[i % colors.length]; });

                      return uniqueIds.map((id) => {
                        const segments = simulationData.results.filter(r => r.id === id);
                        const color = idColorMap[id];

                        return (
                          <div key={id} className="flex items-center border-b border-slate-800/50 last:border-b-0">
                            <div className="w-14 shrink-0 text-xs font-bold text-slate-400 text-center px-1 truncate">{id}</div>
                            <div className="relative h-10 flex-1">
                              {segments.map((res, i) => {
                                const width = ((res.completionTime - res.startTime) / maxTime) * 100;
                                const left = (res.startTime / maxTime) * 100;

                                return (
                                  <div 
                                    key={i} 
                                    className={`absolute h-full ${color} border-r border-black/20 flex items-center justify-center text-xs font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] hover:brightness-110 transition-all cursor-default`}
                                    style={{ left: `${left}%`, width: `${width}%` }}
                                    title={`${res.id} | Wait: ${res.waitingTime}ms | Turnaround: ${res.turnaroundTime}ms`}
                                  >
                                    {width > 4 && `${res.startTime}-${res.completionTime}`}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                  
                  {/* Time Axis */}
                  <div className="flex items-center mt-1 min-w-[400px]">
                    <div className="w-14 shrink-0" />
                    <div className="relative flex-1 h-5">
                      <span className="absolute left-0 text-xs text-slate-600">0ms</span>
                      <span className="absolute right-0 text-xs text-slate-600">{maxTime}ms</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Benchmark Dashboard */}
            {benchmarkData && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-200">
                    <Zap className="text-purple-400" size={18} />
                    Stress Test Results
                  </h2>
                  <span className="bg-purple-500/15 text-purple-300 text-xs px-3 py-1.5 rounded-full border border-purple-500/20 self-start">
                    N = {benchmarkData.numProcesses.toLocaleString()} Processes
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {benchmarkData.results.map((res: any, idx: number) => (
                    <div key={idx} className="bg-slate-950 border border-slate-800 rounded-lg p-4 relative overflow-hidden group hover:border-purple-500/40 transition-colors">
                      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 opacity-40 group-hover:opacity-100 transition-opacity" />
                      <h3 className="font-bold text-sm text-white mb-3">{res.algorithm}</h3>
                      
                      <div className="space-y-2 mb-3">
                        <div className="flex items-start justify-between gap-2 text-sm">
                          <span className="text-slate-500 whitespace-nowrap">Avg Wait:</span>
                          <span className="font-medium text-blue-400 text-right break-all leading-snug">{res.avgWait}ms</span>
                        </div>
                        <div className="flex items-start justify-between gap-2 text-sm">
                          <span className="text-slate-500 whitespace-nowrap">Avg Turn:</span>
                          <span className="font-medium text-green-400 text-right break-all leading-snug">{res.avgTurnaround.toFixed(2)}ms</span>
                        </div>
                      </div>
                      
                      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                        <span className="text-slate-600 whitespace-nowrap">C++ Core</span>
                        <span className="font-mono text-purple-400 bg-purple-500/10 px-2 py-1 rounded whitespace-nowrap">
                          {res.engineExecTimeMs.toFixed(3)}ms
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}


          </div>
        </div>
      </div>
    </div>
  );
}