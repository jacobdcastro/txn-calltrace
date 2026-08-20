import { Config, Effect, Redacted } from "effect";
import { ConfigError } from "./errors";

const missing = (key: string) =>
  new ConfigError({
    key,
    message: `${key} is not defined`,
  });

export const quickNodeRpcUrl: Effect.Effect<string, ConfigError> =
  Config.string("NEXT_PUBLIC_QUICKNODE_RPC_URL").pipe(
    Effect.mapError(() => missing("NEXT_PUBLIC_QUICKNODE_RPC_URL"))
  );

export const etherscanApiKey: Effect.Effect<Redacted.Redacted, ConfigError> =
  Config.redacted("ETHERSCAN_API_KEY").pipe(
    Effect.mapError(() => missing("ETHERSCAN_API_KEY"))
  );
