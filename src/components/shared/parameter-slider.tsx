"use client"

import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Info } from "lucide-react"

export function ParameterSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  tooltip,
  formatValue,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
  tooltip?: string
  formatValue?: (v: number) => string
}) {
  const displayValue = formatValue ? formatValue(value) : value.toString()

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium flex items-center gap-1">
          {label}
          {tooltip && (
            <Tooltip>
              <TooltipTrigger className="inline-flex">
                <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </label>
        <span className="text-sm font-mono text-muted-foreground">{displayValue}</span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(val) => {
          const arr = Array.isArray(val) ? val : [val]
          onChange(arr[0] as number)
        }}
      />
    </div>
  )
}
