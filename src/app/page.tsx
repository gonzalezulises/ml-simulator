"use client"

import Link from "next/link"
import { Brain, TreePine, FileText, ArrowRight } from "lucide-react"
import { weeks } from "@/lib/content/weeks"
import { useProgress } from "@/hooks/use-progress"

const weekIcons = [Brain, TreePine, FileText]
const weekColors = ["ml-green", "ml-blue", "ml-purple"]

export default function HomePage() {
  const { getWeekProgress } = useProgress()

  return (
    <main className="px-6 py-16">
      <div className="max-w-4xl mx-auto space-y-16">
        {/* Hero */}
        <div className="text-center space-y-5">
          <p className="font-mono text-xs uppercase tracking-[0.12em] text-ml-green">
            simulador interactivo
          </p>
          <h1 className="text-4xl sm:text-5xl font-medium tracking-tight">
            Machine Learning
          </h1>
          <p className="text-base text-[#888892] max-w-xl mx-auto leading-relaxed">
            Aprende ajustando parámetros y observando cómo cambian los modelos en tiempo real.
            15 simulaciones interactivas, teoría concisa y verificación de conocimiento.
          </p>
        </div>

        {/* Stats bar */}
        <div className="flex items-center justify-center gap-10 font-mono text-[13px]">
          <div className="text-center">
            <p className="text-foreground font-medium text-2xl">15</p>
            <p className="text-[#484852]">simulaciones</p>
          </div>
          <div className="h-10 w-px bg-[rgba(255,255,255,0.07)]" />
          <div className="text-center">
            <p className="text-foreground font-medium text-2xl">3</p>
            <p className="text-[#484852]">semanas</p>
          </div>
          <div className="h-10 w-px bg-[rgba(255,255,255,0.07)]" />
          <div className="text-center">
            <p className="text-foreground font-medium text-2xl">45</p>
            <p className="text-[#484852]">preguntas</p>
          </div>
        </div>

        {/* Week cards */}
        <div className="grid gap-5">
          {weeks.map((week) => {
            const Icon = weekIcons[week.id - 1]
            const progress = getWeekProgress(week.id)
            const colorClass = weekColors[week.id - 1]

            return (
              <div
                key={week.id}
                className="rounded-lg border border-[rgba(255,255,255,0.07)] bg-[#16161a] overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-lg bg-${colorClass}/10`}>
                        <Icon className={`h-5 w-5 text-${colorClass}`} />
                      </div>
                      <div>
                        <p className="font-mono text-xs text-[#484852] uppercase tracking-wider">
                          Semana {week.id}
                        </p>
                        <h2 className="text-base font-medium">{week.title}</h2>
                      </div>
                    </div>
                    <span className="font-mono text-xs text-[#484852]">{progress}%</span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1 rounded-full bg-[#1e1e24] mb-5">
                    <div
                      className={`h-full rounded-full bg-${colorClass} transition-all`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <p className="text-sm text-[#888892] mb-5 leading-relaxed">
                    {week.description}
                  </p>

                  {/* Module tags */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {week.modules.map((m) => (
                      <Link
                        key={m.id}
                        href={`/semana/${week.id}/${m.slug}`}
                        className="font-mono text-xs px-3 py-1.5 rounded bg-[#1e1e24] border border-[rgba(255,255,255,0.07)] text-[#888892] hover:text-foreground hover:border-[rgba(255,255,255,0.15)] transition-colors"
                      >
                        {m.title}
                      </Link>
                    ))}
                  </div>

                  <Link
                    href={`/semana/${week.id}`}
                    className="inline-flex items-center gap-2 font-mono text-[13px] text-ml-green hover:text-ml-green/80 transition-colors"
                  >
                    Comenzar semana {week.id}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="text-center font-mono text-xs text-[#484852]">
          <p>
            Perceptrón · Árboles de decisión · Random Forest · Regresión logística · NLP
          </p>
        </div>
      </div>
    </main>
  )
}
