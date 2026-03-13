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
              <CartesianGrid stroke="#1e1e24" strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="x"
                domain={[-5, 5]}
                name="x"
                stroke="#484852"
                tick={{ fill: "#888892", fontSize: 12 }}
              />
              <YAxis
                type="number"
                dataKey="y"
                domain={[-5, 5]}
                name="y"
                stroke="#484852"
                tick={{ fill: "#888892", fontSize: 12 }}
              />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                contentStyle={{
                  backgroundColor: "#16161a",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontFamily: "monospace",
                }}
              />
              <Scatter name="Clase 0" data={class0} fill="#4A8FE8" />
              <Scatter name="Clase 1" data={class1} fill="#E8593A" />
              {boundary && (
                <Scatter
                  name="Frontera"
                  data={boundaryPoints}
                  fill="none"
                  line={{ stroke: "#1DB981", strokeWidth: 2 }}
                  lineType="joint"
                  legendType="line"
                />
              )}
            </ScatterChart>
          </ResponsiveContainer>

          {nonSeparable && iteration > 50 && (
            <div className="flex items-start gap-3 rounded-lg border border-[rgba(255,255,255,0.07)] bg-[#1e1e24] p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#E8A530]" />
              <p className="text-[13px] font-mono text-[#888892]">
                Los datos no son linealmente separables. El perceptron nunca convergera
                — necesitas un modelo mas complejo (como redes neuronales con capas ocultas).
              </p>
            </div>
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
            <button
              onClick={() => generateData(true)}
              className="inline-flex items-center gap-1.5 rounded-md border border-[rgba(255,255,255,0.07)] bg-[#1e1e24] px-4 py-2 font-mono text-[13px] text-[#e2e2e6] transition-colors hover:bg-[#24242a]"
            >
              <Shuffle className="h-3.5 w-3.5" />
              Separable
            </button>
            <button
              onClick={() => generateData(false)}
              className="inline-flex items-center gap-1.5 rounded-md border border-[rgba(255,255,255,0.07)] bg-[#1e1e24] px-4 py-2 font-mono text-[13px] text-[#e2e2e6] transition-colors hover:bg-[#24242a]"
            >
              <Shuffle className="h-3.5 w-3.5" />
              No separable
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => doStep()}
              disabled={isTraining}
              className="inline-flex items-center gap-1.5 rounded-md bg-[#1DB981] px-4 py-2 font-mono text-[13px] text-[#0f0f11] font-medium transition-colors hover:bg-[#1DB981]/80 disabled:opacity-40"
            >
              <StepForward className="h-3.5 w-3.5" />
              Paso
            </button>
            <button
              onClick={startTraining}
              className="inline-flex items-center gap-1.5 rounded-md bg-[#4A8FE8] px-4 py-2 font-mono text-[13px] text-[#0f0f11] font-medium transition-colors hover:bg-[#4A8FE8]/80"
            >
              <Play className="h-3.5 w-3.5" />
              {isTraining ? "Detener" : "Entrenar"}
            </button>
            <button
              onClick={() => reset()}
              className="inline-flex items-center gap-1.5 rounded-md border border-[rgba(255,255,255,0.07)] bg-transparent px-4 py-2 font-mono text-[13px] text-[#888892] transition-colors hover:bg-[#1e1e24]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>

          <div className="rounded-lg border border-[rgba(255,255,255,0.07)] bg-[#1e1e24] p-3 space-y-2 text-[13px] font-mono">
            <div className="flex justify-between">
              <span className="text-[#888892]">w1:</span>
              <span className="text-[#e2e2e6]">{weights.w1.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#888892]">w2:</span>
              <span className="text-[#e2e2e6]">{weights.w2.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#888892]">bias:</span>
              <span className="text-[#e2e2e6]">{weights.bias.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#888892]">Iteracion:</span>
              <span className="text-[#e2e2e6]">{iteration}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#888892]">Accuracy:</span>
              <span
                className={`font-mono text-xs px-2.5 py-1 rounded border border-[rgba(255,255,255,0.07)] ${
                  acc >= 0.95
                    ? "bg-[#1DB981]/15 text-[#1DB981]"
                    : "bg-[#1e1e24] text-[#888892]"
                }`}
              >
                {(acc * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </SimulationCard>
  )
}
