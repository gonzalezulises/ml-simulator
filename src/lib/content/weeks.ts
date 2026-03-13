import { Week } from "@/types/content"

export const weeks: Week[] = [
  {
    id: 1,
    title: "Fundamentos, Perceptrón y el Costo de los Datos",
    description: "Bases del Machine Learning: el rol del científico de datos, el costo de los datos supervisados, el perceptrón como primer modelo y los conceptos de sobre-ajuste.",
    modules: [
      {
        id: "costo-datos",
        weekId: 1,
        title: "El Costo de los Datos Supervisados",
        description: "Entiende por qué conseguir una base de datos etiquetada es costoso y cómo impacta en tus proyectos de ML.",
        slug: "costo-datos",
        order: 1,
        concepts: ["Datos supervisados", "Etiquetado", "Calidad de datos"],
      },
      {
        id: "perceptron",
        weekId: 1,
        title: "El Perceptrón",
        description: "El primer algoritmo de aprendizaje: cómo un hiperplano aprende a separar clases ajustando sus pesos iterativamente.",
        slug: "perceptron",
        order: 2,
        concepts: ["Hiperplano", "Pesos", "Learning rate", "Convergencia"],
      },
      {
        id: "hiperplano",
        weekId: 1,
        title: "Hiperplano y Margen",
        description: "Modelo vs algoritmo: la frontera de decisión y cómo el margen mejora la generalización.",
        slug: "hiperplano",
        order: 3,
        concepts: ["Frontera de decisión", "Margen", "Generalización"],
      },
      {
        id: "dimensionalidad",
        weekId: 1,
        title: "La Bendición de la Dimensión",
        description: "Por qué los modelos lineales funcionan sorprendentemente bien en espacios de alta dimensionalidad.",
        slug: "dimensionalidad",
        order: 4,
        concepts: ["Alta dimensionalidad", "Separabilidad lineal"],
      },
      {
        id: "overfitting",
        weekId: 1,
        title: "Sobre-ajuste vs Sub-ajuste",
        description: "Los archienemigos del ML: cuando el modelo memoriza los datos vs cuando es demasiado simple.",
        slug: "overfitting",
        order: 5,
        concepts: ["Overfitting", "Underfitting", "Sesgo-Varianza"],
      },
    ],
  },
  {
    id: 2,
    title: "Árboles de Decisión, Random Forest e Interpretabilidad",
    description: "Modelos basados en árboles, ensambles y el trade-off entre interpretabilidad y desempeño.",
    modules: [
      {
        id: "interpretabilidad",
        weekId: 2,
        title: "Interpretabilidad vs Desempeño",
        description: "A veces explicar el modelo es más importante que su precisión. Compara fronteras de decisión de distintos algoritmos.",
        slug: "interpretabilidad",
        order: 1,
        concepts: ["Interpretabilidad", "Feature Selection", "Trade-off"],
      },
      {
        id: "entropia",
        weekId: 2,
        title: "Entropía y Selección de Features",
        description: "Cómo los árboles de decisión eligen la mejor variable usando entropía y ganancia de información.",
        slug: "entropia",
        order: 2,
        concepts: ["Entropía", "Ganancia de información", "Árbol de decisión"],
      },
      {
        id: "random-forest",
        weekId: 2,
        title: "Random Forest",
        description: "Ensambles de árboles poco profundos que votan para reducir el sobre-ajuste.",
        slug: "random-forest",
        order: 3,
        concepts: ["Ensamble", "Bootstrap", "Voto mayoritario"],
      },
      {
        id: "umbral-decision",
        weekId: 2,
        title: "Umbral de Decisión",
        description: "Mueve el umbral de clasificación para priorizar el tipo de error que más le conviene a tu negocio.",
        slug: "umbral-decision",
        order: 4,
        concepts: ["Umbral", "Falsos Positivos", "Falsos Negativos", "F1-Score"],
      },
      {
        id: "curva-roc",
        weekId: 2,
        title: "Curva ROC y AUC",
        description: "Evalúa la calidad de un clasificador con la curva ROC y el área bajo la curva.",
        slug: "curva-roc",
        order: 5,
        concepts: ["ROC", "AUC", "TPR", "FPR"],
      },
    ],
  },
  {
    id: 3,
    title: "Regresión Logística y NLP",
    description: "Regresión logística, procesamiento de texto con TF-IDF, regularización y validación cruzada.",
    modules: [
      {
        id: "tfidf",
        weekId: 3,
        title: "Vectorización TF-IDF",
        description: "Convierte texto en números: frecuencia de términos ponderada por su rareza en el corpus.",
        slug: "tfidf",
        order: 1,
        concepts: ["TF", "IDF", "Vectorización", "Ley de Zipf"],
      },
      {
        id: "probabilidad",
        weekId: 3,
        title: "Probabilidad y Momios (Odds)",
        description: "La regresión logística predice probabilidades. Los momios son otra forma de interpretarlas.",
        slug: "probabilidad",
        order: 2,
        concepts: ["Sigmoide", "Odds", "Log-Odds", "Coeficientes"],
      },
      {
        id: "ridge",
        weekId: 3,
        title: "Regularización Ridge (L2)",
        description: "Penaliza coeficientes grandes para evitar el sobre-ajuste cuando hay muchas features.",
        slug: "ridge",
        order: 3,
        concepts: ["Regularización", "Norma L2", "Lambda", "Coeficientes"],
      },
      {
        id: "validacion-cruzada",
        weekId: 3,
        title: "Validación Cruzada (K-Fold)",
        description: "Divide los datos en K partes para obtener una evaluación robusta del modelo.",
        slug: "validacion-cruzada",
        order: 4,
        concepts: ["K-Fold", "Data Leakage", "Evaluación robusta"],
      },
      {
        id: "grid-search",
        weekId: 3,
        title: "Grid Search",
        description: "Búsqueda exhaustiva de la mejor combinación de hiperparámetros.",
        slug: "grid-search",
        order: 5,
        concepts: ["Hiperparámetros", "Búsqueda exhaustiva", "Optimización"],
      },
    ],
  },
]

export function getWeek(weekId: number): Week | undefined {
  return weeks.find((w) => w.id === weekId)
}

export function getModule(weekId: number, slug: string) {
  const week = getWeek(weekId)
  return week?.modules.find((m) => m.slug === slug)
}

export function getAllModules() {
  return weeks.flatMap((w) => w.modules)
}
