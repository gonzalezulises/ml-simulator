import { AlertTriangle, Eye, ShieldAlert, Lightbulb } from "lucide-react"

const calloutConfig = {
  overfitting: {
    icon: AlertTriangle,
    title: "Riesgo de Sobre-ajuste",
    color: "ml-coral",
    borderClass: "border-ml-coral/30",
    bgClass: "bg-ml-coral/5",
    iconClass: "text-ml-coral",
  },
  interpretability: {
    icon: Eye,
    title: "Interpretabilidad",
    color: "ml-blue",
    borderClass: "border-ml-blue/30",
    bgClass: "bg-ml-blue/5",
    iconClass: "text-ml-blue",
  },
  leakage: {
    icon: ShieldAlert,
    title: "Data Leakage",
    color: "ml-purple",
    borderClass: "border-ml-purple/30",
    bgClass: "bg-ml-purple/5",
    iconClass: "text-ml-purple",
  },
  "no-perfect-model": {
    icon: Lightbulb,
    title: "No existe el modelo perfecto",
    color: "ml-amber",
    borderClass: "border-ml-amber/30",
    bgClass: "bg-ml-amber/5",
    iconClass: "text-ml-amber",
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
    <div className={`rounded-lg border ${config.borderClass} ${config.bgClass} p-5`}>
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${config.iconClass}`} />
        <div className="space-y-1">
          <p className={`font-mono text-[13px] font-medium ${config.iconClass}`}>
            {config.title}
          </p>
          <div className="text-sm text-[#888892] leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
