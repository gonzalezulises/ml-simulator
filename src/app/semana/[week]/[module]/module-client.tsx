"use client"

import { useEffect } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
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
      concepts={["Datos supervisados", "Etiquetado", "Calidad vs cantidad", "Feature engineering"]}
    >
      <p>
        En Machine Learning supervisado, el modelo aprende de <strong>ejemplos etiquetados</strong>: pares
        (entrada, respuesta correcta). La calidad de estos datos es el factor que más determina el rendimiento
        final — por encima del algoritmo elegido.
      </p>
      <p>
        Un científico de datos opera en la intersección de tres competencias:
      </p>
      <ul>
        <li><strong>Abstracción</strong> — traducir problemas del mundo real a formulaciones matemáticas con función objetivo clara</li>
        <li><strong>Implementación</strong> — programar pipelines de datos, entrenar modelos y ponerlos en producción</li>
        <li><strong>Intuición matemática</strong> — entender <em>por qué</em> cada modelo funciona y cuándo fallará</li>
      </ul>
      <p>
        El costo real de un dataset supervisado se descompone en: <code>recolección</code> (sensores, APIs, scraping),
        <code>limpieza</code> (valores faltantes, outliers, inconsistencias), <code>etiquetado</code> (expertos humanos
        con conocimiento del dominio) y <code>validación</code> (acuerdo inter-anotador, revisión de calidad).
      </p>
      <ConceptCallout type="no-perfect-model">
        Antes de invertir en un modelo complejo, estima el costo total del dataset que necesita. Un modelo simple
        con datos excelentes supera a un modelo sofisticado con datos mediocres.
      </ConceptCallout>
    </TheorySection>
  )
}

function PerceptronTheory() {
  return (
    <TheorySection
      title="El Perceptrón: Primer Algoritmo de Aprendizaje"
      concepts={["Hiperplano", "Pesos (betas)", "Learning rate", "Convergencia", "Separabilidad lineal"]}
    >
      <p>
        El perceptrón (Rosenblatt, 1958) es el bloque fundamental del aprendizaje automático. Distinguimos
        dos conceptos que suelen confundirse:
      </p>
      <ul>
        <li><strong>El modelo</strong> — un hiperplano definido por la ecuación <code>w₁·x₁ + w₂·x₂ + b = 0</code>,
        que divide el espacio en dos regiones (una para cada clase)</li>
        <li><strong>El algoritmo</strong> — un proceso iterativo que, cada vez que encuentra un punto mal clasificado,
        ajusta los pesos en la dirección que corrige ese error</li>
      </ul>
      <p>
        Los <em>pesos</em> (betas) determinan la orientación del hiperplano: controlan cuánto influye cada
        variable en la predicción. El <code>learning rate</code> (η) es un escalar que controla la magnitud
        de cada corrección — valores grandes hacen ajustes agresivos que pueden oscilar, valores pequeños
        convergen lento pero con más estabilidad.
      </p>
      <p>
        La <strong>regla de actualización</strong> es elegantemente simple: si un punto de clase +1 cae del
        lado negativo, sumamos η·x a los pesos; si uno de clase -1 cae del lado positivo, restamos η·x.
      </p>
      <ConceptCallout type="no-perfect-model">
        El perceptrón solo converge si los datos son linealmente separables (Teorema de Convergencia de Novikoff).
        Para datos no separables, el algoritmo oscila indefinidamente. La solución: usar modelos con margen (SVM)
        o funciones no lineales (redes neuronales).
      </ConceptCallout>
    </TheorySection>
  )
}

function HiperplanoTheory() {
  return (
    <TheorySection
      title="Frontera de Decisión y Margen"
      concepts={["Frontera de decisión", "Margen geométrico", "Vectores de soporte", "Generalización"]}
    >
      <p>
        La <strong>frontera de decisión</strong> es el hiperplano que separa las clases. Pero existen
        infinitos hiperplanos que clasifican correctamente los datos de entrenamiento — ¿cuál elegimos?
      </p>
      <p>
        La intuición clave es el <strong>margen</strong>: la distancia perpendicular desde el hiperplano
        hasta el punto más cercano de cada clase. Los puntos que definen este margen se llaman <em>vectores
        de soporte</em>. Un margen amplio indica que el modelo tiene confianza en su clasificación — hay
        un &ldquo;espacio de seguridad&rdquo; antes de cambiar de clase.
      </p>
      <p>
        A veces conviene <strong>sacrificar algunos errores en entrenamiento</strong> (permitir que ciertos
        puntos violen el margen) a cambio de un hiperplano más robusto. Esta es la idea central de las
        SVM con margen suave: un parámetro <code>C</code> controla el balance entre maximizar el margen
        y minimizar las violaciones.
      </p>
      <ConceptCallout type="overfitting">
        Un hiperplano con margen cero que clasifica todo correctamente probablemente está sobre-ajustado:
        cualquier perturbación en los datos cambiará drásticamente la frontera.
      </ConceptCallout>
    </TheorySection>
  )
}

function DimensionalidadTheory() {
  return (
    <TheorySection
      title="La Bendición de la Dimensión"
      concepts={["Alta dimensionalidad", "Separabilidad lineal", "Kernel trick", "Maldición de la dimensión"]}
    >
      <p>
        Resultado contra-intuitivo: los modelos lineales funcionan <strong>sorprendentemente bien</strong> en
        espacios de alta dimensionalidad. Un dataset que es imposible de separar linealmente en 2D puede
        volverse perfectamente separable en 100 o 1000 dimensiones.
      </p>
      <p>
        La razón matemática es que en espacios de alta dimensión hay exponencialmente más &ldquo;espacio libre&rdquo;
        para colocar un hiperplano separador. Cover (1965) demostró que la probabilidad de separabilidad
        lineal tiende a 1 cuando la dimensión crece respecto al número de muestras.
      </p>
      <p>
        Esto justifica técnicas como el <em>kernel trick</em>: proyectar los datos a un espacio de dimensión
        mucho mayor donde sí son linealmente separables, sin calcular explícitamente las coordenadas.
      </p>
      <ConceptCallout type="overfitting">
        La bendición tiene un gemelo peligroso: la <em>maldición de la dimensión</em>. Con pocas muestras
        y muchas features, el modelo memoriza ruido en vez de capturar patrones. Regla práctica: necesitas
        al menos 10× más muestras que features para evitar sobre-ajuste.
      </ConceptCallout>
    </TheorySection>
  )
}

function OverfittingTheory() {
  return (
    <TheorySection
      title="Sobre-ajuste vs Sub-ajuste"
      concepts={["Overfitting", "Underfitting", "Trade-off Sesgo-Varianza", "Complejidad del modelo"]}
    >
      <p>
        El sobre-ajuste es el <strong>problema central</strong> del Machine Learning. Ocurre cuando el
        modelo memoriza los datos de entrenamiento — incluyendo su ruido y particularidades — en vez de
        capturar los patrones generalizables.
      </p>
      <ul>
        <li><strong>Sub-ajuste (alto sesgo)</strong> — el modelo es demasiado simple para capturar la
        estructura real de los datos. Error alto en entrenamiento Y en prueba</li>
        <li><strong>Sobre-ajuste (alta varianza)</strong> — el modelo es tan flexible que se adapta
        al ruido. Error bajo en entrenamiento pero alto en prueba</li>
        <li><strong>Balance óptimo</strong> — complejidad suficiente para capturar patrones reales sin
        memorizar ruido. El &ldquo;sweet spot&rdquo; del trade-off sesgo-varianza</li>
      </ul>
      <p>
        Diagnóstico visual: grafica el error de entrenamiento y el error de prueba en función de la
        complejidad del modelo. El punto donde el error de prueba deja de bajar y empieza a subir marca
        la complejidad óptima.
      </p>
      <ConceptCallout type="overfitting">
        Si la diferencia entre el error de entrenamiento y el error de prueba es grande, estás sobre-ajustando.
        Soluciones: más datos, menos features, regularización, o un modelo más simple.
      </ConceptCallout>
    </TheorySection>
  )
}

// ---- WEEK 2 THEORIES ----

function InterpretabilidadTheory() {
  return (
    <TheorySection
      title="Interpretabilidad vs Desempeño"
      concepts={["Interpretabilidad", "Caja negra vs caja blanca", "Feature importance", "Explicabilidad"]}
    >
      <p>
        En aplicaciones reales, la precisión no es el único criterio. Un modelo médico que diagnostica
        cáncer debe poder explicar <strong>por qué</strong> llegó a esa conclusión — no solo dar un
        número. Un banco que deniega un crédito tiene la obligación legal de justificar la decisión.
      </p>
      <p>
        Los modelos se clasifican en un espectro de interpretabilidad:
      </p>
      <ul>
        <li><strong>Caja blanca</strong> — regresión lineal, árboles de decisión: cada predicción
        se puede rastrear a reglas explícitas</li>
        <li><strong>Caja gris</strong> — random forest, gradient boosting: interpretables a nivel
        de importancia de features, pero las decisiones individuales son complejas</li>
        <li><strong>Caja negra</strong> — redes neuronales profundas: máximo poder predictivo,
        mínima interpretabilidad directa</li>
      </ul>
      <p>
        Los árboles de decisión son particularmente valiosos porque realizan <strong>selección implícita
        de features</strong>: las variables más discriminativas aparecen en los nodos superiores,
        proporcionando un ranking natural de importancia.
      </p>
      <ConceptCallout type="interpretability">
        Un modelo con 99% de accuracy que nadie entiende puede ser menos útil que uno con 92% cuyas
        decisiones son transparentes. La interpretabilidad no es un lujo — es un requisito en muchos
        dominios regulados.
      </ConceptCallout>
    </TheorySection>
  )
}

function EntropiaTheory() {
  return (
    <TheorySection
      title="Entropía y Ganancia de Información"
      concepts={["Entropía de Shannon", "Ganancia de información", "Gini impurity", "Árbol de decisión"]}
    >
      <p>
        El árbol de decisión construye su estructura eligiendo, en cada nodo, la variable que mejor
        <strong> separa las clases</strong>. &ldquo;Mejor separa&rdquo; se formaliza usando <strong>entropía
        de Shannon</strong>: una medida de desorden o incertidumbre.
      </p>
      <p>
        Entropía máxima (= 1 bit para clasificación binaria) significa 50/50 — máxima incertidumbre.
        Entropía cero significa que todos los elementos pertenecen a una sola clase — certeza total.
        La fórmula: <code>H = -Σ pᵢ·log₂(pᵢ)</code>.
      </p>
      <p>
        La <strong>ganancia de información</strong> mide cuánta entropía se reduce al dividir los datos
        por una variable: <code>IG = H(padre) - Σ(nᵢ/n)·H(hijoᵢ)</code>. La variable con mayor ganancia
        se coloca en la raíz del árbol, y el proceso se repite recursivamente en cada rama.
      </p>
      <p>
        Alternativa práctica: <em>Gini impurity</em> (<code>1 - Σ pᵢ²</code>) es computacionalmente
        más rápida y produce árboles similares en la mayoría de los casos.
      </p>
      <ConceptCallout type="interpretability">
        Cada nodo del árbol es una pregunta interpretable sobre una variable. Esto permite explicar cualquier
        predicción como una secuencia de decisiones lógicas que cualquier persona puede seguir.
      </ConceptCallout>
    </TheorySection>
  )
}

function RandomForestTheory() {
  return (
    <TheorySection
      title="Random Forest: La Sabiduría de la Multitud"
      concepts={["Ensamble", "Bagging (Bootstrap)", "Decorrelación", "Voto mayoritario", "OOB error"]}
    >
      <p>
        Un árbol profundo tiene <strong>alta varianza</strong>: pequeños cambios en los datos producen
        árboles muy diferentes. Random Forest resuelve esto con un principio elegante: en vez de un
        árbol grande y preciso, entrena <strong>muchos árboles pequeños e imprecisos</strong>, y combina
        sus predicciones por voto mayoritario.
      </p>
      <p>
        Dos mecanismos generan la diversidad necesaria:
      </p>
      <ul>
        <li><strong>Bootstrap</strong> — cada árbol se entrena con una muestra aleatoria con reemplazo
        del dataset original (~63% de los datos únicos)</li>
        <li><strong>Feature subsampling</strong> — en cada split, solo se considera un subconjunto
        aleatorio de variables (típicamente √p para clasificación, p/3 para regresión)</li>
      </ul>
      <p>
        El error <em>Out-of-Bag</em> (OOB) es un bono: los ~37% de datos no usados por cada árbol
        sirven como validación gratuita, sin necesidad de un conjunto de prueba separado.
      </p>
      <ConceptCallout type="overfitting">
        Random Forest es resistente al sobre-ajuste porque promedia muchos modelos con errores independientes.
        Más árboles siempre ayudan (o al menos no empeoran) — solo aumentan el costo computacional.
      </ConceptCallout>
    </TheorySection>
  )
}

function UmbralDecisionTheory() {
  return (
    <TheorySection
      title="Umbral de Decisión y Matriz de Confusión"
      concepts={["Umbral de probabilidad", "Precision", "Recall", "F1-Score", "Matriz de confusión"]}
    >
      <p>
        Un clasificador probabilístico no predice directamente una clase — produce una <strong>probabilidad</strong>.
        El <code>umbral</code> (por defecto 0.5) convierte esa probabilidad en una decisión binaria:
        si P ≥ umbral → clase positiva.
      </p>
      <p>
        Mover el umbral redistribuye los errores entre cuatro categorías (la <em>matriz de confusión</em>):
      </p>
      <ul>
        <li><strong>Verdaderos Positivos (TP)</strong> — detectados correctamente</li>
        <li><strong>Falsos Positivos (FP)</strong> — alarmas falsas. Controlados por <em>Precision</em> = TP/(TP+FP)</li>
        <li><strong>Falsos Negativos (FN)</strong> — casos perdidos. Controlados por <em>Recall</em> = TP/(TP+FN)</li>
        <li><strong>Verdaderos Negativos (TN)</strong> — rechazados correctamente</li>
      </ul>
      <p>
        En medicina, bajar el umbral (más sensibilidad) es preferible porque perder un caso positivo
        tiene consecuencias graves. En detección de spam, subir el umbral (más precisión) evita que
        emails legítimos terminen en la carpeta de spam.
      </p>
      <ConceptCallout type="no-perfect-model">
        No existe un umbral universalmente óptimo. La elección correcta depende del <em>costo asimétrico</em>
        de cada tipo de error en tu contexto específico de negocio.
      </ConceptCallout>
    </TheorySection>
  )
}

function CurvaRocTheory() {
  return (
    <TheorySection
      title="Curva ROC y Área Bajo la Curva (AUC)"
      concepts={["Curva ROC", "AUC", "TPR (Sensibilidad)", "FPR (1-Especificidad)", "Comparación de modelos"]}
    >
      <p>
        La curva ROC (<em>Receiver Operating Characteristic</em>) visualiza el rendimiento de un clasificador
        a <strong>todos los umbrales posibles</strong> simultáneamente. Eje Y: <code>TPR</code> (tasa de
        verdaderos positivos = Recall). Eje X: <code>FPR</code> (tasa de falsos positivos).
      </p>
      <p>
        Interpretación geométrica: cada punto de la curva representa un umbral diferente. La diagonal
        (45°) es un clasificador aleatorio. Un clasificador perfecto pasa por la esquina superior izquierda
        (TPR=1, FPR=0).
      </p>
      <p>
        El <strong>AUC</strong> (área bajo la curva) resume la calidad global del modelo en un solo número:
      </p>
      <ul>
        <li><code>AUC = 1.0</code> — separación perfecta entre clases</li>
        <li><code>AUC = 0.5</code> — modelo no mejor que lanzar una moneda</li>
        <li><code>AUC &lt; 0.5</code> — peor que aleatorio (invertir las predicciones lo mejoraría)</li>
      </ul>
      <p>
        La principal ventaja de la curva ROC: permite comparar modelos de forma <strong>independiente del
        umbral</strong>. El modelo con mayor AUC es generalmente superior, sin importar qué umbral se elija.
      </p>
      <ConceptCallout type="interpretability">
        Usa la curva ROC para comparar modelos entre sí y el AUC como métrica resumen. Es especialmente
        útil cuando las clases están desbalanceadas o cuando el costo de los errores no está claro.
      </ConceptCallout>
    </TheorySection>
  )
}

// ---- WEEK 3 THEORIES ----

function TfidfTheory() {
  return (
    <TheorySection
      title="Vectorización TF-IDF"
      concepts={["Term Frequency", "Inverse Document Frequency", "Bag of Words", "Ley de Zipf", "Vectorización"]}
    >
      <p>
        Los modelos de ML no entienden texto — necesitan <strong>vectores numéricos</strong>. El enfoque
        más efectivo para textos cortos es <strong>TF-IDF</strong> (Term Frequency · Inverse Document Frequency).
      </p>
      <p>
        La idea central: una palabra es importante para un documento si aparece <em>frecuentemente en ese
        documento</em> (TF alto) pero <em>raramente en el corpus</em> (IDF alto). Palabras como
        &ldquo;el&rdquo;, &ldquo;de&rdquo;, &ldquo;y&rdquo; tienen TF alto pero IDF bajo — son ruido.
      </p>
      <ul>
        <li><code>TF(t,d)</code> = frecuencia del término t en el documento d (a menudo normalizada)</li>
        <li><code>IDF(t)</code> = log(N / df(t)), donde N es el total de documentos y df(t) es en cuántos aparece t</li>
        <li><code>TF-IDF(t,d)</code> = TF(t,d) × IDF(t) — alto cuando la palabra es discriminativa</li>
      </ul>
      <p>
        Cada documento se convierte en un vector donde cada dimensión corresponde a un término del vocabulario,
        y su valor es el peso TF-IDF. Esto se conoce como <em>bag of words</em> porque ignora el orden de las palabras.
      </p>
      <ConceptCallout type="leakage">
        El vocabulario y los valores IDF deben calcularse <strong>exclusivamente</strong> con los datos de
        entrenamiento. Si incluyes datos de prueba en el cálculo de IDF, el modelo tendrá información del
        futuro — una forma sutil pero grave de data leakage.
      </ConceptCallout>
    </TheorySection>
  )
}

function ProbabilidadTheory() {
  return (
    <TheorySection
      title="Probabilidad, Momios (Odds) y la Sigmoide"
      concepts={["Función sigmoide", "Odds ratio", "Log-odds (logit)", "Coeficientes interpretables"]}
    >
      <p>
        La regresión logística es especial porque combina <strong>poder predictivo</strong> con
        <strong> interpretabilidad completa</strong>. Para entenderla, necesitas tres representaciones
        equivalentes del mismo fenómeno:
      </p>
      <ul>
        <li><strong>Probabilidad</strong> (p) — valor entre 0 y 1. Lo que intuitivamente entendemos</li>
        <li><strong>Odds/Momios</strong> — p/(1-p). Si p=0.75, los odds son 3:1 (&ldquo;3 a 1 a favor&rdquo;).
        Rango: 0 a ∞</li>
        <li><strong>Log-odds (logit)</strong> — ln(p/(1-p)). La transformación que hace todo lineal.
        Rango: -∞ a +∞</li>
      </ul>
      <p>
        La <strong>función sigmoide</strong> σ(z) = 1/(1+e⁻ᶻ) convierte log-odds a probabilidad. Es
        la función que transforma la combinación lineal de los pesos (<code>z = β₀ + β₁x₁ + β₂x₂ + ...</code>)
        en una probabilidad válida.
      </p>
      <ConceptCallout type="interpretability">
        La interpretación de los coeficientes es directa: un incremento de 1 unidad en xᵢ <em>multiplica</em>
        los odds por e^βᵢ. Si β₁ = 0.7, un aumento unitario en x₁ duplica los odds (e^0.7 ≈ 2.0).
      </ConceptCallout>
    </TheorySection>
  )
}

function RidgeTheory() {
  return (
    <TheorySection
      title="Regularización Ridge (L2)"
      concepts={["Regularización", "Norma L2", "Lambda (λ)", "Shrinkage", "Multicolinealidad"]}
    >
      <p>
        Cuando tienes muchas features (especialmente más que muestras), los coeficientes pueden volverse
        <strong> exageradamente grandes</strong> — el modelo amplifica señales débiles y ruido para
        ajustarse perfectamente al entrenamiento. Ridge soluciona esto añadiendo una <strong>penalización</strong>
        a la función de pérdida:
      </p>
      <p>
        <code>Loss = Error original + λ · Σβᵢ²</code>
      </p>
      <p>
        El término <code>λ·Σβᵢ²</code> (norma L2 al cuadrado) penaliza coeficientes grandes, forzando
        al modelo a encontrar soluciones donde los pesos son <em>pequeños y distribuidos</em> en vez de
        grandes y concentrados. Esto se llama <strong>shrinkage</strong> — los coeficientes se &ldquo;encogen&rdquo;
        hacia cero sin llegar exactamente a cero.
      </p>
      <ul>
        <li><code>λ = 0</code> — sin regularización: regresión ordinaria (riesgo de overfitting)</li>
        <li><code>λ pequeño</code> — regularización suave: reduce varianza sin perder mucha señal</li>
        <li><code>λ grande</code> — regularización fuerte: coeficientes cercanos a cero (riesgo de underfitting)</li>
        <li><code>λ → ∞</code> — todos los coeficientes colapsados a cero: el modelo predice la media</li>
      </ul>
      <ConceptCallout type="overfitting">
        Ridge es especialmente útil con <em>multicolinealidad</em> (features correlacionadas). Sin regularización,
        el modelo asigna coeficientes enormes con signos opuestos a features correlacionadas. Ridge estabiliza
        estos coeficientes distribuyendo el peso entre las variables correlacionadas.
      </ConceptCallout>
    </TheorySection>
  )
}

function ValidacionCruzadaTheory() {
  return (
    <TheorySection
      title="Validación Cruzada (K-Fold)"
      concepts={["K-Fold CV", "Varianza de estimación", "Data leakage temporal", "Stratified K-Fold"]}
    >
      <p>
        Un solo split train/test produce una estimación <strong>frágil</strong> del rendimiento: depende
        de <em>qué</em> datos cayeron en cada partición. K-Fold Cross-Validation resuelve esto dividiendo
        el dataset en K partes (folds) y rotando cuál se usa como prueba:
      </p>
      <ul>
        <li>Fold 1 como test, folds 2-K como entrenamiento → score₁</li>
        <li>Fold 2 como test, folds 1,3-K como entrenamiento → score₂</li>
        <li>... y así K veces</li>
        <li>Score final = promedio(score₁, ..., scoreₖ) ± desviación estándar</li>
      </ul>
      <p>
        La <strong>desviación estándar</strong> entre folds es tan informativa como el promedio: una
        desviación alta indica que el modelo es inestable — su rendimiento depende fuertemente de qué
        datos ve en entrenamiento.
      </p>
      <p>
        <em>Stratified K-Fold</em> mantiene la misma proporción de clases en cada fold — esencial cuando
        las clases están desbalanceadas.
      </p>
      <ConceptCallout type="leakage">
        Regla de oro: toda transformación (escalado, PCA, selección de features, cálculo de IDF) debe
        realizarse <strong>dentro</strong> de cada fold, usando solo los datos de entrenamiento de ese fold.
        Calcular transformaciones antes del split contamina la evaluación con información del futuro.
      </ConceptCallout>
    </TheorySection>
  )
}

function GridSearchTheory() {
  return (
    <TheorySection
      title="Grid Search: Optimización de Hiperparámetros"
      concepts={["Hiperparámetros vs parámetros", "Búsqueda exhaustiva", "CV anidado", "Random Search"]}
    >
      <p>
        Los <strong>parámetros</strong> los aprende el modelo (pesos, coeficientes). Los <strong>hiperparámetros</strong>
        los elige el ingeniero (learning rate, profundidad del árbol, lambda de regularización). No existe
        fórmula para el hiperparámetro óptimo — hay que <em>experimentar</em>.
      </p>
      <p>
        Grid Search define una <strong>grilla</strong> de combinaciones posibles y evalúa cada una usando
        Cross-Validation. Para cada combinación de hiperparámetros, se entrena y evalúa K veces, y se
        selecciona la combinación con el mejor score promedio.
      </p>
      <ul>
        <li><strong>Grid Search</strong> — prueba todas las combinaciones. Exhaustivo pero exponencial:
        con 3 hiperparámetros de 5 valores cada uno = 125 combinaciones × K folds</li>
        <li><strong>Random Search</strong> — muestrea combinaciones al azar. Sorprendentemente efectivo:
        Bergstra & Bengio (2012) demostraron que con el mismo presupuesto computacional, random search
        encuentra mejores resultados que grid search en la mayoría de los casos</li>
      </ul>
      <ConceptCallout type="leakage">
        El dataset de test final debe estar <strong>completamente separado</strong> del proceso de Grid Search.
        Si usas los mismos datos para seleccionar hiperparámetros Y para reportar el rendimiento final,
        tu estimación será optimista. Solución: CV anidado (outer CV para evaluación, inner CV para tuning).
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
    <main className="px-6 py-12">
      <div className="max-w-4xl mx-auto space-y-12">
        <div>
          <Link
            href={`/semana/${weekId}`}
            className="inline-flex items-center gap-2 font-mono text-[13px] text-[#888892] hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Semana {weekId}
          </Link>
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-xs px-3 py-1 rounded bg-[#1e1e24] border border-[rgba(255,255,255,0.07)] text-[#484852]">
              Semana {weekId} · Módulo {mod.order}
            </span>
          </div>
          <h1 className="text-3xl font-medium tracking-tight">{mod.title}</h1>
          <p className="mt-2 text-[15px] text-[#888892] leading-relaxed">{mod.description}</p>
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
