import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const assistSchema = z.object({
  prompt: z.string().trim().min(2).max(400),
  domain: z.string().trim().optional(),
  limit: z.number().int().min(1).max(20).optional(),
})

const stopWords = new Set([
  'the', 'and', 'for', 'with', 'from', 'that', 'this', 'want', 'learn', 'help', 'about',
  'into', 'your', 'you', 'can', 'how', 'what', 'where', 'when', 'which', 'a', 'an', 'to', 'of',
  'please', 'need', 'im', 'i', 'me', 'my'
])

const tokenAliases: Record<string, string[]> = {
  fr: ['french', 'francais'],
  js: ['javascript', 'frontend'],
  py: ['python'],
  ml: ['machine', 'learning', 'ai'],
  ui: ['design', 'ux'],
  ux: ['design', 'ui'],
}

const domainHints: Record<string, string[]> = {
  programming: ['code', 'coding', 'programming', 'software', 'developer', 'javascript', 'python', 'java', 'c++', 'html', 'css', 'backend', 'frontend', 'typescript', 'php', 'swift', 'kotlin'],
  cooking: ['cook', 'cooking', 'recipe', 'kitchen', 'meal', 'food', 'italian', 'french', 'chinese', 'indian', 'japanese', 'korean'],
  languages: ['language', 'speak', 'speaking', 'spanish', 'french', 'german', 'english', 'korean', 'japanese', 'mandarin', 'italian', 'russian', 'arabic'],
  fitness: ['fitness', 'workout', 'exercise', 'strength', 'cardio', 'mobility', 'yoga', 'health', 'calisthenics', 'running'],
  school: ['school', 'math', 'algebra', 'precalculus', 'calculus', 'science', 'history', 'writing', 'physics', 'chemistry', 'biology', 'economics'],
  'data-ai': ['data', 'ai', 'machine', 'learning', 'analysis', 'sql', 'ml', 'prompt'],
  business: ['business', 'startup', 'finance', 'entrepreneur', 'marketing', 'strategy'],
  design: ['design', 'ui', 'ux', 'typography', 'layout', 'wireframe', 'color', 'accessibility'],
  cybersecurity: ['security', 'cyber', 'owasp', 'secure', 'threat', 'auth', 'vulnerability'],
  productivity: ['productivity', 'planning', 'workflow', 'communication', 'presentation', 'focus'],
  music: ['music', 'guitar', 'piano', 'theory', 'rhythm', 'chords'],
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function tokenize(text: string) {
  return normalizeText(text)
    .split(/[^a-z0-9+#.]+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 1 && !stopWords.has(w))
}

function expandTokens(tokens: string[]) {
  const expanded = new Set(tokens)
  for (const token of tokens) {
    const aliases = tokenAliases[token]
    if (!aliases) continue
    for (const alias of aliases) expanded.add(alias)
  }
  return [...expanded]
}

function levenshteinDistance(a: string, b: string) {
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length

  const prev = new Array(b.length + 1)
  const curr = new Array(b.length + 1)
  for (let j = 0; j <= b.length; j += 1) prev[j] = j

  for (let i = 1; i <= a.length; i += 1) {
    curr[0] = i
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost)
    }
    for (let j = 0; j <= b.length; j += 1) prev[j] = curr[j]
  }

  return prev[b.length]
}

function detectDomain(tokens: string[]) {
  let bestDomain = ''
  let bestScore = 0

  for (const [domain, hints] of Object.entries(domainHints)) {
    const score = tokens.reduce((acc, token) => (
      acc + (hints.some((hint) => hint.includes(token) || token.includes(hint)) ? 1 : 0)
    ), 0)

    if (score > bestScore) {
      bestScore = score
      bestDomain = domain
    }
  }

  return bestScore > 0 ? bestDomain : undefined
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = assistSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const { prompt, domain, limit = 12 } = parsed.data
    const tokens = tokenize(prompt)
    const expandedTokens = expandTokens(tokens)
    const inferredDomain = domain && domain !== 'all' ? domain : detectDomain(expandedTokens)

    const baseActivities = await prisma.activity.findMany({
      where: inferredDomain
        ? { domain: { slug: inferredDomain } }
        : undefined,
      include: {
        domain: true,
        category: true,
      },
      take: 500,
      orderBy: [
        { order: 'asc' },
        { difficulty: 'asc' },
        { title: 'asc' },
      ],
    })

    const scored = baseActivities
      .map((activity) => {
        const title = normalizeText(activity.title)
        const description = normalizeText(activity.description || '')
        const domainName = normalizeText(activity.domain?.name || '')
        const category = normalizeText(activity.category?.name || '')
        const tags = (activity.tags || []).map((t) => normalizeText(t))
        const blob = `${title} ${description} ${domainName} ${category} ${tags.join(' ')}`
        const blobTokens = blob.split(/[^a-z0-9+#.]+/).filter(Boolean)

        let score = 0
        for (const token of expandedTokens) {
          if (title.startsWith(token)) score += 6
          if (title.includes(token)) score += 5
          if (description.includes(token)) score += 3
          if (domainName.includes(token)) score += 3
          if (category.includes(token)) score += 3
          if (tags.some((tag) => tag.includes(token))) score += 4

          const closeToken = blobTokens.some((item) => {
            if (Math.abs(item.length - token.length) > 2) return false
            return token.length >= 4 && levenshteinDistance(item, token) <= 1
          })
          if (closeToken) score += 2
        }

        return { activity, score }
      })
      .filter((row) => row.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((row) => row.activity)

    const fallback = scored.length > 0
      ? scored
      : baseActivities.slice(0, limit)

    const suggestions = expandedTokens.slice(0, 5)
    const nextPrompts = inferredDomain
      ? [
          `Beginner ${inferredDomain} roadmap`,
          `${inferredDomain} practice plan for 4 weeks`,
          `${inferredDomain} projects for beginners`,
        ]
      : [
          'Beginner roadmap for my goal',
          '4-week plan for this subject',
          'Best beginner topics to start with',
        ]

    return NextResponse.json({
      activities: fallback,
      suggestedDomain: inferredDomain || null,
      suggestedQuery: suggestions.join(' '),
      suggestions,
      nextPrompts,
      message: scored.length > 0
        ? 'Here are the best matches for your goal.'
        : 'I could not find a direct match, so I picked the closest topics to help you start.',
    })
  } catch (error) {
    console.error('Assist search error:', error)
    return NextResponse.json({ error: 'Failed to assist search' }, { status: 500 })
  }
}
