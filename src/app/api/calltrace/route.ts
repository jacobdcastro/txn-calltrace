import { enhanceCallTraceWithVerifiedSource } from "@/lib/enhance-call";
import { getTransactionCallTrace } from "@/lib/get-txn-calltrace";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const txHash = searchParams.get("hash");

  if (!txHash) {
    return NextResponse.json(
      { error: "transaction hash parameter is required" },
      { status: 400 }
    );
  }

  try {
    // get initial call trace
    const callTrace = await getTransactionCallTrace(txHash);

    // enhance call trace with verified contract data
    const enhancedTrace = await enhanceCallTraceWithVerifiedSource(callTrace);

    return NextResponse.json(enhancedTrace);
  } catch (error) {
    console.error("Error processing call trace:", error);
    return NextResponse.json(
      { error: "Failed to process transaction call trace" },
      { status: 500 }
    );
  }

