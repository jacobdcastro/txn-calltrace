import {
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "@effect/platform";
import { Context, Effect, Layer, Redacted, Schema } from "effect";
import { etherscanApiKey } from "../config";
import { EtherscanError } from "../errors";
import type { VerifiedContract } from "../types";

const EtherscanApiResponse = Schema.Struct({
  status: Schema.String,
  message: Schema.String,
  result: Schema.Array(Schema.Unknown),
});

export class EtherscanClient extends Context.Tag("EtherscanClient")<
  EtherscanClient,
  {
    readonly getVerifiedContract: (
      address: string
    ) => Effect.Effect<VerifiedContract, EtherscanError>;
  }
>() {}

export const EtherscanClientLive = Layer.effect(
  EtherscanClient,
  Effect.gen(function* () {
    const httpClient = (yield* HttpClient.HttpClient).pipe(
      HttpClient.filterStatusOk
    );
    const apiKey = yield* etherscanApiKey;

    return {
      getVerifiedContract: (address: string) =>
        Effect.gen(function* () {
          const request = HttpClientRequest.get(
            "https://api.etherscan.io/api"
          ).pipe(
            HttpClientRequest.setUrlParams({
              module: "contract",
              action: "getsourcecode",
              address,
              apikey: Redacted.value(apiKey),
            }),
            HttpClientRequest.acceptJson
          );

          const response = yield* httpClient.execute(request).pipe(
            Effect.mapError(
              (error) => new EtherscanError({ message: error.message })
            )
          );

          const body = yield* HttpClientResponse.schemaBodyJson(
            EtherscanApiResponse
          )(response).pipe(
            Effect.mapError(
              (error) => new EtherscanError({ message: error.message })
            )
          );

          if (body.status === "0") {
            return yield* new EtherscanError({ message: body.message });
          }

          const contract = body.result[0] as VerifiedContract | undefined;
          if (!contract) {
            return yield* new EtherscanError({
              message: "Contract not verified",
            });
          }

          return contract;
        }),
    };
  })
);
