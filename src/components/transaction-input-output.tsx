import { AbiParameter } from "abitype";

interface TxnInputOutputProps {
  input: `0x${string}`;
  output: `0x${string}`;
  parsedFnSelector?: string;
  inputParams?: readonly AbiParameter[];
  outputParams?: readonly AbiParameter[];
  decodedInputParams?: any[];
  decodedOutputParams?: any[];
  error?: string;
  revertReason?: string;
}

export function TxnInputOutput({
  input,
  output,
  parsedFnSelector,
  inputParams,
  decodedInputParams,
  outputParams,
  decodedOutputParams,
  error,
  revertReason,
}: TxnInputOutputProps) {
  const formatParamValue = (value: any, type: string) => {
    if (type === 'bool') {
      return value ? 'true' : 'false';
    }
    return JSON.stringify(value);
  };

  return (
    <div className="mb-8">
      <div>
        <h2 className="mono-subtitle">Input/Output</h2>
      </div>

      {/* Error Section */}
      {(error || revertReason) && (
        <div className="border-4 border-destructive bg-destructive/10 mb-[-4px]">
          <div className="p-4">
            <div className="text-destructive pb-3">error data</div>
            <div className="font-mono text-sm space-y-1">
              {error && (
                <div className="flex gap-2">
                  <span className="text-muted-foreground whitespace-nowrap min-w-[80px]">error:</span>
                  <span className="break-all">{error}</span>
                </div>
              )}
              {revertReason && (
                <div className="flex gap-2">
                  <span className="text-muted-foreground whitespace-nowrap min-w-[80px]">revertReason:</span>
                  <span className="break-all">{revertReason}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
                    <span className="text-muted-foreground whitespace-nowrap min-w-[80px]">{param.type}</span>
                    <span className="whitespace-nowrap min-w-[80px]">{param.name}:</span>
                    <span className="break-all">
                      {formatParamValue(decodedInputParams[index], param.type)}
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
                    <span className="text-muted-foreground whitespace-nowrap min-w-[80px]">{param.type}</span>
                    <span className="whitespace-nowrap min-w-[80px]">{param.name || `param${index}`}:</span>
                    <span className="break-all">
                      {formatParamValue(decodedOutputParams[index], param.type)}
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