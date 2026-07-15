#include<iostream>
#include<vector>
#include<string>
#include<algorithm>
#include<iomanip>
#include<queue>
#include<chrono>
#include<random>
#include<cctype>
#include "Process.h"

using namespace std;

const int CONTEXT_SWITCH_PENALTY = 1;

bool cmp (const Process &a, const  Process &b) {
  if(a.arrivalTime == b.arrivalTime) return a.id < b.id;
  return a.arrivalTime < b.arrivalTime;
}

void FCFS(vector<Process>& processes) {
    sort(processes.begin(), processes.end(), cmp);
    
    int currentTime = 0;
    for(auto &it : processes) {
      if(currentTime < it.arrivalTime) currentTime = it.arrivalTime;

      currentTime += CONTEXT_SWITCH_PENALTY;

      it.startTime = currentTime;
      it.completionTime = currentTime + it.burstTime;
      it.turnaroundTime = it.completionTime - it.arrivalTime;
      it.waitingTime = it.turnaroundTime - it.burstTime;

      currentTime = it.completionTime;
    }
}

struct compareBurstTime {
  const vector<Process>* procs;
  compareBurstTime(const vector<Process>* p) : procs(p) {}
  bool operator()(int a , int b) {
    if((*procs)[a].burstTime == (*procs)[b].burstTime) return (*procs)[a].arrivalTime > (*procs)[b].arrivalTime;
    return (*procs)[a].burstTime > (*procs)[b].burstTime;
  }
};

void SJF(vector<Process>& processes) {
  sort(processes.begin(), processes.end(), cmp);

  priority_queue<int, vector<int>, compareBurstTime> readyQueue{compareBurstTime(&processes)};  

  int currentTime = 0;
  int cnt = 0;
  int n = processes.size();
  int index = 0;

  while(cnt < n) {
    while(index < n && processes[index].arrivalTime <= currentTime) {
      readyQueue.push(index);
      index++;
    }

    if(readyQueue.empty()) {
      currentTime = processes[index].arrivalTime;
      continue;
    }

    int pIdx = readyQueue.top();
    readyQueue.pop();

    Process &currentProcess = processes[pIdx];

    currentTime += CONTEXT_SWITCH_PENALTY;

    currentProcess.startTime = (currentTime > currentProcess.arrivalTime) ? currentTime :  
    currentProcess.arrivalTime;

    currentProcess.completionTime = currentTime + currentProcess.burstTime;
    currentProcess.turnaroundTime = currentProcess.completionTime - currentProcess.arrivalTime;
    currentProcess.waitingTime = currentProcess.turnaroundTime - currentProcess.burstTime;

    currentTime = currentProcess.completionTime;
    cnt++;
  }
  
}

void RR(vector<Process>& processes, int timeQuantum) {
  sort(processes.begin(), processes.end(), cmp);

  queue<int> readyQueue;
  int currentTime = 0;
  int cnt = 0;
  int n = processes.size();
  int index = 0;

  if(n > 0) {
    currentTime = processes[0].arrivalTime;
    while(index < n && processes[index].arrivalTime <= currentTime) {
      readyQueue.push(index);
      index++;
    }
  }

  while(cnt < n) {
    if(readyQueue.empty()) {
      currentTime = processes[index].arrivalTime;
      while(index < n && processes[index].arrivalTime <= currentTime) {
        readyQueue.push(index);
        index++;
      }
    }

    int pIdx = readyQueue.front();
    readyQueue.pop();

    Process &currentProcess = processes[pIdx];

    currentTime += CONTEXT_SWITCH_PENALTY;

    if(currentProcess.startTime == -1) currentProcess.startTime = currentTime;

    int execTime = min(currentProcess.remainingTime, timeQuantum);
    currentTime += execTime;
    currentProcess.remainingTime -= execTime;


    while(index < n && processes[index].arrivalTime <= currentTime) {
      readyQueue.push(index);
      index++;
    }

    if(currentProcess.remainingTime > 0 ) readyQueue.push(pIdx);
    else {
      currentProcess.completionTime = currentTime;
      currentProcess.turnaroundTime = currentProcess.completionTime - currentProcess.arrivalTime;
      currentProcess.waitingTime = currentProcess.turnaroundTime - currentProcess.burstTime;
      cnt++;
    }
  }
}

void MLFQ(vector<Process>& processes) {
  sort(processes.begin(), processes.end(), cmp);

  queue<int> q0, q1, q2;
  int topQueueQuantum0  = 2;
  int topQueueQuantum1 = 4;

  int currentTime = 0, cnt = 0;
  int n = processes.size(), index = 0;

  if(n > 0) {
    currentTime = processes[0].arrivalTime;
    while(index < n && processes[index].arrivalTime <= currentTime) {
      q0.push(index);
      index++;
    }
  }

  while (cnt < n) {
     if(q0.empty() && q1.empty() && q2.empty()) {
      currentTime = processes[index].arrivalTime;
      while(index < n && processes[index].arrivalTime <= currentTime) {
        q0.push(index);
        index++;
      }
     }

     int pIdx = -1;
     int currentLevel = 0;
     int tq = 0;  

     if(!q0.empty()) {
      pIdx = q0.front();
      q0.pop();
      currentLevel = 0;
      tq = topQueueQuantum0;
     } else if(!q1.empty()) {
      pIdx = q1.front();
      q1.pop();
      currentLevel = 1;
      tq = topQueueQuantum1;
     } else {
      pIdx = q2.front();
      q2.pop();
      currentLevel = 2;
     }

     Process &currentProcess = processes[pIdx];

     if(currentLevel == 2) tq = currentProcess.remainingTime;

     currentTime += CONTEXT_SWITCH_PENALTY; 
     if(currentProcess.startTime == -1) currentProcess.startTime = currentTime;

     int execTime = 0;
     if(currentLevel == 2 && index < n) {
      int timeUntilNextArrival = processes[index].arrivalTime - currentTime;
      if(timeUntilNextArrival > 0 && timeUntilNextArrival < currentProcess.remainingTime) {
        execTime = timeUntilNextArrival;
      } else {
        execTime = currentProcess.remainingTime;
      }
     } else {
      execTime = min(currentProcess.remainingTime, tq);
     }

     currentTime += execTime;
     currentProcess.remainingTime -= execTime;

     while(index < n && processes[index].arrivalTime <= currentTime) {
      q0.push(index);
      index++;
     }

     if(currentProcess.remainingTime > 0) {
      if(currentLevel == 0) q1.push(pIdx);
      else if(currentLevel == 1) q2.push(pIdx);
      else q2.push(pIdx);
     } else {
      currentProcess.completionTime = currentTime;
      currentProcess.turnaroundTime = currentProcess.completionTime - currentProcess.arrivalTime;
      currentProcess.waitingTime = currentProcess.turnaroundTime - currentProcess.burstTime;
      cnt++;
     }
  }
}

void simulateAlgorithm(string algorithm, vector<Process>& processes, int timeQuantum) {
  if(algorithm == "FCFS") {
    FCFS(processes);
  } else if (algorithm == "SJF") {
    SJF(processes);
  } else if (algorithm == "RR") {
    RR(processes, timeQuantum);
  } else if (algorithm == "MLFQ") {
    MLFQ(processes);
  }
}

void runBenchmark(int numProcesses, int timeQuantum) {
    vector<Process> originalProcesses;
    mt19937 rng(42); 
    uniform_int_distribution<int> arrivalDist(0, numProcesses / 2);
    uniform_int_distribution<int> burstDist(1, 100);
    uniform_int_distribution<int> prioDist(0, 4);
    
    // Add a distribution for I/O burst times (5ms to 25ms)
    uniform_int_distribution<int> ioDist(5, 25); 

    for (int i = 0; i < numProcesses; ++i) {
        string id = "P" + to_string(i + 1);
        Process p(id, arrivalDist(rng), burstDist(rng), prioDist(rng));
        
        // --- I/O BURST LOGIC ---
        // Flag 10% of the workload as I/O-bound to simulate hardware delays
        if (i % 10 == 0) { 
            p.ioBurstTime = ioDist(rng);
        }
        
        originalProcesses.push_back(p);
    }

    string algos[] = {"FCFS", "SJF", "RR", "MLFQ"};
    
    cout << "{\n  \"mode\": \"benchmark\",\n  \"numProcesses\": " << numProcesses << ",\n  \"results\": [\n";
    
    for (int i = 0; i < 4; ++i) {
        vector<Process> pCopy = originalProcesses;
        
        auto start = chrono::high_resolution_clock::now();
        simulateAlgorithm(algos[i], pCopy, timeQuantum);
        auto end = chrono::high_resolution_clock::now();
        double execTimeMs = chrono::duration<double, std::milli>(end - start).count();
        
        double totalWait = 0, totalTurnaround = 0;
        for (const auto& p : pCopy) {
            totalWait += p.waitingTime;
            totalTurnaround += p.turnaroundTime;
        }
        double avgWait = totalWait / numProcesses;
        double avgTurnaround = totalTurnaround / numProcesses;
        
        cout << "    {\n      \"algorithm\": \"" << algos[i] << "\",\n";
        cout << "      \"avgWait\": " << fixed << setprecision(2) << avgWait << ",\n";
        cout << "      \"avgTurnaround\": " << avgTurnaround << ",\n";
        cout << "      \"engineExecTimeMs\": " << execTimeMs << "\n    }" << (i == 3 ? "" : ",") << "\n";
    }
    cout << "  ]\n}\n";
}



int main() {
  // Read mode from user
  string mode;
  if(!(cin >> mode)) return 0;

  string cleanMode = "";
  for(char c : mode) {
    if (isalnum(c)) cleanMode += toupper(c);
  }

  if(cleanMode == "BENCHMARK") {
    int numProcesses, timeQuantum;
    cin >> numProcesses >> timeQuantum;
    runBenchmark(numProcesses, timeQuantum);
    return 0;
  }

//  Read algorithm choice from user
  string algorithm = mode;

  int timeQuantum = 4; // default fallback
  if(algorithm == "RR") {
    cin >> timeQuantum;
  }

//  Read number of processes
  int numProcesses;
  cin >> numProcesses;

  // Parse stream into the process struct 
  vector<Process> processes;
  for(int i = 0; i < numProcesses; i++) {
    string id;
    int arrivalTime;
    int burstTime;
    int priority;
    cin >> id >> arrivalTime >> burstTime >> priority;
    processes.push_back(Process(id, arrivalTime, burstTime, priority));
  }

  // Run the algorithm
  simulateAlgorithm(algorithm, processes , timeQuantum);

  // calculate summary metrics 
  double totalWait = 0, totalTurnaround = 0;
  for(const auto& p : processes) {
    totalWait += p.waitingTime;
    totalTurnaround += p.turnaroundTime;
  }
  double  avgWait = processes.empty() ? 0 : totalWait / processes.size();
  double avgTurnaround = processes.empty() ? 0 : totalTurnaround / processes.size();

  // Output the results as a raw JSON string to standard output.
  // Node.js will parse this string directly into a JavaScript object.
  cout << "{" << endl;
  cout << "  \"algorithm\": \"" << algorithm << "\"," << endl;
  cout << "  \"status\": \"success\"," << endl;
  cout << "  \"metrics\": {" << endl;
  cout << "    \"averageWaitingTime\": " << fixed << setprecision(2) << avgWait << "," << endl;
  cout << "    \"averageTurnaroundTime\": " << avgTurnaround << endl;
  cout << "  }," << endl;
  cout << "  \"processes\": [" << endl;

  for (size_t i = 0; i < processes.size(); ++i) {
    cout << "    {" << endl;
    cout << "      \"id\": \"" << processes[i].id << "\"," << endl;
    cout << "      \"startTime\": " << processes[i].startTime << "," << endl;
    cout << "      \"completionTime\": " << processes[i].completionTime << "," << endl;
    cout << "      \"waitingTime\": " << processes[i].waitingTime << "," << endl;
    cout << "      \"turnaroundTime\": " << processes[i].turnaroundTime << endl;
    cout << "    }" << (i == processes.size() - 1 ? "" : ",") << endl;
  }

  cout << "  ]" << endl;
  cout << "}" << endl;

  return 0;
}