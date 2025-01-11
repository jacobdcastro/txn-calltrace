import { formatAbiItem } from "abitype";
import { toFunctionSelector } from "viem";
import { decodeAbiParametersEnhanced } from "./decode-abi-parameters";
import { Call } from "./get-txn-calltrace";
import { getVerifiedContract } from "./get-verified-contract";

interface Parameter {
  name: string;
  value: string;
}

interface FunctionDefinition {
  inputParams?: Parameter[];
  outputParams?: Parameter[];
  stateMutability?: "pure" | "view" | "nonpayable" | "payable";
  constant?: boolean;
  contractName?: string;
  functionName?: string;
  parsedFnSelector?: string;
  decodedInputParams?: any[];
  decodedOutputParams?: any[];
  functionAbiItem?: any;
}

export interface EnhancedCall extends Call, FunctionDefinition {
  calls?: EnhancedCall[];
}

// add delay utility function at the top
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function enhanceCallTraceWithVerifiedSource(call: Call): Promise<EnhancedCall> {
  const enhancedCall: EnhancedCall = { ...call };

  try {
    // attempt to get verified contract ABI from etherscan
    const source = await getVerifiedContract(call.to as string);
    if (!source) throw new Error("Contract not verified");

    // add contract name to enhanced call object
    enhancedCall.contractName = source.ContractName;

    const abi = JSON.parse(source.ABI);
    const callFnSelector = call.input?.slice(0, 10);

    // find matching function in ABI
    const functionAbiItem = abi.find((item: any) => {
      if (item.type !== "function") return false
      return callFnSelector === toFunctionSelector(item);
    });

    if (functionAbiItem) {
      enhancedCall.functionAbiItem = functionAbiItem;
      enhancedCall.parsedFnSelector = formatAbiItem(functionAbiItem);
      enhancedCall.functionName = functionAbiItem.name;
      enhancedCall.inputParams = functionAbiItem.inputs;
      enhancedCall.outputParams = functionAbiItem.outputs;
      enhancedCall.stateMutability = functionAbiItem.stateMutability;
      enhancedCall.decodedInputParams = decodeAbiParametersEnhanced(functionAbiItem.inputs, call.input as `0x${string}`);
      enhancedCall.decodedOutputParams = decodeAbiParametersEnhanced(functionAbiItem.outputs, call.output as `0x${string}`);
      enhancedCall.constant = functionAbiItem.constant;
    }
  } catch (error) {
    // silently continue if ABI not found
  }

  // recursively process child calls with delay between each
  if (call.calls?.length) {
    const enhancedSubcalls: EnhancedCall[] = [];
    for (const subcall of call.calls) {
      // add 200ms delay between each API call
      await delay(300);
      enhancedSubcalls.push(await enhanceCallTraceWithVerifiedSource(subcall));
    }
    enhancedCall.calls = enhancedSubcalls as EnhancedCall[];
  }

  return enhancedCall;
}
