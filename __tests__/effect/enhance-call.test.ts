import { enhanceCallTrace } from "@/lib/effect/enhance-call";
import { EtherscanError } from "@/lib/effect/errors";
import type { Call } from "@/lib/effect/types";
import { serializeBigInts } from "@/lib/serialize-bigints";
import { Effect, Fiber, TestClock, TestContext } from "effect";
import {
  makeTestEtherscanLayer,
  partialContract,
} from "./test-layers";

describe("enhanceCallTrace", () => {
  it("enhances a call trace with verified contract data", async () => {
    const mockCall: Call = {
      from: "0x123",
      to: "0x456",
      input:
        "0xa9059cbb000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045000000000000000000000000000000000000000000000000000000000000007b",
      type: "CALL",
    };

    const layer = makeTestEtherscanLayer(() =>
      Effect.succeed(
        partialContract({
          ContractName: "TestToken",
          ABI: JSON.stringify([
            {
              type: "function",
              name: "transfer",
              inputs: [
                { name: "recipient", type: "address" },
                { name: "amount", type: "uint256" },
              ],
              outputs: [{ name: "", type: "bool" }],
              stateMutability: "nonpayable",
            },
          ]),
        })
      )
    );

    const result = await Effect.runPromise(
      enhanceCallTrace(mockCall).pipe(Effect.provide(layer))
    );
    const serializedResult = serializeBigInts(result);

    expect(serializedResult.contractName).toBe("TestToken");
    expect(serializedResult.functionName).toBe("transfer");

    const testValue = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";
    expect(serializedResult.decodedInputParams).toEqual([testValue, "123"]);
  });

  it("swallows EtherscanError via catchTag and returns the bare call", async () => {
    const mockCall: Call = {
      from: "0x123",
      to: "0x456",
      input: "0x",
      type: "CALL",
    };

    const layer = makeTestEtherscanLayer(() =>
      Effect.fail(new EtherscanError({ message: "Contract not verified" }))
    );

    const result = await Effect.runPromise(
      enhanceCallTrace(mockCall).pipe(Effect.provide(layer))
    );

    expect(result.contractName).toBeUndefined();
    expect(result.functionName).toBeUndefined();
    expect(result.decodedInputParams).toBeUndefined();
    expect(result.from).toBe("0x123");
    expect(result.to).toBe("0x456");
  });

  it("processes nested calls recursively", async () => {
    const mockCall: Call = {
      from: "0x123",
      to: "0x456",
      type: "CALL",
      calls: [
        {
          from: "0x456",
          to: "0x789",
          type: "DELEGATECALL",
        },
      ],
    };

    const layer = makeTestEtherscanLayer((address) =>
      Effect.succeed(
        partialContract({
          ContractName: address === "0x456" ? "Parent" : "Child",
          ABI: "[]",
        })
      )
    );

    const result = await Effect.runPromise(
      enhanceCallTrace(mockCall).pipe(Effect.provide(layer))
    );

    expect(result.contractName).toBe("Parent");
    expect(result.calls?.[0].contractName).toBe("Child");
  });

  it("spaces sibling subcalls by 300ms", async () => {
    const requested: string[] = [];

    const layer = makeTestEtherscanLayer((address) =>
      Effect.sync(() => {
        requested.push(address);
        return partialContract({ ContractName: address, ABI: "[]" });
      })
    );

    const mockCall: Call = {
      from: "0x1",
      to: "0xparent",
      type: "CALL",
      calls: [
        { from: "0xparent", to: "0xchild1", type: "CALL" },
        { from: "0xparent", to: "0xchild2", type: "CALL" },
      ],
    };

    const program = Effect.gen(function* () {
      const fiber = yield* Effect.fork(enhanceCallTrace(mockCall));
      yield* TestClock.adjust("0 millis");
      expect(requested).toEqual(["0xparent"]);

      yield* TestClock.adjust("300 millis");
      expect(requested).toEqual(["0xparent", "0xchild1"]);

      yield* TestClock.adjust("300 millis");
      const result = yield* Fiber.join(fiber);
      expect(requested).toEqual(["0xparent", "0xchild1", "0xchild2"]);
      return result;
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(layer), Effect.provide(TestContext.TestContext))
    );
  });
});
