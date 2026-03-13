"use client"

import { ReactNode } from "react"

export function SimulationCard({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <div className="rounded-lg border border-[rgba(255,255,255,0.07)] bg-[#16161a]">
      <div className="border-b border-[rgba(255,255,255,0.07)] px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-ml-green" />
          <h3 className="text-[13px] font-medium">{title}</h3>
        </div>
        {description && (
          <p className="mt-1 text-[11px] text-[#888892] font-mono">{description}</p>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}
