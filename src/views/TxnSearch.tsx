"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetTransactionReceipt } from "@/hooks/use-get-transaction-receipt";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const TxnSearch = () => {
  const router = useRouter();
  const [txHash, setTxHash] = useState<string>("");
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
      <h1 className="mono-title mb-8">
        Ethereum Transaction Debug
      </h1>

      <div className="">
        <div className="mb-6">
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
            className="font-mono border-2 h-12 mb-4"
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isFetching}
          className="w-full h-12 mt-4 text-base font-mono border-2 border-foreground"
          variant="outline"
        >
          {isFetching ? "loading" : "Decode Transaction"}
        </Button>
      </div>
    </div>
  );
};
