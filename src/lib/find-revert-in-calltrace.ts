import { Call } from "./get-txn-calltrace";

// Add this function after the Call interface
export function findRevertInCallTrace(call: Call): { error?: string; revertReason?: string } | null {
  // check current call for revert
  if (call?.error || call?.revertReason) {
    return {
      error: call.error,
      revertReason: call.revertReason
    };
  }

  // recursively check child calls
  if (call?.calls) {
    for (const subcall of call.calls) {
      const revert = findRevertInCallTrace(subcall);
      if (revert) return revert;
    }
  }

  return null;
}