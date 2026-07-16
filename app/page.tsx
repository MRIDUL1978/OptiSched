"use client";

import React, { useState } from 'react';
import Header from './components/Header';
import StressTestDialog from './components/StressTestDialog';
import ProcessQueue from './components/ProcessQueue';
import MetricsCards from './components/MetricsCards';
import GanttChart from './components/GanttChart';
import BenchmarkDashboard from './components/BenchmarkDashboard';
import { Process, SimulationData, BenchmarkData } from './components/types';

export default function CPUScheduler() {
  const [processes, setProcesses] = useState<Process[]>([
    { id: 'P1', arrivalTime: 0, burstTime: 5, priority: 1 },
    { id: 'P2', arrivalTime: 1, burstTime: 3, priority: 2 },
    { id: 'P3', arrivalTime: 2, burstTime: 8, priority: 1 },
  ]);

  const [algorithm, setAlgorithm] = useState('FCFS');
  const [timeQuantum, setTimeQuantum] = useState(4);
  const [simulationData, setSimulationData] = useState<SimulationData | null>(null);

  const [benchmarkData, setBenchmarkData] = useState<BenchmarkData | null>(null);
  const [isBenchmarking, setIsBenchmarking] = useState(false);

  const [open, setOpen] = useState(false);
  const [noOfProcesses, setNoOfProcesses] = useState<number>(0);
  const [benchTimeQuantum, setBenchTimeQuantum] = useState<number>(0);

  const [newP, setNewP] = useState({ arrival: 0, burst: 1, priority: 1 });

  const handleAddProcess = () => {
    const nextId = `P${processes.length + 1}`;
    setProcesses([...processes, { id: nextId, arrivalTime: newP.arrival, burstTime: newP.burst, priority: newP.priority }]);
  };

  const handleRemoveProcess = (id: string) => {
    setProcesses(processes.filter(p => p.id !== id));
    setSimulationData(null);
  };

  const handleSimulate = async () => {
    try {
      const res = await fetch('api/simulate', {
        method: 'POST',
        body: JSON.stringify({
          mode: 'simulate',
          algorithm,
          processes,
          timeQuantum
        })
      });

      const data = await res.json();

      if (!res.ok) {
        console.log("Backend Error", data);
        alert(`Backend Error: ${data.error}`);
        return;
      }

      setSimulationData({
        results: data.processes,
        metrics: {
          avgWait: data.metrics.averageWaitingTime,
          avgTurnaround: data.metrics.averageTurnaroundTime
        }
      });

    } catch (err) {
      console.log("Simulation Failed.", err);
      alert("failed to connect to backend API");
    }
  };

  const handleStressTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
    setIsBenchmarking(true);
    setBenchmarkData(null);
    try {
      const res = await fetch('api/simulate', {
        method: 'POST',
        body: JSON.stringify({
          mode: 'benchmark',
          numProcesses: noOfProcesses,
          timeQuantum: benchTimeQuantum
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(`Backend Error: ${data.error}`);
        return;
      }

      if (!data.numProcesses) {
        alert(`Error: The engine returned the wrong data format.`);
        return;
      }

      setBenchmarkData(data);
    } catch (err) {
      alert("Failed to run stress test");
    } finally {
      setIsBenchmarking(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6 lg:space-y-8">

        <Header
          algorithm={algorithm}
          setAlgorithm={setAlgorithm}
          timeQuantum={timeQuantum}
          setTimeQuantum={setTimeQuantum}
          isBenchmarking={isBenchmarking}
          onOpenStressTest={() => setOpen(true)}
          onSimulate={handleSimulate}
        />

        <StressTestDialog
          open={open}
          onOpenChange={setOpen}
          noOfProcesses={noOfProcesses}
          setNoOfProcesses={setNoOfProcesses}
          timeQuantum={benchTimeQuantum}
          setTimeQuantum={setBenchTimeQuantum}
          isBenchmarking={isBenchmarking}
          onSubmit={handleStressTest}
        />

        {isBenchmarking && (
          <div className="bg-slate-900 border border-purple-500/30 rounded-xl p-8 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-300 font-medium">Running stress test — please wait...</p>
            <p className="text-sm text-slate-500">This may take a while depending on the number of processes.</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

          <ProcessQueue
            processes={processes}
            isBenchmarking={isBenchmarking}
            newProcess={newP}
            setNewProcess={setNewP}
            onAddProcess={handleAddProcess}
            onRemoveProcess={handleRemoveProcess}
          />

          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            <MetricsCards simulationData={simulationData} />
            <GanttChart simulationData={simulationData} />
            {benchmarkData && <BenchmarkDashboard benchmarkData={benchmarkData} />}
          </div>
        </div>
      </div>
    </div>
  );
}
