import { weeks } from "@/lib/content/weeks"
import { ModuleClient } from "./module-client"

export function generateStaticParams() {
  return weeks.flatMap((w) =>
    w.modules.map((m) => ({ week: String(w.id), module: m.slug }))
  )
}

export default async function ModulePage({
  params,
}: {
  params: Promise<{ week: string; module: string }>
}) {
  const { week, module: moduleSlug } = await params
  return <ModuleClient weekId={parseInt(week)} moduleSlug={moduleSlug} />
}
