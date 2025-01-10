import { keccak256, toHex } from "viem";
import { Call, TraceCallResult } from "./get-txn-calltrace";

interface DecodedParameter {
  name: string;
  value: string;
}

interface ContractData {
  contractName?: string;
  functionName?: string;
  parameters?: DecodedParameter[];
}

export interface EnhancedCall extends Call, ContractData {
  calls?: EnhancedCall[];
}

export interface EnhancedTraceCallResult extends TraceCallResult, ContractData {
  calls?: EnhancedCall[];
}

export function decodeFunctionFromAbi(abi: any[], methodId: string) {
  // skip if no methodId or too short
  if (!methodId || methodId.length < 10) return null;

  // find matching function in ABI
  const functionDef = abi.find(item => {
    if (item.type !== "function") return false;

    // construct the canonical signature string: name(type1,type2,...)
    const inputTypes = item.inputs.map((input: any) => input.type).join(',');
    const signature = `${item.name}(${inputTypes})`;

    // calculate methodId: first 4 bytes of keccak256 hash of the signature
    const hash = keccak256(toHex(signature));
    const calculatedMethodId = hash.slice(0, 10);

    return calculatedMethodId === methodId.slice(0, 10);
  });

  if (!functionDef) return null;

  return {
    functionName: functionDef.name,
    parameters: functionDef.inputs
  };
} 