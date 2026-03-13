"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { weeks } from "@/lib/content/weeks"
import { useProgress } from "@/hooks/use-progress"
import { CheckCircle2, Circle, RotateCcw } from "lucide-react"

export default function ProgresoPage() {
  const { progress, getWeekProgress, getModuleProgress, resetProgress } = useProgress()

  const totalModules = weeks.flatMap((w) => w.modules).length
  const completedModules = weeks
    .flatMap((w) => w.modules)
    .filter((m) => {
      const mp = getModuleProgress(m.id)
      return mp?.quizCompleted && mp?.simulationVisited
    }).length
  const totalProgress = Math.round((completedModules / totalModules) * 100)

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tu progreso</h1>
            <p className="text-muted-foreground mt-1">
              {completedModules} de {totalModules} módulos completados
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={resetProgress}>
            <RotateCcw className="mr-1 h-4 w-4" />
            Reiniciar
          </Button>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progreso general</span>
            <span className="text-sm text-muted-foreground">{totalProgress}%</span>
          </div>
          <Progress value={totalProgress} className="h-3" />
        </div>

        {weeks.map((week) => (
          <Card key={week.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Semana {week.id}: {week.title}</CardTitle>
                <Badge variant={getWeekProgress(week.id) === 100 ? "default" : "outline"}>
                  {getWeekProgress(week.id)}%
                </Badge>
              </div>
              <Progress value={getWeekProgress(week.id)} className="mt-2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {week.modules.map((m) => {
                  const mp = getModuleProgress(m.id)
                  const completed = mp?.quizCompleted && mp?.simulationVisited
                  return (
                    <div key={m.id} className="flex items-center gap-2 text-sm">
                      {completed ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <span className={completed ? "text-foreground" : "text-muted-foreground"}>
                        {m.title}
                      </span>
                      {mp?.quizCompleted && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          Quiz: {mp.quizScore}%
                        </Badge>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  )
}
