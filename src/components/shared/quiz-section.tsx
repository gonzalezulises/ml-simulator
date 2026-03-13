"use client"

import { useState } from "react"
import { QuizQuestion } from "@/types/content"
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
      const score = Math.round(
        (((isCorrect ? correctCount + 1 : correctCount)) / questions.length) * 100
      )
      setFinished(true)
      onComplete?.(score)
    }
  }

  if (finished) {
    const score = Math.round((correctCount / questions.length) * 100)
    return (
      <div className="rounded-lg border border-[rgba(255,255,255,0.07)] bg-[#16161a] p-10 text-center space-y-5">
        <Trophy className="h-12 w-12 mx-auto text-ml-amber" />
        <h3 className="text-xl font-medium">Quiz completado</h3>
        <p className="text-[15px] text-[#888892]">
          Obtuviste <span className="font-bold text-foreground">{correctCount}</span> de{" "}
          {questions.length} correctas ({score}%)
        </p>
        <span
          className={cn(
            "inline-block font-mono text-xs px-4 py-1.5 rounded",
            score >= 70
              ? "bg-ml-green/10 text-ml-green border border-ml-green/20"
              : "bg-ml-coral/10 text-ml-coral border border-ml-coral/20"
          )}
        >
          {score >= 70 ? "Aprobado" : "Necesitas repasar"}
        </span>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-[rgba(255,255,255,0.07)] bg-[#16161a]">
      <div className="border-b border-[rgba(255,255,255,0.07)] px-6 py-4 flex items-center justify-between">
        <h3 className="text-[15px] font-medium flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-ml-amber" />
          Verificación de conocimiento
        </h3>
        <span className="font-mono text-xs text-[#484852]">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>
      <div className="p-6 space-y-5">
        <p className="text-[15px] font-medium leading-relaxed">{question.question}</p>

        <div className="space-y-2.5">
          {question.options.map((opt) => {
            const isThis = opt.value === selected
            const isRight = opt.value === question.correctAnswer
            return (
              <label
                key={opt.value}
                className={cn(
                  "flex items-center gap-4 rounded-lg border border-[rgba(255,255,255,0.07)] px-5 py-3.5 cursor-pointer transition-all text-[15px]",
                  answered && isRight && "border-ml-green/50 bg-ml-green/5",
                  answered && isThis && !isRight && "border-ml-coral/50 bg-ml-coral/5",
                  !answered && isThis && "border-ml-green/40 bg-[#1e1e24]",
                  !answered && !isThis && "hover:bg-[#1e1e24]",
                  answered && "cursor-default"
                )}
                onClick={() => !answered && setSelected(opt.value)}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                    isThis
                      ? "border-ml-green bg-ml-green"
                      : "border-[#484852]"
                  )}
                >
                  {isThis && (
                    <span className="h-2 w-2 rounded-full bg-[#0f0f11]" />
                  )}
                </span>
                <span className="flex-1 text-[#888892]">{opt.label}</span>
                {answered && isRight && <CheckCircle2 className="h-5 w-5 text-ml-green" />}
                {answered && isThis && !isRight && <XCircle className="h-5 w-5 text-ml-coral" />}
              </label>
            )
          })}
        </div>

        {answered && (
          <div className={cn(
            "rounded-lg px-5 py-4 text-sm font-mono",
            isCorrect
              ? "bg-ml-green/5 border border-ml-green/20"
              : "bg-ml-coral/5 border border-ml-coral/20"
          )}>
            <p className={cn("font-medium mb-1", isCorrect ? "text-ml-green" : "text-ml-coral")}>
              {isCorrect ? "¡Correcto!" : "Incorrecto"}
            </p>
            <p className="text-[#888892]">{question.explanation}</p>
          </div>
        )}

        <div className="flex justify-end">
          {!answered ? (
            <button
              onClick={handleAnswer}
              disabled={!selected}
              className="px-5 py-2.5 rounded-lg font-mono text-[13px] bg-ml-green text-[#0f0f11] font-medium hover:bg-ml-green/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Verificar
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-5 py-2.5 rounded-lg font-mono text-[13px] bg-[#1e1e24] border border-[rgba(255,255,255,0.07)] text-foreground hover:bg-[#26262e] transition-colors"
            >
              {currentIndex + 1 < questions.length ? "Siguiente →" : "Finalizar"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
