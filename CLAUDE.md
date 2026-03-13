# ML Simulator

Simulador interactivo de Machine Learning — herramienta educativa web que cubre un curso de 3 semanas con simulaciones en tiempo real, teoría y quizzes.

## Tech Stack

- **Framework**: Next.js 15 (App Router, TypeScript, Tailwind CSS v4)
- **UI**: shadcn/ui (new-york style)
- **Charts**: recharts
- **Animations**: framer-motion
- **Auth**: Ninguna — público y abierto
- **Progreso**: localStorage

## Project Structure

- `src/app/` — App Router pages
- `src/app/semana/[week]/[module]/` — Dynamic module pages (theory + simulation + quiz)
- `src/components/ui/` — shadcn/ui components
- `src/components/layout/` — Site header, navigation
- `src/components/shared/` — Reusable components (TheorySection, SimulationCard, ParameterSlider, QuizSection, ConceptCallout)
- `src/components/simulations/week1|2|3/` — Interactive simulation components (15 total)
- `src/lib/ml/` — ML algorithms (perceptron, decision-tree, metrics, tfidf, data-generators)
- `src/lib/content/` — Course content (weeks metadata, quiz questions)
- `src/hooks/` — Custom hooks (useProgress for localStorage)
- `src/types/` — TypeScript types (content, ml, progress)

## Key Patterns

- All simulations are client components ("use client") that run ML computations in the browser
- No backend needed — all ML is pure TypeScript
- Shared components: SimulationCard wraps simulations, ParameterSlider for controls, QuizSection for quizzes
- Progress tracked in localStorage via useProgress hook
- Spanish UI throughout

## Modules

### Semana 1: Fundamentos
1. Costo de datos supervisados
2. Perceptrón
3. Hiperplano y margen
4. Bendición de la dimensión
5. Overfitting vs underfitting

### Semana 2: Árboles e Interpretabilidad
1. Interpretabilidad vs desempeño
2. Entropía y selección de features
3. Random Forest
4. Umbral de decisión
5. Curva ROC

### Semana 3: Regresión Logística y NLP
1. TF-IDF
2. Probabilidad y momios (odds)
3. Regularización Ridge (L2)
4. Validación cruzada (K-Fold)
5. Grid Search

## Development

```bash
npm run dev     # Dev server
npm run build   # Production build
```
