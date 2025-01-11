import { AbiParameter } from "abitype";
import { useState } from "react";

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
  const [showDecodedInput, setShowDecodedInput] = useState(true);
  const [showDecodedOutput, setShowDecodedOutput] = useState(true);

  const formatParamValue = (value: any, type: string) => {
    if (type === 'bool') {
      return value ? 'true' : 'false';
    }
    if (typeof value === 'bigint') {
      return value.toString();
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
          <div className="flex justify-between items-center pb-3">
            <div className="text-muted-foreground">input data</div>
            {decodedInputParams && decodedInputParams.length > 0 && (
              <button
                onClick={() => setShowDecodedInput(!showDecodedInput)}
                className="text-xs text-primary hover:text-primary/80"
              >
                show {showDecodedInput ? "encoded" : "decoded"}
              </button>
            )}
          </div>
          {parsedFnSelector && (
            <div className="font-mono text-sm pb-3 text-primary">
              {parsedFnSelector}
            </div>
          )}
          <div className="font-mono text-sm break-all">
            {decodedInputParams && decodedInputParams.length > 0 ? (
              showDecodedInput ? (
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
              )
            ) : (
              <div>{input === "0x" ? "(none)" : input}</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 font-mono text-sm border-4 border-foreground">
        <div className="p-4">
          <div className="flex justify-between items-center pb-3">
            <div className="text-muted-foreground">output data</div>
            {decodedOutputParams && decodedOutputParams.length > 0 && (
              <button
                onClick={() => setShowDecodedOutput(!showDecodedOutput)}
                className="text-xs text-primary hover:text-primary/80"
              >
                show {showDecodedOutput ? "encoded" : "decoded"}
              </button>
            )}
          </div>
          <div className="break-all">
            {decodedOutputParams && decodedOutputParams.length > 0 ? (
              showDecodedOutput ? (
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
              )
            ) : (
              <div>{output === "0x" ? "(none)" : output}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 