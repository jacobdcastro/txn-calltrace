import { HttpClient, HttpClientResponse } from "@effect/platform";
import { ConfigProvider, Effect, Either, Layer } from "effect";
import { ConfigError, EtherscanError, RpcError } from "@/lib/effect/errors";
import { EtherscanClient, EtherscanClientLive } from "@/lib/effect/services/etherscan";
import { QuickNodeRpc, QuickNodeRpcLive } from "@/lib/effect/services/quicknode-rpc";
import { makeTestEtherscanLayer, makeTestQuickNodeLayer, partialContract } from "./test-layers";

const jsonHttpClient = (body: unknown, status = 200) =>
  HttpClient.make((request) =>
    Effect.succeed(
      HttpClientResponse.fromWeb(
        request,
        new Response(JSON.stringify(body), {
          status,
          headers: { "Content-Type": "application/json" },
        })
      )
    )
  );

const provideRpc = <A, E>(
  program: Effect.Effect<A, E, QuickNodeRpc>,
  body: unknown,
  env: Record<string, string> = {
    NEXT_PUBLIC_QUICKNODE_RPC_URL: "http://rpc.test",
  }
) =>
  program.pipe(
    Effect.provide(
      QuickNodeRpcLive.pipe(
        Layer.provide(
          Layer.succeed(HttpClient.HttpClient, jsonHttpClient(body))
        ),
        Layer.provide(
          Layer.setConfigProvider(
            ConfigProvider.fromMap(new Map(Object.entries(env)))
          )
        )
      )
    )
  );

const provideEtherscan = <A, E>(
  program: Effect.Effect<A, E, EtherscanClient>,
  body: unknown,
  env: Record<string, string> = { ETHERSCAN_API_KEY: "test-key" }
) =>
  program.pipe(
    Effect.provide(
      EtherscanClientLive.pipe(
        Layer.provide(
          Layer.succeed(HttpClient.HttpClient, jsonHttpClient(body))
        ),
        Layer.provide(
          Layer.setConfigProvider(
            ConfigProvider.fromMap(new Map(Object.entries(env)))
          )
        )
      )
    )
  );

describe("QuickNodeRpc", () => {
  it("fails with ConfigError when NEXT_PUBLIC_QUICKNODE_RPC_URL is missing", async () => {
    const result = await Effect.runPromise(
      Effect.either(
        provideRpc(
          Effect.flatMap(QuickNodeRpc, (rpc) => rpc.getCallTrace("0xabc")),
          { result: {} },
          {}
        )
      )
    );

    expect(Either.isLeft(result)).toBe(true);
    if (Either.isLeft(result)) {
      expect(result.left).toBeInstanceOf(ConfigError);
      expect(result.left).toMatchObject({
        _tag: "ConfigError",
        key: "NEXT_PUBLIC_QUICKNODE_RPC_URL",
        message: "NEXT_PUBLIC_QUICKNODE_RPC_URL is not defined",
      });
    }
  });

  it("maps JSON-RPC errors to RpcError", async () => {
    const result = await Effect.runPromise(
      Effect.either(
        provideRpc(
          Effect.flatMap(QuickNodeRpc, (rpc) => rpc.getCallTrace("0xabc")),
          { error: { message: "transaction not found" } }
        )
      )
    );

    expect(Either.isLeft(result)).toBe(true);
    if (Either.isLeft(result)) {
      expect(result.left).toBeInstanceOf(RpcError);
      expect(result.left).toMatchObject({
        _tag: "RpcError",
        message: "transaction not found",
      });
    }
  });

  it("returns the JSON-RPC result on success", async () => {
    const trace = { from: "0x1", to: "0x2", type: "CALL" };
    const result = await Effect.runPromise(
      provideRpc(
        Effect.flatMap(QuickNodeRpc, (rpc) => rpc.getCallTrace("0xabc")),
        { result: trace }
      )
    );

    expect(result).toEqual(trace);
  });

  it("substitutes a TestQuickNodeLayer without HTTP", async () => {
    const layer = makeTestQuickNodeLayer({
      getCallTrace: () =>
        Effect.succeed({ from: "0xaaa", to: "0xbbb", type: "CALL" }),
    });

    const result = await Effect.runPromise(
      Effect.flatMap(QuickNodeRpc, (rpc) => rpc.getCallTrace("0xabc")).pipe(
        Effect.provide(layer)
      )
    );

    expect(result.to).toBe("0xbbb");
  });
});

describe("EtherscanClient", () => {
  it("maps status 0 responses to EtherscanError", async () => {
    const result = await Effect.runPromise(
      Effect.either(
        provideEtherscan(
          Effect.flatMap(EtherscanClient, (client) =>
            client.getVerifiedContract("0xabc")
          ),
          { status: "0", message: "NOTOK", result: [] }
        )
      )
    );

    expect(Either.isLeft(result)).toBe(true);
    if (Either.isLeft(result)) {
      expect(result.left).toBeInstanceOf(EtherscanError);
      expect(result.left).toMatchObject({
        _tag: "EtherscanError",
        message: "NOTOK",
      });
    }
  });

  it("returns the first verified contract on success", async () => {
    const result = await Effect.runPromise(
      provideEtherscan(
        Effect.flatMap(EtherscanClient, (client) =>
          client.getVerifiedContract("0xabc")
        ),
        {
          status: "1",
          message: "OK",
          result: [{ ContractName: "Token", ABI: "[]" }],
        }
      )
    );

    expect(result.ContractName).toBe("Token");
    expect(result.ABI).toBe("[]");
  });

  it("substitutes a TestEtherscanLayer without HTTP", async () => {
    const layer = makeTestEtherscanLayer(() =>
      Effect.succeed(partialContract({ ContractName: "Mocked", ABI: "[]" }))
    );

    const result = await Effect.runPromise(
      Effect.flatMap(EtherscanClient, (client) =>
        client.getVerifiedContract("0xabc")
      ).pipe(Effect.provide(layer))
    );

    expect(result.ContractName).toBe("Mocked");
  });
});
