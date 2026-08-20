import {
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "@effect/platform";
import { Context, Effect, Layer, Schema } from "effect";
import { quickNodeRpcUrl } from "../config";
import { RpcError } from "../errors";
import type { Call, TransactionReceipt } from "../types";

const JsonRpcResponse = Schema.Struct({
  result: Schema.optional(Schema.Unknown),
  error: Schema.optional(
    Schema.Struct({
      message: Schema.String,
    })
  ),
});

const jsonRpcRequest = (rpcUrl: string, method: string, params: unknown[]) =>
  HttpClientRequest.post(rpcUrl).pipe(
    HttpClientRequest.bodyUnsafeJson({
      jsonrpc: "2.0",
      id: 1,
      method,
      params,
    }),
    HttpClientRequest.acceptJson
  );

const executeJsonRpc = <A>(
  client: HttpClient.HttpClient,
  request: HttpClientRequest.HttpClientRequest
): Effect.Effect<A, RpcError> =>
  Effect.gen(function* () {
    const response = yield* client.execute(request).pipe(
      Effect.mapError((error) => new RpcError({ message: error.message }))
    );

    const body = yield* HttpClientResponse.schemaBodyJson(JsonRpcResponse)(
      response
    ).pipe(Effect.mapError((error) => new RpcError({ message: error.message })));

    if (body.error) {
      return yield* new RpcError({ message: body.error.message });
    }

    return body.result as A;
  });

export class QuickNodeRpc extends Context.Tag("QuickNodeRpc")<
  QuickNodeRpc,
  {
    readonly getCallTrace: (txHash: string) => Effect.Effect<Call, RpcError>;
    readonly getReceipt: (
      txHash: string
    ) => Effect.Effect<TransactionReceipt, RpcError>;
  }
>() {}

export const QuickNodeRpcLive = Layer.effect(
  QuickNodeRpc,
  Effect.gen(function* () {
    const httpClient = (yield* HttpClient.HttpClient).pipe(
      HttpClient.filterStatusOk
    );
    const rpcUrl = yield* quickNodeRpcUrl;

    return {
      getCallTrace: (txHash: string) =>
        executeJsonRpc<Call>(
          httpClient,
          jsonRpcRequest(rpcUrl, "debug_traceTransaction", [
            txHash,
            { tracer: "callTracer" },
          ])
        ),
      getReceipt: (txHash: string) =>
        executeJsonRpc<TransactionReceipt>(
          httpClient,
          jsonRpcRequest(rpcUrl, "eth_getTransactionReceipt", [txHash])
        ),
    };
  })
);
