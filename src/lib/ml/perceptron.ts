import { DataPoint, Weights, TrainingStep } from "@/types/ml"

export function predict(weights: Weights, point: DataPoint): 0 | 1 {
  const z = weights.w1 * point.x + weights.w2 * point.y + weights.bias
  return z >= 0 ? 1 : 0
}

export function accuracy(weights: Weights, data: DataPoint[]): number {
  if (data.length === 0) return 0
  const correct = data.filter((p) => predict(weights, p) === p.label).length
  return correct / data.length
}

export function step(
  weights: Weights,
  data: DataPoint[],
  lr: number
): { weights: Weights; updated: boolean } {
  let updated = false
  let w = { ...weights }
  for (const point of data) {
    const pred = predict(w, point)
    if (pred !== point.label) {
      const error = point.label - pred
      w = {
        w1: w.w1 + lr * error * point.x,
        w2: w.w2 + lr * error * point.y,
        bias: w.bias + lr * error,
      }
      updated = true
    }
  }
  return { weights: w, updated }
}

export function train(
  data: DataPoint[],
  lr: number = 0.1,
  maxIter: number = 100
): TrainingStep[] {
  const history: TrainingStep[] = []
  let weights: Weights = { w1: Math.random() * 0.4 - 0.2, w2: Math.random() * 0.4 - 0.2, bias: 0 }
  history.push({ weights: { ...weights }, accuracy: accuracy(weights, data), iteration: 0 })

  for (let i = 1; i <= maxIter; i++) {
    const result = step(weights, data, lr)
    weights = result.weights
    history.push({ weights: { ...weights }, accuracy: accuracy(weights, data), iteration: i })
    if (!result.updated) break
  }
  return history
}

export function getDecisionBoundaryLine(
  weights: Weights,
  xRange: [number, number]
): { x1: number; y1: number; x2: number; y2: number } | null {
  if (Math.abs(weights.w2) < 1e-10) {
    if (Math.abs(weights.w1) < 1e-10) return null
    const xInt = -weights.bias / weights.w1
    return { x1: xInt, y1: xRange[0], x2: xInt, y2: xRange[1] }
  }
  const y1 = -(weights.w1 * xRange[0] + weights.bias) / weights.w2
  const y2 = -(weights.w1 * xRange[1] + weights.bias) / weights.w2
  return { x1: xRange[0], y1, x2: xRange[1], y2 }
}
