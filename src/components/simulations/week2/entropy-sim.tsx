"use client"

import { useState, useMemo } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { SimulationCard } from "@/components/shared/simulation-card"
import { ConceptCallout } from "@/components/shared/concept-callout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { entropy, informationGain, bestSplit, buildTree } from "@/lib/ml/decision-tree"
import type { TreeNode } from "@/types/ml"

type Row = {
  id: number
  ingreso: number
  edad: number
  historial: number
  target: number
}

function generateDataset(): Row[] {
  return [
    { id: 1, ingreso: 85, edad: 35, historial: 1, target: 1 },
    { id: 2, ingreso: 20, edad: 22, historial: 0, target: 0 },
    { id: 3, ingreso: 60, edad: 45, historial: 1, target: 1 },
    { id: 4, ingreso: 30, edad: 28, historial: 0, target: 0 },
    { id: 5, ingreso: 75, edad: 55, historial: 1, target: 1 },
    { id: 6, ingreso: 40, edad: 30, historial: 1, target: 0 },
    { id: 7, ingreso: 90, edad: 40, historial: 0, target: 1 },
    { id: 8, ingreso: 15, edad: 20, historial: 0, target: 0 },
    { id: 9, ingreso: 55, edad: 50, historial: 1, target: 1 },
    { id: 10, ingreso: 45, edad: 33, historial: 0, target: 0 },
    { id: 11, ingreso: 70, edad: 42, historial: 1, target: 1 },
    { id: 12, ingreso: 25, edad: 25, historial: 0, target: 0 },
  ]
}

const FEATURES = ["ingreso", "edad", "historial"] as const
const FEATURE_LABELS: Record<string, string> = {
  ingreso: "Ingreso (k$)",
  edad: "Edad",
  historial: "Historial crediticio",
}

function TreeDiagram({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  if (depth > 2) return null

  const isLeaf = node.prediction !== undefined
  const majority = node.classCounts[1] > node.classCounts[0] ? 1 : 0

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`px-3 py-2 rounded-lg border-2 text-xs font-mono text-center min-w-[100px] ${
          isLeaf
            ? majority === 1
              ? "bg-emerald-100 border-emerald-400 dark:bg-emerald-900/30 dark:border-emerald-600"
              : "bg-red-100 border-red-400 dark:bg-red-900/30 dark:border-red-600"
            : "bg-blue-50 border-blue-300 dark:bg-blue-900/20 dark:border-blue-600"
        }`}
      >
        {isLeaf ? (
          <div>
            <div className="font-bold">{majority === 1 ? "Aprobado" : "Rechazado"}</div>
            <div className="text-muted-foreground">
              [{node.classCounts[0]}, {node.classCounts[1]}]
            </div>
          </div>
        ) : (
          <div>
            <div className="font-bold">
              {FEATURE_LABELS[node.feature!] ?? node.feature} &le; {node.threshold?.toFixed(1)}
            </div>
            <div className="text-muted-foreground">
              H={node.entropy.toFixed(3)} | n={node.samples}
            </div>
          </div>
        )}
      </div>
      {!isLeaf && node.left && node.right && (
        <div className="flex gap-4 mt-1">
          <div className="flex flex-col items-center">
            <div className="text-xs text-muted-foreground mb-1">Si</div>
            <div className="w-px h-3 bg-border" />
            <TreeDiagram node={node.left} depth={depth + 1} />
          </div>
          <div className="flex flex-col items-center">
            <div className="text-xs text-muted-foreground mb-1">No</div>
            <div className="w-px h-3 bg-border" />
            <TreeDiagram node={node.right} depth={depth + 1} />
          </div>
        </div>
      )}
    </div>
  )
}

export function EntropySim() {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null)
  const dataset = useMemo(() => generateDataset(), [])

  const analysis = useMemo(() => {
    const labels = dataset.map((r) => r.target)
    const count0 = labels.filter((l) => l === 0).length
    const count1 = labels.filter((l) => l === 1).length
    const parentCounts = [count0, count1]
    const parentEntropy = entropy(parentCounts)

    const gains = FEATURES.map((feat) => {
      const tableRows = dataset.map((r) => ({
        [feat]: r[feat],
        target: r.target,
      }))
      const split = bestSplit(tableRows, [feat])
      const gain = split ? split.gain : 0
      const threshold = split ? split.threshold : 0
      return { feature: feat, label: FEATURE_LABELS[feat], gain, threshold }
    })

    const bestFeature = gains.reduce((a, b) => (a.gain > b.gain ? a : b))

    const treeData = dataset.map((r) => ({
      ingreso: r.ingreso,
      edad: r.edad,
      historial: r.historial,
      target: r.target,
    }))
    const tree = buildTree(treeData, [...FEATURES], 2)

    return { parentEntropy, parentCounts, gains, bestFeature, tree }
  }, [dataset])

  const selectedGain = analysis.gains.find((g) => g.feature === selectedFeature)

  return (
    <SimulationCard
      title="Calculadora de Entropia e Information Gain"
      description="Explora como un arbol de decision elige la mejor variable para dividir los datos"
    >
      <div className="space-y-6">
        {/* Dataset table */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Dataset: Aprobacion de credito</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="px-2 py-1 text-left">#</th>
                  <th className="px-2 py-1 text-left">Ingreso (k$)</th>
                  <th className="px-2 py-1 text-left">Edad</th>
                  <th className="px-2 py-1 text-left">Historial</th>
                  <th className="px-2 py-1 text-left">Resultado</th>
                </tr>
              </thead>
              <tbody>
                {dataset.map((row) => (
                  <tr key={row.id} className="border-b hover:bg-muted/50">
                    <td className="px-2 py-1 font-mono">{row.id}</td>
                    <td
                      className={`px-2 py-1 font-mono ${
                        selectedFeature === "ingreso" ? "bg-blue-100 dark:bg-blue-900/30" : ""
                      }`}
                    >
                      {row.ingreso}
                    </td>
                    <td
                      className={`px-2 py-1 font-mono ${
                        selectedFeature === "edad" ? "bg-blue-100 dark:bg-blue-900/30" : ""
                      }`}
                    >
                      {row.edad}
                    </td>
                    <td
                      className={`px-2 py-1 font-mono ${
                        selectedFeature === "historial" ? "bg-blue-100 dark:bg-blue-900/30" : ""
                      }`}
                    >
                      {row.historial}
                    </td>
                    <td className="px-2 py-1">
                      <Badge variant={row.target === 1 ? "default" : "secondary"}>
                        {row.target === 1 ? "Aprobado" : "Rechazado"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Entropy formula */}
        <div className="p-4 rounded-lg bg-muted/50 space-y-2">
          <h3 className="text-sm font-semibold">Entropia del conjunto padre</h3>
          <div className="font-mono text-sm">
            H(S) = -&sum; p(c) &middot; log&sub2;(p(c))
          </div>
          <div className="font-mono text-sm text-muted-foreground">
            H(S) = -({analysis.parentCounts[0]}/{dataset.length}) &middot; log&sub2;(
            {analysis.parentCounts[0]}/{dataset.length}) - ({analysis.parentCounts[1]}/
            {dataset.length}) &middot; log&sub2;({analysis.parentCounts[1]}/{dataset.length})
          </div>
          <div className="font-mono text-sm font-bold">
            H(S) = {analysis.parentEntropy.toFixed(4)} bits
          </div>
        </div>

        {/* Feature selection */}
        <div>
          <h3 className="text-sm font-semibold mb-2">
            Selecciona una variable para dividir
          </h3>
          <div className="flex gap-2 flex-wrap">
            {FEATURES.map((feat) => (
              <Button
                key={feat}
                variant={selectedFeature === feat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFeature(feat)}
              >
                {FEATURE_LABELS[feat]}
              </Button>
            ))}
          </div>
        </div>

        {/* Information gain chart */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Information Gain por variable</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={analysis.gains}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value) => [Number(value).toFixed(4), "Info. Gain"]}
              />
              <Bar dataKey="gain" radius={[4, 4, 0, 0]}>
                {analysis.gains.map((entry) => (
                  <Cell
                    key={entry.feature}
                    fill={
                      entry.feature === analysis.bestFeature.feature
                        ? "#22c55e"
                        : entry.feature === selectedFeature
                        ? "#3b82f6"
                        : "#94a3b8"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Selected feature detail */}
        {selectedGain && (
          <div className="p-4 rounded-lg bg-muted/50 space-y-1">
            <h3 className="text-sm font-semibold">
              Detalle: {FEATURE_LABELS[selectedGain.feature]}
            </h3>
            <div className="font-mono text-sm">
              Mejor umbral: {selectedGain.threshold.toFixed(1)}
            </div>
            <div className="font-mono text-sm">
              Information Gain: {selectedGain.gain.toFixed(4)}
            </div>
            {selectedGain.feature === analysis.bestFeature.feature && (
              <Badge className="bg-emerald-500 mt-1">Mejor division</Badge>
            )}
          </div>
        )}

        {/* Tree diagram */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Arbol resultante (profundidad 2)</h3>
          <div className="overflow-x-auto p-4 flex justify-center">
            <TreeDiagram node={analysis.tree} />
          </div>
        </div>

        <ConceptCallout type="interpretability">
          La entropia mide el desorden en los datos. Un Information Gain alto significa que
          esa variable separa bien las clases. El arbol siempre elige la division que
          maximiza la ganancia de informacion.
        </ConceptCallout>
      </div>
    </SimulationCard>
  )
}
