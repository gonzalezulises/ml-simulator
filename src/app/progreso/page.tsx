"use client"

import { weeks } from "@/lib/content/weeks"
import { useProgress } from "@/hooks/use-progress"
import { CheckCircle2, Circle, RotateCcw } from "lucide-react"

export default function ProgresoPage() {
  const { getWeekProgress, getModuleProgress, resetProgress } = useProgress()

  const totalModules = weeks.flatMap((w) => w.modules).length
  const completedModules = weeks
    .flatMap((w) => w.modules)
    .filter((m) => {
      const mp = getModuleProgress(m.id)
      return mp?.quizCompleted && mp?.simulationVisited
    }).length
  const totalProgress = Math.round((completedModules / totalModules) * 100)

  return (
    <main className="px-6 py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ml-green mb-2">
              resumen
            </p>
            <h1 className="text-2xl font-medium tracking-tight">Tu progreso</h1>
            <p className="text-[13px] text-[#888892] mt-1">
              {completedModules} de {totalModules} módulos completados
            </p>
          </div>
          <button
            onClick={resetProgress}
            className="flex items-center gap-1.5 font-mono text-[11px] px-3 py-2 rounded-lg border border-[rgba(255,255,255,0.07)] bg-[#16161a] text-[#888892] hover:text-foreground hover:border-[rgba(255,255,255,0.15)] transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Reiniciar
          </button>
        </div>

        {/* Overall progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[11px] text-[#888892]">Progreso general</span>
            <span className="font-mono text-[11px] text-[#484852]">{totalProgress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-[#1e1e24]">
            <div
              className="h-full rounded-full bg-ml-green transition-all"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
        </div>

        {/* Week sections */}
        {weeks.map((week) => {
          const weekProgress = getWeekProgress(week.id)
          return (
            <div
              key={week.id}
              className="rounded-lg border border-[rgba(255,255,255,0.07)] bg-[#16161a]"
            >
              <div className="border-b border-[rgba(255,255,255,0.07)] px-5 py-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-[13px] font-medium flex items-center gap-2">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-ml-green" />
                    Semana {week.id}: {week.title}
                  </h2>
                  <span className="font-mono text-[10px] text-[#484852]">{weekProgress}%</span>
                </div>
                <div className="h-[3px] rounded-full bg-[#1e1e24] mt-2">
                  <div
                    className="h-full rounded-full bg-ml-green transition-all"
                    style={{ width: `${weekProgress}%` }}
                  />
                </div>
              </div>
              <div className="p-5 space-y-2">
                {week.modules.map((m) => {
                  const mp = getModuleProgress(m.id)
                  const completed = mp?.quizCompleted && mp?.simulationVisited
                  return (
                    <div key={m.id} className="flex items-center gap-2.5 text-[12px]">
                      {completed ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-ml-green shrink-0" />
                      ) : (
                        <Circle className="h-3.5 w-3.5 text-[#484852] shrink-0" />
                      )}
                      <span className={completed ? "text-foreground" : "text-[#888892]"}>
                        {m.title}
                      </span>
                      {mp?.quizCompleted && (
                        <span className="ml-auto font-mono text-[10px] px-2 py-0.5 rounded bg-[#1e1e24] border border-[rgba(255,255,255,0.07)] text-[#484852]">
                          Quiz: {mp.quizScore}%
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}
