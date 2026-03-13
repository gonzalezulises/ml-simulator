import { ROCPoint, ConfusionMatrix } from "@/types/ml"

export function confusionMatrix(
  labels: (0 | 1)[],
  predictions: (0 | 1)[]
): ConfusionMatrix {
  let tp = 0, fp = 0, tn = 0, fn = 0
  for (let i = 0; i < labels.length; i++) {
    if (labels[i] === 1 && predictions[i] === 1) tp++
    else if (labels[i] === 0 && predictions[i] === 1) fp++
    else if (labels[i] === 0 && predictions[i] === 0) tn++
    else fn++
  }
  return { tp, fp, tn, fn }
}

export function precision(cm: ConfusionMatrix): number {
  return cm.tp + cm.fp === 0 ? 0 : cm.tp / (cm.tp + cm.fp)
}

export function recall(cm: ConfusionMatrix): number {
  return cm.tp + cm.fn === 0 ? 0 : cm.tp / (cm.tp + cm.fn)
}

export function f1Score(cm: ConfusionMatrix): number {
  const p = precision(cm)
  const r = recall(cm)
  return p + r === 0 ? 0 : (2 * p * r) / (p + r)
}

export function accuracyFromCM(cm: ConfusionMatrix): number {
  const total = cm.tp + cm.fp + cm.tn + cm.fn
  return total === 0 ? 0 : (cm.tp + cm.tn) / total
}

export function rocCurve(
  labels: (0 | 1)[],
  scores: number[],
  nPoints: number = 100
): ROCPoint[] {
  const points: ROCPoint[] = []
  for (let i = 0; i <= nPoints; i++) {
    const threshold = i / nPoints
    const predictions = scores.map((s) => (s >= threshold ? 1 : 0) as 0 | 1)
    const cm = confusionMatrix(labels, predictions)
    const tpr = cm.tp + cm.fn === 0 ? 0 : cm.tp / (cm.tp + cm.fn)
    const fpr = cm.fp + cm.tn === 0 ? 0 : cm.fp / (cm.fp + cm.tn)
    points.push({ fpr, tpr, threshold })
  }
  return points.sort((a, b) => a.fpr - b.fpr)
}

export function auc(rocPoints: ROCPoint[]): number {
  let area = 0
  const sorted = [...rocPoints].sort((a, b) => a.fpr - b.fpr)
  for (let i = 1; i < sorted.length; i++) {
    const dx = sorted[i].fpr - sorted[i - 1].fpr
    const avgY = (sorted[i].tpr + sorted[i - 1].tpr) / 2
    area += dx * avgY
  }
  return area
}

export function classifyWithThreshold(
  scores: number[],
  threshold: number
): (0 | 1)[] {
  return scores.map((s) => (s >= threshold ? 1 : 0) as 0 | 1)
}
