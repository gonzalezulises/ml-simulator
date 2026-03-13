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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

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
    { name: "Recoleccion", costo: Math.round(collectionCost), fill: "var(--chart-1)" },
    { name: "Limpieza", costo: Math.round(cleaningCost), fill: "var(--chart-2)" },
    { name: "Etiquetado", costo: Math.round(labelingCost), fill: "var(--chart-3)" },
    { name: "Validacion", costo: Math.round(validationCost), fill: "var(--chart-4)" },
  ]

  const getCostLevel = () => {
    if (totalCost < 1000) return { label: "Bajo", variant: "secondary" as const, message: "Proyecto accesible. Pocos datos y etiquetado barato." }
    if (totalCost < 10000) return { label: "Moderado", variant: "default" as const, message: "Costo manejable pero significativo. Considera estrategias de active learning." }
    if (totalCost < 50000) return { label: "Alto", variant: "destructive" as const, message: "Presupuesto considerable. Evalua si puedes usar transfer learning o datos sinteticos." }
    return { label: "Muy Alto", variant: "destructive" as const, message: "El costo es prohibitivo para muchas organizaciones. Explora pre-entrenamiento, few-shot learning o modelos mas simples." }
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
            <label className="text-sm font-medium">Tipo de tarea</label>
            <Select value={taskType} onValueChange={(v) => { if (v) setTaskType(v) }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TASK_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                tickFormatter={(v: number) => `$${v.toLocaleString()}`}
              />
              <YAxis type="category" dataKey="name" width={90} />
              <Tooltip
                formatter={(value) => [`$${Number(value).toLocaleString()}`, "Costo"]}
              />
              <Bar dataKey="costo" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="rounded-lg border p-4 text-center space-y-2">
            <p className="text-sm text-muted-foreground">Costo total estimado</p>
            <p className="text-3xl font-bold font-mono">
              ${Math.round(totalCost).toLocaleString()}
            </p>
            <Badge variant={level.variant}>{level.label}</Badge>
            <p className="text-xs text-muted-foreground">{level.message}</p>
          </div>
        </div>
      </div>
    </SimulationCard>
  )
}
