"use client";

import { CallTrace } from "@/components/call-trace";
import { TransactionHeader } from "@/components/transaction-header";
import { TxnInputOutput } from "@/components/transaction-input-output";
import { useGetTransactionCallTraceData } from "@/hooks/use-get-transaction-calltrace-data";
import { useGetTransactionReceipt } from "@/hooks/use-get-transaction-receipt";
import { AbiParameter } from "abitype";
import { Search } from "lucide-react";
import Link from "next/link";

interface TxnDetailsProps {
  txHash: string;
}

export const TxnDetails = ({ txHash }: TxnDetailsProps) => {
  const { data, isLoading, error } = useGetTransactionReceipt({ txHash, enabled: true });
  const { data: callTrace, isLoading: callTraceLoading, error: callTraceError } = useGetTransactionCallTraceData({ txHash, enabled: !!data });

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (callTraceError) {
    return <div>Error loading call trace: {callTraceError.message}</div>;
  }

  return (
    <div className="mono-container">
      <div className="flex items-center justify-between mb-8">
        <h1 className="mono-title mb-0 p-0">Transaction Details</h1>
        <Link
          href="/"
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          <Search className="h-6 w-6" />
        </Link>
      </div>
      {data && <TransactionHeader receipt={data} />}
      {isLoading || callTraceLoading ? <div>Loading...</div> : (
        <>
          {callTrace && (
            <TxnInputOutput
              input={callTrace.input as `0x${string}`}
              output={callTrace.output as `0x${string}`}
              parsedFnSelector={callTrace.parsedFnSelector}
              inputParams={callTrace.inputParams as unknown as AbiParameter[]}
              outputParams={callTrace.outputParams as unknown as AbiParameter[]}
              decodedInputParams={callTrace.decodedInputParams}
              decodedOutputParams={callTrace.decodedOutputParams}
            />
          )}
          {callTrace && <CallTrace callTrace={callTrace} />}
        </>
      )}
    </div>
  );
}; 