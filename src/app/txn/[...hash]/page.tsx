"use client";

import { TxnDetails } from "@/views/TxnDetails";
import { useParams } from "next/navigation";

export default function TransactionPage() {
  const params = useParams();
  const txHash = Array.isArray(params.hash) ? params.hash[0] : params.hash || "";

  return <TxnDetails txHash={txHash} />;
}
