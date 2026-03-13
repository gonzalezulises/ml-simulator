"use client"

import { useState, useMemo } from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  Cell,
} from "recharts"
import { SimulationCard } from "@/components/shared/simulation-card"
import { ParameterSlider } from "@/components/shared/parameter-slider"
import { ConceptCallout } from "@/components/shared/concept-callout"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

function randomGaussian(mean = 0, std = 1): number {
  const u1 = Math.random()
  const u2 = Math.random()
  return mean + std * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
}

function generateCorrelatedData(
  n: number,
  p: number,
  noise: number,
  seed: number
) {
  let s = seed
  const rand = () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
  const gauss = () => {
    const u1 = rand()
    const u2 = rand()
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  }

  const trueCoefs = Array.from({ length: p }, (_, i) =>
    i < 3 ? (i + 1) * 0.8 : 0.1 * gauss()
  )

  const X: number[][] = []
  const y: number[] = []
  for (let i = 0; i < n; i++) {
    const base = gauss()
    const row: number[] = []
    for (let j = 0; j < p; j++) {
      row.push(base * 0.7 + gauss() * 0.5)
    }
    X.push(row)
    let yi = 0
    for (let j = 0; j < p; j++) yi += trueCoefs[j] * row[j]
    yi += gauss() * noise
    y.push(yi)
  }
  return { X, y, trueCoefs }
}

// Matrix operations for small matrices
function transpose(A: number[][]): number[][] {
  const rows = A.length
  const cols = A[0].length
  const T: number[][] = Array.from({ length: cols }, () => new Array(rows))
  for (let i = 0; i < rows; i++)
    for (let j = 0; j < cols; j++) T[j][i] = A[i][j]
  return T
}

function matMul(A: number[][], B: number[][]): number[][] {
  const m = A.length
  const n = B[0].length
  const p = B.length
  const C: number[][] = Array.from({ length: m }, () => new Array(n).fill(0))
  for (let i = 0; i < m; i++)
    for (let j = 0; j < n; j++)
      for (let k = 0; k < p; k++) C[i][j] += A[i][k] * B[k][j]
  return C
}

function matVecMul(A: number[][], v: number[]): number[] {
  return A.map((row) => row.reduce((s, a, i) => s + a * v[i], 0))
}

function addIdentity(A: number[][], lambda: number): number[][] {
  return A.map((row, i) => row.map((v, j) => v + (i === j ? lambda : 0)))
}

// Gauss-Jordan inverse for small matrices
function invertMatrix(M: number[][]): number[][] | null {
  const n = M.length
  const aug: number[][] = M.map((row, i) => {
    const r = [...row]
    for (let j = 0; j < n; j++) r.push(i === j ? 1 : 0)
    return r
  })

  for (let col = 0; col < n; col++) {
    let maxRow = col
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) maxRow = row
    }
    ;[aug[col], aug[maxRow]] = [aug[maxRow], aug[col]]

    if (Math.abs(aug[col][col]) < 1e-12) return null

    const pivot = aug[col][col]
    for (let j = 0; j < 2 * n; j++) aug[col][j] /= pivot

    for (let row = 0; row < n; row++) {
      if (row === col) continue
      const factor = aug[row][col]
      for (let j = 0; j < 2 * n; j++) aug[row][j] -= factor * aug[col][j]
    }
  }

  return aug.map((row) => row.slice(n))
}

function ridgeCoefs(X: number[][], y: number[], lambda: number): number[] | null {
  const Xt = transpose(X)
  const XtX = matMul(Xt, X)
  const XtXpLI = addIdentity(XtX, lambda)
  const inv = invertMatrix(XtXpLI)
  if (!inv) return null
  const Xty = matVecMul(Xt, y)
  return matVecMul(inv, Xty)
}

function mse(y: number[], yPred: number[]): number {
  const n = y.length
  let s = 0
  for (let i = 0; i < n; i++) s += (y[i] - yPred[i]) ** 2
  return s / n
}

function l2Norm(w: number[]): number {
  return Math.sqrt(w.reduce((s, v) => s + v * v, 0))
}

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "#e07c4f",
  "#7c4fe0",
  "#4fe0a8",
  "#e04f7c",
  "#4f7ce0",
  "#c4a04f",
  "#4fc4a0",
  "#a04fc4",
  "#c44f60",
  "#60c44f",
  "#4f60c4",
  "#c4604f",
  "#604fc4",
  "#4fc460",
  "#c44fa0",
]

export function RidgeSim() {
  const [lambda, setLambda] = useState(1.0)
  const [noise, setNoise] = useState(0.5)
  const [numFeatures, setNumFeatures] = useState(6)
  const [view, setView] = useState<"coefficients" | "trajectory">("coefficients")

  const data = useMemo(() => {
    const nTrain = 40
    const nTest = 20
    const seed = 42
    const train = generateCorrelatedData(nTrain, numFeatures, noise, seed)
    const test = generateCorrelatedData(nTest, numFeatures, noise, seed + 1000)
    return { train, test }
  }, [numFeatures, noise])

  const coefs = useMemo(() => {
    return ridgeCoefs(data.train.X, data.train.y, lambda) || new Array(numFeatures).fill(0)
  }, [data, lambda, numFeatures])

  const coefsNoReg = useMemo(() => {
    return ridgeCoefs(data.train.X, data.train.y, 0.001) || new Array(numFeatures).fill(0)
  }, [data, numFeatures])

  const coefBarData = useMemo(() => {
    return Array.from({ length: numFeatures }, (_, i) => ({
      name: `β${i + 1}`,
      "Sin reg.": Number(coefsNoReg[i].toFixed(4)),
      [`λ=${lambda}`]: Number(coefs[i].toFixed(4)),
    }))
  }, [coefs, coefsNoReg, numFeatures, lambda])

  const trajectoryData = useMemo(() => {
    const lambdas = [0.001, 0.01, 0.05, 0.1, 0.2, 0.5, 1, 2, 3, 5, 7, 10]
    return lambdas.map((lam) => {
      const w = ridgeCoefs(data.train.X, data.train.y, lam) || new Array(numFeatures).fill(0)
      const entry: Record<string, number> = { lambda: lam }
      w.forEach((v, i) => {
        entry[`β${i + 1}`] = Number(v.toFixed(4))
      })
      return entry
    })
  }, [data, numFeatures])

  const metrics = useMemo(() => {
    const yPredTrain = data.train.X.map((row) =>
      row.reduce((s, v, i) => s + v * coefs[i], 0)
    )
    const yPredTest = data.test.X.map((row) =>
      row.reduce((s, v, i) => s + v * coefs[i], 0)
    )
    return {
      mseTrain: mse(data.train.y, yPredTrain),
      mseTest: mse(data.test.y, yPredTest),
      l2: l2Norm(coefs),
    }
  }, [data, coefs])

  const mseTrajectory = useMemo(() => {
    const lambdas = [0.001, 0.01, 0.05, 0.1, 0.2, 0.5, 1, 2, 3, 5, 7, 10]
    return lambdas.map((lam) => {
      const w = ridgeCoefs(data.train.X, data.train.y, lam) || new Array(numFeatures).fill(0)
      const yPredTrain = data.train.X.map((row) =>
        row.reduce((s, v, i) => s + v * w[i], 0)
      )
      const yPredTest = data.test.X.map((row) =>
        row.reduce((s, v, i) => s + v * w[i], 0)
      )
      return {
        lambda: lam,
        "MSE Train": Number(mse(data.train.y, yPredTrain).toFixed(4)),
        "MSE Test": Number(mse(data.test.y, yPredTest).toFixed(4)),
      }
    })
  }, [data, numFeatures])

  return (
    <SimulationCard
      title="Regularización Ridge (L2)"
      description="Observa cómo λ controla la complejidad del modelo penalizando coeficientes grandes"
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <ParameterSlider
            label="λ (regularización)"
            value={lambda}
            min={0}
            max={10}
            step={0.1}
            onChange={setLambda}
            tooltip="Penalización L2. Mayor λ = coeficientes más pequeños."
            formatValue={(v) => v.toFixed(1)}
          />
          <ParameterSlider
            label="Ruido"
            value={noise}
            min={0}
            max={1}
            step={0.05}
            onChange={setNoise}
            tooltip="Nivel de ruido en los datos. Más ruido hace la regularización más necesaria."
            formatValue={(v) => v.toFixed(2)}
          />
          <ParameterSlider
            label="Número de features"
            value={numFeatures}
            min={2}
            max={20}
            step={1}
            onChange={setNumFeatures}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border p-3 text-center">
            <p className="text-xs text-muted-foreground">MSE Entrenamiento</p>
            <p className="text-lg font-bold font-mono">{metrics.mseTrain.toFixed(3)}</p>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <p className="text-xs text-muted-foreground">MSE Test</p>
            <p className="text-lg font-bold font-mono">{metrics.mseTest.toFixed(3)}</p>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <p className="text-xs text-muted-foreground">‖w‖₂ (norma L2)</p>
            <p className="text-lg font-bold font-mono">{metrics.l2.toFixed(3)}</p>
          </div>
        </div>

        <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
          <TabsList>
            <TabsTrigger value="coefficients">Coeficientes</TabsTrigger>
            <TabsTrigger value="trajectory">Trayectoria λ</TabsTrigger>
          </TabsList>

          <TabsContent value="coefficients" className="space-y-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={coefBarData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <ReferenceLine y={0} stroke="#888" />
                <Bar dataKey="Sin reg." fill="var(--chart-1)" radius={[4, 4, 0, 0]} opacity={0.5} />
                <Bar dataKey={`λ=${lambda}`} fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground">
              Compara los coeficientes sin regularización (λ ≈ 0) vs con λ = {lambda.toFixed(1)}.
              Los coeficientes se encogen hacia cero conforme λ aumenta.
            </p>
          </TabsContent>

          <TabsContent value="trajectory" className="space-y-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trajectoryData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="lambda"
                  scale="log"
                  domain={["auto", "auto"]}
                  tick={{ fontSize: 11 }}
                  label={{ value: "λ (log)", position: "insideBottom", offset: -2, fontSize: 11 }}
                />
                <YAxis tick={{ fontSize: 11 }} label={{ value: "Valor coef.", angle: -90, position: "insideLeft", fontSize: 11 }} />
                <Tooltip labelFormatter={(v) => `λ = ${v}`} />
                <ReferenceLine y={0} stroke="#888" strokeDasharray="3 3" />
                {Array.from({ length: Math.min(numFeatures, 20) }, (_, i) => (
                  <Line
                    key={i}
                    type="monotone"
                    dataKey={`β${i + 1}`}
                    stroke={COLORS[i % COLORS.length]}
                    strokeWidth={1.5}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>

            <p className="text-sm font-medium">MSE vs λ</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={mseTrajectory} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="lambda"
                  scale="log"
                  domain={["auto", "auto"]}
                  tick={{ fontSize: 11 }}
                  label={{ value: "λ (log)", position: "insideBottom", offset: -2, fontSize: 11 }}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip labelFormatter={(v) => `λ = ${v}`} />
                <Legend />
                <Line type="monotone" dataKey="MSE Train" stroke="var(--chart-1)" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="MSE Test" stroke="var(--chart-4)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>

        {lambda < 0.1 && numFeatures > 8 && (
          <ConceptCallout type="overfitting">
            Con {numFeatures} features y λ muy bajo, los coeficientes son inestables y el modelo
            probablemente sobre-ajusta. Incrementa λ para estabilizar.
          </ConceptCallout>
        )}
      </div>
    </SimulationCard>
  )
}
