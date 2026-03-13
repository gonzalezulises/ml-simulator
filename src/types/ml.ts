export type DataPoint = {
  x: number
  y: number
  label: 0 | 1
}

export type Weights = {
  w1: number
  w2: number
  bias: number
}

export type TrainingStep = {
  weights: Weights
  accuracy: number
  iteration: number
}

export type TreeNode = {
  feature?: string
  threshold?: number
  entropy: number
  samples: number
  classCounts: number[]
  left?: TreeNode
  right?: TreeNode
  prediction?: number
}

export type ROCPoint = {
  fpr: number
  tpr: number
  threshold: number
}

export type ConfusionMatrix = {
  tp: number
  fp: number
  tn: number
  fn: number
}
