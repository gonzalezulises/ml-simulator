"use client"

import { useEffect } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import { getModule, getWeek } from "@/lib/content/weeks"
import { quizzes } from "@/lib/content/quizzes"
import { useProgress } from "@/hooks/use-progress"
import { TheorySection } from "@/components/shared/theory-section"
import { QuizSection } from "@/components/shared/quiz-section"
import { ConceptCallout } from "@/components/shared/concept-callout"

import { DataCostSim } from "@/components/simulations/week1/data-cost-sim"
import { PerceptronSim } from "@/components/simulations/week1/perceptron-sim"
import { HyperplaneSim } from "@/components/simulations/week1/hyperplane-sim"
import { DimensionalitySim } from "@/components/simulations/week1/dimensionality-sim"
import { OverfittingSim } from "@/components/simulations/week1/overfitting-sim"

import { InterpretabilitySim } from "@/components/simulations/week2/interpretability-sim"
import { EntropySim } from "@/components/simulations/week2/entropy-sim"
import { RandomForestSim } from "@/components/simulations/week2/random-forest-sim"
import { DecisionThresholdSim } from "@/components/simulations/week2/decision-threshold-sim"
import { RocCurveSim } from "@/components/simulations/week2/roc-curve-sim"

import { TfidfSim } from "@/components/simulations/week3/tfidf-sim"
import { OddsProbabilitySim } from "@/components/simulations/week3/odds-probability-sim"
import { RidgeSim } from "@/components/simulations/week3/ridge-sim"
import { CrossValidationSim } from "@/components/simulations/week3/cross-validation-sim"
import { GridSearchSim } from "@/components/simulations/week3/grid-search-sim"

const simulations: Record<string, React.ComponentType> = {
  "costo-datos": DataCostSim,
  perceptron: PerceptronSim,
  hiperplano: HyperplaneSim,
  dimensionalidad: DimensionalitySim,
  overfitting: OverfittingSim,
  interpretabilidad: InterpretabilitySim,
  entropia: EntropySim,
  "random-forest": RandomForestSim,
  "umbral-decision": DecisionThresholdSim,
  "curva-roc": RocCurveSim,
  tfidf: TfidfSim,
  probabilidad: OddsProbabilitySim,
  ridge: RidgeSim,
  "validacion-cruzada": CrossValidationSim,
  "grid-search": GridSearchSim,
}

// ---- WEEK 1 THEORIES ----

function CostoDatosTheory() {
  return (
    <TheorySection
      title="El Costo de los Datos Supervisados"
      concepts={["Datos supervisados", "Etiquetado", "Calidad de datos"]}
    >
      <p>
        En Machine Learning supervisado, el científico de datos es <strong>esclavo de la base de datos</strong>.
        Sin datos etiquetados de calidad, ningún algoritmo — por sofisticado que sea — producirá resultados útiles.
      </p>
      <p>Un científico de datos necesita dominar tres pilares fundamentales:</p>
      <ul>
        <li><strong>Abstraer problemas del mundo real</strong> en problemas matemáticos resolubles</li>
        <li><strong>Saber programar</strong> para implementar soluciones</li>
        <li><strong>Tener intuición matemática</strong> para entender qué hace cada modelo y por qué funciona</li>
      </ul>
      <p>
        El costo de un dataset supervisado no es solo el etiquetado. Incluye recolección, limpieza,
        etiquetado por expertos y validación.
      </p>
      <ConceptCallout type="no-perfect-model">
        Antes de construir un modelo complejo, pregúntate: ¿puedo pagar el costo de los datos que necesita?
      </ConceptCallout>
    </TheorySection>
  )
}

function PerceptronTheory() {
  return (
    <TheorySection
      title="El Perceptrón"
      concepts={["Hiperplano", "Pesos", "Learning rate", "Convergencia"]}
    >
      <p>El perceptrón es el primer algoritmo de aprendizaje automático. Hay que separar dos conceptos:</p>
      <ul>
        <li><strong>El modelo</strong> es un hiperplano definido por <code>w1·x + w2·y + bias = 0</code>.</li>
        <li><strong>El algoritmo</strong> es el proceso iterativo que ajusta los pesos cada vez que comete un error.</li>
      </ul>
      <p>
        Los pesos (<em>betas</em>) determinan la orientación del hiperplano. El learning rate controla
        el tamaño de cada ajuste.
      </p>
      <ConceptCallout type="no-perfect-model">
        El perceptrón solo converge si los datos son linealmente separables. Para datos no separables,
        necesitarás modelos más complejos.
      </ConceptCallout>
    </TheorySection>
  )
}

function HiperplanoTheory() {
  return (
    <TheorySection
      title="Hiperplano y Margen"
      concepts={["Frontera de decisión", "Margen", "Generalización"]}
    >
      <p>
        La <strong>frontera de decisión</strong> es el hiperplano que separa las clases. Queremos el que
        tenga el <strong>margen más amplio</strong> posible.
      </p>
      <p>
        A veces conviene <strong>sacrificar algunos errores en entrenamiento</strong> para obtener un
        margen más robusto. Esta es la intuición detrás de las SVM.
      </p>
      <ConceptCallout type="overfitting">
        Un hiperplano con margen cero que clasifica todo perfecto probablemente está sobre-ajustado.
      </ConceptCallout>
    </TheorySection>
  )
}

function DimensionalidadTheory() {
  return (
    <TheorySection
      title="La Bendición de la Dimensión"
      concepts={["Alta dimensionalidad", "Separabilidad lineal"]}
    >
      <p>
        Los modelos lineales funcionan <strong>irracionalmente bien</strong> en espacios de alta dimensionalidad.
        En 2D puede ser imposible separar clases, pero en 100 dimensiones casi siempre existe un hiperplano separador.
      </p>
      <ConceptCallout type="overfitting">
        La bendición funciona solo si tienes suficientes datos. Con pocas muestras y muchas features,
        el modelo memoriza ruido.
      </ConceptCallout>
    </TheorySection>
  )
}

function OverfittingTheory() {
  return (
    <TheorySection
      title="Sobre-ajuste vs Sub-ajuste"
      concepts={["Overfitting", "Underfitting", "Sesgo-Varianza"]}
    >
      <p>
        El sobre-ajuste es el <strong>archienemigo del Machine Learning</strong>. Ocurre cuando el
        modelo memoriza los datos de entrenamiento en vez de capturar patrones.
      </p>
      <ul>
        <li><strong>Alto sesgo</strong> (sub-ajuste): modelo demasiado rígido</li>
        <li><strong>Alta varianza</strong> (sobre-ajuste): modelo demasiado flexible</li>
        <li><strong>Balance óptimo</strong>: complejidad justa para capturar patrones sin memorizar ruido</li>
      </ul>
      <ConceptCallout type="overfitting">
        Si tu error de entrenamiento es mucho menor que tu error de prueba, estás sobre-ajustando.
      </ConceptCallout>
    </TheorySection>
  )
}

// ---- WEEK 2 THEORIES ----

function InterpretabilidadTheory() {
  return (
    <TheorySection
      title="Interpretabilidad vs Desempeño"
      concepts={["Interpretabilidad", "Feature Selection", "Trade-off"]}
    >
      <p>
        En la vida real, a veces es más importante <strong>explicar por qué</strong> un modelo tomó una
        decisión que tener la mayor precisión posible. Si un banco deniega un crédito, necesita explicar por qué.
      </p>
      <p>
        Los árboles de decisión son excelentes para esto: realizan <strong>selección de características</strong>
        explícita, colocando las variables más importantes en la cima del árbol.
      </p>
      <ConceptCallout type="interpretability">
        Un modelo que no puedes explicar a un gerente puede ser inútil en la práctica, aunque tenga la mejor accuracy.
      </ConceptCallout>
    </TheorySection>
  )
}

function EntropiaTheory() {
  return (
    <TheorySection
      title="Entropía y Selección de Features"
      concepts={["Entropía", "Ganancia de información", "Árbol de decisión"]}
    >
      <p>
        El árbol de decisión elige la variable que <strong>minimiza la entropía</strong> (el desorden).
        Una variable es buena si, al dividir los datos por ella, obtenemos grupos con una clase mayoritaria clara.
      </p>
      <p>
        La <strong>ganancia de información</strong> mide cuánta incertidumbre se reduce al hacer una división.
        La variable con mayor ganancia se coloca en la raíz del árbol.
      </p>
      <ConceptCallout type="interpretability">
        La entropía permite entender exactamente por qué el modelo eligió cada variable. Cada nodo es una pregunta interpretable.
      </ConceptCallout>
    </TheorySection>
  )
}

function RandomForestTheory() {
  return (
    <TheorySection
      title="Random Forest"
      concepts={["Ensamble", "Bootstrap", "Voto mayoritario"]}
    >
      <p>
        Los árboles muy profundos tienden a <strong>memorizar los datos</strong>. La solución es
        Random Forest: construir múltiples árboles poco profundos (&ldquo;arbustos&rdquo;) entrenados
        con subconjuntos aleatorios de datos y variables.
      </p>
      <p>
        La predicción final es el <strong>voto mayoritario</strong> de todos los árboles. Cada árbol
        individual puede equivocarse, pero el consenso tiende a ser correcto.
      </p>
      <ConceptCallout type="overfitting">
        Random Forest reduce el sobre-ajuste al promediar muchos modelos simples. La diversidad del ensamble es clave.
      </ConceptCallout>
    </TheorySection>
  )
}

function UmbralDecisionTheory() {
  return (
    <TheorySection
      title="Umbral de Decisión"
      concepts={["Umbral", "Falsos Positivos", "Falsos Negativos", "F1-Score"]}
    >
      <p>
        El umbral por defecto (50%) para clasificar se puede mover para <strong>priorizar el tipo de
        error</strong> que sea más grave para el negocio. En medicina, es mejor dar una falsa alarma
        que no detectar una enfermedad.
      </p>
      <p>
        Mover el umbral cambia el balance entre <strong>Precision</strong> y <strong>Recall</strong>.
      </p>
      <ConceptCallout type="no-perfect-model">
        No existe un umbral perfecto. La elección depende del costo de cada tipo de error en tu contexto de negocio.
      </ConceptCallout>
    </TheorySection>
  )
}

function CurvaRocTheory() {
  return (
    <TheorySection
      title="Curva ROC y AUC"
      concepts={["ROC", "AUC", "TPR", "FPR"]}
    >
      <p>
        La curva ROC muestra el trade-off entre la <strong>Tasa de Verdaderos Positivos</strong> (TPR) y
        la <strong>Tasa de Falsos Positivos</strong> (FPR) a todos los umbrales posibles.
      </p>
      <p>
        El <strong>AUC</strong> resume la calidad del modelo en un solo número:
        1.0 es perfecto, 0.5 es aleatorio.
      </p>
      <ConceptCallout type="interpretability">
        La curva ROC es ideal para comparar modelos entre sí. El AUC es una métrica robusta que no depende del umbral.
      </ConceptCallout>
    </TheorySection>
  )
}

// ---- WEEK 3 THEORIES ----

function TfidfTheory() {
  return (
    <TheorySection
      title="Vectorización TF-IDF"
      concepts={["TF", "IDF", "Vectorización", "Ley de Zipf"]}
    >
      <p>
        Para que un modelo de ML procese texto, necesitamos convertirlo en números. No basta con contar
        palabras: debemos usar <strong>TF-IDF</strong>, que pondera la frecuencia de una palabra en un
        texto (TF) penalizándola si aparece en todos los textos (IDF).
      </p>
      <ConceptCallout type="leakage">
        El vocabulario y los valores IDF deben calcularse SOLO con los datos de entrenamiento.
      </ConceptCallout>
    </TheorySection>
  )
}

function ProbabilidadTheory() {
  return (
    <TheorySection
      title="Probabilidad y Momios (Odds)"
      concepts={["Sigmoide", "Odds", "Log-Odds", "Coeficientes"]}
    >
      <p>
        La regresión logística tiene <strong>lo mejor de dos mundos</strong>: es precisa y es interpretable.
        Los <strong>momios</strong> (odds) son el cociente p/(1-p). Las betas indican qué tanto
        influye cada variable.
      </p>
      <ConceptCallout type="interpretability">
        Cada coeficiente beta tiene una interpretación directa: un aumento de 1 unidad en la variable
        multiplica los odds por e^beta.
      </ConceptCallout>
    </TheorySection>
  )
}

function RidgeTheory() {
  return (
    <TheorySection
      title="Regularización Ridge (L2)"
      concepts={["Regularización", "Norma L2", "Lambda", "Coeficientes"]}
    >
      <p>
        Cuando tienes más features que muestras, los coeficientes pueden volverse <strong>exageradamente
        grandes</strong>. Ridge añade la <strong>Norma L2</strong> a la función de error.
      </p>
      <ConceptCallout type="overfitting">
        Lambda controla la fuerza de la regularización. Lambda=0 es sin regularización (riesgo de overfitting).
        Lambda muy alto fuerza todos los coeficientes a cero (underfitting).
      </ConceptCallout>
    </TheorySection>
  )
}

function ValidacionCruzadaTheory() {
  return (
    <TheorySection
      title="Validación Cruzada (K-Fold)"
      concepts={["K-Fold", "Data Leakage", "Evaluación robusta"]}
    >
      <p>
        Dividir los datos en train/test una sola vez da una estimación <strong>frágil</strong>. K-Fold CV
        divide en K partes y entrena/evalúa K veces, usando cada parte como test una vez.
      </p>
      <ConceptCallout type="leakage">
        Regla de oro: las transformaciones se entrenan SOLO con el conjunto de entrenamiento. Nunca al revés.
      </ConceptCallout>
    </TheorySection>
  )
}

function GridSearchTheory() {
  return (
    <TheorySection
      title="Grid Search"
      concepts={["Hiperparámetros", "Búsqueda exhaustiva", "Optimización"]}
    >
      <p>
        El <strong>hiperparámetro ideal</strong> siempre se encuentra experimentando. Grid Search prueba
        todas las combinaciones posibles y usa Cross-Validation para encontrar la mejor.
      </p>
      <ConceptCallout type="leakage">
        El test set final debe estar completamente separado del Grid Search.
      </ConceptCallout>
    </TheorySection>
  )
}

// ---- MAPS ----

const theories: Record<string, React.ComponentType> = {
  "costo-datos": CostoDatosTheory,
  perceptron: PerceptronTheory,
  hiperplano: HiperplanoTheory,
  dimensionalidad: DimensionalidadTheory,
  overfitting: OverfittingTheory,
  interpretabilidad: InterpretabilidadTheory,
  entropia: EntropiaTheory,
  "random-forest": RandomForestTheory,
  "umbral-decision": UmbralDecisionTheory,
  "curva-roc": CurvaRocTheory,
  tfidf: TfidfTheory,
  probabilidad: ProbabilidadTheory,
  ridge: RidgeTheory,
  "validacion-cruzada": ValidacionCruzadaTheory,
  "grid-search": GridSearchTheory,
}

export function ModuleClient({ weekId, moduleSlug }: { weekId: number; moduleSlug: string }) {
  const week = getWeek(weekId)
  const mod = getModule(weekId, moduleSlug)
  const { markSimulationVisited, saveQuizResult } = useProgress()

  useEffect(() => {
    if (mod) {
      markSimulationVisited(mod.id)
    }
  }, [mod, markSimulationVisited])

  if (!week || !mod) notFound()

  const SimComponent = simulations[moduleSlug]
  const TheoryComponent = theories[moduleSlug]
  const questions = quizzes[moduleSlug] ?? []

  if (!SimComponent || !TheoryComponent) notFound()

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-10">
        <div>
          <Link href={`/semana/${weekId}`}>
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Semana {weekId}
            </Button>
          </Link>
          <Badge variant="outline" className="mb-2">
            Semana {weekId} &middot; Módulo {mod.order}
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight">{mod.title}</h1>
          <p className="mt-2 text-muted-foreground">{mod.description}</p>
        </div>

        <TheoryComponent />

        <SimComponent />

        {questions.length > 0 && (
          <QuizSection
            questions={questions}
            onComplete={(score) => saveQuizResult(mod.id, score)}
          />
        )}
      </div>
    </main>
  )
}
