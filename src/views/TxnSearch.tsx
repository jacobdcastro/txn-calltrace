"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetTransactionReceipt } from "@/hooks/use-get-transaction-receipt";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const TxnSearch = () => {
  const router = useRouter();
  const [txHash, setTxHash] = useState<string>("0xb26207246255bccf733334fc5a700e9a608cb81b7c398e9b3ba04e2019247ad9");
  const { toast } = useToast();

  const { refetch, isFetching } = useGetTransactionReceipt({ txHash, enabled: false });

  const handleSubmit = async () => {
    if (!txHash) {
      toast({
        title: "Error",
        description: "please enter a transaction hash",
        variant: "destructive",
        className: "font-mono border-2 border-destructive",
      });
      return;
    }

    try {
      const { error } = await refetch();

      if (error) {
        throw error;
      }

      // navigate to transaction page on success
      router.push(`/txn/${txHash}`);
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "failed to fetch transaction",
        variant: "destructive",
        className: "font-mono border-2 border-destructive",
      });
    }
  };

  return (
    <div className="mono-container">
      <h1 className="mono-title">
        Ethereum Transaction Debug
      </h1>

      <div className="space-y-6">
        <div className="space-y-2">
          <label
            htmlFor="txHash"
            className="block text-sm font-medium"
          >
            Ethereum Mainnet Transaction Hash
          </label>
          <Input
            id="txHash"
            value={txHash}
            onChange={(e) => setTxHash(e.target.value)}
            placeholder="0x..."
            className="font-mono border-2 h-12"
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isFetching}
          className="w-full h-12 text-base font-mono border-2 border-foreground"
          variant="outline"
        >
          {isFetching ? "loading" : "Decode Transaction"}
        </Button>
      </div>
    </div>
  );
};
