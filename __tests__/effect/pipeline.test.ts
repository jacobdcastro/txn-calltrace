import { callTracePipeline } from "@/lib/effect/calltrace-pipeline";
import { RpcError } from "@/lib/effect/errors";
import { QuickNodeRpc } from "@/lib/effect/services/quicknode-rpc";
import type { Call } from "@/lib/effect/types";
import { Effect, Either, Layer } from "effect";
import {
  makeTestEtherscanLayer,
  makeTestQuickNodeLayer,
  partialContract,
} from "./test-layers";

describe("callTracePipeline", () => {
  it("composes QuickNode fetch, enhancement, and bigint serialization", async () => {
    const rpcLayer = makeTestQuickNodeLayer({
      getCallTrace: () =>
        Effect.succeed({
          from: "0x123",
          to: "0x456",
          type: "CALL",
          nonce: 123n,
        } as Call & { nonce: bigint }),
    });

    const etherscanLayer = makeTestEtherscanLayer(() =>
      Effect.succeed(
        partialContract({
          ContractName: "Vault",
          ABI: "[]",
        })
      )
    );

    const result = await Effect.runPromise(
      callTracePipeline("0xabc").pipe(
        Effect.provide(Layer.mergeAll(rpcLayer, etherscanLayer))
      )
    );

    expect(result.contractName).toBe("Vault");
    expect(result.nonce).toBe("123");
    expect(typeof result.nonce).toBe("string");
  });

  it("fails the whole pipeline when QuickNode returns RpcError", async () => {
    const rpcLayer = Layer.succeed(QuickNodeRpc, {
      getCallTrace: () =>
        Effect.fail(new RpcError({ message: "transaction not found" })),
      getReceipt: () => Effect.die(new Error("unused")),
    });

    const etherscanLayer = makeTestEtherscanLayer(() =>
      Effect.succeed(partialContract({ ContractName: "Unused", ABI: "[]" }))
    );

    const result = await Effect.runPromise(
      Effect.either(
        callTracePipeline("0xabc").pipe(
          Effect.provide(Layer.mergeAll(rpcLayer, etherscanLayer))
        )
      )
    );

    expect(Either.isLeft(result)).toBe(true);
    if (Either.isLeft(result)) {
      expect(result.left).toBeInstanceOf(RpcError);
      expect(result.left.message).toBe("transaction not found");
    }
  });
});
