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
  ReferenceDot,
  ReferenceLine,
} from "recharts"
import { SimulationCard } from "@/components/shared/simulation-card"
import { ParameterSlider } from "@/components/shared/parameter-slider"
import { Badge } from "@/components/ui/badge"

export function OddsProbabilitySim() {
  const [probability, setProbability] = useState(0.75)
  const [b1, setB1] = useState(1.0)
  const [b0, setB0] = useState(0.0)

  const odds = probability / (1 - probability)
  const logOdds = Math.log(odds)

  const currentX = useMemo(() => {
    if (b1 === 0) return 0
    return (logOdds - b0) / b1
  }, [logOdds, b0, b1])

  const sigmoidData = useMemo(() => {
    const points = []
    for (let i = -60; i <= 60; i++) {
      const x = i / 10
      const z = b0 + b1 * x
      const p = 1 / (1 + Math.exp(-z))
      points.push({ x, p: Math.round(p * 10000) / 10000 })
    }
    return points
  }, [b0, b1])

  const creditScore = Math.round(500 + currentX * 50)

  return (
    <SimulationCard
      title="Probabilidad, Momios y Log-Momios"
      description="Convierte entre las tres escalas fundamentales de regresión logística"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <ParameterSlider
            label="Probabilidad"
            value={probability}
            min={0.01}
            max={0.99}
            step={0.01}
            onChange={setProbability}
            tooltip="Probabilidad del evento (entre 0 y 1)"
            formatValue={(v) => v.toFixed(2)}
          />
          <ParameterSlider
            label="β₁ (coeficiente)"
            value={b1}
            min={-3}
            max={3}
            step={0.1}
            onChange={setB1}
            tooltip="Pendiente de la curva sigmoidea. Valores positivos: más feature → más probabilidad."
            formatValue={(v) => v.toFixed(1)}
          />
          <ParameterSlider
            label="β₀ (intercepto)"
            value={b0}
            min={-3}
            max={3}
            step={0.1}
            onChange={setB0}
            tooltip="Desplazamiento horizontal de la curva. Cambia el punto donde P=0.5."
            formatValue={(v) => v.toFixed(1)}
          />

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border p-3 text-center space-y-1">
              <p className="text-xs text-muted-foreground">Probabilidad</p>
              <div className="relative h-4 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-chart-1 transition-all"
                  style={{ width: `${probability * 100}%` }}
                />
              </div>
              <p className="text-lg font-bold font-mono">{probability.toFixed(2)}</p>
              <p className="text-[10px] text-muted-foreground">Rango: 0 a 1</p>
            </div>

            <div className="rounded-lg border p-3 text-center space-y-1">
              <p className="text-xs text-muted-foreground">Momios (Odds)</p>
              <p className="text-lg font-bold font-mono">
                {odds < 100 ? odds.toFixed(2) : odds.toFixed(0)}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {odds >= 1
                  ? `${odds.toFixed(1)}:1 a favor`
                  : `1:${(1 / odds).toFixed(1)} en contra`}
              </p>
              <p className="text-[10px] text-muted-foreground">Rango: 0 a ∞</p>
            </div>

            <div className="rounded-lg border p-3 text-center space-y-1">
              <p className="text-xs text-muted-foreground">Log-Momios</p>
              <p className="text-lg font-bold font-mono">{logOdds.toFixed(3)}</p>
              <p className="text-[10px] text-muted-foreground">
                {logOdds > 0 ? "Positivo → favorece evento" : logOdds < 0 ? "Negativo → desfavorece" : "Cero → 50/50"}
              </p>
              <p className="text-[10px] text-muted-foreground">Rango: -∞ a +∞</p>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
            <p className="text-sm font-medium">Fórmulas con valores</p>
            <div className="space-y-1 font-mono text-xs">
              <p>P = {probability.toFixed(2)}</p>
              <p>
                Odds = P / (1 - P) = {probability.toFixed(2)} / {(1 - probability).toFixed(2)} ={" "}
                <span className="font-bold">{odds.toFixed(3)}</span>
              </p>
              <p>
                Log-Odds = ln(Odds) = ln({odds.toFixed(3)}) ={" "}
                <span className="font-bold">{logOdds.toFixed(3)}</span>
              </p>
              <p>
                Log-Odds = β₀ + β₁·x = {b0.toFixed(1)} + {b1.toFixed(1)}·x
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-medium">Curva Sigmoidea</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sigmoidData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="x"
                type="number"
                domain={[-6, 6]}
                tick={{ fontSize: 11 }}
                label={{ value: "x (feature)", position: "insideBottom", offset: -2, fontSize: 11 }}
              />
              <YAxis
                domain={[0, 1]}
                tick={{ fontSize: 11 }}
                label={{ value: "P(y=1)", angle: -90, position: "insideLeft", fontSize: 11 }}
              />
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <Tooltip
                formatter={(value: any) => [typeof value === "number" ? value.toFixed(4) : value, "P(y=1)"]}
                labelFormatter={(v) => `x = ${Number(v).toFixed(1)}`}
              />
              <ReferenceLine y={0.5} stroke="#888" strokeDasharray="3 3" />
              <Line
                type="monotone"
                dataKey="p"
                stroke="var(--chart-1)"
                strokeWidth={2}
                dot={false}
              />
              {currentX >= -6 && currentX <= 6 && (
                <ReferenceDot
                  x={Math.round(currentX * 10) / 10}
                  y={probability}
                  r={6}
                  fill="var(--chart-4)"
                  stroke="var(--chart-4)"
                />
              )}
            </LineChart>
          </ResponsiveContainer>

          <div className="rounded-lg border bg-blue-50 dark:bg-blue-950/20 p-4 space-y-2">
            <p className="text-sm font-medium">Ejemplo de negocio</p>
            <p className="text-sm">
              Si un cliente tiene score crediticio{" "}
              <span className="font-bold">{creditScore}</span> (x ={" "}
              {currentX.toFixed(1)}), la probabilidad de pago es{" "}
              <span className="font-bold">{(probability * 100).toFixed(1)}%</span>.
            </p>
            <p className="text-sm">
              Los momios son{" "}
              <span className="font-bold">
                {odds >= 1
                  ? `${odds.toFixed(1)}:1 a favor`
                  : `1:${(1 / odds).toFixed(1)} en contra`}
              </span>{" "}
              de que pague.
            </p>
            <p className="text-sm">
              {probability >= 0.5 ? (
                <Badge variant="secondary">Aprobado</Badge>
              ) : (
                <Badge variant="destructive">Rechazado</Badge>
              )}{" "}
              con umbral de 0.5
            </p>
          </div>
        </div>
      </div>
    </SimulationCard>
  )
}
