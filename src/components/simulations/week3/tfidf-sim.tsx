"use client"

import { useState, useMemo, useCallback } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { SimulationCard } from "@/components/shared/simulation-card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { tokenize, computeAllTFIDF } from "@/lib/ml/tfidf"

const DEFAULT_DOCS = [
  `La inteligencia artificial y el aprendizaje automático están transformando la industria tecnológica. Los algoritmos de machine learning procesan grandes volúmenes de datos para encontrar patrones. Las redes neuronales profundas permiten resolver problemas complejos de clasificación y predicción. Python es el lenguaje más popular para ciencia de datos y análisis estadístico.`,
  `La receta de paella valenciana requiere arroz bomba, pollo, judías verdes y garrofón. El sofrito se prepara con tomate rallado y aceite de oliva. El caldo debe hervir antes de añadir el arroz. La cocción perfecta tarda dieciocho minutos a fuego fuerte. El socarrat es la capa crujiente de arroz del fondo.`,
  `El fútbol es el deporte más popular del mundo. Los equipos entrenan táctica y resistencia física cada semana. El portero defiende la portería con reflejos y agilidad. Los delanteros buscan anotar goles con disparos precisos. La Champions League reúne a los mejores clubes europeos cada temporada.`,
]

type SortKey = "word" | "tf0" | "tf1" | "tf2" | "idf" | "tfidf0" | "tfidf1" | "tfidf2"

export function TfidfSim() {
  const [docs, setDocs] = useState(DEFAULT_DOCS)
  const [selectedWord, setSelectedWord] = useState("")
  const [viewMode, setViewMode] = useState<"tfidf" | "tf" | "idf">("tfidf")
  const [sortKey, setSortKey] = useState<SortKey>("tfidf0")
  const [sortAsc, setSortAsc] = useState(false)

  const tokenizedDocs = useMemo(() => docs.map((d) => tokenize(d)), [docs])

  const computed = useMemo(() => computeAllTFIDF(tokenizedDocs), [tokenizedDocs])

  const tableData = useMemo(() => {
    const rows = computed.vocab.map((word, i) => ({
      word,
      tf0: computed.tfMatrix[0][i],
      tf1: computed.tfMatrix[1][i],
      tf2: computed.tfMatrix[2][i],
      idf: computed.idfValues[i],
      tfidf0: computed.matrix[0][i],
      tfidf1: computed.matrix[1][i],
      tfidf2: computed.matrix[2][i],
    }))

    rows.sort((a, b) => {
      const va = a[sortKey]
      const vb = b[sortKey]
      if (typeof va === "string" && typeof vb === "string") {
        return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va)
      }
      return sortAsc ? (va as number) - (vb as number) : (vb as number) - (va as number)
    })

    return rows.slice(0, 15)
  }, [computed, sortKey, sortAsc])

  const chartData = useMemo(() => {
    const top = [...tableData].slice(0, 10)
    if (viewMode === "tf") {
      return top.map((r) => ({
        word: r.word,
        "Doc 1": r.tf0,
        "Doc 2": r.tf1,
        "Doc 3": r.tf2,
        IDF: 0,
      }))
    }
    if (viewMode === "idf") {
      return top.map((r) => ({
        word: r.word,
        "Doc 1": 0,
        "Doc 2": 0,
        "Doc 3": 0,
        IDF: r.idf,
      }))
    }
    return top.map((r) => ({
      word: r.word,
      "Doc 1": r.tfidf0,
      "Doc 2": r.tfidf1,
      "Doc 3": r.tfidf2,
      IDF: 0,
    }))
  }, [tableData, viewMode])

  const handleSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) {
        setSortAsc(!sortAsc)
      } else {
        setSortKey(key)
        setSortAsc(false)
      }
    },
    [sortKey, sortAsc]
  )

  const highlightWord = useCallback(
    (text: string, word: string) => {
      if (!word) return text
      const regex = new RegExp(`(${word})`, "gi")
      const parts = text.split(regex)
      return parts.map((part, i) =>
        part.toLowerCase() === word.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">
            {part}
          </mark>
        ) : (
          part
        )
      )
    },
    []
  )

  const SortHeader = ({ label, k }: { label: string; k: SortKey }) => (
    <th
      className="px-2 py-1.5 text-left text-xs font-medium cursor-pointer hover:bg-muted/50 whitespace-nowrap"
      onClick={() => handleSort(k)}
    >
      {label} {sortKey === k ? (sortAsc ? "▲" : "▼") : ""}
    </th>
  )

  const docLabels = ["Tecnología", "Cocina", "Deportes"]

  return (
    <SimulationCard
      title="Visualizador TF-IDF"
      description="Explora cómo TF-IDF pondera la importancia de palabras en documentos"
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {docs.map((doc, i) => (
            <div key={i} className="space-y-1">
              <label className="text-sm font-medium">
                Documento {i + 1}: {docLabels[i]}
              </label>
              <div className="rounded-md border p-2 text-sm min-h-[120px] max-h-[160px] overflow-y-auto leading-relaxed">
                {highlightWord(doc, selectedWord)}
              </div>
              <textarea
                className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-none"
                rows={4}
                value={doc}
                onChange={(e) => {
                  const next = [...docs]
                  next[i] = e.target.value
                  setDocs(next)
                }}
              />
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Buscar palabra:</label>
            <input
              type="text"
              className="rounded-md border bg-background px-3 py-1.5 text-sm w-40"
              placeholder="ej: arroz"
              value={selectedWord}
              onChange={(e) => setSelectedWord(e.target.value.toLowerCase().trim())}
            />
          </div>
          {selectedWord && computed.vocab.includes(selectedWord) && (
            <Badge variant="secondary">
              IDF({selectedWord}) = {computed.idfValues[computed.vocab.indexOf(selectedWord)].toFixed(3)}
            </Badge>
          )}
        </div>

        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as typeof viewMode)}>
          <TabsList>
            <TabsTrigger value="tfidf">TF-IDF</TabsTrigger>
            <TabsTrigger value="tf">Solo TF</TabsTrigger>
            <TabsTrigger value="idf">Solo IDF</TabsTrigger>
          </TabsList>

          <TabsContent value={viewMode} className="space-y-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 60, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="word"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 11 }}
                />
                <YAxis tick={{ fontSize: 11 }} />
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <Tooltip
                  formatter={(value: any) => (typeof value === "number" ? value.toFixed(4) : value)}
                />
                {viewMode === "idf" ? (
                  <Bar dataKey="IDF" fill="var(--chart-1)" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={
                          entry.word === selectedWord
                            ? "var(--chart-4)"
                            : "var(--chart-1)"
                        }
                      />
                    ))}
                  </Bar>
                ) : (
                  <>
                    <Bar dataKey="Doc 1" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Doc 2" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Doc 3" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
                  </>
                )}
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>

        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <SortHeader label="Palabra" k="word" />
                <SortHeader label="TF(D1)" k="tf0" />
                <SortHeader label="TF(D2)" k="tf1" />
                <SortHeader label="TF(D3)" k="tf2" />
                <SortHeader label="IDF" k="idf" />
                <SortHeader label="TF-IDF(D1)" k="tfidf0" />
                <SortHeader label="TF-IDF(D2)" k="tfidf1" />
                <SortHeader label="TF-IDF(D3)" k="tfidf2" />
              </tr>
            </thead>
            <tbody>
              {tableData.map((row) => (
                <tr
                  key={row.word}
                  className={`border-t hover:bg-muted/30 ${
                    row.word === selectedWord
                      ? "bg-yellow-50 dark:bg-yellow-950/30"
                      : ""
                  }`}
                  onClick={() => setSelectedWord(row.word)}
                >
                  <td className="px-2 py-1.5 font-mono font-medium cursor-pointer">
                    {row.word}
                  </td>
                  <td className="px-2 py-1.5 font-mono text-xs">{row.tf0.toFixed(4)}</td>
                  <td className="px-2 py-1.5 font-mono text-xs">{row.tf1.toFixed(4)}</td>
                  <td className="px-2 py-1.5 font-mono text-xs">{row.tf2.toFixed(4)}</td>
                  <td className="px-2 py-1.5 font-mono text-xs font-semibold">
                    {row.idf.toFixed(4)}
                  </td>
                  <td className="px-2 py-1.5 font-mono text-xs">{row.tfidf0.toFixed(4)}</td>
                  <td className="px-2 py-1.5 font-mono text-xs">{row.tfidf1.toFixed(4)}</td>
                  <td className="px-2 py-1.5 font-mono text-xs">{row.tfidf2.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted-foreground">
          Las stop words en español se eliminan automáticamente. Haz clic en una fila para
          resaltar la palabra en los documentos. Las palabras únicas de un documento tienen
          IDF alto (log(3/1) = 1.099), las compartidas tienen IDF bajo.
        </p>
      </div>
    </SimulationCard>
  )
}
