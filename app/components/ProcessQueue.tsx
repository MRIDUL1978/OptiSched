import { Plus, Trash2, Server } from 'lucide-react';
import { Process } from './types';

interface ProcessQueueProps {
  processes: Process[];
  isBenchmarking: boolean;
  newProcess: { arrival: number; burst: number; priority: number };
  setNewProcess: (value: { arrival: number; burst: number; priority: number }) => void;
  onAddProcess: () => void;
  onRemoveProcess: (id: string) => void;
}

const ProcessQueue = ({ processes, isBenchmarking, newProcess, setNewProcess, onAddProcess, onRemoveProcess }: ProcessQueueProps) => {
  return (
    <div className="lg:col-span-1 bg-slate-900 rounded-xl p-5 border border-slate-800">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-200"><Server size={18} /> Process Queue</h2>

      {/* Add Process Form */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Arrival</label>
          <input type="number" min="0" value={newProcess.arrival} onChange={e => setNewProcess({ ...newProcess, arrival: Number(e.target.value) })} disabled={isBenchmarking} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 disabled:opacity-50 focus:border-blue-500 outline-none transition-colors" />
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Burst</label>
          <input type="number" min="1" value={newProcess.burst} onChange={e => setNewProcess({ ...newProcess, burst: Number(e.target.value) })} disabled={isBenchmarking} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 disabled:opacity-50 focus:border-blue-500 outline-none transition-colors" />
        </div>
        <div className="flex items-end">
          <button onClick={onAddProcess} disabled={isBenchmarking} className="w-full bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg py-2 flex justify-center items-center transition-colors">
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
            <button onClick={() => onRemoveProcess(p.id)} disabled={isBenchmarking} className="text-slate-600 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100 transition-all">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProcessQueue;
