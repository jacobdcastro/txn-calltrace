import axios from "axios";

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

if (!ETHERSCAN_API_KEY) {
  throw new Error("ETHERSCAN_API_KEY is not defined");
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

export async function getVerifiedContract(address: string): Promise<VerifiedContract> {
  const response = await axios.get<EtherscanResponse>("https://api.etherscan.io/api", {
    params: {
      module: "contract",
      action: "getsourcecode",
      address,
      apikey: ETHERSCAN_API_KEY,
    },
  });

  if (response.data.status === "0") {
    throw new Error(response.data.message);
  }

  return response.data.result[0];
}
