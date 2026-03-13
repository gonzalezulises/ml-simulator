"use client"

import { useState } from "react"
import { QuizQuestion } from "@/types/content"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CheckCircle2, XCircle, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"

export function QuizSection({
  questions,
  onComplete,
}: {
  questions: QuizQuestion[]
  onComplete?: (score: number) => void
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected, setSelected] = useState<string>("")
  const [answered, setAnswered] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [finished, setFinished] = useState(false)

  if (questions.length === 0) return null

  const question = questions[currentIndex]
  const isCorrect = selected === question.correctAnswer

  function handleAnswer() {
    setAnswered(true)
    if (isCorrect) setCorrectCount((c) => c + 1)
  }

  function handleNext() {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1)
      setSelected("")
      setAnswered(false)
    } else {
      const finalCorrect = correctCount + (isCorrect ? 0 : 0)
      const score = Math.round(((isCorrect ? correctCount + 1 : correctCount) / questions.length) * 100)
      setFinished(true)
      onComplete?.(score)
    }
  }

  if (finished) {
    const score = Math.round((correctCount / questions.length) * 100)
    return (
      <Card>
        <CardContent className="pt-6 text-center space-y-4">
          <Trophy className="h-12 w-12 mx-auto text-yellow-500" />
          <h3 className="text-xl font-bold">Quiz completado</h3>
          <p className="text-muted-foreground">
            Obtuviste <span className="font-bold text-foreground">{correctCount}</span> de{" "}
            {questions.length} correctas ({score}%)
          </p>
          <Badge variant={score >= 70 ? "default" : "destructive"}>
            {score >= 70 ? "Aprobado" : "Necesitas repasar"}
          </Badge>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Verificación de conocimiento</CardTitle>
          <Badge variant="outline">
            {currentIndex + 1} / {questions.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="font-medium">{question.question}</p>

        <RadioGroup value={selected} onValueChange={setSelected} disabled={answered}>
          {question.options.map((opt) => {
            const isThis = opt.value === selected
            const isRight = opt.value === question.correctAnswer
            return (
              <label
                key={opt.value}
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors",
                  answered && isRight && "border-green-500 bg-green-50 dark:bg-green-950",
                  answered && isThis && !isRight && "border-red-500 bg-red-50 dark:bg-red-950",
                  !answered && isThis && "border-primary",
                  answered && "cursor-default"
                )}
              >
                <RadioGroupItem value={opt.value} />
                <span className="flex-1">{opt.label}</span>
                {answered && isRight && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                {answered && isThis && !isRight && <XCircle className="h-4 w-4 text-red-600" />}
              </label>
            )
          })}
        </RadioGroup>

        {answered && (
          <div className="rounded-lg bg-muted p-3 text-sm">
            <p className="font-medium mb-1">{isCorrect ? "¡Correcto!" : "Incorrecto"}</p>
            <p className="text-muted-foreground">{question.explanation}</p>
          </div>
        )}

        <div className="flex justify-end">
          {!answered ? (
            <Button onClick={handleAnswer} disabled={!selected}>
              Verificar
            </Button>
          ) : (
            <Button onClick={handleNext}>
              {currentIndex + 1 < questions.length ? "Siguiente" : "Finalizar"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
