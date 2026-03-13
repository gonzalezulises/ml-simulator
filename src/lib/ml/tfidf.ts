const STOP_WORDS_ES = new Set([
  "de", "la", "que", "el", "en", "y", "a", "los", "del", "se", "las", "por",
  "un", "para", "con", "no", "una", "su", "al", "lo", "como", "más", "pero",
  "sus", "le", "ya", "o", "este", "sí", "porque", "esta", "entre", "cuando",
  "muy", "sin", "sobre", "también", "me", "hasta", "hay", "donde", "quien",
  "desde", "todo", "nos", "durante", "todos", "uno", "les", "ni", "contra",
  "otros", "ese", "eso", "ante", "ellos", "e", "esto", "mí", "antes",
  "algunos", "qué", "unos", "yo", "otro", "otras", "otra", "él", "tanto",
  "esa", "estos", "mucho", "quienes", "nada", "muchos", "cual", "poco",
  "ella", "estar", "estas", "algunas", "algo", "nosotros", "mi", "mis",
  "tú", "te", "ti", "tu", "tus", "ellas", "nosotras", "vosotros", "vosotras",
  "os", "mío", "mía", "míos", "mías", "tuyo", "tuya", "tuyos", "tuyas",
  "suyo", "suya", "suyos", "suyas", "nuestro", "nuestra", "nuestros",
  "nuestras", "vuestro", "vuestra", "vuestros", "vuestras", "esos", "esas",
  "estoy", "estás", "está", "estamos", "estáis", "están", "esté", "estés",
  "estemos", "estéis", "estén", "estaré", "estarás", "estará", "estaremos",
  "estaréis", "estarán", "estaría", "estarías", "estaríamos", "estaríais",
  "estarían", "estaba", "estabas", "estábamos", "estabais", "estaban",
  "es", "son", "fue", "ser", "ha", "han", "sido", "tiene", "tienen",
])

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\wáéíóúüñ\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS_ES.has(w))
}

export function tf(term: string, doc: string[]): number {
  const count = doc.filter((w) => w === term).length
  return doc.length === 0 ? 0 : count / doc.length
}

export function idf(term: string, docs: string[][]): number {
  const docsContaining = docs.filter((doc) => doc.includes(term)).length
  if (docsContaining === 0) return 0
  return Math.log(docs.length / docsContaining)
}

export function tfidf(term: string, doc: string[], docs: string[][]): number {
  return tf(term, doc) * idf(term, docs)
}

export function getVocabulary(docs: string[][]): string[] {
  const vocab = new Set<string>()
  for (const doc of docs) {
    for (const word of doc) vocab.add(word)
  }
  return [...vocab].sort()
}

export function computeAllTFIDF(docs: string[][]): {
  vocab: string[]
  matrix: number[][]
  tfMatrix: number[][]
  idfValues: number[]
} {
  const vocab = getVocabulary(docs)
  const idfValues = vocab.map((term) => idf(term, docs))
  const tfMatrix = docs.map((doc) => vocab.map((term) => tf(term, doc)))
  const matrix = docs.map((doc) => vocab.map((term) => tfidf(term, doc, docs)))
  return { vocab, matrix, tfMatrix, idfValues }
}
