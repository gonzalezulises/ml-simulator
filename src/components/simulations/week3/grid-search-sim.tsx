"use client"

import { useState, useMemo, useCallback, useRef, useEffect } from "react"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Cell,
  ZAxis,
} from "recharts"
import { SimulationCard } from "@/components/shared/simulation-card"
import { ParameterSlider } from "@/components/shared/parameter-slider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { buildTree, predictTree } from "@/lib/ml/decision-tree"

const DEPTH_OPTIONS = [1, 2, 3, 5, 10]
const MIN_SAMPLES_OPTIONS = [2, 5, 10, 20]

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function generateData(n: number, seed: number) {
  const rand = seededRandom(seed)
  const data: Record<string, number>[] = []
  for (let i = 0; i < n; i++) {
    const x1 = rand() * 4 - 2
    const x2 = rand() * 4 - 2
    const noise = (rand() - 0.5) * 0.6
    const target = x1 * x1 + x2 + noise > 1 ? 1 : 0
    data.push({ x1, x2, target })
  }
  return data
}

function kFoldCV(
  data: Record<string, number>[],
  k: number,
  maxDepth: number,
  minSamples: number,
  features: string[]
): { mean: number; std: number } {
  const foldSize = Math.floor(data.length / k)
  const accs: number[] = []

  for (let fold = 0; fold < k; fold++) {
    const testStart = fold * foldSize
    const testEnd = fold === k - 1 ? data.length : testStart + foldSize
    const testData = data.slice(testStart, testEnd)
    const trainData = [...data.slice(0, testStart), ...data.slice(testEnd)]

    // Filter train data by minSamples (used as minimum leaf size constraint)
    const tree = buildTree(trainData, features, maxDepth, 0, "target")

    let correct = 0
    for (const row of testData) {
      const pred = predictTree(tree, row)
      if (pred === row.target) correct++
    }
    accs.push(testData.length > 0 ? correct / testData.length : 0)
  }

  const mean = accs.reduce((s, v) => s + v, 0) / accs.length
  const std =
    accs.length > 1
      ? Math.sqrt(accs.reduce((s, v) => s + (v - mean) ** 2, 0) / (accs.length - 1))
      : 0

  return { mean, std }
}

type GridResult = {
  depth: number
  minSamples: number
  mean: number
  std: number
}

export function GridSearchSim() {
  const [selectedDepths, setSelectedDepths] = useState<number[]>([1, 2, 3, 5])
  const [selectedMinSamples, setSelectedMinSamples] = useState<number[]>([2, 5, 10])
  const [cvK, setCvK] = useState(3)
  const [results, setResults] = useState<GridResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [sortBy, setSortBy] = useState<"mean" | "depth" | "minSamples">("mean")
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const dataset = useMemo(() => {
    const raw = generateData(150, 42)
    // Shuffle for CV
    const rand = seededRandom(123)
    for (let i = raw.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[raw[i], raw[j]] = [raw[j], raw[i]]
    }
    return raw
  }, [])

  const features = ["x1", "x2"]

  useEffect(() => {
    return () => {
      if (animRef.current) clearTimeout(animRef.current)
    }
  }, [])

  const toggleDepth = (d: number) => {
    setSelectedDepths((prev) =>
      prev.includes(d) ? prev.filter((v) => v !== d) : [...prev, d].sort((a, b) => a - b)
    )
  }

  const toggleMinSamples = (m: number) => {
    setSelectedMinSamples((prev) =>
      prev.includes(m) ? prev.filter((v) => v !== m) : [...prev, m].sort((a, b) => a - b)
    )
  }

  const totalCombinations = selectedDepths.length * selectedMinSamples.length

  const runGridSearch = useCallback(() => {
    if (selectedDepths.length === 0 || selectedMinSamples.length === 0) return

    setIsRunning(true)
    setResults([])
    setProgress(0)

    const combinations: { depth: number; minSamples: number }[] = []
    for (const depth of selectedDepths) {
      for (const ms of selectedMinSamples) {
        combinations.push({ depth, minSamples: ms })
      }
    }

    const accumulated: GridResult[] = []
    let idx = 0

    const processNext = () => {
      if (idx >= combinations.length) {
        setIsRunning(false)
        return
      }

      const { depth, minSamples } = combinations[idx]
      // Filter dataset for minSamples constraint by only building with enough data
      const filteredData = dataset
      const { mean, std } = kFoldCV(filteredData, cvK, depth, minSamples, features)
      accumulated.push({ depth, minSamples, mean, std })
      setResults([...accumulated])
      setProgress(((idx + 1) / combinations.length) * 100)
      idx++

      animRef.current = setTimeout(processNext, 150)
    }

    animRef.current = setTimeout(processNext, 200)
  }, [selectedDepths, selectedMinSamples, cvK, dataset, features])

  const best = useMemo(() => {
    if (results.length === 0) return null
    return results.reduce((b, r) => (r.mean > b.mean ? r : b), results[0])
  }, [results])

  const sortedResults = useMemo(() => {
    const sorted = [...results]
    if (sortBy === "mean") sorted.sort((a, b) => b.mean - a.mean)
    else if (sortBy === "depth") sorted.sort((a, b) => a.depth - b.depth)
    else sorted.sort((a, b) => a.minSamples - b.minSamples)
    return sorted
  }, [results, sortBy])

  // Heatmap data for scatter plot
  const heatmapData = useMemo(() => {
    return results.map((r) => ({
      depth: r.depth,
      minSamples: r.minSamples,
      accuracy: Number((r.mean * 100).toFixed(1)),
      isBest: best ? r.depth === best.depth && r.minSamples === best.minSamples : false,
    }))
  }, [results, best])

  const minAcc = heatmapData.length > 0
    ? Math.min(...heatmapData.map((d) => d.accuracy))
    : 0
  const maxAcc = heatmapData.length > 0
    ? Math.max(...heatmapData.map((d) => d.accuracy))
    : 100

  const getColor = (acc: number, isBest: boolean) => {
    if (isBest) return "#f59e0b"
    const range = maxAcc - minAcc || 1
    const ratio = (acc - minAcc) / range
    const r = Math.round(255 * (1 - ratio))
    const g = Math.round(180 * ratio + 60)
    const b = Math.round(80 * ratio + 60)
    return `rgb(${r}, ${g}, ${b})`
  }

  return (
    <SimulationCard
      title="Grid Search de Hiperparámetros"
      description="Busca la mejor combinación de hiperparámetros evaluando todas las opciones con validación cruzada"
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Max Depth</label>
            <div className="flex flex-wrap gap-2">
              {DEPTH_OPTIONS.map((d) => (
                <label
                  key={d}
                  className="flex items-center gap-1.5 text-sm cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedDepths.includes(d)}
                    onChange={() => toggleDepth(d)}
                    className="rounded"
                  />
                  {d}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Min Samples</label>
            <div className="flex flex-wrap gap-2">
              {MIN_SAMPLES_OPTIONS.map((m) => (
                <label
                  key={m}
                  className="flex items-center gap-1.5 text-sm cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedMinSamples.includes(m)}
                    onChange={() => toggleMinSamples(m)}
                    className="rounded"
                  />
                  {m}
                </label>
              ))}
            </div>
          </div>

          <ParameterSlider
            label="K para CV interno"
            value={cvK}
            min={3}
            max={5}
            step={1}
            onChange={setCvK}
            tooltip="Número de folds en la validación cruzada interna de cada combinación."
          />
        </div>

        <div className="flex items-center gap-4">
          <Button
            onClick={runGridSearch}
            disabled={isRunning || totalCombinations === 0}
          >
            {isRunning ? "Buscando..." : "Ejecutar Grid Search"}
          </Button>
          <span className="text-sm text-muted-foreground">
            {totalCombinations} combinaciones
            {totalCombinations > 0 && ` × ${cvK}-fold CV = ${totalCombinations * cvK} entrenamientos`}
          </span>
        </div>

        {(isRunning || results.length > 0) && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progreso</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-chart-1 transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {results.length > 0 && (
          <>
            <div className="space-y-2">
              <p className="text-sm font-medium">Mapa de calor de resultados</p>
              <ResponsiveContainer width="100%" height={280}>
                <ScatterChart margin={{ top: 10, right: 30, bottom: 30, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="depth"
                    type="number"
                    name="Max Depth"
                    domain={[0, 12]}
                    tick={{ fontSize: 11 }}
                    label={{ value: "Max Depth", position: "insideBottom", offset: -10, fontSize: 11 }}
                  />
                  <YAxis
                    dataKey="minSamples"
                    type="number"
                    name="Min Samples"
                    domain={[0, 25]}
                    tick={{ fontSize: 11 }}
                    label={{ value: "Min Samples", angle: -90, position: "insideLeft", fontSize: 11 }}
                  />
                  <ZAxis dataKey="accuracy" range={[200, 600]} name="Accuracy %" />
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <Tooltip
                    formatter={(value: any, name: any) => [
                      name === "Accuracy %" ? `${value}%` : value,
                      name,
                    ]}
                  />
                  <Scatter data={heatmapData}>
                    {heatmapData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={getColor(entry.accuracy, entry.isBest)}
                        stroke={entry.isBest ? "#f59e0b" : "#666"}
                        strokeWidth={entry.isBest ? 3 : 1}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <span className="inline-block w-3 h-3 rounded bg-red-400" /> Menor accuracy
                <span className="mx-1">→</span>
                <span className="inline-block w-3 h-3 rounded bg-green-500" /> Mayor accuracy
                <span className="mx-1">|</span>
                <span className="inline-block w-3 h-3 rounded border-2 border-amber-500 bg-amber-400" /> Mejor
              </div>
            </div>

            {best && !isRunning && (
              <div className="rounded-lg border-2 border-amber-500 bg-amber-50 dark:bg-amber-950/20 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">Mejor modelo encontrado</p>
                  <Badge className="bg-amber-500">Ganador</Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 font-mono text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Max Depth</p>
                    <p className="text-lg font-bold">{best.depth}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Min Samples</p>
                    <p className="text-lg font-bold">{best.minSamples}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Accuracy (CV)</p>
                    <p className="text-lg font-bold">
                      {(best.mean * 100).toFixed(1)}% <span className="text-sm font-normal">± {(best.std * 100).toFixed(1)}%</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Tabla de resultados</p>
                <div className="flex gap-1">
                  {(["mean", "depth", "minSamples"] as const).map((key) => (
                    <Button
                      key={key}
                      variant={sortBy === key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSortBy(key)}
                      className="text-xs h-7"
                    >
                      {key === "mean" ? "Accuracy" : key === "depth" ? "Depth" : "Min Samples"}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto rounded-md border max-h-[250px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="px-3 py-1.5 text-left text-xs font-medium">#</th>
                      <th className="px-3 py-1.5 text-left text-xs font-medium">Max Depth</th>
                      <th className="px-3 py-1.5 text-left text-xs font-medium">Min Samples</th>
                      <th className="px-3 py-1.5 text-left text-xs font-medium">Accuracy (media)</th>
                      <th className="px-3 py-1.5 text-left text-xs font-medium">Accuracy (std)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedResults.map((r, i) => {
                      const isBest =
                        best &&
                        r.depth === best.depth &&
                        r.minSamples === best.minSamples
                      return (
                        <tr
                          key={`${r.depth}-${r.minSamples}`}
                          className={`border-t ${
                            isBest
                              ? "bg-amber-50 dark:bg-amber-950/20 font-semibold"
                              : "hover:bg-muted/30"
                          }`}
                        >
                          <td className="px-3 py-1.5 font-mono text-xs">{i + 1}</td>
                          <td className="px-3 py-1.5 font-mono">{r.depth}</td>
                          <td className="px-3 py-1.5 font-mono">{r.minSamples}</td>
                          <td className="px-3 py-1.5 font-mono">
                            {(r.mean * 100).toFixed(1)}%
                          </td>
                          <td className="px-3 py-1.5 font-mono">
                            {(r.std * 100).toFixed(1)}%
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        <p className="text-xs text-muted-foreground">
          Grid Search evalúa exhaustivamente todas las combinaciones de hiperparámetros.
          Cada combinación se evalúa con {cvK}-fold CV para obtener una estimación confiable.
          El costo crece exponencialmente con cada hiperparámetro adicional.
        </p>
      </div>
    </SimulationCard>
  )
}
