import { NextResponse } from "next/server";
import { spawn } from 'child_process';
import path from "path";
import fs from "fs"

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {mode, algorithm, processes, timeQuantum, numProcesses } = body;

    // 1. Format data for C++ stdin
    let inputStr = '';
    if(mode == 'benchmark') {
      inputStr = `BENCHMARK\n${numProcesses}\n${timeQuantum}\n`;
    } else {
      inputStr = `${algorithm}\n`;
      if (algorithm === 'RR') inputStr += `${timeQuantum}\n`;
      inputStr += `${processes.length}\n`;
      processes.forEach((p: any) => {
        inputStr += `${p.id} ${p.arrivalTime} ${p.burstTime} ${p.priority}\n`
      });
    }

    console.log("[DEBUG] Sending to C++ engine:", inputStr.replace(/\n/g, " | "))

    // 2. Spawn the C++ executable (make sure you compiled main.cpp to 'engine.exe' or './engine')
    return new Promise((resolve) => {
      const enginePath = path.join(process.cwd(), 'engine_v2.exe')

      if(!fs.existsSync(enginePath)) {
        return resolve(NextResponse .json({
          error: "engine_v2.exe not found",
          deatils: "File missing"
        },{status: 404}))
      }
      
      const cppProcess = spawn(enginePath)
      let output = ''
      let errOutput = ''

      // Read JSON output from C++
      cppProcess.stdout.on('data', (data) => {
        output += data.toString()
      });

      cppProcess.stderr.on('data' , (data) => {
        errOutput += data.toString()
      })

      // To catch the spwan errors
      cppProcess.on('error', (err) => {
        console.error("Spawn error:", err)
        resolve(NextResponse.json({ error: "Failed to run C++ file", details: err.message }, { status: 500 }))
      })

      // When C++ finishes, parse JSON and send to frontend
      cppProcess.on('close', (code) => {
        console.log(`[DEBUG] C++ process exited with code: ${code}`)
        console.log(`[DEBUG] Raw C++ output:`, output)

        if(errOutput) {
          console.error(`[DEBUG] C++ STDERR:`, errOutput)
        }

        try {
          const parsedData = JSON.parse(output)
          resolve(NextResponse.json(parsedData))
        } catch (e) {
          resolve(NextResponse.json({ error: "Failed to parse C++ output", rawOutput :output }, { status: 500 }))
        }
      })

      cppProcess.on('error', (err) => {
         console.error("[DEBUG] Spawn error:", err);
         resolve(NextResponse.json({ error: `Spawn error: ${err.message}` }, { status: 500 }));
      })

      // Feed data to C++
      cppProcess.stdin.write(inputStr);
      cppProcess.stdin.end();
      
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}