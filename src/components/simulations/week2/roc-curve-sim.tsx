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
  Area,
  ComposedChart,
  ReferenceLine,
} from "recharts"
import { SimulationCard } from "@/components/shared/simulation-card"
import { ParameterSlider } from "@/components/shared/parameter-slider"
import { ConceptCallout } from "@/components/shared/concept-callout"
import { rocCurve, auc } from "@/lib/ml/metrics"

type ModelQuality = "random" | "bad" | "regular" | "good" | "perfect"

const MODEL_OPTIONS: { key: ModelQuality; label: string; quality: number }[] = [
  { key: "random", label: "Aleatorio", quality: 0.0 },
  { key: "bad", label: "Malo", quality: 0.3 },
  { key: "regular", label: "Regular", quality: 0.55 },
  { key: "good", label: "Bueno", quality: 0.75 },
  { key: "perfect", label: "Perfecto", quality: 1.0 },
]

const MODEL_COLORS: Record<ModelQuality, string> = {
  random: "#484852",
  bad: "#E8593A",
  regular: "#E8A530",
  good: "#1DB981",
  perfect: "#4A8FE8",
}

function aucBadge(aucValue: number) {
  if (aucValue < 0.6)
    return (
      <span className="font-mono text-xs px-3 py-1.5 rounded bg-[#E8593A]/15 border border-[#E8593A]/20 text-[#E8593A]">
        AUC: {aucValue.toFixed(3)} - Malo
      </span>
    )
  if (aucValue < 0.8)
    return (
      <span className="font-mono text-xs px-3 py-1.5 rounded bg-[#E8A530]/15 border border-[#E8A530]/20 text-[#E8A530]">
        AUC: {aucValue.toFixed(3)} - Aceptable
      </span>
    )
  return (
    <span className="font-mono text-xs px-3 py-1.5 rounded bg-[#1DB981]/15 border border-[#1DB981]/20 text-[#1DB981]">
      AUC: {aucValue.toFixed(3)} - Bueno
    </span>
  )
}

export function RocCurveSim() {
  const [selectedModel, setSelectedModel] = useState<ModelQuality>("good")
  const [imbalance, setImbalance] = useState(50)
  const [compareMode, setCompareMode] = useState(false)

  const generateForModel = (quality: number, imb: number) => {
    const n = 400
    const nPos = Math.round(n * (1 - imb / 100))
    const nNeg = n - nPos
    const total = nPos + nNeg

    const scores: number[] = []
    const labels: (0 | 1)[] = []

    for (let i = 0; i < total; i++) {
      const isPos = i < nPos
      const label: 0 | 1 = isPos ? 1 : 0
      labels.push(label)

      if (quality >= 1.0) {
        scores.push(isPos ? 0.95 + Math.random() * 0.05 : Math.random() * 0.05)
      } else if (quality <= 0.0) {
        scores.push(Math.random())
      } else {
        const mean = isPos ? 0.5 + quality * 0.4 : 0.5 - quality * 0.4
        const std = 0.15
        const u1 = Math.random()
        const u2 = Math.random()
        const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
        scores.push(Math.max(0, Math.min(1, mean + std * z)))
      }
    }

    return { scores, labels }
  }

  const modelData = useMemo(() => {
    const opt = MODEL_OPTIONS.find((m) => m.key === selectedModel)!
    const { scores, labels } = generateForModel(opt.quality, imbalance)
    const roc = rocCurve(labels, scores, 100)
    const aucVal = auc(roc)
    return { roc, auc: aucVal }
  }, [selectedModel, imbalance])

  const comparisonData = useMemo(() => {
    if (!compareMode) return null
    return MODEL_OPTIONS.map((opt) => {
      const { scores, labels } = generateForModel(opt.quality, imbalance)
      const roc = rocCurve(labels, scores, 100)
      const aucVal = auc(roc)
      return { key: opt.key, label: opt.label, roc, auc: aucVal }
    })
  }, [compareMode, imbalance])

  const diagonal = useMemo(() => {
    return Array.from({ length: 11 }, (_, i) => ({
      fpr: i / 10,
      tpr: i / 10,
    }))
  }, [])

  return (
    <SimulationCard
      title="Visualizador de Curva ROC"
      description="Comprende como la calidad del modelo y el desbalance de clases afectan la curva ROC y el AUC"
    >
      <div className="space-y-6">
        {/* Model quality selector */}
        <div>
          <h3 className="text-[15px] font-medium text-[#e2e2e6] mb-2">Calidad del modelo</h3>
          <div className="flex gap-2 flex-wrap">
            {MODEL_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                className={`font-mono text-[13px] px-4 py-2 rounded border transition-colors ${
                  selectedModel === opt.key
                    ? "bg-[#4A8FE8]/20 border-[#4A8FE8] text-[#4A8FE8]"
                    : "bg-[#1e1e24] border-[rgba(255,255,255,0.07)] text-[#888892] hover:text-[#e2e2e6] hover:border-[rgba(255,255,255,0.15)]"
                } ${compareMode ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => setSelectedModel(opt.key)}
                disabled={compareMode}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ParameterSlider
            label="Desbalance de clases"
            value={imbalance}
            min={50}
            max={95}
            step={5}
            onChange={setImbalance}
            tooltip="Porcentaje de la clase negativa (mayoritaria)"
            formatValue={(v) => `${100 - v}/${v} (pos/neg)`}
          />
          <div className="flex items-end">
            <button
              className={`font-mono text-[13px] px-4 py-2 rounded border transition-colors ${
                compareMode
                  ? "bg-[#9B7FE8]/20 border-[#9B7FE8] text-[#9B7FE8]"
                  : "bg-[#1e1e24] border-[rgba(255,255,255,0.07)] text-[#888892] hover:text-[#e2e2e6] hover:border-[rgba(255,255,255,0.15)]"
              }`}
              onClick={() => setCompareMode(!compareMode)}
            >
              {compareMode ? "Comparando modelos" : "Comparar todos los modelos"}
            </button>
          </div>
        </div>

        {/* ROC Curve */}
        <div>
          <h3 className="text-[15px] font-medium text-[#e2e2e6] mb-2">Curva ROC</h3>
          <ResponsiveContainer width="100%" height={350}>
            {compareMode && comparisonData ? (
              <LineChart margin={{ top: 10, right: 20, bottom: 30, left: 20 }}>
                <CartesianGrid stroke="#1e1e24" strokeDasharray="3 3" />
                <XAxis
                  dataKey="fpr"
                  type="number"
                  domain={[0, 1]}
                  stroke="#484852"
                  tick={{ fill: '#888892', fontSize: 12 }}
                  label={{ value: "Tasa de Falsos Positivos (FPR)", position: "insideBottom", offset: -15, fontSize: 12, fill: '#888892' }}
                />
                <YAxis
                  dataKey="tpr"
                  type="number"
                  domain={[0, 1]}
                  stroke="#484852"
                  tick={{ fill: '#888892', fontSize: 12 }}
                  label={{ value: "Tasa de Verdaderos Positivos (TPR)", angle: -90, position: "insideLeft", fontSize: 12, fill: '#888892' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#16161a',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                  }}
                  formatter={(value, name) => [Number(value).toFixed(3), String(name)]}
                />
                {/* Diagonal reference */}
                <Line
                  data={diagonal}
                  dataKey="tpr"
                  type="linear"
                  stroke="#484852"
                  strokeDasharray="5 5"
                  dot={false}
                  name="Aleatorio"
                  legendType="none"
                />
                {comparisonData.map((model) => (
                  <Line
                    key={model.key}
                    data={model.roc}
                    dataKey="tpr"
                    type="monotone"
                    stroke={MODEL_COLORS[model.key]}
                    strokeWidth={2}
                    dot={false}
                    name={`${model.label} (AUC=${model.auc.toFixed(3)})`}
                  />
                ))}
              </LineChart>
            ) : (
              <ComposedChart
                data={modelData.roc}
                margin={{ top: 10, right: 20, bottom: 30, left: 20 }}
              >
                <CartesianGrid stroke="#1e1e24" strokeDasharray="3 3" />
                <XAxis
                  dataKey="fpr"
                  type="number"
                  domain={[0, 1]}
                  stroke="#484852"
                  tick={{ fill: '#888892', fontSize: 12 }}
                  label={{ value: "Tasa de Falsos Positivos (FPR)", position: "insideBottom", offset: -15, fontSize: 12, fill: '#888892' }}
                />
                <YAxis
                  dataKey="tpr"
                  type="number"
                  domain={[0, 1]}
                  stroke="#484852"
                  tick={{ fill: '#888892', fontSize: 12 }}
                  label={{ value: "Tasa de Verdaderos Positivos (TPR)", angle: -90, position: "insideLeft", fontSize: 12, fill: '#888892' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#16161a',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                  }}
                  formatter={(value) => [Number(value).toFixed(3)]}
                />
                <Area
                  dataKey="tpr"
                  fill={MODEL_COLORS[selectedModel]}
                  fillOpacity={0.15}
                  stroke="none"
                />
                <Line
                  dataKey="tpr"
                  type="monotone"
                  stroke={MODEL_COLORS[selectedModel]}
                  strokeWidth={2.5}
                  dot={false}
                  name="ROC"
                />
                {/* Diagonal */}
                <ReferenceLine
                  segment={[{ x: 0, y: 0 }, { x: 1, y: 1 }]}
                  stroke="#484852"
                  strokeDasharray="5 5"
                />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* AUC display */}
        <div className="flex flex-wrap gap-3 items-center">
          {compareMode && comparisonData ? (
            comparisonData.map((model) => (
              <div key={model.key} className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: MODEL_COLORS[model.key] }}
                />
                <span className="text-[13px] font-mono text-[#888892]">{model.label}:</span>
                {aucBadge(model.auc)}
              </div>
            ))
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-medium text-[#e2e2e6]">AUC del modelo:</span>
              {aucBadge(modelData.auc)}
            </div>
          )}
        </div>

        {/* Interpretation guide */}
        <div className="p-4 rounded-lg bg-[#1e1e24] border border-[rgba(255,255,255,0.07)] space-y-2">
          <h3 className="text-[15px] font-medium text-[#e2e2e6]">Guia de interpretacion</h3>
          <ul className="text-[13px] text-[#888892] font-mono space-y-1 list-disc list-inside">
            <li><strong className="text-[#e2e2e6]">AUC = 0.5</strong>: El modelo no es mejor que lanzar una moneda</li>
            <li><strong className="text-[#e2e2e6]">AUC 0.6-0.8</strong>: Modelo aceptable, util pero mejorable</li>
            <li><strong className="text-[#e2e2e6]">AUC &gt; 0.8</strong>: Buen modelo con capacidad discriminativa alta</li>
            <li><strong className="text-[#e2e2e6]">AUC = 1.0</strong>: Clasificacion perfecta (sospechoso en la practica)</li>
          </ul>
        </div>

        <ConceptCallout type="leakage">
          Un AUC de 1.0 en datos reales casi siempre indica data leakage o un error.
          Desconfia de modelos &quot;perfectos&quot; y verifica que no haya fuga de informacion
          del futuro hacia el entrenamiento.
        </ConceptCallout>
      </div>
    </SimulationCard>
  )
}
