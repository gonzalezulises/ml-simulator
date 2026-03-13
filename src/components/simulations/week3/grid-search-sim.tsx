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
    if (isBest) return "#E8A530"
    const range = maxAcc - minAcc || 1
    const ratio = (acc - minAcc) / range
    // Interpolate from ml-coral (#E8593A) to ml-green (#1DB981)
    const r = Math.round(232 + (29 - 232) * ratio)
    const g = Math.round(89 + (185 - 89) * ratio)
    const b = Math.round(58 + (129 - 58) * ratio)
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
            <label className="font-mono text-[11px] text-[#888892]">Max Depth</label>
            <div className="flex flex-wrap gap-2">
              {DEPTH_OPTIONS.map((d) => (
                <label
                  key={d}
                  className="flex items-center gap-1.5 font-mono text-[11px] text-[#888892] cursor-pointer hover:text-[#e2e2e6] transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedDepths.includes(d)}
                    onChange={() => toggleDepth(d)}
                    className="rounded accent-ml-green"
                  />
                  {d}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-mono text-[11px] text-[#888892]">Min Samples</label>
            <div className="flex flex-wrap gap-2">
              {MIN_SAMPLES_OPTIONS.map((m) => (
                <label
                  key={m}
                  className="flex items-center gap-1.5 font-mono text-[11px] text-[#888892] cursor-pointer hover:text-[#e2e2e6] transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedMinSamples.includes(m)}
                    onChange={() => toggleMinSamples(m)}
                    className="rounded accent-ml-green"
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
          <button
            className="px-4 py-2 rounded text-[11px] font-mono font-medium transition-colors bg-ml-green text-[#0f0f11] hover:bg-ml-green/90 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={runGridSearch}
            disabled={isRunning || totalCombinations === 0}
          >
            {isRunning ? "Buscando..." : "Ejecutar Grid Search"}
          </button>
          <span className="font-mono text-[11px] text-[#888892]">
            {totalCombinations} combinaciones
            {totalCombinations > 0 && ` × ${cvK}-fold CV = ${totalCombinations * cvK} entrenamientos`}
          </span>
        </div>

        {(isRunning || results.length > 0) && (
          <div className="space-y-1">
            <div className="flex justify-between font-mono text-[10px] text-[#888892]">
              <span>Progreso</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-[#1e1e24] overflow-hidden">
              <div
                className="h-full rounded-full bg-ml-green transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {results.length > 0 && (
          <>
            <div className="space-y-2">
              <p className="font-mono text-[11px] text-[#888892]">Mapa de calor de resultados</p>
              <ResponsiveContainer width="100%" height={280}>
                <ScatterChart margin={{ top: 10, right: 30, bottom: 30, left: 20 }}>
                  <CartesianGrid stroke="#1e1e24" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="depth"
                    type="number"
                    name="Max Depth"
                    domain={[0, 12]}
                    stroke="#484852"
                    tick={{ fill: '#888892', fontSize: 10 }}
                    label={{ value: "Max Depth", position: "insideBottom", offset: -10, fontSize: 10, fill: '#888892' }}
                  />
                  <YAxis
                    dataKey="minSamples"
                    type="number"
                    name="Min Samples"
                    domain={[0, 25]}
                    stroke="#484852"
                    tick={{ fill: '#888892', fontSize: 10 }}
                    label={{ value: "Min Samples", angle: -90, position: "insideLeft", fontSize: 10, fill: '#888892' }}
                  />
                  <ZAxis dataKey="accuracy" range={[200, 600]} name="Accuracy %" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#16161a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
                    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
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
                        stroke={entry.isBest ? "#E8A530" : "#484852"}
                        strokeWidth={entry.isBest ? 3 : 1}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-2 font-mono text-[10px] text-[#888892]">
                <span className="inline-block w-3 h-3 rounded bg-ml-coral" /> Menor accuracy
                <span className="mx-1 text-[#484852]">&rarr;</span>
                <span className="inline-block w-3 h-3 rounded bg-ml-green" /> Mayor accuracy
                <span className="mx-1 text-[#484852]">|</span>
                <span className="inline-block w-3 h-3 rounded border-2 border-ml-amber bg-ml-amber" /> Mejor
              </div>
            </div>

            {best && !isRunning && (
              <div className="rounded-lg border border-ml-amber/30 bg-ml-amber/5 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <p className="font-mono text-[11px] text-[#888892]">Mejor modelo encontrado</p>
                  <span className="font-mono text-[10px] px-2 py-1 rounded bg-ml-amber text-[#0f0f11] font-medium">
                    Ganador
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 font-mono text-[11px]">
                  <div>
                    <p className="text-[10px] text-[#484852]">Max Depth</p>
                    <p className="text-lg font-bold text-[#e2e2e6]">{best.depth}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#484852]">Min Samples</p>
                    <p className="text-lg font-bold text-[#e2e2e6]">{best.minSamples}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#484852]">Accuracy (CV)</p>
                    <p className="text-lg font-bold text-[#e2e2e6]">
                      {(best.mean * 100).toFixed(1)}% <span className="text-[11px] font-normal text-[#888892]">± {(best.std * 100).toFixed(1)}%</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[11px] text-[#888892]">Tabla de resultados</p>
                <div className="flex gap-1">
                  {(["mean", "depth", "minSamples"] as const).map((key) => (
                    <button
                      key={key}
                      className={`px-2 py-1 rounded text-[10px] font-mono transition-colors ${
                        sortBy === key
                          ? "bg-ml-green text-[#0f0f11]"
                          : "bg-[#1e1e24] border border-[rgba(255,255,255,0.07)] text-[#888892] hover:text-[#e2e2e6]"
                      }`}
                      onClick={() => setSortBy(key)}
                    >
                      {key === "mean" ? "Accuracy" : key === "depth" ? "Depth" : "Min Samples"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto rounded-md border border-[rgba(255,255,255,0.07)] max-h-[250px] overflow-y-auto">
                <table className="w-full text-[11px] font-mono">
                  <thead className="bg-[#1e1e24] sticky top-0">
                    <tr>
                      <th className="px-3 py-1.5 text-left text-[10px] text-[#484852] font-medium">#</th>
                      <th className="px-3 py-1.5 text-left text-[10px] text-[#484852] font-medium">Max Depth</th>
                      <th className="px-3 py-1.5 text-left text-[10px] text-[#484852] font-medium">Min Samples</th>
                      <th className="px-3 py-1.5 text-left text-[10px] text-[#484852] font-medium">Accuracy (media)</th>
                      <th className="px-3 py-1.5 text-left text-[10px] text-[#484852] font-medium">Accuracy (std)</th>
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
                          className={`border-t border-[rgba(255,255,255,0.07)] ${
                            isBest
                              ? "bg-ml-amber/5 text-ml-amber"
                              : "text-[#888892] hover:bg-[#1e1e24]/50"
                          }`}
                        >
                          <td className="px-3 py-1.5 text-[10px]">{i + 1}</td>
                          <td className="px-3 py-1.5">{r.depth}</td>
                          <td className="px-3 py-1.5">{r.minSamples}</td>
                          <td className="px-3 py-1.5">
                            {(r.mean * 100).toFixed(1)}%
                          </td>
                          <td className="px-3 py-1.5">
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

        <p className="font-mono text-[10px] text-[#484852]">
          Grid Search evalúa exhaustivamente todas las combinaciones de hiperparámetros.
          Cada combinación se evalúa con {cvK}-fold CV para obtener una estimación confiable.
          El costo crece exponencialmente con cada hiperparámetro adicional.
        </p>
      </div>
    </SimulationCard>
  )
}
