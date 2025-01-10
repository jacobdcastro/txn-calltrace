import { TransactionReceipt } from "@/lib/get-txn-receipt";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface TransactionHeaderProps {
  receipt: TransactionReceipt;
}

// helper to convert hex to decimal
const hexToDecimal = (hex: string) => parseInt(hex, 16).toString();

export function TransactionHeader({ receipt }: TransactionHeaderProps) {
  const isSuccess = receipt.status === '0x1';

  const [hashCopied, setHashCopied] = useState(false);
  const [fromCopied, setFromCopied] = useState(false);
  const [toCopied, setToCopied] = useState(false);

  const copyToClipboard = (text: string, setCopied: (value: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="grid grid-cols-[6fr_1fr] border-4 border-foreground bg-background mb-[-4px]">
        {/* Hash */}
        <div className="p-4 border-foreground">
          <div className="text-muted-foreground">hash</div>
          <div className="break-all flex items-center gap-2">
            {receipt.transactionHash}
            <button
              onClick={() => copyToClipboard(receipt.transactionHash, setHashCopied)}
              className="hover:opacity-70"
            >
              {hashCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Status */}
        <div className="border-l-4 border-foreground p-4">
          <div className="text-muted-foreground">status</div>
          <div className={isSuccess ? "text-green-600" : "text-red-600"}>
            {isSuccess ? "Success" : "Failed"}
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-2 font-mono text-sm border-4 border-foreground [&>div]:border-foreground [&>div]:border-r-4 [&>div]:border-b-4 [&>div:nth-child(2n)]:border-r-0 [&>div:nth-last-child(-n+2)]:border-b-0">

        {/* From Address */}
        <div className="p-4">
          <div className="text-muted-foreground">from</div>
          <div className="break-all flex items-center gap-2">
            {receipt.from}
            <button
              onClick={() => copyToClipboard(receipt.from, setFromCopied)}
              className="hover:opacity-70"
            >
              {fromCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* To Address */}
        <div className="p-4">
          <div className="text-muted-foreground">to</div>
          <div className="break-all flex items-center gap-2">
            {receipt.to || "N/A"}
            {receipt.to && (
              <button
                onClick={() => copyToClipboard(receipt.to!, setToCopied)}
                className="hover:opacity-70"
              >
                {toCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            )}
          </div>
        </div>

        {/* Block */}
        <div className="p-4">
          <div className="text-muted-foreground">block</div>
          <div>{hexToDecimal(receipt.blockNumber)}</div>
        </div>

        {/* Gas Used */}
        <div className="p-4">
          <div className="text-muted-foreground">gas used</div>
          <div>{hexToDecimal(receipt.gasUsed)}</div>
        </div>

        {/* Effective Gas Price */}
        {/*         <div className="p-4">
          <div className="text-muted-foreground">effective gas price</div>
          <div>{hexToDecimal(receipt.effectiveGasPrice)} wei</div>
        </div> */}
      </div>
    </div>
  );
} 