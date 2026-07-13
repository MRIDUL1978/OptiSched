#ifndef PROCESS_H
#define PROCESS_H

#include<iostream>
using namespace std;

struct Process {
  string  id;
  int arrivalTime;
  int burstTime;
  int remainingTime;
  int priority;

  int startTime;
  int completionTime;
  int turnaroundTime;
  int waitingTime;

  Process(string id, int arrivalTime, int burstTime, int priority = 0) {
    this->id = id;
    this->arrivalTime = arrivalTime;
    this->burstTime = burstTime;
    this->remainingTime = burstTime;
    this->priority = priority;
    this->startTime = -1;
    this->completionTime = 0;
    this->turnaroundTime = 0;
    this->waitingTime = 0;
  }
};

#endif