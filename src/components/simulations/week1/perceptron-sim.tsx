"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import { SimulationCard } from "@/components/shared/simulation-card"
import { ParameterSlider } from "@/components/shared/parameter-slider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Play, RotateCcw, StepForward, Shuffle, AlertTriangle } from "lucide-react"
import { generateLinearSeparable, generateNonLinear } from "@/lib/ml/data-generators"
import { step, accuracy, getDecisionBoundaryLine } from "@/lib/ml/perceptron"
import type { DataPoint, Weights } from "@/types/ml"

export function PerceptronSim() {
  const [lr, setLr] = useState(0.1)
  const [data, setData] = useState<DataPoint[]>(() => generateLinearSeparable(80, 2, 0.4))
  const [weights, setWeights] = useState<Weights>({ w1: 0.1, w2: -0.1, bias: 0 })
  const [iteration, setIteration] = useState(0)
  const [isTraining, setIsTraining] = useState(false)
  const [nonSeparable, setNonSeparable] = useState(false)
  const trainRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const acc = accuracy(weights, data)
  const boundary = getDecisionBoundaryLine(weights, [-5, 5])

  const class0 = data.filter((p) => p.label === 0).map((p) => ({ x: p.x, y: p.y }))
  const class1 = data.filter((p) => p.label === 1).map((p) => ({ x: p.x, y: p.y }))

  const doStep = useCallback(() => {
    setWeights((w) => {
      const result = step(w, data, lr)
      if (!result.updated && iteration > 0) {
        setIsTraining(false)
      }
      return result.weights
    })
    setIteration((i) => i + 1)
  }, [data, lr, iteration])

  const startTraining = useCallback(() => {
    if (isTraining) {
      setIsTraining(false)
      return
    }
    setIsTraining(true)
  }, [isTraining])

  useEffect(() => {
    if (isTraining) {
      trainRef.current = setInterval(() => {
        setWeights((w) => {
          const result = step(w, data, lr)
          if (!result.updated) {
            setIsTraining(false)
          }
          return result.weights
        })
        setIteration((i) => {
          if (i >= 200) {
            setIsTraining(false)
            return i
          }
          return i + 1
        })
      }, 100)
    }
    return () => {
      if (trainRef.current) clearInterval(trainRef.current)
    }
  }, [isTraining, data, lr])

  const generateData = (separable: boolean) => {
    const newData = separable
      ? generateLinearSeparable(80, 2, 0.4)
      : generateNonLinear(80, 0.5)
    setData(newData)
    setNonSeparable(!separable)
    reset(newData)
  }

  const reset = (newData?: DataPoint[]) => {
    setWeights({ w1: Math.random() * 0.4 - 0.2, w2: Math.random() * 0.4 - 0.2, bias: 0 })
    setIteration(0)
    setIsTraining(false)
  }

  const boundaryPoints = boundary
    ? [
        { x: boundary.x1, y: boundary.y1 },
        { x: boundary.x2, y: boundary.y2 },
      ]
    : []

  return (
    <SimulationCard
      title="Simulador del Perceptron"
      description="Observa como el perceptron ajusta sus pesos para encontrar la frontera de decision"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="x" domain={[-5, 5]} name="x" />
              <YAxis type="number" dataKey="y" domain={[-5, 5]} name="y" />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter name="Clase 0" data={class0} fill="hsl(221, 83%, 53%)" />
              <Scatter name="Clase 1" data={class1} fill="hsl(0, 84%, 60%)" />
              {boundary && (
                <Scatter
                  name="Frontera"
                  data={boundaryPoints}
                  fill="none"
                  line={{ stroke: "hsl(142, 71%, 45%)", strokeWidth: 2 }}
                  lineType="joint"
                  legendType="line"
                />
              )}
            </ScatterChart>
          </ResponsiveContainer>

          {nonSeparable && iteration > 50 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Los datos no son linealmente separables. El perceptron nunca convergera
                — necesitas un modelo mas complejo (como redes neuronales con capas ocultas).
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="space-y-4">
          <ParameterSlider
            label="Learning Rate"
            value={lr}
            min={0.001}
            max={1.0}
            step={0.001}
            onChange={setLr}
            tooltip="Tasa de aprendizaje: que tan grandes son los ajustes a los pesos"
            formatValue={(v) => v.toFixed(3)}
          />

          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => generateData(true)}>
              <Shuffle className="mr-1 h-4 w-4" />
              Separable
            </Button>
            <Button size="sm" variant="outline" onClick={() => generateData(false)}>
              <Shuffle className="mr-1 h-4 w-4" />
              No separable
            </Button>
          </div>

          <div className="flex gap-2">
            <Button size="sm" onClick={() => doStep()} disabled={isTraining}>
              <StepForward className="mr-1 h-4 w-4" />
              Paso
            </Button>
            <Button size="sm" onClick={startTraining}>
              <Play className="mr-1 h-4 w-4" />
              {isTraining ? "Detener" : "Entrenar"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => reset()}>
              <RotateCcw className="mr-1 h-4 w-4" />
              Reset
            </Button>
          </div>

          <div className="rounded-lg border p-3 space-y-2 text-sm font-mono">
            <div className="flex justify-between">
              <span className="text-muted-foreground">w1:</span>
              <span>{weights.w1.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">w2:</span>
              <span>{weights.w2.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">bias:</span>
              <span>{weights.bias.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Iteracion:</span>
              <span>{iteration}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Accuracy:</span>
              <Badge variant={acc >= 0.95 ? "default" : "secondary"}>
                {(acc * 100).toFixed(1)}%
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </SimulationCard>
  )
}
