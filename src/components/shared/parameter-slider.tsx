"use client"

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
    <div className="flex items-center gap-4">
      <span className="font-mono text-[13px] text-[#888892] min-w-[160px] flex items-center gap-1.5">
        {label}
        {tooltip && (
          <Tooltip>
            <TooltipTrigger className="inline-flex">
              <Info className="h-3.5 w-3.5 text-[#484852] cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-[13px]">
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-1.5 bg-[#26262e] rounded-sm appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-ml-green [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#0f0f11] [&::-webkit-slider-thumb]:cursor-pointer"
      />
      <span className="font-mono text-[13px] font-medium min-w-[50px] text-right">
        {displayValue}
      </span>
    </div>
  )
}
