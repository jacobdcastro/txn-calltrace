import { EnhancedCall } from "@/lib/enhance-call";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useGetTransactionCallTraceData({ txHash, enabled = false }: { txHash: string; enabled: boolean }) {
  return useQuery<EnhancedCall>({
    queryKey: ["transactionCallTrace", txHash],
    queryFn: async () => {
      if (!txHash) throw new Error("transaction hash is required");
      const response = await axios.get(`/api/calltrace?hash=${txHash}`);
      return response.data;
    },
    enabled,
  });
}