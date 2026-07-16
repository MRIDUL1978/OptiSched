export interface Process {
  id: string;
  arrivalTime: number;
  burstTime: number;
  priority: number;
}

export interface SimulationResult {
  id: string;
  startTime: number;
  completionTime: number;
  waitingTime: number;
  turnaroundTime: number;
}

export interface Metrics {
  avgWait: number;
  avgTurnaround: number;
}

export interface BenchmarkResult {
  algorithm: string;
  avgWait: number;
  avgTurnaround: number;
  engineExecTimeMs: number;
}

export interface BenchmarkData {
  numProcesses: number;
  results: BenchmarkResult[];
}

export interface SimulationData {
  results: SimulationResult[];
  metrics: Metrics;
}
