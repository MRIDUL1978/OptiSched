import { Zap } from 'lucide-react';
import { BenchmarkData } from './types';

interface BenchmarkDashboardProps {
  benchmarkData: BenchmarkData;
}

const BenchmarkDashboard = ({ benchmarkData }: BenchmarkDashboardProps) => {
  return (
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
        {benchmarkData.results.map((res, idx) => (
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
  );
};

export default BenchmarkDashboard;
