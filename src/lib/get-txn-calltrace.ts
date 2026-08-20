import { Effect } from "effect";
import { runAppEffect } from "./effect/runtime";
import { QuickNodeRpc } from "./effect/services/quicknode-rpc";
import type { Call } from "./effect/types";

export type { Call } from "./effect/types";

export async function getTransactionCallTrace(txHash: string): Promise<Call> {
  return runAppEffect(
    Effect.gen(function* () {
      const rpc = yield* QuickNodeRpc;
      return yield* rpc.getCallTrace(txHash);
    })
  );
}
