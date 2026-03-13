"use client"

import { useState, useMemo } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import { SimulationCard } from "@/components/shared/simulation-card"
import { ParameterSlider } from "@/components/shared/parameter-slider"
import { generateMultiDimensional } from "@/lib/ml/data-generators"

function linearClassifierAccuracy(
  data: number[][],
  labels: (0 | 1)[]
): number {
  const n = data.length
  if (n === 0) return 0
  const dims = data[0].length

  // Simple perceptron-like: compute mean of each class and use
  // the midpoint as threshold along the direction connecting means
  const mean0 = new Array(dims).fill(0)
  const mean1 = new Array(dims).fill(0)
  let n0 = 0
  let n1 = 0
  for (let i = 0; i < n; i++) {
    const m = labels[i] === 0 ? mean0 : mean1
    if (labels[i] === 0) n0++
    else n1++
    for (let d = 0; d < dims; d++) m[d] += data[i][d]
  }
  if (n0 === 0 || n1 === 0) return 0.5
  for (let d = 0; d < dims; d++) {
    mean0[d] /= n0
    mean1[d] /= n1
  }

  // Direction vector = mean1 - mean0 (Fisher's LDA simplified)
  const w = mean1.map((v, d) => v - mean0[d])
  const mid = mean0.map((v, d) => (v + mean1[d]) / 2)

  // Project and classify
  let correct = 0
  for (let i = 0; i < n; i++) {
    let proj = 0
    let midProj = 0
    for (let d = 0; d < dims; d++) {
      proj += w[d] * data[i][d]
      midProj += w[d] * mid[d]
    }
    const pred: 0 | 1 = proj >= midProj ? 1 : 0
    if (pred === labels[i]) correct++
  }
  return correct / n
}

export function DimensionalitySim() {
  const [maxDims, setMaxDims] = useState(15)
  const [samples, setSamples] = useState(100)
  const [separation, setSeparation] = useState(1.0)

  const chartData = useMemo(() => {
    const points: { dimension: number; accuracy: number }[] = []
    for (let d = 1; d <= maxDims; d++) {
      const { data, labels } = generateMultiDimensional(samples, d, separation)
      const acc = linearClassifierAccuracy(data, labels)
      points.push({ dimension: d, accuracy: Math.round(acc * 1000) / 10 })
    }
    return points
  }, [maxDims, samples, separation])

  const maxAcc = Math.max(...chartData.map((d) => d.accuracy))
  const minAcc = Math.min(...chartData.map((d) => d.accuracy))
  const improvement = maxAcc - minAcc

  const getMessage = () => {
    if (improvement > 15)
      return "La separabilidad mejora dramaticamente con mas dimensiones. En alta dimension, casi cualquier conjunto de datos es linealmente separable."
    if (improvement > 5)
      return "Se observa una mejora moderada. Con mayor separacion entre clases o mas dimensiones, el efecto seria mas pronunciado."
    return "Las clases ya estan bien separadas desde pocas dimensiones. Intenta reducir la separacion para ver el efecto de la dimensionalidad."
  }

  return (
    <SimulationCard
      title="La Bendicion de la Dimension"
      description="Observa como la accuracy de un clasificador lineal mejora al aumentar las dimensiones"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
              <CartesianGrid stroke="#1e1e24" strokeDasharray="3 3" />
              <XAxis
                dataKey="dimension"
                stroke="#484852"
                tick={{ fill: "#888892", fontSize: 10 }}
                label={{
                  value: "Dimensiones",
                  position: "insideBottom",
                  offset: -5,
                  fill: "#484852",
                  fontSize: 10,
                }}
              />
              <YAxis
                domain={[40, 100]}
                stroke="#484852"
                tick={{ fill: "#888892", fontSize: 10 }}
                label={{
                  value: "Accuracy (%)",
                  angle: -90,
                  position: "insideLeft",
                  offset: 10,
                  fill: "#484852",
                  fontSize: 10,
                }}
              />
              <Tooltip
                formatter={(value) => [`${value}%`, "Accuracy"]}
                labelFormatter={(label) => `${label} dimensiones`}
                contentStyle={{
                  backgroundColor: "#16161a",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "8px",
                  fontSize: "11px",
                  fontFamily: "monospace",
                }}
              />
              <ReferenceLine y={50} stroke="#E8593A" strokeDasharray="3 3" label={{ value: "Azar", fill: "#484852", fontSize: 10 }} />
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke="#9B7FE8"
                strokeWidth={2}
                dot={{ fill: "#9B7FE8", r: 4 }}
                activeDot={{ r: 6, fill: "#9B7FE8" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4">
          <ParameterSlider
            label="Dimensiones max"
            value={maxDims}
            min={1}
            max={20}
            step={1}
            onChange={setMaxDims}
            tooltip="Numero maximo de dimensiones a evaluar"
          />
          <ParameterSlider
            label="Muestras"
            value={samples}
            min={20}
            max={500}
            step={10}
            onChange={setSamples}
            tooltip="Numero de muestras en el dataset"
          />
          <ParameterSlider
            label="Separacion de clases"
            value={separation}
            min={0.1}
            max={2.0}
            step={0.1}
            onChange={setSeparation}
            tooltip="Distancia entre los centros de las dos clases"
            formatValue={(v) => v.toFixed(1)}
          />

          <div className="rounded-lg border border-[rgba(255,255,255,0.07)] bg-[#1e1e24] p-3 space-y-2 text-[11px] font-mono">
            <div className="flex justify-between items-center">
              <span className="text-[#888892]">Mejor accuracy:</span>
              <span className="text-[10px] px-2 py-1 rounded border border-[rgba(255,255,255,0.07)] bg-[#1DB981]/15 text-[#1DB981]">
                {maxAcc.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#888892]">Mejora total:</span>
              <span
                className={`text-[10px] px-2 py-1 rounded border border-[rgba(255,255,255,0.07)] ${
                  improvement > 10
                    ? "bg-[#1DB981]/15 text-[#1DB981]"
                    : "bg-[#16161a] text-[#888892]"
                }`}
              >
                +{improvement.toFixed(1)}%
              </span>
            </div>
          </div>

          <p className="text-[11px] font-mono text-[#484852]">{getMessage()}</p>
        </div>
      </div>
    </SimulationCard>
  )
}
