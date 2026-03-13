"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Brain, TreePine, FileText, ArrowRight } from "lucide-react"
import { weeks } from "@/lib/content/weeks"
import { useProgress } from "@/hooks/use-progress"

const weekIcons = [Brain, TreePine, FileText]

export default function HomePage() {
  const { getWeekProgress } = useProgress()

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            ML Simulator
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Aprende Machine Learning de forma interactiva. Ajusta parámetros, observa
            cómo cambian los modelos en tiempo real y verifica tu comprensión.
          </p>
        </div>

        <div className="grid gap-6">
          {weeks.map((week) => {
            const Icon = weekIcons[week.id - 1]
            const progress = getWeekProgress(week.id)
            return (
              <Card key={week.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle>Semana {week.id}</CardTitle>
                        <CardDescription className="mt-1">{week.title}</CardDescription>
                      </div>
                    </div>
                    <Badge variant={progress === 100 ? "default" : "outline"}>
                      {progress}%
                    </Badge>
                  </div>
                  <Progress value={progress} className="mt-3" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{week.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {week.modules.map((m) => (
                      <Link key={m.id} href={`/semana/${week.id}/${m.slug}`}>
                        <Badge
                          variant="secondary"
                          className="cursor-pointer hover:bg-secondary/80"
                        >
                          {m.title}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                  <Link href={`/semana/${week.id}`}>
                    <Button variant="outline" size="sm">
                      Comenzar semana {week.id}
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            15 simulaciones interactivas que cubren perceptrón, árboles de decisión,
            random forest, regresión logística y NLP.
          </p>
        </div>
      </div>
    </main>
  )
}
