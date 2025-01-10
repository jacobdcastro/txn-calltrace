import axios from "axios";

const QUICKNODE_RPC_URL = process.env.NEXT_PUBLIC_QUICKNODE_RPC_URL;

if (!QUICKNODE_RPC_URL) {
  throw new Error("NEXT_PUBLIC_QUICKNODE_RPC_URL is not defined");
}

export interface Log {
  // address from which this log was generated
  address: string;
  // array of 0-4 32-byte topics (indexed log arguments)
  topics: string[];
  // the non-indexed log argument data
  data: string;
  blockNumber: string;
  transactionHash: string;
  transactionIndex: string;
  blockHash: string;
  logIndex: string;
  removed: boolean;
}

export interface TransactionReceipt {
  blockHash: `0x${string}`;
  blockNumber: `0x${string}`;
  contractAddress: `0x${string}` | null;
  cumulativeGasUsed: `0x${string}`;
  effectiveGasPrice: `0x${string}`;
  from: `0x${string}`;
  gasUsed: `0x${string}`;
  logs: Log[];
  logsBloom: `0x${string}`;
  status: '0x0' | '0x1'; // 0x0 = failure, 0x1 = success
  to: `0x${string}` | null;
  transactionHash: `0x${string}`;
  transactionIndex: `0x${string}`;
  type: `0x${string}`;
}

export async function getTransactionReceipt(txHash: string): Promise<TransactionReceipt> {
  const response = await axios.post(QUICKNODE_RPC_URL as string, {
    jsonrpc: "2.0",
    id: 1,
    method: "eth_getTransactionReceipt",
    params: [txHash],
  });

  if (response.data.error) {
    throw new Error(response.data.error.message);
  }

  return response.data.result;
} 