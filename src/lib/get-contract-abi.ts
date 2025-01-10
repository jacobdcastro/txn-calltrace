import axios from "axios";

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

if (!ETHERSCAN_API_KEY) {
  throw new Error("ETHERSCAN_API_KEY is not defined");
}

export interface EtherscanResponse {
  status: string;
  message: string;
  result: string;
}

export async function getContractAbi(address: string): Promise<any[]> {
  const response = await axios.get<EtherscanResponse>("https://api.etherscan.io/api", {
    params: {
      module: "contract",
      action: "getabi",
      address,
      apikey: ETHERSCAN_API_KEY,
    },
  });

  if (response.data.status === "0") {
    throw new Error(response.data.result);
  }

  return JSON.parse(response.data.result);
} 