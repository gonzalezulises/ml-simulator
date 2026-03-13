import { QuizQuestion } from "@/types/content"

export const quizzes: Record<string, QuizQuestion[]> = {
  "costo-datos": [
    {
      id: "cd-1",
      moduleId: "costo-datos",
      question:
        "Un proyecto de ML requiere 10,000 imagenes medicas etiquetadas por radiologos. ¿Cual es el principal cuello de botella?",
      options: [
        { label: "El costo computacional del entrenamiento", value: "a" },
        { label: "El costo y tiempo del etiquetado por expertos", value: "b" },
        { label: "La eleccion del algoritmo de ML", value: "c" },
        { label: "El almacenamiento de las imagenes", value: "d" },
      ],
      correctAnswer: "b",
      explanation:
        "En datos supervisados, el etiquetado por expertos de dominio es tipicamente el recurso mas escaso y costoso. Un radiologo cobra significativamente mas por hora que el costo computacional equivalente.",
    },
    {
      id: "cd-2",
      moduleId: "costo-datos",
      question:
        "¿Cual de las siguientes NO es una de las 3 capacidades clave de un cientifico de datos segun el curso?",
      options: [
        { label: "Abstraer problemas del mundo real", value: "a" },
        { label: "Saber programar", value: "b" },
        { label: "Diseñar interfaces de usuario", value: "c" },
        { label: "Tener intuicion matematica", value: "d" },
      ],
      correctAnswer: "c",
      explanation:
        "Los tres pilares son: abstraer problemas reales en problemas matematicos, saber programar, y tener intuicion matematica. El diseño de UI no es una competencia core del cientifico de datos.",
    },
    {
      id: "cd-3",
      moduleId: "costo-datos",
      question:
        "Si duplicas el numero de muestras y el numero de features, ¿que pasa con el costo de recoleccion?",
      options: [
        { label: "Se duplica", value: "a" },
        { label: "Se cuadruplica (aproximadamente)", value: "b" },
        { label: "Se mantiene igual", value: "c" },
        { label: "Depende solo del numero de muestras", value: "d" },
      ],
      correctAnswer: "b",
      explanation:
        "El costo de recoleccion escala con muestras x features. Si ambos se duplican, el costo se multiplica por ~4. Por eso la planificacion del dataset es critica antes de empezar.",
    },
  ],
  perceptron: [
    {
      id: "p-1",
      moduleId: "perceptron",
      question:
        "¿Cual es la diferencia fundamental entre el modelo y el algoritmo del perceptron?",
      options: [
        { label: "No hay diferencia, son lo mismo", value: "a" },
        {
          label: "El modelo es el hiperplano; el algoritmo es el proceso iterativo que ajusta los pesos",
          value: "b",
        },
        {
          label: "El modelo es el codigo; el algoritmo es la matematica",
          value: "c",
        },
        {
          label: "El algoritmo es el hiperplano; el modelo es el proceso de entrenamiento",
          value: "d",
        },
      ],
      correctAnswer: "b",
      explanation:
        "El modelo (hiperplano) es la representacion matematica que separa las clases. El algoritmo es el procedimiento iterativo que encuentra los pesos correctos para ese hiperplano.",
    },
    {
      id: "p-2",
      moduleId: "perceptron",
      question:
        "El perceptron NO converge cuando los datos son:",
      options: [
        { label: "Linealmente separables", value: "a" },
        { label: "No linealmente separables", value: "b" },
        { label: "Demasiado pocos", value: "c" },
        { label: "De alta dimensionalidad", value: "d" },
      ],
      correctAnswer: "b",
      explanation:
        "El teorema de convergencia del perceptron garantiza convergencia SOLO si los datos son linealmente separables. Con datos no separables, el algoritmo oscila indefinidamente.",
    },
    {
      id: "p-3",
      moduleId: "perceptron",
      question:
        "Si el learning rate es muy alto, ¿que ocurre durante el entrenamiento?",
      options: [
        { label: "Converge mas rapido siempre", value: "a" },
        {
          label: "Los pesos oscilan y pueden no converger",
          value: "b",
        },
        { label: "No tiene ningun efecto", value: "c" },
        { label: "El modelo se vuelve mas preciso", value: "d" },
      ],
      correctAnswer: "b",
      explanation:
        "Un learning rate alto hace ajustes demasiado grandes a los pesos, causando oscilaciones. La frontera de decision 'salta' de un lado a otro sin estabilizarse.",
    },
  ],
  hiperplano: [
    {
      id: "h-1",
      moduleId: "hiperplano",
      question:
        "¿Por que un margen mas amplio mejora la generalizacion?",
      options: [
        { label: "Porque clasifica correctamente mas datos de entrenamiento", value: "a" },
        {
          label: "Porque crea una zona de seguridad que tolera variaciones en datos nuevos",
          value: "b",
        },
        { label: "Porque reduce el numero de features necesarias", value: "c" },
        { label: "Porque acelera el entrenamiento", value: "d" },
      ],
      correctAnswer: "b",
      explanation:
        "El margen actua como zona de tolerancia. Datos nuevos que caigan cerca de la frontera tienen mayor probabilidad de ser clasificados correctamente si el margen es amplio.",
    },
    {
      id: "h-2",
      moduleId: "hiperplano",
      question:
        "¿Es valido sacrificar accuracy en entrenamiento para obtener mejor margen?",
      options: [
        { label: "Nunca, la accuracy es lo mas importante", value: "a" },
        {
          label: "Si, algunos errores en entrenamiento pueden mejorar la robustez del modelo",
          value: "b",
        },
        { label: "Solo si tienes menos de 100 muestras", value: "c" },
        { label: "Solo en problemas de regresion", value: "d" },
      ],
      correctAnswer: "b",
      explanation:
        "Sacrificar algunos puntos de entrenamiento por un margen mayor es exactamente la idea detras de SVM (Support Vector Machines). La generalizacion importa mas que memorizar el entrenamiento.",
    },
    {
      id: "h-3",
      moduleId: "hiperplano",
      question:
        "¿Que parametro del hiperplano controla su orientacion en el espacio?",
      options: [
        { label: "El bias (sesgo)", value: "a" },
        { label: "Los pesos (w1, w2)", value: "b" },
        { label: "El learning rate", value: "c" },
        { label: "El numero de iteraciones", value: "d" },
      ],
      correctAnswer: "b",
      explanation:
        "Los pesos definen la normal al hiperplano, determinando su orientacion. El bias desplaza el hiperplano sin cambiar su angulo.",
    },
  ],
  dimensionalidad: [
    {
      id: "d-1",
      moduleId: "dimensionalidad",
      question:
        "¿Por que los modelos lineales funcionan 'irracionalmente bien' en alta dimension?",
      options: [
        { label: "Porque hay mas datos disponibles", value: "a" },
        {
          label: "Porque en alta dimension es mas facil encontrar un hiperplano que separe las clases",
          value: "b",
        },
        { label: "Porque los algoritmos son mas eficientes", value: "c" },
        { label: "Porque el ruido desaparece con mas dimensiones", value: "d" },
      ],
      correctAnswer: "b",
      explanation:
        "Con mas dimensiones, el espacio crece exponencialmente y los puntos se 'dispersan', lo que facilita encontrar un hiperplano separador. Es la bendicion de la dimensionalidad.",
    },
    {
      id: "d-2",
      moduleId: "dimensionalidad",
      question:
        "¿Cual es un riesgo de tener demasiadas dimensiones con pocas muestras?",
      options: [
        { label: "El modelo nunca aprende", value: "a" },
        {
          label: "El modelo puede sobre-ajustarse al encontrar patrones espurios",
          value: "b",
        },
        { label: "El modelo se vuelve mas lento unicamente", value: "c" },
        { label: "No hay ningun riesgo", value: "d" },
      ],
      correctAnswer: "b",
      explanation:
        "Con muchas dimensiones y pocas muestras, el modelo puede encontrar separaciones perfectas que son puro ruido estadistico. Esto es la maldicion de la dimensionalidad — lo opuesto a la bendicion.",
    },
    {
      id: "d-3",
      moduleId: "dimensionalidad",
      question:
        "Si tienes 50 muestras y 1000 features, ¿que es mas probable?",
      options: [
        { label: "Que el clasificador lineal tenga accuracy perfecta en entrenamiento", value: "a" },
        { label: "Que el clasificador no pueda aprender nada", value: "b" },
        { label: "Que el modelo sea robusto a datos nuevos", value: "c" },
        { label: "Que necesites mas features", value: "d" },
      ],
      correctAnswer: "a",
      explanation:
        "Con n < d (muestras < dimensiones), es casi seguro que un hiperplano pueda separar perfectamente los datos de entrenamiento. Pero esta accuracy perfecta NO implica buena generalizacion.",
    },
  ],
  // ---- WEEK 2 ----
  interpretabilidad: [
    {
      id: "int-1",
      moduleId: "interpretabilidad",
      question: "Un banco necesita explicar por qué denegó un crédito. ¿Qué modelo es más apropiado?",
      options: [
        { label: "Red neuronal profunda", value: "a" },
        { label: "Árbol de decisión", value: "b" },
        { label: "Ensamble de 1000 modelos", value: "c" },
        { label: "El que tenga mayor accuracy", value: "d" },
      ],
      correctAnswer: "b",
      explanation: "El árbol de decisión produce reglas if/else interpretables que pueden explicarse al cliente y al regulador. La accuracy no es lo único que importa cuando hay requisitos legales de explicabilidad.",
    },
    {
      id: "int-2",
      moduleId: "interpretabilidad",
      question: "¿Qué significa que un árbol de decisión haga 'selección de características'?",
      options: [
        { label: "Elimina columnas del dataset", value: "a" },
        { label: "Coloca las variables más importantes en los nodos superiores", value: "b" },
        { label: "Crea nuevas features automáticamente", value: "c" },
        { label: "Normaliza todas las variables", value: "d" },
      ],
      correctAnswer: "b",
      explanation: "El árbol selecciona implícitamente las features más informativas al colocarlas en los primeros splits. Las variables que nunca aparecen en el árbol son efectivamente ignoradas.",
    },
    {
      id: "int-3",
      moduleId: "interpretabilidad",
      question: "¿Por qué existe un trade-off entre interpretabilidad y desempeño?",
      options: [
        { label: "Los modelos interpretables siempre son peores", value: "a" },
        { label: "Los modelos complejos capturan patrones no lineales pero son difíciles de explicar", value: "b" },
        { label: "No existe tal trade-off", value: "c" },
        { label: "Solo aplica en problemas de texto", value: "d" },
      ],
      correctAnswer: "b",
      explanation: "Modelos como redes neuronales pueden capturar relaciones muy complejas (mejor accuracy) pero sus miles de parámetros no son interpretables. Modelos simples como regresión logística o árboles son interpretables pero pueden no capturar toda la complejidad.",
    },
  ],
  entropia: [
    {
      id: "ent-1",
      moduleId: "entropia",
      question: "¿Qué valor de entropía tiene un nodo donde el 100% de los datos pertenece a una sola clase?",
      options: [
        { label: "1.0 (máxima)", value: "a" },
        { label: "0.5", value: "b" },
        { label: "0.0 (mínima)", value: "c" },
        { label: "Depende del número de muestras", value: "d" },
      ],
      correctAnswer: "c",
      explanation: "Entropía = 0 significa certeza total (sin desorden). Si todos los datos son de una clase, no hay incertidumbre sobre la clasificación.",
    },
    {
      id: "ent-2",
      moduleId: "entropia",
      question: "El árbol elige para dividir la variable que:",
      options: [
        { label: "Tiene el valor más alto", value: "a" },
        { label: "Maximiza la ganancia de información (reduce más la entropía)", value: "b" },
        { label: "Aparece primero en el dataset", value: "c" },
        { label: "Tiene menos valores únicos", value: "d" },
      ],
      correctAnswer: "b",
      explanation: "La ganancia de información mide cuánta entropía se reduce al dividir por esa variable. La variable que más reduce la incertidumbre es la más informativa.",
    },
    {
      id: "ent-3",
      moduleId: "entropia",
      question: "Si un nodo tiene 50% clase A y 50% clase B, su entropía es:",
      options: [
        { label: "0.0", value: "a" },
        { label: "0.5", value: "b" },
        { label: "1.0", value: "c" },
        { label: "2.0", value: "d" },
      ],
      correctAnswer: "c",
      explanation: "H = -0.5·log2(0.5) - 0.5·log2(0.5) = 1.0. La entropía es máxima (1.0 para clasificación binaria) cuando las clases están perfectamente balanceadas — máxima incertidumbre.",
    },
  ],
  "random-forest": [
    {
      id: "rf-1",
      moduleId: "random-forest",
      question: "¿Cómo reduce Random Forest el sobre-ajuste comparado con un solo árbol profundo?",
      options: [
        { label: "Usa un learning rate menor", value: "a" },
        { label: "Promedia múltiples árboles poco profundos entrenados con subconjuntos aleatorios", value: "b" },
        { label: "Elimina los outliers automáticamente", value: "c" },
        { label: "Aumenta el número de features", value: "d" },
      ],
      correctAnswer: "b",
      explanation: "Cada árbol individual puede sobre-ajustarse a su subconjunto, pero el voto mayoritario de muchos árboles diversos cancela los errores individuales. La aleatoriedad (bootstrap + feature sampling) crea la diversidad necesaria.",
    },
    {
      id: "rf-2",
      moduleId: "random-forest",
      question: "¿Qué pasa si cada árbol del bosque usa TODAS las features disponibles?",
      options: [
        { label: "Mejor accuracy siempre", value: "a" },
        { label: "Los árboles serán muy similares entre sí, reduciendo el beneficio del ensamble", value: "b" },
        { label: "No cambia nada", value: "c" },
        { label: "El modelo se vuelve más interpretable", value: "d" },
      ],
      correctAnswer: "b",
      explanation: "Si todos los árboles ven las mismas features, tenderán a hacer los mismos splits y serán muy correlacionados. La diversidad es clave: el feature sampling fuerza a cada árbol a explorar diferentes caminos.",
    },
    {
      id: "rf-3",
      moduleId: "random-forest",
      question: "El 'voto mayoritario' en Random Forest significa que:",
      options: [
        { label: "Se usa el árbol con mejor accuracy individual", value: "a" },
        { label: "Cada árbol vota una clase y se elige la clase con más votos", value: "b" },
        { label: "Se promedian las profundidades de los árboles", value: "c" },
        { label: "Se selecciona el árbol más reciente", value: "d" },
      ],
      correctAnswer: "b",
      explanation: "Cada árbol produce una predicción independiente. La clase final es la que recibe más votos. Este mecanismo es robusto porque los errores individuales tienden a cancelarse.",
    },
  ],
  "umbral-decision": [
    {
      id: "ud-1",
      moduleId: "umbral-decision",
      question: "En detección de fraude, ¿qué tipo de error es más costoso?",
      options: [
        { label: "Falso Positivo (bloquear una transacción legítima)", value: "a" },
        { label: "Falso Negativo (no detectar un fraude real)", value: "b" },
        { label: "Ambos cuestan lo mismo", value: "c" },
        { label: "Depende del día de la semana", value: "d" },
      ],
      correctAnswer: "b",
      explanation: "Un fraude no detectado puede costar miles de dólares. Un bloqueo falso solo incomoda al cliente. Por eso en fraude se baja el umbral para detectar más positivos, aunque haya más falsas alarmas.",
    },
    {
      id: "ud-2",
      moduleId: "umbral-decision",
      question: "Si bajas el umbral de decisión de 0.5 a 0.3, ¿qué pasa?",
      options: [
        { label: "Aumenta la Precision y baja el Recall", value: "a" },
        { label: "Baja la Precision y aumenta el Recall", value: "b" },
        { label: "Ambos suben", value: "c" },
        { label: "Ambos bajan", value: "d" },
      ],
      correctAnswer: "b",
      explanation: "Un umbral más bajo clasifica más instancias como positivas. Detectas más positivos reales (Recall sube) pero también más falsos positivos (Precision baja). Es el trade-off fundamental.",
    },
    {
      id: "ud-3",
      moduleId: "umbral-decision",
      question: "¿Qué métrica combina Precision y Recall en un solo número?",
      options: [
        { label: "Accuracy", value: "a" },
        { label: "F1-Score", value: "b" },
        { label: "AUC", value: "c" },
        { label: "Entropía", value: "d" },
      ],
      correctAnswer: "b",
      explanation: "El F1-Score es la media armónica de Precision y Recall. Es útil cuando quieres un balance entre ambas métricas, especialmente con clases desbalanceadas.",
    },
  ],
  "curva-roc": [
    {
      id: "roc-1",
      moduleId: "curva-roc",
      question: "¿Qué AUC tendría un modelo que clasifica al azar?",
      options: [
        { label: "0.0", value: "a" },
        { label: "0.5", value: "b" },
        { label: "1.0", value: "c" },
        { label: "Depende del dataset", value: "d" },
      ],
      correctAnswer: "b",
      explanation: "Un clasificador aleatorio tiene AUC = 0.5, representado por la diagonal en la curva ROC. Cualquier modelo útil debe superar este baseline.",
    },
    {
      id: "roc-2",
      moduleId: "curva-roc",
      question: "¿Cuál es la ventaja principal de usar AUC sobre Accuracy?",
      options: [
        { label: "Es más fácil de calcular", value: "a" },
        { label: "No depende del umbral de decisión elegido", value: "b" },
        { label: "Siempre da valores más altos", value: "c" },
        { label: "Solo funciona con datos balanceados", value: "d" },
      ],
      correctAnswer: "b",
      explanation: "El AUC evalúa la calidad del modelo en TODOS los umbrales posibles. La accuracy depende de un umbral específico y puede ser engañosa con clases desbalanceadas.",
    },
    {
      id: "roc-3",
      moduleId: "curva-roc",
      question: "En la curva ROC, ¿qué representa el eje Y?",
      options: [
        { label: "Tasa de Falsos Positivos (FPR)", value: "a" },
        { label: "Tasa de Verdaderos Positivos (TPR / Recall)", value: "b" },
        { label: "Precision", value: "c" },
        { label: "Accuracy", value: "d" },
      ],
      correctAnswer: "b",
      explanation: "El eje Y es el TPR (True Positive Rate = Recall): proporción de positivos reales correctamente detectados. El eje X es el FPR (False Positive Rate): proporción de negativos incorrectamente clasificados como positivos.",
    },
  ],
  // ---- WEEK 3 ----
  tfidf: [
    {
      id: "tf-1",
      moduleId: "tfidf",
      question: "¿Por qué no basta con contar la frecuencia de palabras para vectorizar texto?",
      options: [
        { label: "Porque las computadoras no pueden contar", value: "a" },
        { label: "Porque palabras comunes como 'de' o 'el' tendrían el peso más alto sin ser informativas", value: "b" },
        { label: "Porque el español tiene demasiadas palabras", value: "c" },
        { label: "Porque la frecuencia siempre es 1", value: "d" },
      ],
      correctAnswer: "b",
      explanation: "Palabras muy frecuentes en todos los documentos (stop words) no distinguen entre textos. TF-IDF las penaliza con el componente IDF, dando más peso a palabras que son frecuentes en UN documento pero raras en el corpus.",
    },
    {
      id: "tf-2",
      moduleId: "tfidf",
      question: "Si una palabra aparece en TODOS los documentos del corpus, su IDF es:",
      options: [
        { label: "Muy alto (la palabra es importante)", value: "a" },
        { label: "0 o cercano a 0 (la palabra no discrimina)", value: "b" },
        { label: "1.0 exactamente", value: "c" },
        { label: "Negativo", value: "d" },
      ],
      correctAnswer: "b",
      explanation: "IDF = log(N/df). Si la palabra aparece en todos los N documentos, IDF = log(N/N) = log(1) = 0. Una palabra ubicua no aporta información discriminante.",
    },
    {
      id: "tf-3",
      moduleId: "tfidf",
      question: "¿Qué tipo de palabra tendría el TF-IDF más alto?",
      options: [
        { label: "Una palabra que aparece mucho en todos los documentos", value: "a" },
        { label: "Una palabra que aparece mucho en un documento pero poco en los demás", value: "b" },
        { label: "Una palabra que aparece una vez en cada documento", value: "c" },
        { label: "La palabra más larga del corpus", value: "d" },
      ],
      correctAnswer: "b",
      explanation: "TF-IDF = TF × IDF. TF alto (frecuente en el documento) × IDF alto (rara en el corpus) = una palabra que es característica y distintiva de ese documento.",
    },
  ],
  probabilidad: [
    {
      id: "prob-1",
      moduleId: "probabilidad",
      question: "Si la probabilidad de un evento es 0.8, ¿cuáles son los odds (momios)?",
      options: [
        { label: "0.8", value: "a" },
        { label: "4:1 a favor", value: "b" },
        { label: "1:4 a favor", value: "c" },
        { label: "0.2", value: "d" },
      ],
      correctAnswer: "b",
      explanation: "Odds = p/(1-p) = 0.8/0.2 = 4. Esto significa 4:1 a favor: por cada vez que NO ocurre, ocurre 4 veces.",
    },
    {
      id: "prob-2",
      moduleId: "probabilidad",
      question: "¿Qué forma tiene la función sigmoide?",
      options: [
        { label: "Una línea recta", value: "a" },
        { label: "Una parábola", value: "b" },
        { label: "Una S que va de 0 a 1", value: "c" },
        { label: "Una campana de Gauss", value: "d" },
      ],
      correctAnswer: "c",
      explanation: "La sigmoide σ(z) = 1/(1+e^(-z)) tiene forma de S, mapeando cualquier valor real al rango (0,1). Esto la hace perfecta para representar probabilidades.",
    },
    {
      id: "prob-3",
      moduleId: "probabilidad",
      question: "En regresión logística, ¿qué indica un coeficiente beta positivo para una variable?",
      options: [
        { label: "La variable no tiene efecto", value: "a" },
        { label: "Al aumentar esa variable, aumenta la probabilidad del evento", value: "b" },
        { label: "Al aumentar esa variable, disminuye la probabilidad", value: "c" },
        { label: "La variable debe eliminarse del modelo", value: "d" },
      ],
      correctAnswer: "b",
      explanation: "Un beta positivo significa que incrementar esa variable incrementa el log-odds, lo que incrementa la probabilidad del evento. Cada unidad de aumento multiplica los odds por e^beta.",
    },
  ],
  ridge: [
    {
      id: "ridge-1",
      moduleId: "ridge",
      question: "¿Qué hace la regularización Ridge con los coeficientes del modelo?",
      options: [
        { label: "Los hace exactamente cero", value: "a" },
        { label: "Los encoge hacia cero sin eliminarlos", value: "b" },
        { label: "Los duplica", value: "c" },
        { label: "No afecta los coeficientes", value: "d" },
      ],
      correctAnswer: "b",
      explanation: "Ridge (L2) penaliza coeficientes grandes, encogiéndolos hacia cero pero sin hacerlos exactamente cero. Lasso (L1) sí puede llevar coeficientes a cero exacto.",
    },
    {
      id: "ridge-2",
      moduleId: "ridge",
      question: "¿Qué pasa si lambda es demasiado grande en Ridge?",
      options: [
        { label: "El modelo se sobre-ajusta", value: "a" },
        { label: "El modelo se sub-ajusta (underfitting) porque los coeficientes se acercan demasiado a cero", value: "b" },
        { label: "No pasa nada", value: "c" },
        { label: "El modelo se vuelve más interpretable", value: "d" },
      ],
      correctAnswer: "b",
      explanation: "Lambda muy alto penaliza excesivamente cualquier coeficiente no-cero, forzando un modelo casi plano que no puede capturar patrones. El balance óptimo de lambda se encuentra con Cross-Validation.",
    },
    {
      id: "ridge-3",
      moduleId: "ridge",
      question: "¿Cuándo es especialmente útil la regularización?",
      options: [
        { label: "Cuando tienes pocas features y muchos datos", value: "a" },
        { label: "Cuando tienes más features que muestras", value: "b" },
        { label: "Solo en problemas de NLP", value: "c" },
        { label: "Nunca es útil", value: "d" },
      ],
      correctAnswer: "b",
      explanation: "Con más features que muestras (como en NLP donde cada palabra es una feature), el modelo puede encontrar infinitas soluciones. La regularización estabiliza el problema seleccionando la solución con coeficientes más pequeños.",
    },
  ],
  "validacion-cruzada": [
    {
      id: "cv-1",
      moduleId: "validacion-cruzada",
      question: "¿Por qué un solo split train/test puede ser engañoso?",
      options: [
        { label: "Porque siempre da accuracy perfecta", value: "a" },
        { label: "Porque el resultado depende de qué datos cayeron en cada partición", value: "b" },
        { label: "Porque no se puede entrenar con un split", value: "c" },
        { label: "Porque el test set siempre es más fácil", value: "d" },
      ],
      correctAnswer: "b",
      explanation: "Un split particular puede ser 'afortunado' o 'desafortunado'. K-Fold CV promedia sobre K splits diferentes, dando una estimación más estable y confiable del desempeño real.",
    },
    {
      id: "cv-2",
      moduleId: "validacion-cruzada",
      question: "Si usas K=10 en Cross-Validation, ¿qué porcentaje de datos se usa para entrenar en cada fold?",
      options: [
        { label: "10%", value: "a" },
        { label: "50%", value: "b" },
        { label: "90%", value: "c" },
        { label: "100%", value: "d" },
      ],
      correctAnswer: "c",
      explanation: "Con K=10, cada fold usa 9/10 = 90% de los datos para entrenar y 10% para evaluar. K más alto = más datos de entrenamiento por fold, pero más costoso computacionalmente.",
    },
    {
      id: "cv-3",
      moduleId: "validacion-cruzada",
      question: "¿Qué es Data Leakage en el contexto de Cross-Validation?",
      options: [
        { label: "Cuando los datos se pierden del disco", value: "a" },
        { label: "Cuando información del test set contamina el entrenamiento", value: "b" },
        { label: "Cuando tienes muchos missing values", value: "c" },
        { label: "Cuando el dataset es muy pequeño", value: "d" },
      ],
      correctAnswer: "b",
      explanation: "Data Leakage ocurre cuando preprocesas (normalización, TF-IDF, etc.) ANTES de dividir los datos. El test set debe simular datos nunca vistos — si participó en el preprocesamiento, la evaluación es optimista y engañosa.",
    },
  ],
  "grid-search": [
    {
      id: "gs-1",
      moduleId: "grid-search",
      question: "Si tienes 4 valores de max_depth y 5 valores de min_samples, ¿cuántas combinaciones evalúa Grid Search?",
      options: [
        { label: "9", value: "a" },
        { label: "20", value: "b" },
        { label: "4", value: "c" },
        { label: "5", value: "d" },
      ],
      correctAnswer: "b",
      explanation: "Grid Search evalúa el producto cartesiano: 4 × 5 = 20 combinaciones. Cada una se evalúa con Cross-Validation, así que el costo total es 20 × K entrenamientos.",
    },
    {
      id: "gs-2",
      moduleId: "grid-search",
      question: "¿Por qué Grid Search usa Cross-Validation internamente?",
      options: [
        { label: "Para hacerlo más lento y seguro", value: "a" },
        { label: "Para obtener una estimación robusta de cada combinación sin depender de un solo split", value: "b" },
        { label: "Porque sin CV no puede funcionar", value: "c" },
        { label: "Para reducir el número de combinaciones", value: "d" },
      ],
      correctAnswer: "b",
      explanation: "Sin CV, una combinación podría parecer la mejor solo porque tuvo suerte con un split particular. Con CV, cada combinación se evalúa K veces, dando una media y desviación estándar confiables.",
    },
    {
      id: "gs-3",
      moduleId: "grid-search",
      question: "¿Cuál es la principal desventaja de Grid Search?",
      options: [
        { label: "No encuentra buenos hiperparámetros", value: "a" },
        { label: "El costo computacional crece exponencialmente con el número de hiperparámetros", value: "b" },
        { label: "Solo funciona con árboles de decisión", value: "c" },
        { label: "Requiere datos etiquetados", value: "d" },
      ],
      correctAnswer: "b",
      explanation: "Con 3 hiperparámetros de 10 valores cada uno = 1000 combinaciones × K folds. El costo crece exponencialmente, por eso para muchos hiperparámetros se prefiere Random Search o Bayesian Optimization.",
    },
  ],
  overfitting: [
    {
      id: "o-1",
      moduleId: "overfitting",
      question:
        "¿Cual es la señal clasica del sobre-ajuste?",
      options: [
        { label: "Error alto en entrenamiento y prueba", value: "a" },
        { label: "Error bajo en entrenamiento y bajo en prueba", value: "b" },
        {
          label: "Error bajo en entrenamiento pero alto en prueba",
          value: "c",
        },
        { label: "Error alto en entrenamiento y bajo en prueba", value: "d" },
      ],
      correctAnswer: "c",
      explanation:
        "Sobre-ajuste = el modelo memoriza los datos de entrenamiento (error bajo) pero no generaliza a datos nuevos (error alto en prueba). La brecha entre ambos errores es la señal de alarma.",
    },
    {
      id: "o-2",
      moduleId: "overfitting",
      question:
        "¿Como se relaciona la complejidad del modelo con el sobre-ajuste?",
      options: [
        { label: "Mas complejidad siempre reduce el sobre-ajuste", value: "a" },
        {
          label: "Mas complejidad permite memorizar ruido, aumentando el sobre-ajuste",
          value: "b",
        },
        { label: "La complejidad no tiene relacion con el sobre-ajuste", value: "c" },
        { label: "Menos complejidad siempre causa sobre-ajuste", value: "d" },
      ],
      correctAnswer: "b",
      explanation:
        "Un modelo mas complejo (ej. polinomio de grado alto) tiene la capacidad de memorizar cada punto incluyendo el ruido. Esto es sobre-ajuste: capturar patrones que no existen en la poblacion general.",
    },
    {
      id: "o-3",
      moduleId: "overfitting",
      question:
        "¿Que estrategia ayuda a combatir el sobre-ajuste?",
      options: [
        { label: "Aumentar el grado del polinomio", value: "a" },
        { label: "Reducir el tamaño del dataset", value: "b" },
        {
          label: "Usar mas datos de entrenamiento y/o regularizacion",
          value: "c",
        },
        { label: "Eliminar la validacion del modelo", value: "d" },
      ],
      correctAnswer: "c",
      explanation:
        "Mas datos hacen mas dificil memorizar. La regularizacion penaliza la complejidad excesiva. Ambas estrategias fuerzan al modelo a capturar patrones reales en vez de ruido.",
    },
  ],
}
