import { toFunctionSelector } from "viem";
import { Call, TraceCallResult } from "./get-txn-calltrace";
import { getVerifiedContract } from "./get-verified-contract";

interface Parameter {
  name: string;
  value: string;
}

interface ContractData {
  contractName?: string;
  functionName?: string;
}

interface FunctionDefinition {
  name?: string;
  inputParams?: Parameter[];
  outputParams?: Parameter[];
  stateMutability?: "pure" | "view" | "nonpayable" | "payable";
  constant?: boolean;
}

export interface EnhancedCall extends Call, ContractData, FunctionDefinition {
  calls?: EnhancedCall[];
}

export interface EnhancedTraceCallResult extends TraceCallResult, ContractData, FunctionDefinition {
  calls?: EnhancedCall[];
}

export async function enhanceCallTraceWithVerifiedSource(call: Call): Promise<EnhancedTraceCallResult> {
  const enhancedCall: EnhancedTraceCallResult = { ...call };

  try {
    // attempt to get verified contract ABI from etherscan
    const source = await getVerifiedContract(call.to as string);
    if (!source) throw new Error("Contract not verified");

    // add contract name to enhanced call object
    enhancedCall.contractName = source.ContractName;

    const abi = JSON.parse(source.ABI);
    const callFnSelector = call.input?.slice(0, 10);

    // find matching function in ABI
    const functionDef = abi.find((item: any) => {
      if (item.type !== "function") return false
      return callFnSelector === toFunctionSelector(item);
    });

    if (functionDef) {
      enhancedCall.functionName = functionDef.name;
      enhancedCall.inputParams = functionDef.inputs;
      enhancedCall.outputParams = functionDef.outputs;
      enhancedCall.stateMutability = functionDef.stateMutability;
      enhancedCall.constant = functionDef.constant;
    }
  } catch (error) {
    // silently continue if ABI not found
  }

  // recursively process child calls
  if (call.calls?.length) {
    const enhancedSubcalls: EnhancedTraceCallResult[] = await Promise.all(
      call.calls.map(subcall => enhanceCallTraceWithVerifiedSource(subcall))
    );
    enhancedCall.calls = enhancedSubcalls as EnhancedCall[];
  }

  return enhancedCall;
}
