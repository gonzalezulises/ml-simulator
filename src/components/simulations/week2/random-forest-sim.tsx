"use client"

import { useState, useMemo, useCallback } from "react"
import {
  LineChart,
  Line,
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
import { ConceptCallout } from "@/components/shared/concept-callout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type Point2D = { x: number; y: number; label: 0 | 1 }

type SimpleSplit = {
  featureIdx: 0 | 1
  threshold: number
  leftLabel: 0 | 1
  rightLabel: 0 | 1
  left?: SimpleSplit
  right?: SimpleSplit
}

function randomGaussian(mean = 0, std = 1): number {
  const u1 = Math.random()
  const u2 = Math.random()
  return mean + std * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
}

function generateData(n: number): Point2D[] {
  const points: Point2D[] = []
  for (let i = 0; i < n; i++) {
    const label: 0 | 1 = i < n / 2 ? 0 : 1
    const cx = label === 0 ? -1 : 1
    const cy = label === 0 ? -1 : 1
    points.push({
      x: randomGaussian(cx, 0.8),
      y: randomGaussian(cy, 0.8),
      label,
    })
  }
  return points
}

function bootstrapSample(data: Point2D[], sampleFrac: number): Point2D[] {
  const n = Math.round(data.length * sampleFrac)
  const sample: Point2D[] = []
  for (let i = 0; i < n; i++) {
    sample.push(data[Math.floor(Math.random() * data.length)])
  }
  return sample
}

function buildSimpleTree(
  data: Point2D[],
  maxDepth: number,
  featureFrac: number,
  depth: number = 0
): SimpleSplit {
  const count0 = data.filter((p) => p.label === 0).length
  const count1 = data.length - count0
  const majorityLabel: 0 | 1 = count1 >= count0 ? 1 : 0

  if (depth >= maxDepth || data.length < 4 || count0 === 0 || count1 === 0) {
    return {
      featureIdx: 0,
      threshold: 0,
      leftLabel: majorityLabel,
      rightLabel: majorityLabel,
    }
  }

  const useFeatures: (0 | 1)[] = []
  if (Math.random() < featureFrac) useFeatures.push(0)
  if (Math.random() < featureFrac) useFeatures.push(1)
  if (useFeatures.length === 0) useFeatures.push(Math.random() < 0.5 ? 0 : 1)

  let bestGini = Infinity
  let bestSplit: SimpleSplit = {
    featureIdx: 0,
    threshold: 0,
    leftLabel: majorityLabel,
    rightLabel: majorityLabel,
  }

  for (const fIdx of useFeatures) {
    const values = data.map((p) => (fIdx === 0 ? p.x : p.y)).sort((a, b) => a - b)
    const nCandidates = Math.min(10, values.length - 1)
    for (let i = 0; i < nCandidates; i++) {
      const idx = Math.floor(((i + 1) / (nCandidates + 1)) * values.length)
      const thresh = values[idx]

      const leftData = data.filter((p) => (fIdx === 0 ? p.x : p.y) <= thresh)
      const rightData = data.filter((p) => (fIdx === 0 ? p.x : p.y) > thresh)

      if (leftData.length === 0 || rightData.length === 0) continue

      const leftP = leftData.filter((p) => p.label === 1).length / leftData.length
      const rightP = rightData.filter((p) => p.label === 1).length / rightData.length
      const giniLeft = 2 * leftP * (1 - leftP)
      const giniRight = 2 * rightP * (1 - rightP)
      const weightedGini =
        (leftData.length * giniLeft + rightData.length * giniRight) / data.length

      if (weightedGini < bestGini) {
        bestGini = weightedGini
        const leftLabel: 0 | 1 = leftP >= 0.5 ? 1 : 0
        const rightLabel: 0 | 1 = rightP >= 0.5 ? 1 : 0
        bestSplit = { featureIdx: fIdx, threshold: thresh, leftLabel, rightLabel }
      }
    }
  }

  if (bestGini >= 0.5) {
    return bestSplit
  }

  const leftData = data.filter(
    (p) => (bestSplit.featureIdx === 0 ? p.x : p.y) <= bestSplit.threshold
  )
  const rightData = data.filter(
    (p) => (bestSplit.featureIdx === 0 ? p.x : p.y) > bestSplit.threshold
  )

  if (depth + 1 < maxDepth) {
    bestSplit.left = buildSimpleTree(leftData, maxDepth, featureFrac, depth + 1)
    bestSplit.right = buildSimpleTree(rightData, maxDepth, featureFrac, depth + 1)
  }

  return bestSplit
}

function predictPoint(tree: SimpleSplit, x: number, y: number): 0 | 1 {
  const val = tree.featureIdx === 0 ? x : y
  if (val <= tree.threshold) {
    if (tree.left) return predictPoint(tree.left, x, y)
    return tree.leftLabel
  } else {
    if (tree.right) return predictPoint(tree.right, x, y)
    return tree.rightLabel
  }
}

function predictForest(trees: SimpleSplit[], x: number, y: number): { prediction: 0 | 1; votes: (0 | 1)[] } {
  const votes = trees.map((t) => predictPoint(t, x, y))
  const sum = votes.reduce((a: number, b) => a + b, 0 as number)
  return { prediction: sum >= votes.length / 2 ? 1 : 0, votes }
}

function computeAccuracy(trees: SimpleSplit[], data: Point2D[], nTrees: number): number {
  const subset = trees.slice(0, nTrees)
  let correct = 0
  for (const p of data) {
    const { prediction } = predictForest(subset, p.x, p.y)
    if (prediction === p.label) correct++
  }
  return correct / data.length
}

export function RandomForestSim() {
  const [nTrees, setNTrees] = useState(10)
  const [maxDepth, setMaxDepth] = useState(3)
  const [featureFrac, setFeatureFrac] = useState(0.7)
  const [sampleFrac, setSampleFrac] = useState(0.7)
  const [forest, setForest] = useState<SimpleSplit[] | null>(null)
  const [selectedPoint, setSelectedPoint] = useState<{ x: number; y: number } | null>(null)

  const data = useMemo(() => generateData(120), [])

  const handleTrain = useCallback(() => {
    const trees: SimpleSplit[] = []
    for (let i = 0; i < nTrees; i++) {
      const sample = bootstrapSample(data, sampleFrac)
      const tree = buildSimpleTree(sample, maxDepth, featureFrac)
      trees.push(tree)
    }
    setForest(trees)
    setSelectedPoint(null)
  }, [data, nTrees, maxDepth, featureFrac, sampleFrac])

  const convergenceData = useMemo(() => {
    if (!forest) return []
    const points: { trees: number; accuracy: number }[] = []
    for (let n = 1; n <= forest.length; n++) {
      points.push({ trees: n, accuracy: computeAccuracy(forest, data, n) })
    }
    return points
  }, [forest, data])

  const gridPredictions = useMemo(() => {
    if (!forest) return []
    const res = 20
    const points: { x: number; y: number; prediction: number }[] = []
    const xMin = Math.min(...data.map((p) => p.x)) - 0.5
    const xMax = Math.max(...data.map((p) => p.x)) + 0.5
    const yMin = Math.min(...data.map((p) => p.y)) - 0.5
    const yMax = Math.max(...data.map((p) => p.y)) + 0.5

    for (let i = 0; i < res; i++) {
      for (let j = 0; j < res; j++) {
        const x = xMin + ((xMax - xMin) * i) / (res - 1)
        const y = yMin + ((yMax - yMin) * j) / (res - 1)
        const { prediction } = predictForest(forest, x, y)
        points.push({ x: parseFloat(x.toFixed(2)), y: parseFloat(y.toFixed(2)), prediction })
      }
    }
    return points
  }, [forest, data])

  const selectedVotes = useMemo(() => {
    if (!forest || !selectedPoint) return null
    return predictForest(forest, selectedPoint.x, selectedPoint.y)
  }, [forest, selectedPoint])

  const treesToShow = forest ? forest.slice(0, Math.min(9, forest.length)) : []

  const treeGridPredictions = useMemo(() => {
    if (!forest) return []
    const res = 12
    const xMin = Math.min(...data.map((p) => p.x)) - 0.5
    const xMax = Math.max(...data.map((p) => p.x)) + 0.5
    const yMin = Math.min(...data.map((p) => p.y)) - 0.5
    const yMax = Math.max(...data.map((p) => p.y)) + 0.5

    return treesToShow.map((tree) => {
      const grid: { x: number; y: number; prediction: number }[] = []
      for (let i = 0; i < res; i++) {
        for (let j = 0; j < res; j++) {
          const x = xMin + ((xMax - xMin) * i) / (res - 1)
          const y = yMin + ((yMax - yMin) * j) / (res - 1)
          grid.push({
            x: parseFloat(x.toFixed(2)),
            y: parseFloat(y.toFixed(2)),
            prediction: predictPoint(tree, x, y),
          })
        }
      }
      return grid
    })
  }, [forest, data, treesToShow])

  const forestAccuracy = useMemo(() => {
    if (!forest) return 0
    return computeAccuracy(forest, data, forest.length)
  }, [forest, data])

  return (
    <SimulationCard
      title="Simulador de Random Forest"
      description="Entrena un bosque aleatorio y observa como multiples arboles debiles crean un clasificador fuerte"
    >
      <div className="space-y-6">
        {/* Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ParameterSlider
            label="Numero de arboles"
            value={nTrees}
            min={1}
            max={50}
            step={1}
            onChange={setNTrees}
            tooltip="Mas arboles = mas estable, pero mas lento"
          />
          <ParameterSlider
            label="Profundidad maxima"
            value={maxDepth}
            min={1}
            max={5}
            step={1}
            onChange={setMaxDepth}
            tooltip="Profundidad de cada arbol individual"
          />
          <ParameterSlider
            label="Fraccion de features"
            value={featureFrac}
            min={0.2}
            max={1}
            step={0.1}
            onChange={setFeatureFrac}
            tooltip="Porcentaje de variables consideradas en cada split"
            formatValue={(v) => `${Math.round(v * 100)}%`}
          />
          <ParameterSlider
            label="Fraccion de muestras"
            value={sampleFrac}
            min={0.3}
            max={1}
            step={0.1}
            onChange={setSampleFrac}
            tooltip="Porcentaje del dataset usado por cada arbol (bootstrap)"
            formatValue={(v) => `${Math.round(v * 100)}%`}
          />
        </div>

        <Button onClick={handleTrain} className="w-full">
          Entrenar bosque ({nTrees} arboles)
        </Button>

        {forest && (
          <>
            {/* Combined boundary */}
            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                Frontera de decision combinada
                <Badge variant="outline">Accuracy: {(forestAccuracy * 100).toFixed(1)}%</Badge>
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="x" type="number" tick={{ fontSize: 11 }} name="X" />
                  <YAxis dataKey="y" type="number" tick={{ fontSize: 11 }} name="Y" />
                  <ZAxis range={[15, 15]} />
                  <Tooltip />
                  {/* Background grid predictions */}
                  <Scatter data={gridPredictions} shape="square" legendType="none">
                    {gridPredictions.map((p, i) => (
                      <Cell
                        key={i}
                        fill={p.prediction === 1 ? "#22c55e" : "#ef4444"}
                        fillOpacity={0.15}
                      />
                    ))}
                  </Scatter>
                  {/* Actual data points */}
                  <Scatter
                    data={data}
                    onClick={(point: any) => {
                      if (point && point.x !== undefined && point.y !== undefined) {
                        setSelectedPoint({ x: point.x, y: point.y })
                      }
                    }}
                  >
                    {data.map((p, i) => (
                      <Cell
                        key={i}
                        fill={p.label === 1 ? "#16a34a" : "#dc2626"}
                        fillOpacity={0.9}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-1">
                Haz clic en un punto para ver como voto cada arbol
              </p>
            </div>

            {/* Individual tree votes for selected point */}
            {selectedVotes && selectedPoint && (
              <div className="p-4 rounded-lg bg-muted/50">
                <h3 className="text-sm font-semibold mb-2">
                  Votacion para punto ({selectedPoint.x.toFixed(1)}, {selectedPoint.y.toFixed(1)})
                </h3>
                <div className="flex flex-wrap gap-1 mb-2">
                  {selectedVotes.votes.map((v, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className={v === 1 ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-red-100 dark:bg-red-900/30"}
                    >
                      T{i + 1}: {v === 1 ? "+" : "-"}
                    </Badge>
                  ))}
                </div>
                <div className="text-sm">
                  Resultado: <strong>{selectedVotes.prediction === 1 ? "Clase 1 (positivo)" : "Clase 0 (negativo)"}</strong>
                  {" "}({selectedVotes.votes.filter((v) => v === 1).length}/{selectedVotes.votes.length} votos positivos)
                </div>
              </div>
            )}

            {/* Mini tree grid */}
            <div>
              <h3 className="text-sm font-semibold mb-2">
                Arboles individuales (mostrando {treesToShow.length} de {forest.length})
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {treesToShow.map((_, treeIdx) => (
                  <div key={treeIdx} className="border rounded p-1">
                    <div className="text-xs text-center text-muted-foreground mb-1">
                      Arbol {treeIdx + 1}
                    </div>
                    <ResponsiveContainer width="100%" height={100}>
                      <ScatterChart margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                        <XAxis dataKey="x" type="number" hide />
                        <YAxis dataKey="y" type="number" hide />
                        <ZAxis range={[8, 8]} />
                        <Scatter data={treeGridPredictions[treeIdx]} shape="square">
                          {treeGridPredictions[treeIdx]?.map((p, i) => (
                            <Cell
                              key={i}
                              fill={p.prediction === 1 ? "#22c55e" : "#ef4444"}
                              fillOpacity={0.3}
                            />
                          ))}
                        </Scatter>
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                ))}
              </div>
            </div>

            {/* Convergence chart */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Convergencia: Accuracy vs Numero de arboles</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={convergenceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="trees"
                    tick={{ fontSize: 11 }}
                    label={{ value: "Arboles", position: "insideBottom", offset: -5, fontSize: 12 }}
                  />
                  <YAxis
                    domain={[0.4, 1]}
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
                    label={{ value: "Accuracy", angle: -90, position: "insideLeft", fontSize: 12 }}
                  />
                  <Tooltip formatter={(v) => [`${(Number(v) * 100).toFixed(1)}%`, "Accuracy"]} />
                  <Line
                    dataKey="accuracy"
                    type="monotone"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        <ConceptCallout type="overfitting">
          Random Forest reduce el sobre-ajuste combinando muchos arboles entrenados con datos
          y features aleatorios. Cada arbol individual es &quot;debil&quot;, pero el voto
          mayoritario produce un clasificador robusto. Observa como la accuracy se estabiliza
          al agregar mas arboles.
        </ConceptCallout>
      </div>
    </SimulationCard>
  )
}
