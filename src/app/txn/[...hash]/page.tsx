"use client";

import { TransactionHeader } from "@/components/transaction-header";
import { useGetTransactionReceipt } from "@/hooks/use-get-transaction-receipt";
import { useParams } from "next/navigation";

export default function TransactionPage() {
  const params = useParams();
  const txHash = Array.isArray(params.hash) ? params.hash[0] : params.hash || "";

  const { data, isLoading, error } = useGetTransactionReceipt({ txHash, enabled: true });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="mono-container">
      <h1 className="mono-title">Transaction Details</h1>
      {data && <TransactionHeader receipt={data} />}
      <pre className="font-mono whitespace-pre-wrap">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
