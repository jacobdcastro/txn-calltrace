import { enhanceCallTrace, type EnhancedCall } from "./effect/enhance-call";
import { runAppEffect } from "./effect/runtime";
import type { Call } from "./effect/types";

export type { EnhancedCall } from "./effect/enhance-call";

export async function enhanceCallTraceWithVerifiedSource(
  call: Call
): Promise<EnhancedCall> {
  return runAppEffect(enhanceCallTrace(call));
}
