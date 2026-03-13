# ML Simulator

Simulador interactivo de Machine Learning para aprender conceptos fundamentales de ciencia de datos.

## Descripción

Herramienta educativa web que cubre un curso de 3 semanas de Machine Learning. Cada módulo combina:

- **Teoría**: Explicaciones claras de los conceptos clave
- **Simulación interactiva**: Ajusta parámetros y observa en tiempo real cómo cambian los modelos
- **Quiz**: Preguntas para verificar tu comprensión

## Temas cubiertos

### Semana 1: Fundamentos
- El costo de los datos supervisados
- El perceptrón y su algoritmo de aprendizaje
- Hiperplano, frontera de decisión y margen
- La bendición de la dimensionalidad
- Sobre-ajuste vs sub-ajuste

### Semana 2: Árboles e Interpretabilidad
- Trade-off interpretabilidad vs desempeño
- Entropía y selección de features
- Random Forest y ensambles
- Umbrales de decisión y matrices de confusión
- Curva ROC y AUC

### Semana 3: Regresión Logística y NLP
- Vectorización TF-IDF
- Probabilidad, odds y la curva sigmoide
- Regularización Ridge (L2)
- Validación cruzada (K-Fold)
- Grid Search de hiperparámetros

## Stack tecnológico

- [Next.js 15](https://nextjs.org/) (App Router, TypeScript)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [recharts](https://recharts.org/)
- [framer-motion](https://motion.dev/)

## Desarrollo local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Deploy

El proyecto está configurado para desplegarse en [Vercel](https://vercel.com/).

```bash
npm run build
```
