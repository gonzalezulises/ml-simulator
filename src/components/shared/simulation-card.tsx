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
      <div className="border-b border-[rgba(255,255,255,0.07)] px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-ml-green" />
          <h3 className="text-[15px] font-medium">{title}</h3>
        </div>
        {description && (
          <p className="mt-1 text-[13px] text-[#888892] font-mono">{description}</p>
        )}
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}
