"use client"

import { TxnInputOutput } from "@/components/transaction-input-output"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { EnhancedCall } from "@/lib/enhance-call"
import { ChevronDown, ChevronRight } from "lucide-react"
import { useState } from "react"
import { AbiParameter, hexToNumber } from "viem"

const truncateString = (str: string, length: number = 10) => {
  if (str.length <= length) return str
  return `${str.slice(0, length)}...${str.slice(-4)}`
}

function CallNode({ call, depth = 0 }: { call: EnhancedCall; depth?: number }) {
  const [isOpen, setIsOpen] = useState(true)
  const [showDetails, setShowDetails] = useState(false)
  const hasChildren = call.calls && call.calls.length > 0
  const fnSignature = call.parsedFnSelector

  const handleClick = (e: React.MouseEvent) => {
    // prevent click from triggering if user clicked the collapse button
    if ((e.target as HTMLElement).closest('button')) return
    setShowDetails(!showDetails)
  }

  return (
    <div style={{ marginLeft: `${depth * 10}px` }}>
      <div
        className="flex items-center gap-2 py-1 whitespace-nowrap hover:bg-muted/50 rounded-md px-2 cursor-pointer"
        onClick={handleClick}
      >
        {hasChildren ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation()
              setIsOpen(!isOpen)
            }}
          >
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        ) : (
          <div className="w-6" />
        )}

        <div className="flex items-center gap-2 text-sm whitespace-nowrap overflow-x-auto">
          {call.type && (
            <span className={`px-2 py-0.5 text-xs rounded-md
              ${call.type === 'CALL' ? 'bg-blue-500/20 text-blue-500' :
                call.type === 'DELEGATECALL' ? 'bg-purple-500/20 text-purple-500' :
                  'bg-orange-500/20 text-orange-500'}`
            }>
              {call.type}
            </span>
          )}
          <span className="text-muted-foreground">to:</span>
          <span className="font-mono">
            {call.contractName ?
              `${call.contractName} (${truncateString(call.to as string, 6)})` :
              truncateString(call.to as string, 12)}
          </span>

          {(call.functionName || fnSignature) && (
            <>
              <span className="text-muted-foreground">fn:</span>
              <span className="font-mono">
                {/* remove "function" prefix from fnSignature */}
                {(call.parsedFnSelector || fnSignature)?.replace(/^function\s+/, '')}
              </span>
            </>
          )}

          {call.value && call.value !== "0x0" && (
            <>
              <span className="text-muted-foreground">value:</span>
              <span className="font-mono">
                {hexToNumber(call.value)}
              </span>
            </>
          )}
        </div>
      </div>

      <Collapsible open={showDetails}>
        <CollapsibleContent>
          <div className="pl-6 pr-2 py-2">
            <TxnInputOutput
              input={call.input as `0x${string}`}
              output={call.output as `0x${string}`}
              parsedFnSelector={call.parsedFnSelector}
              inputParams={call.inputParams as unknown as readonly AbiParameter[]}
              outputParams={call.outputParams as unknown as readonly AbiParameter[]}
              decodedInputParams={call.decodedInputParams}
              decodedOutputParams={call.decodedOutputParams}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {hasChildren && (
        <Collapsible open={isOpen}>
          <CollapsibleContent>
            <div className="border-l-2 border-muted ml-3 pl-3">
              {call.calls?.map((subcall, index) => (
                <CallNode key={index} call={subcall} depth={depth + 1} />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  )
}

export function CallTrace({ callTrace }: { callTrace: EnhancedCall }) {
  return (
    <div className="mb-8">
      <div>
        <h2 className="mono-subtitle">Call Trace</h2>
      </div>

      <div className="border-4 border-foreground bg-background p-4 overflow-x-auto">
        <div className="min-w-fit whitespace-nowrap">
          <CallNode
            call={callTrace}
          />
        </div>
      </div>
    </div>
  )
} 