import { getTransactionReceipt, type TransactionReceipt } from "@/lib/get-txn-receipt";
import { useQuery } from "@tanstack/react-query";

export function useGetTransactionReceipt({ txHash, enabled }: { txHash: string; enabled: boolean }) {
  return useQuery<TransactionReceipt>({
    queryKey: ["transactionReceipt", txHash],
    queryFn: ({ queryKey }) => {
      const [_, txHash] = queryKey;
      if (!txHash) throw new Error("transaction hash is required");
      return getTransactionReceipt(txHash as string);
    },
    enabled,
  });
} 