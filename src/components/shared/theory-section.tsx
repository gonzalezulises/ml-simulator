import { ReactNode } from "react"
import { Badge } from "@/components/ui/badge"

export function TheorySection({
  title,
  concepts,
  children,
}: {
  title: string
  concepts?: string[]
  children: ReactNode
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {concepts && concepts.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {concepts.map((c) => (
              <Badge key={c} variant="secondary">
                {c}
              </Badge>
            ))}
          </div>
        )}
      </div>
      <div className="prose prose-zinc max-w-none dark:prose-invert text-muted-foreground leading-relaxed">
        {children}
      </div>
    </section>
  )
}
