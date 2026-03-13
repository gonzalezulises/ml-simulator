export type ModuleProgress = {
  moduleId: string
  quizCompleted: boolean
  quizScore: number
  simulationVisited: boolean
  lastVisited: string
}

export type UserProgress = {
  modules: Record<string, ModuleProgress>
  lastActiveModule: string
  startedAt: string
}
