import { ReactNode } from "react"

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
    <section className="space-y-5">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.08em] text-[#484852] mb-2">
          conceptos clave
        </p>
        <h2 className="text-xl font-medium tracking-tight">{title}</h2>
      </div>
      {concepts && concepts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {concepts.map((c) => (
            <span
              key={c}
              className="inline-block font-mono text-xs px-3 py-1.5 rounded bg-[#1e1e24] border border-[rgba(255,255,255,0.07)] text-[#888892]"
            >
              {c}
            </span>
          ))}
        </div>
      )}
      <div className="text-[15px] text-[#888892] leading-[1.8] space-y-3 [&_strong]:text-foreground [&_strong]:font-medium [&_code]:font-mono [&_code]:text-ml-green [&_code]:text-sm [&_code]:bg-[#1e1e24] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_ul]:space-y-2 [&_ul]:list-none [&_ul]:pl-0 [&_li]:before:content-['→'] [&_li]:before:text-[#484852] [&_li]:before:mr-2 [&_em]:text-ml-amber [&_em]:not-italic">
        {children}
      </div>
    </section>
  )
}
