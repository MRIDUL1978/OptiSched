import { NextResponse } from "next/server";
import { spawn } from 'child_process';
import path from "path";
import fs from "fs"

interface ProcessInput {
  id: string;
  arrivalTime: number;
  burstTime: number;
  priority: number;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {mode, algorithm, processes, timeQuantum, numProcesses } = body;

    let inputStr = '';
    if(mode == 'benchmark') {
      inputStr = `BENCHMARK\n${numProcesses}\n${timeQuantum}\n`;
    } else {
      inputStr = `${algorithm}\n`;
      if (algorithm === 'RR') inputStr += `${timeQuantum}\n`;
      inputStr += `${processes.length}\n`;
      processes.forEach((p: ProcessInput) => {
        inputStr += `${p.id} ${p.arrivalTime} ${p.burstTime} ${p.priority}\n`
      });
    }

    return new Promise<Response>((resolve) => {
      const enginePath = path.join(process.cwd(), 'engine_v2.exe')

      if(!fs.existsSync(enginePath)) {
        return resolve(NextResponse.json({
          error: "engine_v2.exe not found",
          deatils: "File missing"
        },{status: 404}))
      }

      const cppProcess = spawn(enginePath)
      let output = ''
      let errOutput = ''

      cppProcess.stdout.on('data', (data: Buffer) => {
        output += data.toString()
      });

      cppProcess.stderr.on('data' , (data: Buffer) => {
        errOutput += data.toString()
      })

      cppProcess.on('error', (err) => {
        console.error("Spawn error:", err)
        resolve(NextResponse.json({ error: "Failed to run C++ file", details: err.message }, { status: 500 }))
      })

      cppProcess.on('close', () => {
        if(errOutput) {
          console.error(`[DEBUG] C++ STDERR:`, errOutput)
        }

        try {
          const parsedData = JSON.parse(output)
          resolve(NextResponse.json(parsedData))
        } catch {
          resolve(NextResponse.json({ error: "Failed to parse C++ output", rawOutput :output }, { status: 500 }))
        }
      })

      cppProcess.on('error', (err) => {
         console.error("[DEBUG] Spawn error:", err);
         resolve(NextResponse.json({ error: `Spawn error: ${err.message}` }, { status: 500 }));
      })

      cppProcess.stdin.write(inputStr);
      cppProcess.stdin.end();

    })
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}