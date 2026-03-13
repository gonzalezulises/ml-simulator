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
  Cell,
  ZAxis,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts"
import { SimulationCard } from "@/components/shared/simulation-card"
import { ParameterSlider } from "@/components/shared/parameter-slider"
import { ConceptCallout } from "@/components/shared/concept-callout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type ModelType = "linear" | "tree" | "randomForest" | "neural"
type Point2D = { x: number; y: number; label: 0 | 1 }

function randomGaussian(mean = 0, std = 1): number {
  const u1 = Math.random()
  const u2 = Math.random()
  return mean + std * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
}

function generateData(complexity: number): Point2D[] {
  const n = 100
  const points: Point2D[] = []
  for (let i = 0; i < n; i++) {
    const label: 0 | 1 = i < n / 2 ? 0 : 1
    if (complexity <= 0.3) {
      // Linearly separable
      const cx = label === 0 ? -1.5 : 1.5
      const cy = label === 0 ? -1.5 : 1.5
      points.push({ x: randomGaussian(cx, 0.6), y: randomGaussian(cy, 0.6), label })
    } else if (complexity <= 0.6) {
      // XOR-like
      const quadrant = i % 4
      const cx = quadrant < 2 ? -1.5 : 1.5
      const cy = quadrant % 2 === 0 ? -1.5 : 1.5
      const l: 0 | 1 = (quadrant === 0 || quadrant === 3) ? 0 : 1
      points.push({ x: randomGaussian(cx, 0.5), y: randomGaussian(cy, 0.5), label: l })
    } else {
      // Circular / concentric
      const angle = Math.random() * Math.PI * 2
      const r = label === 0 ? randomGaussian(1, 0.3) : randomGaussian(2.5, 0.4)
      points.push({ x: r * Math.cos(angle), y: r * Math.sin(angle), label })
    }
  }
  return points
}

function linearPredict(x: number, y: number): 0 | 1 {
  return x + y > 0 ? 1 : 0
}

function treePredict(x: number, y: number): 0 | 1 {
  if (x <= 0) {
    return y <= 0 ? 0 : 1
  }
  return y <= 0 ? 1 : 1
}

function rfPredict(x: number, y: number): 0 | 1 {
  let votes = 0
  // Simulate 5 simple trees with slightly different boundaries
  if (x + y > 0.1) votes++
  if (x > -0.2) votes++
  if (y > -0.3) votes++
  if (x + y * 0.8 > 0) votes++
  if (x * 0.7 + y > -0.1) votes++
  return votes >= 3 ? 1 : 0
}

function neuralPredict(x: number, y: number): 0 | 1 {
  // Simulate a neural network with nonlinear decision boundary
  const h1 = Math.tanh(x * 1.5 + y * 0.5 - 0.3)
  const h2 = Math.tanh(-x * 0.5 + y * 1.5 + 0.2)
  const h3 = Math.tanh(x * x * 0.5 + y * y * 0.5 - 2)
  const out = h1 * 0.5 + h2 * 0.5 - h3 * 0.8
  return out > 0 ? 1 : 0
}

const MODELS: {
  key: ModelType
  label: string
  interpretability: number
  speed: number
  robustness: number
  predict: (x: number, y: number) => 0 | 1
  explanation: string
}[] = [
  {
    key: "linear",
    label: "Lineal",
    interpretability: 5,
    speed: 5,
    robustness: 2,
    predict: linearPredict,
    explanation:
      "Si x + y > 0, es clase 1. Cada coeficiente indica cuanto contribuye esa variable. Facil de explicar a un gerente.",
  },
  {
    key: "tree",
    label: "Arbol de Decision",
    interpretability: 4,
    speed: 4,
    robustness: 2,
    predict: treePredict,
    explanation:
      'Si ingreso > 50k y edad > 30, aprueba. Son reglas tipo "si-entonces" que cualquier persona entiende.',
  },
  {
    key: "randomForest",
    label: "Random Forest",
    interpretability: 2,
    speed: 3,
    robustness: 4,
    predict: rfPredict,
    explanation:
      "50 arboles votaron: 35 dicen aprobar, 15 dicen rechazar. Se puede mostrar importancia de variables, pero no una regla simple.",
  },
  {
    key: "neural",
    label: "Red Neuronal",
    interpretability: 1,
    speed: 2,
    robustness: 5,
    predict: neuralPredict,
    explanation:
      "La red dice 87% probabilidad de clase 1. Tiene 3 capas ocultas con 128 neuronas cada una. Imposible explicar por que.",
  },
]

function Stars({ count }: { count: number }) {
  return (
    <span className="text-yellow-500">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < count ? "" : "opacity-20"}>
          ★
        </span>
      ))}
    </span>
  )
}

export function InterpretabilitySim() {
  const [selectedModel, setSelectedModel] = useState<ModelType>("linear")
  const [complexity, setComplexity] = useState(0.3)

  const data = useMemo(() => generateData(complexity), [complexity])

  const model = MODELS.find((m) => m.key === selectedModel)!

  const gridPredictions = useMemo(() => {
    const res = 25
    const xMin = Math.min(...data.map((p) => p.x)) - 0.5
    const xMax = Math.max(...data.map((p) => p.x)) + 0.5
    const yMin = Math.min(...data.map((p) => p.y)) - 0.5
    const yMax = Math.max(...data.map((p) => p.y)) + 0.5

    const points: { x: number; y: number; prediction: number }[] = []
    for (let i = 0; i < res; i++) {
      for (let j = 0; j < res; j++) {
        const x = xMin + ((xMax - xMin) * i) / (res - 1)
        const y = yMin + ((yMax - yMin) * j) / (res - 1)
        points.push({
          x: parseFloat(x.toFixed(2)),
          y: parseFloat(y.toFixed(2)),
          prediction: model.predict(x, y),
        })
      }
    }
    return points
  }, [data, model])

  const accuracy = useMemo(() => {
    let correct = 0
    for (const p of data) {
      if (model.predict(p.x, p.y) === p.label) correct++
    }
    return correct / data.length
  }, [data, model])

  const radarData = useMemo(() => {
    return [
      { metric: "Accuracy", ...Object.fromEntries(MODELS.map((m) => {
        let correct = 0
        for (const p of data) { if (m.predict(p.x, p.y) === p.label) correct++ }
        return [m.key, Math.round((correct / data.length) * 5)]
      })) },
      { metric: "Interpretabilidad", ...Object.fromEntries(MODELS.map((m) => [m.key, m.interpretability])) },
      { metric: "Velocidad", ...Object.fromEntries(MODELS.map((m) => [m.key, m.speed])) },
      { metric: "Robustez", ...Object.fromEntries(MODELS.map((m) => [m.key, m.robustness])) },
    ]
  }, [data])

  return (
    <SimulationCard
      title="Interpretabilidad vs Complejidad"
      description="Compara como diferentes modelos trazan sus fronteras de decision y que tan faciles son de explicar"
    >
      <div className="space-y-6">
        {/* Model selector */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Selecciona un modelo</h3>
          <div className="flex gap-2 flex-wrap">
            {MODELS.map((m) => (
              <Button
                key={m.key}
                variant={selectedModel === m.key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedModel(m.key)}
              >
                {m.label}
              </Button>
            ))}
          </div>
        </div>

        <ParameterSlider
          label="Complejidad del dataset"
          value={complexity}
          min={0.1}
          max={1}
          step={0.1}
          onChange={setComplexity}
          tooltip="Datos simples (lineales) a complejos (circulos concentricos)"
          formatValue={(v) => v <= 0.3 ? "Lineal" : v <= 0.6 ? "XOR" : "Circular"}
        />

        {/* Scatter with decision boundary */}
        <div>
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            Frontera de decision: {model.label}
            <Badge variant="outline">Accuracy: {(accuracy * 100).toFixed(1)}%</Badge>
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" type="number" tick={{ fontSize: 11 }} name="X" />
              <YAxis dataKey="y" type="number" tick={{ fontSize: 11 }} name="Y" />
              <ZAxis range={[15, 15]} />
              <Tooltip />
              {/* Decision boundary background */}
              <Scatter data={gridPredictions} shape="square" legendType="none">
                {gridPredictions.map((p, i) => (
                  <Cell
                    key={i}
                    fill={p.prediction === 1 ? "#22c55e" : "#ef4444"}
                    fillOpacity={0.12}
                  />
                ))}
              </Scatter>
              {/* Data points */}
              <Scatter data={data} name="Datos">
                {data.map((p, i) => (
                  <Cell
                    key={i}
                    fill={p.label === 1 ? "#16a34a" : "#dc2626"}
                    fillOpacity={0.85}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Model info panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-muted/50 space-y-3">
            <h3 className="text-sm font-semibold">Propiedades del modelo</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Accuracy:</span>
                <span className="font-mono">{(accuracy * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Interpretabilidad:</span>
                <Stars count={model.interpretability} />
              </div>
              <div className="flex justify-between items-center">
                <span>Velocidad:</span>
                <Stars count={model.speed} />
              </div>
              <div className="flex justify-between items-center">
                <span>Robustez:</span>
                <Stars count={model.robustness} />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-muted/50 space-y-2">
            <h3 className="text-sm font-semibold">
              ¿Se lo puedes explicar a un gerente?
            </h3>
            <Badge
              className={
                model.interpretability >= 4
                  ? "bg-emerald-500"
                  : model.interpretability >= 2
                  ? "bg-yellow-500 text-black"
                  : "bg-red-500"
              }
            >
              {model.interpretability >= 4
                ? "Si, facilmente"
                : model.interpretability >= 2
                ? "Parcialmente"
                : "Muy dificil"}
            </Badge>
            <p className="text-sm text-muted-foreground">{model.explanation}</p>
          </div>
        </div>

        {/* Radar chart */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Comparativa de modelos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData} outerRadius="70%">
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis domain={[0, 5]} tick={{ fontSize: 10 }} />
              <Radar
                name="Lineal"
                dataKey="linear"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={selectedModel === "linear" ? 0.3 : 0.05}
                strokeWidth={selectedModel === "linear" ? 2.5 : 1}
              />
              <Radar
                name="Arbol"
                dataKey="tree"
                stroke="#22c55e"
                fill="#22c55e"
                fillOpacity={selectedModel === "tree" ? 0.3 : 0.05}
                strokeWidth={selectedModel === "tree" ? 2.5 : 1}
              />
              <Radar
                name="Random Forest"
                dataKey="randomForest"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={selectedModel === "randomForest" ? 0.3 : 0.05}
                strokeWidth={selectedModel === "randomForest" ? 2.5 : 1}
              />
              <Radar
                name="Red Neuronal"
                dataKey="neural"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={selectedModel === "neural" ? 0.3 : 0.05}
                strokeWidth={selectedModel === "neural" ? 2.5 : 1}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <ConceptCallout type="interpretability">
          En muchas industrias reguladas (banca, medicina, seguros), necesitas poder explicar
          POR QUE el modelo tomo una decision. Un modelo mas preciso pero inexplicable puede
          ser inaceptable. Siempre considera el trade-off entre accuracy e interpretabilidad.
        </ConceptCallout>
      </div>
    </SimulationCard>
  )
}
