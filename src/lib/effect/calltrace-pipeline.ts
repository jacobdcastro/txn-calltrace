import { Effect } from "effect";
import { serializeBigInts } from "../serialize-bigints";
import { enhanceCallTrace } from "./enhance-call";
import { QuickNodeRpc } from "./services/quicknode-rpc";

export const callTracePipeline = (txHash: string) =>
  Effect.gen(function* () {
    const rpc = yield* QuickNodeRpc;
    const trace = yield* rpc.getCallTrace(txHash);
    const enhanced = yield* enhanceCallTrace(trace);
    return serializeBigInts(enhanced);
  });
