"use client"

import { useState, useMemo } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import { SimulationCard } from "@/components/shared/simulation-card"
import { ParameterSlider } from "@/components/shared/parameter-slider"
import { ConceptCallout } from "@/components/shared/concept-callout"
import { generateProbabilityScores } from "@/lib/ml/data-generators"
import {
  confusionMatrix,
  precision,
  recall,
  f1Score,
  accuracyFromCM,
  classifyWithThreshold,
} from "@/lib/ml/metrics"

type BusinessContext = "fraud" | "medical" | "spam" | "marketing"

const CONTEXTS: { key: BusinessContext; label: string; description: string; defaultThreshold: number }[] = [
  {
    key: "fraud",
    label: "Fraude bancario",
    description: "Detectar transacciones fraudulentas",
    defaultThreshold: 0.3,
  },
  {
    key: "medical",
    label: "Diagnostico medico",
    description: "Detectar enfermedades graves",
    defaultThreshold: 0.2,
  },
  {
    key: "spam",
    label: "Filtro de spam",
    description: "Clasificar correos como spam",
    defaultThreshold: 0.7,
  },
  {
    key: "marketing",
    label: "Marketing",
    description: "Predecir conversion de clientes",
    defaultThreshold: 0.5,
  },
]

function getBusinessImpact(context: BusinessContext, threshold: number): string {
  switch (context) {
    case "fraud":
      if (threshold < 0.3)
        return "Umbral bajo: bloqueas mas fraudes pero tambien transacciones legitimas. Los clientes se quejan de falsos positivos."
      if (threshold > 0.7)
        return "Umbral alto: pocas alertas falsas pero dejas pasar fraudes reales. Perdidas financieras significativas."
      return "Umbral moderado: balance razonable entre detectar fraude y no molestar a clientes legitimos."
    case "medical":
      if (threshold < 0.3)
        return "Umbral bajo: casi ningun caso se escapa, pero muchos pacientes sanos recibiran tratamiento innecesario."
      if (threshold > 0.7)
        return "Umbral alto: riesgo critico. Pacientes enfermos podrian no ser diagnosticados a tiempo."
      return "Umbral moderado: equilibrio entre deteccion y falsos positivos. Evaluar con especialistas."
    case "spam":
      if (threshold < 0.3)
        return "Umbral bajo: carpeta de spam llena, incluyendo correos importantes. Riesgo de perder comunicaciones criticas."
      if (threshold > 0.7)
        return "Umbral alto: solo spam obvio es filtrado. Tu bandeja tendra mas spam pero ningun correo importante se pierde."
      return "Umbral moderado: buen balance. Algo de spam pasa pero rara vez pierdes correos importantes."
    case "marketing":
      if (threshold < 0.3)
        return "Umbral bajo: contactas a muchas personas, desperdiciando presupuesto en leads de baja calidad."
      if (threshold > 0.7)
        return "Umbral alto: solo contactas leads muy probables. Alta conversion pero volumen bajo."
      return "Umbral moderado: balance entre volumen de contactos y tasa de conversion."
  }
}

const METRIC_COLORS = ["#1DB981", "#4A8FE8", "#E8A530", "#9B7FE8"]

export function DecisionThresholdSim() {
  const [threshold, setThreshold] = useState(0.5)
  const [context, setContext] = useState<BusinessContext>("fraud")

  const { scores, labels } = useMemo(() => generateProbabilityScores(500, 0.7), [])

  const distributions = useMemo(() => {
    const bins = 50
    const data: { score: number; negatives: number; positives: number }[] = []
    for (let i = 0; i < bins; i++) {
      const lo = i / bins
      const hi = (i + 1) / bins
      const mid = (lo + hi) / 2
      let neg = 0
      let pos = 0
      for (let j = 0; j < scores.length; j++) {
        if (scores[j] >= lo && scores[j] < hi) {
          if (labels[j] === 0) neg++
          else pos++
        }
      }
      data.push({ score: parseFloat(mid.toFixed(3)), negatives: neg, positives: pos })
    }
    return data
  }, [scores, labels])

  const metrics = useMemo(() => {
    const predictions = classifyWithThreshold(scores, threshold)
    const cm = confusionMatrix(labels, predictions)
    return {
      cm,
      precision: precision(cm),
      recall: recall(cm),
      f1: f1Score(cm),
      accuracy: accuracyFromCM(cm),
    }
  }, [scores, labels, threshold])

  const contextInfo = CONTEXTS.find((c) => c.key === context)!
  const impact = getBusinessImpact(context, threshold)

  return (
    <SimulationCard
      title="Simulador de Umbral de Decision"
      description="Ajusta el umbral de clasificacion y observa como cambian las metricas segun el contexto de negocio"
    >
      <div className="space-y-6">
        {/* Business context selector */}
        <div>
          <h3 className="text-[15px] font-medium text-[#e2e2e6] mb-2">Contexto de negocio</h3>
          <div className="flex gap-2 flex-wrap">
            {CONTEXTS.map((c) => (
              <button
                key={c.key}
                className={`font-mono text-[13px] px-4 py-2 rounded border transition-colors ${
                  context === c.key
                    ? "bg-ml-green/20 border-ml-green text-ml-green"
                    : "bg-[#1e1e24] border-[rgba(255,255,255,0.07)] text-[#888892] hover:text-[#e2e2e6] hover:border-[rgba(255,255,255,0.15)]"
                }`}
                onClick={() => {
                  setContext(c.key)
                  setThreshold(c.defaultThreshold)
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
          <p className="text-[13px] text-[#888892] font-mono mt-1">{contextInfo.description}</p>
        </div>

        {/* Threshold slider */}
        <ParameterSlider
          label="Umbral de decision"
          value={threshold}
          min={0}
          max={1}
          step={0.01}
          onChange={setThreshold}
          tooltip="Si la probabilidad predicha es >= umbral, se clasifica como positivo"
          formatValue={(v) => v.toFixed(2)}
        />

        {/* Probability distributions */}
        <div>
          <h3 className="text-[15px] font-medium text-[#e2e2e6] mb-2">Distribuciones de probabilidad</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={distributions}>
              <CartesianGrid stroke="#1e1e24" strokeDasharray="3 3" />
              <XAxis
                dataKey="score"
                stroke="#484852"
                tick={{ fill: '#888892', fontSize: 12 }}
                label={{ value: "Probabilidad predicha", position: "insideBottom", offset: -5, fontSize: 12, fill: '#888892' }}
              />
              <YAxis
                stroke="#484852"
                tick={{ fill: '#888892', fontSize: 12 }}
                label={{ value: "Frecuencia", angle: -90, position: "insideLeft", fontSize: 12, fill: '#888892' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#16161a',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                }}
              />
              <Area
                type="monotone"
                dataKey="negatives"
                stackId="1"
                fill="#E8593A"
                fillOpacity={0.4}
                stroke="#E8593A"
                name="Negativos (clase 0)"
              />
              <Area
                type="monotone"
                dataKey="positives"
                stackId="2"
                fill="#1DB981"
                fillOpacity={0.4}
                stroke="#1DB981"
                name="Positivos (clase 1)"
              />
              <ReferenceLine
                x={threshold}
                stroke="#4A8FE8"
                strokeWidth={3}
                strokeDasharray="5 5"
                label={{ value: `T=${threshold.toFixed(2)}`, position: "top", fontSize: 12, fill: '#4A8FE8' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Confusion matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-[15px] font-medium text-[#e2e2e6] mb-2">Matriz de confusion</h3>
            <div className="grid grid-cols-3 gap-1 text-center text-[13px] max-w-[280px]">
              <div />
              <div className="font-mono font-medium text-[#888892] p-2">Pred. Neg</div>
              <div className="font-mono font-medium text-[#888892] p-2">Pred. Pos</div>

              <div className="font-mono font-medium text-[#888892] p-2">Real Neg</div>
              <div className="p-3 rounded bg-[#1DB981]/15 border border-[#1DB981]/20 font-mono font-bold text-[#1DB981]">
                TN: {metrics.cm.tn}
              </div>
              <div className="p-3 rounded bg-[#E8593A]/15 border border-[#E8593A]/20 font-mono font-bold text-[#E8593A]">
                FP: {metrics.cm.fp}
              </div>

              <div className="font-mono font-medium text-[#888892] p-2">Real Pos</div>
              <div className="p-3 rounded bg-[#E8A530]/15 border border-[#E8A530]/20 font-mono font-bold text-[#E8A530]">
                FN: {metrics.cm.fn}
              </div>
              <div className="p-3 rounded bg-[#1DB981]/15 border border-[#1DB981]/20 font-mono font-bold text-[#1DB981]">
                TP: {metrics.cm.tp}
              </div>
            </div>
          </div>

          {/* Metrics panel */}
          <div className="space-y-3">
            <h3 className="text-[15px] font-medium text-[#e2e2e6]">Metricas</h3>
            {[
              { label: "Precision", value: metrics.precision },
              { label: "Recall", value: metrics.recall },
              { label: "F1-Score", value: metrics.f1 },
              { label: "Accuracy", value: metrics.accuracy },
            ].map((m, i) => (
              <div key={m.label} className="flex items-center gap-2">
                <span className="text-[13px] font-mono text-[#888892] w-20">{m.label}</span>
                <div className="flex-1 h-2 bg-[#1e1e24] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${m.value * 100}%`, backgroundColor: METRIC_COLORS[i] }}
                  />
                </div>
                <span className="text-[13px] font-mono w-14 text-right text-[#e2e2e6]">
                  {(m.value * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Business impact */}
        <div className="p-4 rounded-lg bg-[#1e1e24] border border-[rgba(255,255,255,0.07)]">
          <h3 className="text-[15px] font-medium text-[#e2e2e6] mb-1 flex items-center gap-2">
            Impacto en negocio
            <span className="font-mono text-xs px-3 py-1.5 rounded bg-[#16161a] border border-[rgba(255,255,255,0.07)] text-[#888892]">
              {contextInfo.label}
            </span>
          </h3>
          <p className="text-[13px] text-[#888892] font-mono">{impact}</p>
        </div>

        <ConceptCallout type="no-perfect-model">
          No hay un umbral universal correcto. En medicina, preferimos alto recall (no perder
          enfermos). En spam, preferimos alta precision (no perder correos importantes).
          El contexto de negocio define la metrica prioritaria.
        </ConceptCallout>
      </div>
    </SimulationCard>
  )
}
