import { Effect, Layer } from "effect";
import { EtherscanError, RpcError } from "@/lib/effect/errors";
import { EtherscanClient } from "@/lib/effect/services/etherscan";
import { QuickNodeRpc } from "@/lib/effect/services/quicknode-rpc";
import type { Call, TransactionReceipt, VerifiedContract } from "@/lib/effect/types";

export const partialContract = (
  contract: Pick<VerifiedContract, "ContractName" | "ABI">
): VerifiedContract => contract as VerifiedContract;

export const makeTestEtherscanLayer = (
  getVerifiedContract: (
    address: string
  ) => Effect.Effect<VerifiedContract, EtherscanError>
) =>
  Layer.succeed(EtherscanClient, {
    getVerifiedContract,
  });

export const makeTestQuickNodeLayer = (impl: {
  getCallTrace: (txHash: string) => Effect.Effect<Call, RpcError>;
  getReceipt?: (txHash: string) => Effect.Effect<TransactionReceipt, RpcError>;
}) =>
  Layer.succeed(QuickNodeRpc, {
    getCallTrace: impl.getCallTrace,
    getReceipt:
      impl.getReceipt ??
      (() =>
        Effect.die(new Error("getReceipt is not implemented in this test"))),
  });
