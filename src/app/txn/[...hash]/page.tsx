"use client";

import { CallTrace } from "@/components/call-trace";
import { TransactionHeader } from "@/components/transaction-header";
import { TxnInputOutput } from "@/components/transaction-input-output";
import { useGetTransactionCallTraceData } from "@/hooks/use-get-transaction-calltrace-data";
import { useGetTransactionReceipt } from "@/hooks/use-get-transaction-receipt";
import { useParams } from "next/navigation";

export default function TransactionPage() {
  const params = useParams();
  const txHash = Array.isArray(params.hash) ? params.hash[0] : params.hash || "";

  const { data, isLoading, error } = useGetTransactionReceipt({ txHash, enabled: true });
  const { data: callTrace, isLoading: callTraceLoading, error: callTraceError } = useGetTransactionCallTraceData({ txHash, enabled: !!data });

  if (isLoading || callTraceLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (callTraceError) {
    return <div>Error loading call trace: {callTraceError.message}</div>;
  }

  return (
    <div className="mono-container">
      <h1 className="mono-title">Transaction Details</h1>
      {data && <TransactionHeader receipt={data} />}
      {callTrace && <TxnInputOutput callTrace={callTrace} />}
      {callTrace && <CallTrace callTrace={callTrace} />}
    </div>
  );
}
