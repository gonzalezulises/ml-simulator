"use client"

import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { getWeek } from "@/lib/content/weeks"
import { useProgress } from "@/hooks/use-progress"

export function WeekClient({ weekId }: { weekId: number }) {
  const week = getWeek(weekId)
  const { getModuleProgress } = useProgress()

  if (!week) notFound()

  return (
    <main className="px-6 py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ml-green mb-2">
            Semana {week.id}
          </p>
          <h1 className="text-2xl font-medium tracking-tight">{week.title}</h1>
          <p className="mt-2 text-[13px] text-[#888892] leading-relaxed">{week.description}</p>
        </div>

        <div className="grid gap-3">
          {week.modules.map((module, i) => {
            const mp = getModuleProgress(module.id)
            const completed = mp?.quizCompleted && mp?.simulationVisited
            return (
              <Link
                key={module.id}
                href={`/semana/${week.id}/${module.slug}`}
                className="group rounded-lg border border-[rgba(255,255,255,0.07)] bg-[#16161a] p-4 hover:border-[rgba(255,255,255,0.15)] transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1e1e24] font-mono text-[11px] text-[#484852]">
                      {i + 1}
                    </span>
                    <h3 className="text-[13px] font-medium">{module.title}</h3>
                  </div>
                  {completed ? (
                    <CheckCircle2 className="h-4 w-4 text-ml-green shrink-0" />
                  ) : (
                    <ArrowRight className="h-4 w-4 text-[#484852] group-hover:text-ml-green transition-colors shrink-0" />
                  )}
                </div>
                <p className="text-[12px] text-[#888892] ml-10 mb-3">{module.description}</p>
                <div className="flex flex-wrap gap-1.5 ml-10">
                  {module.concepts.map((c) => (
                    <span
                      key={c}
                      className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#1e1e24] border border-[rgba(255,255,255,0.07)] text-[#484852]"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  )
}
