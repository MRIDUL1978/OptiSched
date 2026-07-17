import { useMemo } from 'react';
import { SimulationData, GanttSegment, SimulationResult } from './types';

interface GanttChartProps {
  simulationData: SimulationData | null;
}

const COLORS = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500'];

const GanttChart = ({ simulationData }: GanttChartProps) => {
  const maxTime = useMemo(() => {
    if (!simulationData) return 0;
    const allTimes = simulationData.gantt.length > 0
      ? simulationData.gantt
      : simulationData.results;
    return Math.max(...allTimes.map(r => r.completionTime));
  }, [simulationData]);

  const resultsById = useMemo(() => {
    if (!simulationData) return {};
    const map: Record<string, SimulationResult> = {};
    for (const r of simulationData.results) {
      map[r.id] = r;
    }
    return map;
  }, [simulationData]);

  return (
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
              const segments: GanttSegment[] = simulationData.gantt.length > 0
                ? simulationData.gantt
                : simulationData.results;

              const uniqueIds = [...new Set(segments.map(r => r.id))];
              const idColorMap: Record<string, string> = {};
              uniqueIds.forEach((id, i) => { idColorMap[id] = COLORS[i % COLORS.length]; });

              return uniqueIds.map((id) => {
                const segs = segments.filter(r => r.id === id);
                const color = idColorMap[id];
                const result = resultsById[id];

                return (
                  <div key={id} className="flex items-center border-b border-slate-800/50 last:border-b-0">
                    <div className="w-14 shrink-0 text-xs font-bold text-slate-400 text-center px-1 truncate">{id}</div>
                    <div className="relative h-10 flex-1">
                      {segs.map((seg, i) => {
                        const width = ((seg.completionTime - seg.startTime) / maxTime) * 100;
                        const left = (seg.startTime / maxTime) * 100;

                        const tooltip = result
                          ? `${seg.id} | Start: ${seg.startTime}ms | End: ${seg.completionTime}ms | Wait: ${result.waitingTime}ms | Turnaround: ${result.turnaroundTime}ms`
                          : `${seg.id} | Start: ${seg.startTime}ms | End: ${seg.completionTime}ms`;

                        return (
                          <div
                            key={i}
                            className={`absolute h-full ${color} border-r border-black/20 flex items-center justify-center text-xs font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] hover:brightness-110 transition-all cursor-default`}
                            style={{ left: `${left}%`, width: `${width}%` }}
                            title={tooltip}
                          >
                            {width > 4 && `${seg.startTime}-${seg.completionTime}`}
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
  );
};

export default GanttChart;
