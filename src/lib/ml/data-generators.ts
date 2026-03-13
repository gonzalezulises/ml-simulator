import { DataPoint } from "@/types/ml"

function randomGaussian(mean = 0, std = 1): number {
  const u1 = Math.random()
  const u2 = Math.random()
  return mean + std * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
}

export function generateLinearSeparable(
  n: number = 100,
  separation: number = 2,
  noise: number = 0.3
): DataPoint[] {
  const points: DataPoint[] = []
  for (let i = 0; i < n; i++) {
    const label: 0 | 1 = i < n / 2 ? 0 : 1
    const cx = label === 0 ? -separation / 2 : separation / 2
    const cy = label === 0 ? -separation / 2 : separation / 2
    points.push({
      x: randomGaussian(cx, noise),
      y: randomGaussian(cy, noise),
      label,
    })
  }
  return points
}

export function generateNonLinear(n: number = 100, noise: number = 0.3): DataPoint[] {
  const points: DataPoint[] = []
  for (let i = 0; i < n; i++) {
    const angle = Math.random() * Math.PI * 2
    const r = i < n / 2 ? randomGaussian(1, noise) : randomGaussian(3, noise)
    points.push({
      x: r * Math.cos(angle),
      y: r * Math.sin(angle),
      label: i < n / 2 ? 0 : 1,
    })
  }
  return points
}

export function generateMultiDimensional(
  n: number,
  dims: number,
  separation: number = 1.5
): { data: number[][]; labels: (0 | 1)[] } {
  const data: number[][] = []
  const labels: (0 | 1)[] = []
  for (let i = 0; i < n; i++) {
    const label: 0 | 1 = i < n / 2 ? 0 : 1
    const point: number[] = []
    for (let d = 0; d < dims; d++) {
      const offset = label === 0 ? -separation / (2 * Math.sqrt(dims)) : separation / (2 * Math.sqrt(dims))
      point.push(randomGaussian(offset, 1))
    }
    data.push(point)
    labels.push(label)
  }
  return { data, labels }
}

export function generatePolynomialData(
  n: number,
  noise: number = 0.3
): { train: { x: number; y: number }[]; test: { x: number; y: number }[] } {
  const fn = (x: number) => Math.sin(x * 1.5) + 0.5 * Math.sin(x * 3)
  const all: { x: number; y: number }[] = []
  for (let i = 0; i < n * 2; i++) {
    const x = (i / (n * 2 - 1)) * 6 - 3
    all.push({ x, y: fn(x) + randomGaussian(0, noise) })
  }
  const shuffled = all.sort(() => Math.random() - 0.5)
  return {
    train: shuffled.slice(0, n),
    test: shuffled.slice(n),
  }
}

export function generateProbabilityScores(
  n: number,
  quality: number = 0.7
): { scores: number[]; labels: (0 | 1)[] } {
  const scores: number[] = []
  const labels: (0 | 1)[] = []
  for (let i = 0; i < n; i++) {
    const label: 0 | 1 = i < n / 2 ? 0 : 1
    const mean = label === 0 ? 0.5 - quality * 0.4 : 0.5 + quality * 0.4
    const score = Math.max(0, Math.min(1, randomGaussian(mean, 0.15)))
    scores.push(score)
    labels.push(label)
  }
  return { scores, labels }
}
