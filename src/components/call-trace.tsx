"use client"

import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { EnhancedCall, EnhancedTraceCallResult } from "@/lib/enhance-call"
import { ChevronDown, ChevronRight } from "lucide-react"
import { useState } from "react"
import { hexToNumber } from "viem"

const truncateString = (str: string, length: number = 10) => {
  if (str.length <= length) return str
  return `${str.slice(0, length)}...${str.slice(-4)}`
}

const getFunctionSignature = (input: string) => {
  // if input is just "0x" or shorter than 10 chars (0x + 8 bytes), return empty
  if (!input || input.length < 10) return ""
  return input.slice(0, 10)
}

function CallNode({ call, depth = 0 }: { call: EnhancedCall; depth?: number }) {
  const [isOpen, setIsOpen] = useState(true)
  const hasChildren = call.calls && call.calls.length > 0
  const fnSignature = getFunctionSignature(call.input)

  return (
    <div style={{ marginLeft: `${depth * 10}px` }}>
      <div className="flex items-center gap-2 py-1">
        {hasChildren ? (
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        ) : (
          <div className="w-6" />
        )}

        <div className="flex items-center gap-2 text-sm">
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
              `${call.contractName} (${truncateString(call.to, 6)})` :
              truncateString(call.to, 12)}
          </span>

          {(call.functionName || fnSignature) && (
            <>
              <span className="text-muted-foreground">fn:</span>
              <span className="font-mono">
                {call.functionName || fnSignature}
              </span>
            </>
          )}

          {call.parameters && call.parameters.length > 0 && (
            <>
              <span className="text-muted-foreground">params:</span>
              <span className="font-mono">
                ({call.parameters.map((param, i) => (
                  <span key={i}>
                    {i > 0 && ", "}
                    {param.name}: {param.value}
                  </span>
                ))})
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

export function CallTrace({ callTrace }: { callTrace: EnhancedTraceCallResult }) {
  return (
    <div className="mb-8">
      <div>
        <h2 className="mono-subtitle">Call Trace</h2>
      </div>

      <div className="border-4 border-foreground bg-background p-4 overflow-x-auto">
        <div className="min-w-fit">
          <CallNode
            call={{
              from: callTrace.from,
              to: callTrace.to,
              gas: callTrace.gas,
              gasUsed: callTrace.gasUsed,
              input: callTrace.input,
              output: callTrace.output,
              calls: callTrace.calls,
              contractName: callTrace.contractName,
              functionName: callTrace.functionName,
              parameters: callTrace.parameters
            }}
          />
        </div>
      </div>
    </div>
  )
} 