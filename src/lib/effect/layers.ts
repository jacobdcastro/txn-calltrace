import { FetchHttpClient, HttpClient } from "@effect/platform";
import { Layer } from "effect";
import { EtherscanClientLive } from "./services/etherscan";
import { QuickNodeRpcLive } from "./services/quicknode-rpc";

export const withHttp = (http: Layer.Layer<HttpClient.HttpClient>) =>
  Layer.mergeAll(QuickNodeRpcLive, EtherscanClientLive).pipe(
    Layer.provide(http)
  );

export const AppLive = withHttp(FetchHttpClient.layer);
