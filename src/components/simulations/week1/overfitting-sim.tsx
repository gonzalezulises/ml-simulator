"use client"

import { useState, useMemo } from "react"
import {
  ScatterChart,
  Scatter,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { SimulationCard } from "@/components/shared/simulation-card"
import { ParameterSlider } from "@/components/shared/parameter-slider"
import { generatePolynomialData } from "@/lib/ml/data-generators"

// Polynomial regression via normal equations
function polyFit(
  points: { x: number; y: number }[],
  degree: number
): number[] {
  const n = points.length
  const d = degree + 1

  // Build X matrix (Vandermonde)
  const X: number[][] = []
  for (let i = 0; i < n; i++) {
    const row: number[] = []
    for (let j = 0; j < d; j++) {
      row.push(Math.pow(points[i].x, j))
    }
    X.push(row)
  }

  // X^T * X
  const XtX: number[][] = Array.from({ length: d }, () => new Array(d).fill(0))
  for (let i = 0; i < d; i++) {
    for (let j = 0; j < d; j++) {
      let sum = 0
      for (let k = 0; k < n; k++) sum += X[k][i] * X[k][j]
      // Ridge regularization for numerical stability
      XtX[i][j] = sum + (i === j ? 1e-8 : 0)
    }
  }

  // X^T * y
  const Xty: number[] = new Array(d).fill(0)
  for (let i = 0; i < d; i++) {
    for (let k = 0; k < n; k++) {
      Xty[i] += X[k][i] * points[k].y
    }
  }

  // Solve via Gaussian elimination
  const aug: number[][] = XtX.map((row, i) => [...row, Xty[i]])
  for (let col = 0; col < d; col++) {
    // Partial pivoting
    let maxRow = col
    for (let row = col + 1; row < d; row++) {
      if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) maxRow = row
    }
    ;[aug[col], aug[maxRow]] = [aug[maxRow], aug[col]]

    if (Math.abs(aug[col][col]) < 1e-12) continue

    for (let row = col + 1; row < d; row++) {
      const factor = aug[row][col] / aug[col][col]
      for (let j = col; j <= d; j++) {
        aug[row][j] -= factor * aug[col][j]
      }
    }
  }

  const coeffs = new Array(d).fill(0)
  for (let i = d - 1; i >= 0; i--) {
    let sum = aug[i][d]
    for (let j = i + 1; j < d; j++) {
      sum -= aug[i][j] * coeffs[j]
    }
    coeffs[i] = Math.abs(aug[i][i]) > 1e-12 ? sum / aug[i][i] : 0
  }

  return coeffs
}

function polyEval(coeffs: number[], x: number): number {
  let y = 0
  for (let i = 0; i < coeffs.length; i++) {
    y += coeffs[i] * Math.pow(x, i)
  }
  return y
}

function mse(coeffs: number[], points: { x: number; y: number }[]): number {
  if (points.length === 0) return 0
  let sum = 0
  for (const p of points) {
    const pred = polyEval(coeffs, p.x)
    sum += (pred - p.y) * (pred - p.y)
  }
  return sum / points.length
}

export function OverfittingSim() {
  const [complexity, setComplexity] = useState(3)
  const [noise, setNoise] = useState(0.3)
  const [trainSize, setTrainSize] = useState(50)
  const [showTest, setShowTest] = useState(true)

  const { trainData, testData, curvePoints, trainError, testError, errorCurve, status } =
    useMemo(() => {
      const { train, test } = generatePolynomialData(trainSize, noise)

      const coeffs = polyFit(train, Math.min(complexity, train.length - 1))

      // Generate smooth curve
      const curve: { x: number; y: number }[] = []
      for (let i = 0; i <= 200; i++) {
        const x = (i / 200) * 6 - 3
        const y = polyEval(coeffs, x)
        // Clamp for visualization
        curve.push({ x, y: Math.max(-5, Math.min(5, y)) })
      }

      const trnErr = mse(coeffs, train)
      const tstErr = mse(coeffs, test)

      // Error curve for different complexities
      const errCurve: {
        grado: number
        entrenamiento: number
        prueba: number
      }[] = []
      for (let deg = 1; deg <= 15; deg++) {
        const c = polyFit(train, Math.min(deg, train.length - 1))
        errCurve.push({
          grado: deg,
          entrenamiento: Math.min(mse(c, train), 5),
          prueba: Math.min(mse(c, test), 5),
        })
      }

      let st: "underfitting" | "optimal" | "overfitting" = "optimal"
      if (complexity <= 2) st = "underfitting"
      else if (complexity >= 8 || tstErr > trnErr * 3) st = "overfitting"

      return {
        trainData: train,
        testData: test,
        curvePoints: curve,
        trainError: trnErr,
        testError: tstErr,
        errorCurve: errCurve,
        status: st,
      }
    }, [complexity, noise, trainSize])

  const statusConfig = {
    underfitting: { label: "Sub-ajuste", color: "text-[#E8593A]", bg: "bg-[#E8593A]/15" },
    optimal: { label: "Optimo", color: "text-[#1DB981]", bg: "bg-[#1DB981]/15" },
    overfitting: { label: "Sobre-ajuste", color: "text-[#E8593A]", bg: "bg-[#E8593A]/15" },
  }

  const cfg = statusConfig[status]

  return (
    <SimulationCard
      title="Sobre-ajuste vs Sub-ajuste"
      description="Observa como la complejidad del modelo afecta el error en datos de entrenamiento y de prueba"
    >
      <div className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-3">
          <ParameterSlider
            label="Complejidad (grado polinomial)"
            value={complexity}
            min={1}
            max={15}
            step={1}
            onChange={setComplexity}
            tooltip="Grado del polinomio ajustado a los datos"
          />
          <ParameterSlider
            label="Ruido"
            value={noise}
            min={0}
            max={1}
            step={0.05}
            onChange={setNoise}
            tooltip="Cantidad de ruido aleatorio en los datos"
            formatValue={(v) => v.toFixed(2)}
          />
          <ParameterSlider
            label="Tamano de entrenamiento"
            value={trainSize}
            min={10}
            max={200}
            step={5}
            onChange={setTrainSize}
            tooltip="Numero de muestras de entrenamiento"
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTest(!showTest)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-[rgba(255,255,255,0.07)] transition-colors ${
                showTest ? "bg-[#1DB981]" : "bg-[#1e1e24]"
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 rounded-full bg-[#e2e2e6] transition-transform ${
                  showTest ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </button>
            <label className="text-[13px] font-mono text-[#888892]">Mostrar datos de prueba</label>
          </div>
          <span
            className={`font-mono text-xs px-2.5 py-1 rounded border border-[rgba(255,255,255,0.07)] ${cfg.bg} ${cfg.color}`}
          >
            {cfg.label}
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h4 className="text-[13px] font-mono text-[#888892] mb-2">Datos y modelo ajustado</h4>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <CartesianGrid stroke="#1e1e24" strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="x"
                  domain={[-3.5, 3.5]}
                  stroke="#484852"
                  tick={{ fill: "#888892", fontSize: 12 }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  domain={[-3, 3]}
                  stroke="#484852"
                  tick={{ fill: "#888892", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#16161a",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontFamily: "monospace",
                  }}
                />
                <Scatter
                  name="Entrenamiento"
                  data={trainData}
                  fill="#4A8FE8"
                />
                {showTest && (
                  <Scatter
                    name="Prueba"
                    data={testData}
                    fill="#E8593A"
                    opacity={0.6}
                  />
                )}
                <Scatter
                  name={`Polinomio grado ${complexity}`}
                  data={curvePoints}
                  fill="none"
                  line={{ stroke: "#1DB981", strokeWidth: 2 }}
                  lineType="joint"
                  legendType="line"
                  shape={() => null}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h4 className="text-[13px] font-mono text-[#888892] mb-2">Error vs Complejidad</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={errorCurve}
                margin={{ top: 10, right: 20, bottom: 10, left: 10 }}
              >
                <CartesianGrid stroke="#1e1e24" strokeDasharray="3 3" />
                <XAxis
                  dataKey="grado"
                  stroke="#484852"
                  tick={{ fill: "#888892", fontSize: 12 }}
                  label={{
                    value: "Grado del polinomio",
                    position: "insideBottom",
                    offset: -5,
                    fill: "#484852",
                    fontSize: 12,
                  }}
                />
                <YAxis
                  stroke="#484852"
                  tick={{ fill: "#888892", fontSize: 12 }}
                  label={{
                    value: "MSE",
                    angle: -90,
                    position: "insideLeft",
                    offset: 10,
                    fill: "#484852",
                    fontSize: 12,
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#16161a",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontFamily: "monospace",
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "12px", fontFamily: "monospace" }}
                />
                <Line
                  type="monotone"
                  dataKey="entrenamiento"
                  stroke="#4A8FE8"
                  strokeWidth={2}
                  name="Error entrenamiento"
                  dot={{ r: 3, fill: "#4A8FE8" }}
                />
                <Line
                  type="monotone"
                  dataKey="prueba"
                  stroke="#E8593A"
                  strokeWidth={2}
                  name="Error prueba"
                  dot={{ r: 3, fill: "#E8593A" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-[rgba(255,255,255,0.07)] bg-[#1e1e24] p-3 grid grid-cols-2 gap-4 text-[13px] font-mono">
          <div className="text-center">
            <p className="text-[#888892]">Error entrenamiento</p>
            <p className="text-[16px] font-bold text-[#e2e2e6] mt-1">
              {trainError.toFixed(4)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[#888892]">Error prueba</p>
            <p className="text-[16px] font-bold text-[#e2e2e6] mt-1">{testError.toFixed(4)}</p>
          </div>
        </div>
      </div>
    </SimulationCard>
  )
}
