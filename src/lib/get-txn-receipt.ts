import { Effect } from "effect";
import { runAppEffect } from "./effect/runtime";
import { QuickNodeRpc } from "./effect/services/quicknode-rpc";
import type { TransactionReceipt } from "./effect/types";

export type { Log, TransactionReceipt } from "./effect/types";

export async function getTransactionReceipt(
  txHash: string
): Promise<TransactionReceipt> {
  return runAppEffect(
    Effect.gen(function* () {
      const rpc = yield* QuickNodeRpc;
      return yield* rpc.getReceipt(txHash);
    })
  );
}
