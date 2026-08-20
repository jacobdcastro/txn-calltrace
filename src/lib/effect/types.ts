export interface Call {
  from: `0x${string}`;
  gas?: `0x${string}`;
  gasUsed?: `0x${string}`;
  to?: `0x${string}`;
  input?: `0x${string}`;
  output?: `0x${string}`;
  value?: `0x${string}`;
  type?: "CALL" | "DELEGATECALL" | "STATICCALL";
  calls?: Call[];
  error?: string;
  revertReason?: string;
}

export interface Log {
  address: string;
  topics: string[];
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
  status: "0x0" | "0x1";
  to: `0x${string}` | null;
  transactionHash: `0x${string}`;
  transactionIndex: `0x${string}`;
  type: `0x${string}`;
}

export interface VerifiedContract {
  SourceCode: string;
  ABI: string;
  ContractName: string;
  CompilerVersion: string;
  OptimizationUsed: string;
  Runs: string;
  ConstructorArguments: string;
  EVMVersion: string;
  Library: string;
  LicenseType: string;
  Proxy: string;
  Implementation: string;
  SwarmSource: string;
}

export interface EtherscanResponse {
  status: string;
  message: string;
  result: VerifiedContract[];
}
