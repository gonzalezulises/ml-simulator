export type Week = {
  id: 1 | 2 | 3
  title: string
  description: string
  modules: Module[]
}

export type Module = {
  id: string
  weekId: 1 | 2 | 3
  title: string
  description: string
  slug: string
  order: number
  concepts: string[]
}

export type QuizQuestion = {
  id: string
  moduleId: string
  question: string
  options: { label: string; value: string }[]
  correctAnswer: string
  explanation: string
}
