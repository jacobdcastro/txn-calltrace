import { Data } from "effect";

export class ConfigError extends Data.TaggedError("ConfigError")<{
  readonly key: string;
  readonly message: string;
}> {}

export class RpcError extends Data.TaggedError("RpcError")<{
  readonly message: string;
}> {}

export class EtherscanError extends Data.TaggedError("EtherscanError")<{
  readonly message: string;
}> {}

export type AppError = ConfigError | RpcError | EtherscanError;
