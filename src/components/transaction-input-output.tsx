import { TraceCallResult } from "@/lib/get-txn-calltrace";

interface TxnInputOutputProps {
  callTrace: TraceCallResult;
}

export function TxnInputOutput({ callTrace }: TxnInputOutputProps) {
  return (
    <div className="mb-8">
      <div>
        <h2 className="mono-subtitle">Input/Output</h2>
      </div>

      <div className="border-4 border-foreground bg-background mb-[-4px]">
        <div className="p-4">
          <div className="text-muted-foreground pb-3">input data</div>
          <div className="font-mono text-sm break-all">
            {callTrace.input === "0x" ? "(none)" : callTrace.input}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 font-mono text-sm border-4 border-foreground">
        <div className="p-4">
          <div className="text-muted-foreground pb-3">output data</div>
          <div className="break-all">
            {callTrace.output === "0x" ? "(none)" : callTrace.output}
          </div>
        </div>
      </div>
    </div>
  );
} 