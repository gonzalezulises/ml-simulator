"use client"

import Link from "next/link"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { getWeek } from "@/lib/content/weeks"
import { useProgress } from "@/hooks/use-progress"

export function WeekClient({ weekId }: { weekId: number }) {
  const week = getWeek(weekId)
  const { getModuleProgress } = useProgress()

  if (!week) notFound()

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <Badge variant="outline" className="mb-2">
            Semana {week.id}
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight">{week.title}</h1>
          <p className="mt-2 text-muted-foreground">{week.description}</p>
        </div>

        <div className="grid gap-4">
          {week.modules.map((module, i) => {
            const mp = getModuleProgress(module.id)
            const completed = mp?.quizCompleted && mp?.simulationVisited
            return (
              <Card key={module.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-sm font-medium">
                        {i + 1}
                      </span>
                      {module.title}
                    </CardTitle>
                    {completed && (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {module.concepts.map((c) => (
                        <Badge key={c} variant="secondary" className="text-xs">
                          {c}
                        </Badge>
                      ))}
                    </div>
                    <Link href={`/semana/${week.id}/${module.slug}`}>
                      <Button size="sm">
                        {mp?.simulationVisited ? "Continuar" : "Comenzar"}
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </main>
  )
}
