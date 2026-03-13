import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Eye, ShieldAlert, Lightbulb } from "lucide-react"

const calloutConfig = {
  overfitting: {
    icon: AlertTriangle,
    title: "Riesgo de Sobre-ajuste",
    className: "border-orange-500/50 bg-orange-50 dark:bg-orange-950/20",
  },
  interpretability: {
    icon: Eye,
    title: "Interpretabilidad",
    className: "border-blue-500/50 bg-blue-50 dark:bg-blue-950/20",
  },
  leakage: {
    icon: ShieldAlert,
    title: "Data Leakage",
    className: "border-red-500/50 bg-red-50 dark:bg-red-950/20",
  },
  "no-perfect-model": {
    icon: Lightbulb,
    title: "No existe el modelo perfecto",
    className: "border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20",
  },
} as const

export function ConceptCallout({
  type,
  children,
}: {
  type: keyof typeof calloutConfig
  children: React.ReactNode
}) {
  const config = calloutConfig[type]
  const Icon = config.icon

  return (
    <Alert className={config.className}>
      <Icon className="h-4 w-4" />
      <AlertTitle>{config.title}</AlertTitle>
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  )
}
