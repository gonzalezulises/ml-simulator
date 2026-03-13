import { WeekClient } from "./week-client"

export function generateStaticParams() {
  return [{ week: "1" }, { week: "2" }, { week: "3" }]
}

export default async function WeekPage({ params }: { params: Promise<{ week: string }> }) {
  const { week } = await params
  return <WeekClient weekId={parseInt(week)} />
}
