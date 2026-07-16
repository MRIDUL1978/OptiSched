import { Clock, Activity } from 'lucide-react';
import { SimulationData } from './types';

interface MetricsCardsProps {
  simulationData: SimulationData | null;
}

const MetricsCards = ({ simulationData }: MetricsCardsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400"><Clock size={22} /></div>
        <div className="min-w-0">
          <div className="text-xs text-slate-500 uppercase tracking-wider">Avg Waiting Time</div>
          <div className="text-xl sm:text-2xl font-bold text-slate-100 mt-0.5">{simulationData ? simulationData.metrics.avgWait.toFixed(2) : '--'}<span className="text-sm font-normal text-slate-500 ml-1">ms</span></div>
        </div>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
        <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400"><Activity size={22} /></div>
        <div className="min-w-0">
          <div className="text-xs text-slate-500 uppercase tracking-wider">Avg Turnaround Time</div>
          <div className="text-xl sm:text-2xl font-bold text-slate-100 mt-0.5">{simulationData ? simulationData.metrics.avgTurnaround.toFixed(2) : '--'}<span className="text-sm font-normal text-slate-500 ml-1">ms</span></div>
        </div>
      </div>
    </div>
  )
}

export default MetricsCards;
