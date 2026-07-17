import { Cpu, Zap, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  algorithm: string;
  setAlgorithm: (value: string) => void;
  timeQuantum: number;
  setTimeQuantum: (value: number) => void;
  isBenchmarking: boolean;
  onOpenStressTest: () => void;
  onSimulate: () => void;
}

const Header = ({ algorithm, setAlgorithm, timeQuantum, setTimeQuantum, isBenchmarking, onOpenStressTest, onSimulate }: HeaderProps) => {
  return (
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
            <option value="PRIORITY">Priority Scheduling (PRIORITY)</option>
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
            onClick={onOpenStressTest}
            disabled={isBenchmarking}
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm outline-none focus:border-blue-500 transition-colors flex items-center gap-2 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Zap size={16} />
            Stress Test
          </button>

          <Button
            onClick={onSimulate}
            disabled={isBenchmarking}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play size={18} />
            Run Simulation
          </Button>
        </div>
      </div>
    </header>
  )
}

export default Header;
