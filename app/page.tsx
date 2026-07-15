"use client";

import React, { useState, useMemo } from 'react';
import { Play, Plus, Trash2, Cpu, Clock, Activity, Server, Zap } from 'lucide-react';

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

  const handleStressTest = async () => {
    setIsBenchmarking(true)
    setBenchmarkData(null)
    try {
      const res = await fetch('api/simulate',{
        method: 'POST',
        body: JSON.stringify({
          mode: 'benchmark',
          numProcesses: 10000,
          timeQuantum: 4
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
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex items-center justify-between border-b border-slate-700 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Cpu className="text-blue-500" size={32} />
              OptiSched Engine
            </h1>
            <p className="text-slate-400 mt-2">Advanced CPU Scheduling Simulator & Benchmarking</p>
          </div>
          <div className="flex gap-4">
            <select 
              value={algorithm} 
              onChange={(e) => setAlgorithm(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
            >
              <option value="FCFS">First-Come, First-Served (FCFS)</option>
              <option value="SJF">Shortest Job First (SJF)</option>
              <option value="RR">Round Robin (RR)</option>
              <option value="MLFQ">Multilevel Feedback Queue (MLFQ)</option>
            </select>
            {algorithm === 'RR' && (
              <input 
                type="number" min="1" value={timeQuantum} onChange={(e) => setTimeQuantum(Number(e.target.value))}
                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 w-24 outline-none focus:border-blue-500"
                title="Time Quantum"
              />
            )}

            <button 
              onClick={handleStressTest}
              disabled={isBenchmarking}
              className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
            >
              <Zap size={18} /> {isBenchmarking ? 'Testing...' : 'Stress Test'}
            </button>


            <button 
              onClick={handleSimulate}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
            >
              <Play size={18} /> Simulate
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {}
          <div className="lg:col-span-1 bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Server size={20}/> Process Queue</h2>
            
            {/* Add Process Form */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              <div>
                <label className="text-xs text-slate-400">Arrival</label>
                <input type="number" min="0" value={newP.arrival} onChange={e => setNewP({...newP, arrival: Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-400">Burst</label>
                <input type="number" min="1" value={newP.burst} onChange={e => setNewP({...newP, burst: Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm" />
              </div>
              <div className="flex items-end">
                <button onClick={handleAddProcess} className="w-full bg-slate-700 hover:bg-slate-600 rounded p-2 flex justify-center items-center transition-colors">
                  <Plus size={20} />
                </button>
              </div>
            </div>

            {/* Process List */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {processes.map((p, idx) => (
                <div key={p.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex justify-between items-center group">
                  <div>
                    <div className="font-bold text-blue-400">{p.id}</div>
                    <div className="text-xs text-slate-400 mt-1">Arrival: {p.arrivalTime}ms | Burst: {p.burstTime}ms</div>
                  </div>
                  <button onClick={() => handleRemoveProcess(p.id)} className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex items-center gap-4">
                <div className="p-4 bg-blue-500/10 rounded-full text-blue-400"><Clock size={24}/></div>
                <div>
                  <div className="text-sm text-slate-400">Avg Waiting Time</div>
                  <div className="text-2xl font-bold">{simulationData ? simulationData.metrics.avgWait.toFixed(2) : '--'} ms</div>
                </div>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex items-center gap-4">
                <div className="p-4 bg-purple-500/10 rounded-full text-purple-400"><Activity size={24}/></div>
                <div>
                  <div className="text-sm text-slate-400">Avg Turnaround Time</div>
                  <div className="text-2xl font-bold">{simulationData ? simulationData.metrics.avgTurnaround.toFixed(2) : '--'} ms</div>
                </div>
              </div>
            </div>

            {/* Gantt Chart */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 min-h-[300px]">
              <h2 className="text-xl font-semibold mb-6">Execution Timeline (Gantt)</h2>
              
              {!simulationData ? (
                <div className="h-40 flex items-center justify-center text-slate-500 border-2 border-dashed border-slate-700 rounded-lg">
                  Click Simulate to generate timeline
                </div>
              ) : (
                <div className="relative pt-8 pb-4">
                  <div className="h-16 relative bg-slate-900 rounded-lg overflow-hidden border border-slate-700 flex">
                    {simulationData.results.map((res, i) => {
                      const width = ((res.completionTime - res.startTime) / maxTime) * 100;
                      const left = (res.startTime / maxTime) * 100;
                      const color = colors[i % colors.length];
                      
                      return (
                        <div 
                          key={i} 
                          className={`absolute h-full ${color} border-r border-black/20 flex items-center justify-center text-sm font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] hover:brightness-110 transition-all cursor-default`}
                          style={{ left: `${left}%`, width: `${width}%` }}
                          title={`Wait: ${res.waitingTime}ms | Turnaround: ${res.turnaroundTime}ms`}
                        >
                          {res.id}
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Time Axis */}
                  <div className="absolute top-1 left-0 w-full flex justify-between text-xs text-slate-500">
                    <span>0ms</span>
                    <span>{maxTime}ms</span>
                  </div>
                </div>
              )}
            </div>

              {/* Benchmark Dashboard */}
            {benchmarkData && (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Zap className="text-purple-400" />
                    Stress Test Results
                  </h2>
                  <span className="bg-purple-500/20 text-purple-300 text-xs px-3 py-1 rounded-full border border-purple-500/30">
                    N = {benchmarkData.numProcesses.toLocaleString()} Processes
                  </span>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {benchmarkData.results.map((res: any, idx: number) => (
                    <div key={idx} className="bg-slate-900 border border-slate-700 rounded-lg p-4 relative overflow-hidden group hover:border-purple-500/50 transition-colors">
                      <div className="absolute top-0 left-0 w-full h-1 bg-linear-gradient-to-r from-purple-500 to-blue-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                      <h3 className="font-bold text-lg text-white mb-3">{res.algorithm}</h3>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Avg Wait:</span>
                          <span className="font-medium text-blue-400">{res.avgWait}ms</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Avg Turn:</span>
                          <span className="font-medium text-green-400">{res.avgTurnaround.toFixed(2)}ms</span>
                        </div>
                      </div>
                      
                      <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                        <span className="text-slate-500">C++ Core Time</span>
                        <span className="font-mono text-purple-400 bg-purple-500/10 px-2 py-1 rounded">
                          {res.engineExecTimeMs.toFixed(3)} ms
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