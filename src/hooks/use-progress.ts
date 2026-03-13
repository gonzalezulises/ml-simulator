"use client"

import { useState, useEffect, useCallback } from "react"
import { UserProgress, ModuleProgress } from "@/types/progress"

const STORAGE_KEY = "ml-simulator-progress"

function getInitialProgress(): UserProgress {
  return {
    modules: {},
    lastActiveModule: "",
    startedAt: new Date().toISOString(),
  }
}

function loadProgress(): UserProgress {
  if (typeof window === "undefined") return getInitialProgress()
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  return getInitialProgress()
}

function saveProgress(progress: UserProgress) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {}
}

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>(getInitialProgress)

  useEffect(() => {
    setProgress(loadProgress())
  }, [])

  const update = useCallback((updater: (prev: UserProgress) => UserProgress) => {
    setProgress((prev) => {
      const next = updater(prev)
      saveProgress(next)
      return next
    })
  }, [])

  const markSimulationVisited = useCallback(
    (moduleId: string) => {
      update((prev) => ({
        ...prev,
        lastActiveModule: moduleId,
        modules: {
          ...prev.modules,
          [moduleId]: {
            ...prev.modules[moduleId],
            moduleId,
            simulationVisited: true,
            quizCompleted: prev.modules[moduleId]?.quizCompleted ?? false,
            quizScore: prev.modules[moduleId]?.quizScore ?? 0,
            lastVisited: new Date().toISOString(),
          },
        },
      }))
    },
    [update]
  )

  const saveQuizResult = useCallback(
    (moduleId: string, score: number) => {
      update((prev) => ({
        ...prev,
        modules: {
          ...prev.modules,
          [moduleId]: {
            ...prev.modules[moduleId],
            moduleId,
            quizCompleted: true,
            quizScore: score,
            simulationVisited: prev.modules[moduleId]?.simulationVisited ?? true,
            lastVisited: new Date().toISOString(),
          },
        },
      }))
    },
    [update]
  )

  const getWeekProgress = useCallback(
    (weekId: number) => {
      const weekModuleIds: Record<number, string[]> = {
        1: ["costo-datos", "perceptron", "hiperplano", "dimensionalidad", "overfitting"],
        2: ["interpretabilidad", "entropia", "random-forest", "umbral-decision", "curva-roc"],
        3: ["tfidf", "probabilidad", "ridge", "validacion-cruzada", "grid-search"],
      }
      const ids = weekModuleIds[weekId] ?? []
      const completed = ids.filter(
        (id) => progress.modules[id]?.simulationVisited && progress.modules[id]?.quizCompleted
      ).length
      return ids.length > 0 ? Math.round((completed / ids.length) * 100) : 0
    },
    [progress]
  )

  const getModuleProgress = useCallback(
    (moduleId: string): ModuleProgress | undefined => {
      return progress.modules[moduleId]
    },
    [progress]
  )

  const resetProgress = useCallback(() => {
    const initial = getInitialProgress()
    saveProgress(initial)
    setProgress(initial)
  }, [])

  return {
    progress,
    markSimulationVisited,
    saveQuizResult,
    getWeekProgress,
    getModuleProgress,
    resetProgress,
  }
}
