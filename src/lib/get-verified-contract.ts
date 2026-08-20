import { Effect } from "effect";
import { runAppEffect } from "./effect/runtime";
import { EtherscanClient } from "./effect/services/etherscan";
import type { VerifiedContract } from "./effect/types";

export type { EtherscanResponse, VerifiedContract } from "./effect/types";

export async function getVerifiedContract(
  address: string
): Promise<VerifiedContract> {
  return runAppEffect(
    Effect.gen(function* () {
      const etherscan = yield* EtherscanClient;
      return yield* etherscan.getVerifiedContract(address);
    })
  );
}
