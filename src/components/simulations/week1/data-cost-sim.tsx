"use client"

import { useState } from "react"
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
import { ParameterSlider } from "@/components/shared/parameter-slider"

const TASK_MULTIPLIERS: Record<string, number> = {
  clasificacion: 1.0,
  ner: 2.5,
  segmentacion: 4.0,
  medico: 8.0,
}

const TASK_LABELS: Record<string, string> = {
  clasificacion: "Clasificacion binaria",
  ner: "NER (entidades)",
  segmentacion: "Segmentacion de imagenes",
  medico: "Diagnostico medico",
}

const BAR_COLORS = ["#1DB981", "#4A8FE8", "#E8A530", "#9B7FE8"]

export function DataCostSim() {
  const [samples, setSamples] = useState(500)
  const [costPerLabel, setCostPerLabel] = useState(1.0)
  const [features, setFeatures] = useState(10)
  const [taskType, setTaskType] = useState("clasificacion")

  const multiplier = TASK_MULTIPLIERS[taskType]

  const collectionCost = samples * features * 0.01 * multiplier
  const cleaningCost = samples * 0.05 * Math.log2(features + 1) * multiplier
  const labelingCost = samples * costPerLabel * multiplier
  const validationCost = samples * costPerLabel * 0.2 * multiplier
  const totalCost = collectionCost + cleaningCost + labelingCost + validationCost

  const data = [
    { name: "Recoleccion", costo: Math.round(collectionCost) },
    { name: "Limpieza", costo: Math.round(cleaningCost) },
    { name: "Etiquetado", costo: Math.round(labelingCost) },
    { name: "Validacion", costo: Math.round(validationCost) },
  ]

  const getCostLevel = () => {
    if (totalCost < 1000) return { label: "Bajo", color: "text-[#1DB981]", bg: "bg-[#1DB981]/15", message: "Proyecto accesible. Pocos datos y etiquetado barato." }
    if (totalCost < 10000) return { label: "Moderado", color: "text-[#E8A530]", bg: "bg-[#E8A530]/15", message: "Costo manejable pero significativo. Considera estrategias de active learning." }
    if (totalCost < 50000) return { label: "Alto", color: "text-[#E8593A]", bg: "bg-[#E8593A]/15", message: "Presupuesto considerable. Evalua si puedes usar transfer learning o datos sinteticos." }
    return { label: "Muy Alto", color: "text-[#E8593A]", bg: "bg-[#E8593A]/15", message: "El costo es prohibitivo para muchas organizaciones. Explora pre-entrenamiento, few-shot learning o modelos mas simples." }
  }

  const level = getCostLevel()

  return (
    <SimulationCard
      title="Calculadora del Costo de Datos"
      description="Estima el costo real de construir un dataset supervisado"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <ParameterSlider
            label="Muestras"
            value={samples}
            min={50}
            max={5000}
            step={50}
            onChange={setSamples}
            tooltip="Numero de ejemplos en el dataset"
            formatValue={(v) => v.toLocaleString()}
          />
          <ParameterSlider
            label="Costo por etiqueta"
            value={costPerLabel}
            min={0.1}
            max={10}
            step={0.1}
            onChange={setCostPerLabel}
            tooltip="Costo en USD de etiquetar una muestra"
            formatValue={(v) => `$${v.toFixed(2)}`}
          />
          <ParameterSlider
            label="Features"
            value={features}
            min={2}
            max={50}
            step={1}
            onChange={setFeatures}
            tooltip="Numero de caracteristicas/columnas por muestra"
          />
          <div className="space-y-2">
            <label className="text-[11px] font-mono text-[#888892]">Tipo de tarea</label>
            <div className="relative">
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value)}
                className="w-full appearance-none rounded-md border border-[rgba(255,255,255,0.07)] bg-[#1e1e24] px-3 py-2 font-mono text-[11px] text-[#e2e2e6] outline-none focus:border-[#4A8FE8]"
              >
                {Object.entries(TASK_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="h-3.5 w-3.5 text-[#484852]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data} layout="vertical">
              <CartesianGrid stroke="#1e1e24" strokeDasharray="3 3" />
              <XAxis
                type="number"
                tickFormatter={(v: number) => `$${v.toLocaleString()}`}
                stroke="#484852"
                tick={{ fill: "#888892", fontSize: 10 }}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={90}
                stroke="#484852"
                tick={{ fill: "#888892", fontSize: 10 }}
              />
              <Tooltip
                formatter={(value) => [`$${Number(value).toLocaleString()}`, "Costo"]}
                contentStyle={{
                  backgroundColor: "#16161a",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "8px",
                  fontSize: "11px",
                  fontFamily: "monospace",
                }}
              />
              <Bar dataKey="costo" radius={[0, 4, 4, 0]}>
                {data.map((_, index) => (
                  <Cell key={index} fill={BAR_COLORS[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="rounded-lg border border-[rgba(255,255,255,0.07)] bg-[#1e1e24] p-4 text-center space-y-2">
            <p className="text-[11px] font-mono text-[#888892]">Costo total estimado</p>
            <p className="text-2xl font-bold font-mono text-[#e2e2e6]">
              ${Math.round(totalCost).toLocaleString()}
            </p>
            <span
              className={`inline-block font-mono text-[10px] px-2 py-1 rounded border border-[rgba(255,255,255,0.07)] ${level.bg} ${level.color}`}
            >
              {level.label}
            </span>
            <p className="text-[11px] font-mono text-[#484852]">{level.message}</p>
          </div>
        </div>
      </div>
    </SimulationCard>
  )
}
