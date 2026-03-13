import { TreeNode } from "@/types/ml"

export function entropy(counts: number[]): number {
  const total = counts.reduce((a, b) => a + b, 0)
  if (total === 0) return 0
  let h = 0
  for (const c of counts) {
    if (c === 0) continue
    const p = c / total
    h -= p * Math.log2(p)
  }
  return h
}

export function informationGain(
  parentCounts: number[],
  childrenCounts: number[][]
): number {
  const parentTotal = parentCounts.reduce((a, b) => a + b, 0)
  const parentEntropy = entropy(parentCounts)
  let weightedChildEntropy = 0
  for (const child of childrenCounts) {
    const childTotal = child.reduce((a, b) => a + b, 0)
    weightedChildEntropy += (childTotal / parentTotal) * entropy(child)
  }
  return parentEntropy - weightedChildEntropy
}

type TableRow = Record<string, number>

export function bestSplit(
  data: TableRow[],
  features: string[],
  targetKey: string = "target"
): { feature: string; threshold: number; gain: number } | null {
  const labels = data.map((r) => r[targetKey])
  const classes = [...new Set(labels)]
  const parentCounts = classes.map((c) => labels.filter((l) => l === c).length)

  let best: { feature: string; threshold: number; gain: number } | null = null

  for (const feat of features) {
    const values = [...new Set(data.map((r) => r[feat]))].sort((a, b) => a - b)
    for (let i = 0; i < values.length - 1; i++) {
      const threshold = (values[i] + values[i + 1]) / 2
      const left = data.filter((r) => r[feat] <= threshold)
      const right = data.filter((r) => r[feat] > threshold)
      if (left.length === 0 || right.length === 0) continue

      const leftCounts = classes.map(
        (c) => left.filter((r) => r[targetKey] === c).length
      )
      const rightCounts = classes.map(
        (c) => right.filter((r) => r[targetKey] === c).length
      )
      const gain = informationGain(parentCounts, [leftCounts, rightCounts])
      if (!best || gain > best.gain) {
        best = { feature: feat, threshold, gain }
      }
    }
  }
  return best
}

export function buildTree(
  data: TableRow[],
  features: string[],
  maxDepth: number = 3,
  depth: number = 0,
  targetKey: string = "target"
): TreeNode {
  const labels = data.map((r) => r[targetKey])
  const classes = [...new Set(labels)].sort()
  const classCounts = classes.map((c) => labels.filter((l) => l === c).length)
  const ent = entropy(classCounts)

  if (depth >= maxDepth || ent === 0 || data.length < 2) {
    const prediction = classes[classCounts.indexOf(Math.max(...classCounts))]
    return { entropy: ent, samples: data.length, classCounts, prediction }
  }

  const split = bestSplit(data, features, targetKey)
  if (!split || split.gain < 0.001) {
    const prediction = classes[classCounts.indexOf(Math.max(...classCounts))]
    return { entropy: ent, samples: data.length, classCounts, prediction }
  }

  const leftData = data.filter((r) => r[split.feature] <= split.threshold)
  const rightData = data.filter((r) => r[split.feature] > split.threshold)

  return {
    feature: split.feature,
    threshold: split.threshold,
    entropy: ent,
    samples: data.length,
    classCounts,
    left: buildTree(leftData, features, maxDepth, depth + 1, targetKey),
    right: buildTree(rightData, features, maxDepth, depth + 1, targetKey),
  }
}

export function predictTree(tree: TreeNode, row: TableRow): number {
  if (tree.prediction !== undefined) return tree.prediction
  if (!tree.feature || tree.threshold === undefined) return tree.classCounts.indexOf(Math.max(...tree.classCounts))
  if (row[tree.feature] <= tree.threshold) return predictTree(tree.left!, row)
  return predictTree(tree.right!, row)
}
