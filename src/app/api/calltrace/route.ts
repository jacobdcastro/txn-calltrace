import { getContractAbi } from "@/lib/get-contract-abi";
import { Call, getTransactionCallTrace } from "@/lib/get-txn-calltrace";
import { decodeFunctionFromAbi, type EnhancedCall } from "@/lib/process-abi";
import { NextResponse } from "next/server";

async function enhanceCallWithAbi(call: Call): Promise<EnhancedCall> {
  const enhancedCall: EnhancedCall = { ...call };

  try {
    // attempt to get contract ABI
    const abi = await getContractAbi(call.to);

    if (call.to.startsWith("0x3a23f9")) {
      console.log("abi", abi);
    }

    // decode function if we have input data
    if (call.input && call.input.length >= 10) {
      const functionInfo = decodeFunctionFromAbi(abi, call.input);
      console.log("functionInfo", functionInfo);
      if (functionInfo) {
        enhancedCall.functionName = functionInfo.functionName;
        enhancedCall.parameters = functionInfo.parameters;
      }
    }
  } catch (error) {
    // silently continue if ABI not found
  }

  // recursively process child calls
  if (call.calls?.length) {
    enhancedCall.calls = await Promise.all(
      call.calls.map(subcall => enhanceCallWithAbi(subcall))
    );
  }

  return enhancedCall;
}

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

    // enhance with contract data
    const enhancedTrace = await enhanceCallWithAbi(callTrace);

    return NextResponse.json(enhancedTrace);
  } catch (error) {
    console.error("Error processing call trace:", error);
    return NextResponse.json(
      { error: "Failed to process transaction call trace" },
      { status: 500 }
    );
  }
}
