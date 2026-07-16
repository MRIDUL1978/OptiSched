import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface StressTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  noOfProcesses: number;
  setNoOfProcesses: (value: number) => void;
  timeQuantum: number;
  setTimeQuantum: (value: number) => void;
  isBenchmarking: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

const StressTestDialog = ({ open, onOpenChange, noOfProcesses, setNoOfProcesses, timeQuantum, setTimeQuantum, isBenchmarking, onSubmit }: StressTestDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={(v) => !isBenchmarking && onOpenChange(v)}>
      <DialogContent className="bg-slate-800 border border-slate-700 text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-white">Stress Test</DialogTitle>
          <DialogDescription>Configure the stress test parameters and hit submit.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="noOfProcesses">Number of Processes</Label>
              <Input
                id="noOfProcesses"
                type="number"
                min="1"
                value={noOfProcesses}
                onChange={(e) => setNoOfProcesses(Number(e.target.value))}
                className="bg-slate-900 border-slate-700 text-white focus:border-blue-500"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tQ">Time Quantum</Label>
              <Input
                id="tQ"
                type="number"
                min="1"
                value={timeQuantum}
                onChange={(e) => setTimeQuantum(Number(e.target.value))}
                className="bg-slate-900 border-slate-700 text-white focus:border-blue-500"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} className="border-slate-700 text-slate-300 hover:bg-slate-700">Cancel</Button>
            <Button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white border-none">Run Stress Test</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StressTestDialog;
