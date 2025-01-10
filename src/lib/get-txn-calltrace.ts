import axios from "axios";

const QUICKNODE_RPC_URL = process.env.NEXT_PUBLIC_QUICKNODE_RPC_URL;

if (!QUICKNODE_RPC_URL) {
  throw new Error("NEXT_PUBLIC_QUICKNODE_RPC_URL is not defined");
}

export interface Call {
  from: `0x${string}`;
  gas: `0x${string}`;
  gasUsed: `0x${string}`;
  to: `0x${string}`;
  input: `0x${string}`;
  output?: `0x${string}`;
  value?: `0x${string}`;
  type?: 'CALL' | 'DELEGATECALL' | 'STATICCALL';
  calls?: Call[];
}

export interface TraceCallResult {
  from: `0x${string}`;
  gas: `0x${string}`;
  gasUsed: `0x${string}`;
  to: `0x${string}`;
  input: `0x${string}`;
  output: `0x${string}`;
  calls?: Call[];
}

export async function getTransactionCallTrace(txHash: string): Promise<TraceCallResult> {
  const response = await axios.post(QUICKNODE_RPC_URL as string, {
    jsonrpc: "2.0",
    id: 1,
    method: "debug_traceTransaction",
    params: [txHash, { tracer: "callTracer" }],
  });

  if (response.data.error) {
    throw new Error(response.data.error.message);
  }

  return response.data.result;
}
