# ⚡ OptiSched Engine

OptiSched is an advanced CPU Scheduling Simulator and Benchmarking Tool. Designed with a microservices-inspired architecture, it bridges a modern Next.js frontend with a fast native C++ core to simulate, visualize, and benchmark operating system scheduling algorithms.

🔗 Live Demo on Render https://optisched-dyh0.onrender.com/ (Note: Hosted on free tier, may take 30s to start)

## 🚀 Features & Telemetry Modes

The architecture is split into two distinct profiling strategies:

Manual Simulation: Users can define specific process control blocks (Arrival, Burst, Priority) and generate precise, preemptive execution timelines (Gantt Charts) to visualize context switching and CPU allocation.

Dynamic Stress Testing: A parameterized benchmarking suite capable of generating 10,000+ randomized processes. It bypasses DOM-heavy timeline rendering to aggregate macro metrics (Average Waiting Time, Turnaround Time), executing massive datasets in under 3 milliseconds.

## 🧠 Core Architecture

Unlike standard web-based simulators that run algorithms in single-threaded JavaScript, OptiSched handles compute-heavy scheduling via a native binary:

The Frontend (Next.js): Handles state management, input validation, and renders complex visualizations using Tailwind CSS.

The Orchestration Bridge (Node.js API): Spawns asynchronous child processes, serializes JSON payloads, and pipes data to the native engine via standard streams (stdin/stdout), ensuring the Node event loop is never blocked.

The Systems Engine (C++): A memory-safe, index-based scheduling core (avoiding pointer aliasing). It accurately models real-world hardware constraints, including:

Context Switch Penalties: Simulates the hardware overhead of saving/loading registers   .

Asynchronous I/O Bursts: Dynamically flags a subset of workload as I/O-bound to model realistic process blocking.

## 📊 Supported Algorithms

First-Come, First-Served (FCFS): Non-preemptive baseline.

Shortest Job First (SJF): Non-preemptive, mathematically optimal for minimizing wait times.

Round Robin (RR): Preemptive, time-quantum based cyclic scheduling.

Preemptive Priority Scheduling: Dynamically preempts active tasks based on strict integer priorities (lower number = higher priority), resolving ties via arrival time.

Multilevel Feedback Queue (MLFQ): Dynamic priority decay preventing starvation.

## 🛠️ Tech Stack

Frontend: Next.js, React, Tailwind CSS, Lucide Icons

Backend: Node.js API Routes

Systems Core: C++17

Deployment: Docker, Render (Linux Environment)

## ⚙️ Local Installation & Setup

If you wish to run the engine locally, you will need Node.js and a C++ compiler (g++) installed on your machine.

### 1. Clone the repository
```bash
git clone https://github.com/MRIDUL1978/OptiSched.git
cd OptiSched
```


### 2. Install Node dependencies
```bash
npm install
```

### 3. Compile the C++ Engine
For Windows:
```bash
g++ main.cpp -O2 -o engine_v2.exe
```

For Linux/Mac:
```bash
g++ main.cpp -O2 -o engine_linux
```

### 4. Start the development server
```bash
npm run dev
```

Navigate to http://localhost:3000 in your browser.

## 🐳 Docker Deployment

This project is fully containerized for seamless cloud deployment. The included Dockerfile starts with a Debian Linux base, installs the C++ compiler, compiles the native engine during the build step, and serves the Next.js production build.
```bash
docker build -t optisched .
docker run -p 3000:3000 optisched
```

