import { formatAbiItem } from "abitype";
import { Chunk, Duration, Effect, Schedule, Stream } from "effect";
import { toFunctionSelector } from "viem";
import { decodeAbiParametersEnhanced } from "../decode-abi-parameters";
import { EtherscanClient } from "./services/etherscan";
import type { Call } from "./types";

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

const enhanceSingleCall = (
  call: Call
): Effect.Effect<EnhancedCall, never, EtherscanClient> =>
  Effect.gen(function* () {
    const etherscan = yield* EtherscanClient;
    const enhancedCall: EnhancedCall = { ...call };

    yield* Effect.gen(function* () {
      const source = yield* etherscan.getVerifiedContract(call.to as string);
      if (!source) {
        return;
      }

      enhancedCall.contractName = source.ContractName;

      const abi = JSON.parse(source.ABI);
      const callFnSelector = call.input?.slice(0, 10);

      const functionAbiItem = abi.find((item: any) => {
        if (item.type !== "function") return false;
        return callFnSelector === toFunctionSelector(item);
      });

      if (functionAbiItem) {
        enhancedCall.functionAbiItem = functionAbiItem;
        enhancedCall.parsedFnSelector = formatAbiItem(functionAbiItem);
        enhancedCall.functionName = functionAbiItem.name;
        enhancedCall.inputParams = functionAbiItem.inputs;
        enhancedCall.outputParams = functionAbiItem.outputs;
        enhancedCall.stateMutability = functionAbiItem.stateMutability;
        enhancedCall.decodedInputParams = decodeAbiParametersEnhanced(
          functionAbiItem.inputs,
          call.input as `0x${string}`
        );
        enhancedCall.decodedOutputParams = decodeAbiParametersEnhanced(
          functionAbiItem.outputs,
          call.output as `0x${string}`
        );
        enhancedCall.constant = functionAbiItem.constant;
      }
    }).pipe(
      Effect.catchTags({
        EtherscanError: () => Effect.void,
      }),
      // preserve the original empty catch, including JSON.parse / selector throws
      Effect.catchAllCause(() => Effect.void)
    );

    return enhancedCall;
  });

export const enhanceCallTrace = (
  call: Call
): Effect.Effect<EnhancedCall, never, EtherscanClient> =>
  Effect.gen(function* () {
    const enhancedCall = yield* enhanceSingleCall(call);

    if (call.calls?.length) {
      const enhancedSubcalls = yield* Stream.fromIterable(call.calls).pipe(
        Stream.schedule(Schedule.spaced(Duration.millis(300))),
        Stream.mapEffect(enhanceCallTrace, { concurrency: 1 }),
        Stream.runCollect
      );
      enhancedCall.calls = Chunk.toArray(enhancedSubcalls);
    }

    return enhancedCall;
  });
