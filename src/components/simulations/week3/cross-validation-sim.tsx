"use client"

import { useState, useMemo, useCallback, useRef, useEffect } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts"
import { SimulationCard } from "@/components/shared/simulation-card"
import { ParameterSlider } from "@/components/shared/parameter-slider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function generateClassificationData(n: number, seed: number) {
  const rand = seededRandom(seed)
  const data: { features: number[]; label: 0 | 1 }[] = []
  for (let i = 0; i < n; i++) {
    const label: 0 | 1 = i < n / 2 ? 0 : 1
    const x1 = (label === 0 ? -1 : 1) + (rand() - 0.5) * 2
    const x2 = (label === 0 ? -1 : 1) + (rand() - 0.5) * 2
    data.push({ features: [x1, x2], label })
  }
  // Shuffle
  for (let i = data.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[data[i], data[j]] = [data[j], data[i]]
  }
  return data
}

function linearClassify(
  train: { features: number[]; label: 0 | 1 }[],
  test: { features: number[]; label: 0 | 1 }[]
): number {
  // Simple centroid-based classifier
  const c0 = [0, 0]
  const c1 = [0, 0]
  let n0 = 0
  let n1 = 0
  for (const { features, label } of train) {
    if (label === 0) {
      c0[0] += features[0]
      c0[1] += features[1]
      n0++
    } else {
      c1[0] += features[0]
      c1[1] += features[1]
      n1++
    }
  }
  if (n0 > 0) { c0[0] /= n0; c0[1] /= n0 }
  if (n1 > 0) { c1[0] /= n1; c1[1] /= n1 }

  let correct = 0
  for (const { features, label } of test) {
    const d0 = (features[0] - c0[0]) ** 2 + (features[1] - c0[1]) ** 2
    const d1 = (features[0] - c1[0]) ** 2 + (features[1] - c1[1]) ** 2
    const pred = d0 <= d1 ? 0 : 1
    if (pred === label) correct++
  }
  return test.length > 0 ? correct / test.length : 0
}

function treeClassify(
  train: { features: number[]; label: 0 | 1 }[],
  test: { features: number[]; label: 0 | 1 }[]
): number {
  // Simple 1-split decision stump on best feature/threshold
  let bestAcc = 0
  let bestFeat = 0
  let bestThresh = 0
  let bestFlip = false

  for (let f = 0; f < 2; f++) {
    const values = [...new Set(train.map((d) => d.features[f]))].sort((a, b) => a - b)
    for (let i = 0; i < values.length - 1; i++) {
      const thresh = (values[i] + values[i + 1]) / 2
      let correct = 0
      let correctFlip = 0
      for (const d of train) {
        const pred = d.features[f] <= thresh ? 0 : 1
        if (pred === d.label) correct++
        if ((1 - pred) === d.label) correctFlip++
      }
      if (correct > bestAcc * train.length) {
        bestAcc = correct / train.length
        bestFeat = f
        bestThresh = thresh
        bestFlip = false
      }
      if (correctFlip > bestAcc * train.length) {
        bestAcc = correctFlip / train.length
        bestFeat = f
        bestThresh = thresh
        bestFlip = true
      }
    }
  }

  let correct = 0
  for (const d of test) {
    let pred = d.features[bestFeat] <= bestThresh ? 0 : 1
    if (bestFlip) pred = 1 - pred
    if (pred === d.label) correct++
  }
  return test.length > 0 ? correct / test.length : 0
}

export function CrossValidationSim() {
  const [k, setK] = useState(5)
  const [datasetSize, setDatasetSize] = useState(100)
  const [model, setModel] = useState<"linear" | "tree">("linear")
  const [foldResults, setFoldResults] = useState<number[]>([])
  const [activeFold, setActiveFold] = useState(-1)
  const [isRunning, setIsRunning] = useState(false)
  const [singleSplitAcc, setSingleSplitAcc] = useState<number | null>(null)
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const dataset = useMemo(
    () => generateClassificationData(datasetSize, 42),
    [datasetSize]
  )

  const classify = useCallback(
    (
      train: { features: number[]; label: 0 | 1 }[],
      test: { features: number[]; label: 0 | 1 }[]
    ) => (model === "linear" ? linearClassify(train, test) : treeClassify(train, test)),
    [model]
  )

  useEffect(() => {
    return () => {
      if (animRef.current) clearTimeout(animRef.current)
    }
  }, [])

  const runCV = useCallback(() => {
    setIsRunning(true)
    setFoldResults([])
    setActiveFold(-1)

    // Single split baseline
    const splitIdx = Math.floor(dataset.length * 0.8)
    const trainSingle = dataset.slice(0, splitIdx)
    const testSingle = dataset.slice(splitIdx)
    setSingleSplitAcc(classify(trainSingle, testSingle))

    // K-fold
    const foldSize = Math.floor(dataset.length / k)
    const results: number[] = []

    const runFold = (foldIdx: number) => {
      if (foldIdx >= k) {
        setIsRunning(false)
        setActiveFold(-1)
        return
      }

      setActiveFold(foldIdx)
      const testStart = foldIdx * foldSize
      const testEnd = foldIdx === k - 1 ? dataset.length : testStart + foldSize
      const testFold = dataset.slice(testStart, testEnd)
      const trainFold = [...dataset.slice(0, testStart), ...dataset.slice(testEnd)]
      const acc = classify(trainFold, testFold)
      results.push(acc)
      setFoldResults([...results])

      animRef.current = setTimeout(() => runFold(foldIdx + 1), 600)
    }

    animRef.current = setTimeout(() => runFold(0), 300)
  }, [dataset, k, classify])

  const mean = foldResults.length > 0
    ? foldResults.reduce((s, v) => s + v, 0) / foldResults.length
    : 0
  const std = foldResults.length > 1
    ? Math.sqrt(
        foldResults.reduce((s, v) => s + (v - mean) ** 2, 0) / (foldResults.length - 1)
      )
    : 0

  const chartData = foldResults.map((acc, i) => ({
    name: `Fold ${i + 1}`,
    accuracy: Number((acc * 100).toFixed(1)),
  }))

  const kExplanation = useMemo(() => {
    if (k <= 2) return "Con K=2 cada fold usa solo 50% para entrenar. Sesgo alto, varianza baja."
    if (k <= 5) return "K=5 es el estándar. Buen balance entre sesgo y varianza del estimador."
    if (k <= 7) return "K mayor usa más datos para entrenar pero incrementa costo computacional."
    return "Con K alto (cercano a N), se acerca a Leave-One-Out. Varianza alta entre folds, pero bajo sesgo."
  }, [k])

  return (
    <SimulationCard
      title="Validación Cruzada K-Fold"
      description="Visualiza cómo K-Fold divide los datos y estima el rendimiento real del modelo"
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <ParameterSlider
            label="K (folds)"
            value={k}
            min={2}
            max={10}
            step={1}
            onChange={(v) => {
              setK(v)
              setFoldResults([])
              setActiveFold(-1)
            }}
            tooltip="Número de particiones. Mayor K = más folds = estimación más costosa."
          />
          <ParameterSlider
            label="Tamaño del dataset"
            value={datasetSize}
            min={30}
            max={300}
            step={10}
            onChange={(v) => {
              setDatasetSize(v)
              setFoldResults([])
              setActiveFold(-1)
            }}
          />
          <div className="space-y-2">
            <label className="text-sm font-medium">Modelo</label>
            <div className="flex gap-2">
              <Button
                variant={model === "linear" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setModel("linear")
                  setFoldResults([])
                }}
              >
                Lineal
              </Button>
              <Button
                variant={model === "tree" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setModel("tree")
                  setFoldResults([])
                }}
              >
                Árbol
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Diagrama de folds</p>
          <div className="flex gap-0.5 h-10 rounded-md overflow-hidden border">
            {Array.from({ length: k }, (_, i) => (
              <div
                key={i}
                className={`flex-1 flex items-center justify-center text-xs font-medium transition-colors duration-300 ${
                  i === activeFold
                    ? "bg-red-500 text-white"
                    : foldResults.length > i && activeFold === -1
                    ? "bg-blue-400 text-white"
                    : "bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                }`}
              >
                {i === activeFold ? "Test" : `F${i + 1}`}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded bg-blue-400" /> Entrenamiento
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded bg-red-500" /> Test
            </span>
            <span>
              Cada fold: {Math.floor(datasetSize / k)} muestras de test,{" "}
              {datasetSize - Math.floor(datasetSize / k)} de entrenamiento
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button onClick={runCV} disabled={isRunning}>
            {isRunning ? "Ejecutando..." : "Ejecutar CV"}
          </Button>
          {isRunning && (
            <span className="text-sm text-muted-foreground">
              Fold {activeFold + 1} de {k}...
            </span>
          )}
        </div>

        {foldResults.length > 0 && (
          <>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis
                  domain={[
                    Math.max(0, Math.floor((mean - std * 3) * 100)),
                    Math.min(100, Math.ceil((mean + std * 3) * 100)),
                  ]}
                  tick={{ fontSize: 11 }}
                  label={{ value: "Accuracy %", angle: -90, position: "insideLeft", fontSize: 11 }}
                />
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <Tooltip formatter={(v: any) => [`${v}%`, "Accuracy"]} />
                {foldResults.length === k && (
                  <ReferenceLine
                    y={mean * 100}
                    stroke="var(--chart-4)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    label={{ value: `Media: ${(mean * 100).toFixed(1)}%`, fontSize: 11 }}
                  />
                )}
                <Bar dataKey="accuracy" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={i === activeFold ? "var(--chart-4)" : "var(--chart-1)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {foldResults.length === k && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border p-4 space-y-2">
                  <p className="text-sm font-medium">Split único (80/20)</p>
                  <p className="text-2xl font-bold font-mono">
                    {singleSplitAcc !== null ? `${(singleSplitAcc * 100).toFixed(1)}%` : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Un solo corte. No sabemos si este resultado es confiable.
                  </p>
                </div>
                <div className="rounded-lg border border-chart-1 p-4 space-y-2">
                  <p className="text-sm font-medium">Validación cruzada ({k}-fold)</p>
                  <p className="text-2xl font-bold font-mono">
                    {(mean * 100).toFixed(1)}% <span className="text-base font-normal">± {(std * 100).toFixed(1)}%</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Promedio de {k} evaluaciones. La desviación indica qué tan estable es el modelo.
                  </p>
                  {std > 0.1 && (
                    <Badge variant="destructive">Alta varianza entre folds</Badge>
                  )}
                  {std <= 0.05 && (
                    <Badge variant="secondary">Estimación estable</Badge>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="text-sm">{kExplanation}</p>
        </div>
      </div>
    </SimulationCard>
  )
}
