import { AbiParameter } from "abitype";

interface TxnInputOutputProps {
  input: `0x${string}`;
  output: `0x${string}`;
  parsedFnSelector?: string;
  inputParams?: readonly AbiParameter[];
  outputParams?: readonly AbiParameter[];
  decodedInputParams?: any[];
  decodedOutputParams?: any[];
}

export function TxnInputOutput({
  input,
  output,
  parsedFnSelector,
  inputParams,
  decodedInputParams,
  outputParams,
  decodedOutputParams,
}: TxnInputOutputProps) {
  return (
    <div className="mb-8">
      <div>
        <h2 className="mono-subtitle">Input/Output</h2>
      </div>

      <div className="border-4 border-foreground bg-background mb-[-4px]">
        <div className="p-4">
          <div className="text-muted-foreground pb-3">input data</div>
          {parsedFnSelector && (
            <div className="font-mono text-sm pb-3 text-primary">
              {parsedFnSelector}
            </div>
          )}
          <div className="font-mono text-sm break-all">
            {decodedInputParams && decodedInputParams.length > 0 ? (
              <div className="space-y-1">
                {inputParams?.map((param, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="text-muted-foreground">{param.type}</span>
                    <span>{param.name}:</span>
                    <span className="break-all">
                      {JSON.stringify(decodedInputParams[index])}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div>{input === "0x" ? "(none)" : input}</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 font-mono text-sm border-4 border-foreground">
        <div className="p-4">
          <div className="text-muted-foreground pb-3">output data</div>
          <div className="break-all">
            {decodedOutputParams && decodedOutputParams.length > 0 ? (
              <div className="space-y-1">
                {outputParams?.map((param, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="text-muted-foreground">{param.type}</span>
                    <span>{param.name || `param${index}`}:</span>
                    <span className="break-all">
                      {JSON.stringify(decodedOutputParams[index])}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div>{output === "0x" ? "(none)" : output}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 