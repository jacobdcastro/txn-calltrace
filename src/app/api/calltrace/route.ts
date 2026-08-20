import { callTracePipeline } from "@/lib/effect/calltrace-pipeline";
import { AppLiveNode } from "@/lib/effect/layers-node";
import { Effect } from "effect";
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
    const serializedTrace = await Effect.runPromise(
      callTracePipeline(txHash).pipe(Effect.provide(AppLiveNode))
    );

    return NextResponse.json(serializedTrace);
  } catch (error) {
    console.error("Error processing call trace:", error);
    return NextResponse.json(
      { error: "Failed to process transaction call trace" },
      { status: 500 }
    );
  }
}
