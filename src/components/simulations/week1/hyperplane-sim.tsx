"use client"

import { useState, useMemo } from "react"
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts"
import { SimulationCard } from "@/components/shared/simulation-card"
import { ParameterSlider } from "@/components/shared/parameter-slider"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { generateLinearSeparable } from "@/lib/ml/data-generators"
import type { DataPoint } from "@/types/ml"

function classifyPoint(
  point: DataPoint,
  angle: number,
  position: number
): 0 | 1 {
  const rad = (angle * Math.PI) / 180
  const nx = Math.cos(rad)
  const ny = Math.sin(rad)
  const d = nx * point.x + ny * point.y + position
  return d >= 0 ? 1 : 0
}

function distToLine(point: DataPoint, angle: number, position: number): number {
  const rad = (angle * Math.PI) / 180
  const nx = Math.cos(rad)
  const ny = Math.sin(rad)
  return Math.abs(nx * point.x + ny * point.y + position)
}

export function HyperplaneSim() {
  const [angle, setAngle] = useState(45)
  const [position, setPosition] = useState(0)
  const [margin, setMargin] = useState(0.5)
  const [showMargin, setShowMargin] = useState(true)
  const [data] = useState<DataPoint[]>(() => generateLinearSeparable(80, 2, 0.5))

  const rad = (angle * Math.PI) / 180
  const nx = Math.cos(rad)
  const ny = Math.sin(rad)

  const acc = useMemo(() => {
    const correct = data.filter(
      (p) => classifyPoint(p, angle, position) === p.label
    ).length
    return correct / data.length
  }, [data, angle, position])

  const marginViolations = useMemo(() => {
    return data.filter((p) => distToLine(p, angle, position) < margin).length
  }, [data, angle, position, margin])

  const getBoundaryLine = () => {
    const range = 5
    if (Math.abs(ny) > 0.01) {
      const y1 = -(nx * -range + position) / ny
      const y2 = -(nx * range + position) / ny
      return [
        { x: -range, y: y1 },
        { x: range, y: y2 },
      ]
    }
    const xInt = -position / nx
    return [
      { x: xInt, y: -range },
      { x: xInt, y: range },
    ]
  }

  const getMarginLines = () => {
    const range = 5
    if (Math.abs(ny) > 0.01) {
      return {
        upper: [
          { x: -range, y: -(nx * -range + position + margin) / ny },
          { x: range, y: -(nx * range + position + margin) / ny },
        ],
        lower: [
          { x: -range, y: -(nx * -range + position - margin) / ny },
          { x: range, y: -(nx * range + position - margin) / ny },
        ],
      }
    }
    const x1 = -(position + margin) / nx
    const x2 = -(position - margin) / nx
    return {
      upper: [
        { x: x1, y: -range },
        { x: x1, y: range },
      ],
      lower: [
        { x: x2, y: -range },
        { x: x2, y: range },
      ],
    }
  }

  const boundaryLine = getBoundaryLine()
  const marginLines = getMarginLines()

  const class0 = data
    .filter((p) => p.label === 0)
    .map((p) => ({
      x: p.x,
      y: p.y,
      inMargin: distToLine(p, angle, position) < margin,
    }))
  const class1 = data
    .filter((p) => p.label === 1)
    .map((p) => ({
      x: p.x,
      y: p.y,
      inMargin: distToLine(p, angle, position) < margin,
    }))

  const class0Normal = class0.filter((p) => !p.inMargin)
  const class1Normal = class1.filter((p) => !p.inMargin)
  const class0Margin = class0.filter((p) => p.inMargin)
  const class1Margin = class1.filter((p) => p.inMargin)

  return (
    <SimulationCard
      title="Control Manual del Hiperplano"
      description="Ajusta la frontera de decision y observa como el margen afecta la clasificacion"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div>
          <ResponsiveContainer width="100%" height={380}>
            <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="x" domain={[-5, 5]} />
              <YAxis type="number" dataKey="y" domain={[-5, 5]} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter name="Clase 0" data={class0Normal} fill="hsl(221, 83%, 53%)" />
              <Scatter name="Clase 1" data={class1Normal} fill="hsl(0, 84%, 60%)" />
              {showMargin && (
                <>
                  <Scatter
                    name="Clase 0 (margen)"
                    data={class0Margin}
                    fill="hsl(221, 83%, 53%)"
                    opacity={0.4}
                    shape="diamond"
                  />
                  <Scatter
                    name="Clase 1 (margen)"
                    data={class1Margin}
                    fill="hsl(0, 84%, 60%)"
                    opacity={0.4}
                    shape="diamond"
                  />
                </>
              )}
              <Scatter
                name="Frontera"
                data={boundaryLine}
                fill="none"
                line={{ stroke: "hsl(142, 71%, 45%)", strokeWidth: 2 }}
                lineType="joint"
                legendType="line"
              />
              {showMargin && (
                <>
                  <Scatter
                    name="Margen +"
                    data={marginLines.upper}
                    fill="none"
                    line={{
                      stroke: "hsl(142, 71%, 45%)",
                      strokeWidth: 1,
                      strokeDasharray: "4 4",
                    }}
                    lineType="joint"
                    legendType="none"
                  />
                  <Scatter
                    name="Margen -"
                    data={marginLines.lower}
                    fill="none"
                    line={{
                      stroke: "hsl(142, 71%, 45%)",
                      strokeWidth: 1,
                      strokeDasharray: "4 4",
                    }}
                    lineType="joint"
                    legendType="none"
                  />
                </>
              )}
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4">
          <ParameterSlider
            label="Angulo"
            value={angle}
            min={0}
            max={360}
            step={1}
            onChange={setAngle}
            tooltip="Rotacion de la frontera de decision"
            formatValue={(v) => `${v}°`}
          />
          <ParameterSlider
            label="Posicion (bias)"
            value={position}
            min={-5}
            max={5}
            step={0.1}
            onChange={setPosition}
            tooltip="Desplazamiento de la frontera respecto al origen"
            formatValue={(v) => v.toFixed(1)}
          />
          <ParameterSlider
            label="Margen"
            value={margin}
            min={0}
            max={3}
            step={0.1}
            onChange={setMargin}
            tooltip="Ancho de la zona de margen alrededor de la frontera"
            formatValue={(v) => v.toFixed(1)}
          />

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Mostrar margen</label>
            <Switch checked={showMargin} onCheckedChange={setShowMargin} />
          </div>

          <div className="rounded-lg border p-3 space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Accuracy:</span>
              <Badge variant={acc >= 0.9 ? "default" : "secondary"}>
                {(acc * 100).toFixed(1)}%
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Violaciones de margen:</span>
              <Badge variant={marginViolations === 0 ? "default" : "secondary"}>
                {marginViolations}
              </Badge>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Un margen mas amplio suele mejorar la generalizacion, aunque
            sacrifique algunos puntos de entrenamiento. Los puntos con forma de
            diamante estan dentro de la zona de margen.
          </p>
        </div>
      </div>
    </SimulationCard>
  )
}
