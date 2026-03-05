import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const searchParamsSchema = z.object({
  q: z.string().trim().optional().default(''),
  domain: z.union([z.literal(''), z.literal('all'), z.string().regex(/^[a-z0-9-]+$/)]).optional().default(''),
  limit: z.coerce.number().int().min(1).max(100).optional().default(24),
})

const aliasMap: Record<string, string[]> = {
  fr: ['french', 'francais', 'french cuisine', 'french language'],
  french: ['francais', 'french cuisine', 'french language', 'france'],
  js: ['javascript', 'web development'],
  py: ['python'],
  ai: ['machine learning', 'artificial intelligence', 'data'],
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
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
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + cost
      )
    }
    for (let j = 0; j <= b.length; j += 1) prev[j] = curr[j]
  }

  return prev[b.length]
}

function isSubsequence(needle: string, haystack: string) {
  if (!needle || !haystack) return false
  let i = 0
  for (let j = 0; j < haystack.length; j += 1) {
    if (needle[i] === haystack[j]) i += 1
    if (i === needle.length) return true
  }
  return false
}

function buildSearchTerms(query: string) {
  const normalizedQuery = normalizeText(query)
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean)
  const expanded = new Set(tokens)

  for (const token of tokens) {
    expanded.add(token)
    const aliases = aliasMap[token]
    if (aliases) {
      for (const alias of aliases) expanded.add(normalizeText(alias))
    }
  }

  return {
    normalizedQuery,
    tokens,
    expandedTerms: [...expanded],
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const parsedParams = searchParamsSchema.safeParse({
      q: searchParams.get('q') ?? undefined,
      domain: searchParams.get('domain') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
    })

    if (!parsedParams.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters' },
        { status: 400 }
      )
    }

    const { q: query, domain, limit } = parsedParams.data

    const where: Prisma.ActivityWhereInput = {}

    // Add domain filter if specified
    if (domain && domain !== 'all') {
      where.domain = { slug: domain }
    }

    const isSearchMode = query.length >= 1
    const searchTerms = isSearchMode ? buildSearchTerms(query) : null

    // Pull broader candidates for fuzzy matching in-memory.
    const rawActivities = await prisma.activity.findMany({
      where,
      include: {
        domain: true,
        category: true
      },
      take: isSearchMode ? Math.min(limit * 8, 500) : limit,
      orderBy: [
        { order: 'asc' },
        { difficulty: 'asc' },
        { title: 'asc' }
      ]
    })

    const activities = !isSearchMode
      ? rawActivities
      : rawActivities
          .map((activity) => {
            const { normalizedQuery, tokens, expandedTerms } = searchTerms!
            const title = normalizeText(activity.title)
            const description = normalizeText(activity.description || '')
            const domainName = normalizeText(activity.domain?.name || '')
            const categoryName = normalizeText(activity.category?.name || '')
            const tags = (activity.tags || []).map((tag) => normalizeText(tag))
            const textBlob = `${title} ${description} ${domainName} ${categoryName} ${tags.join(' ')}`
            const blobTokens = textBlob.split(/[^a-z0-9+.#-]+/).filter(Boolean)

            let score = 0

            if (title.startsWith(normalizedQuery)) score += 12
            if (title.includes(normalizedQuery)) score += 8
            if (categoryName.includes(normalizedQuery)) score += 7
            if (domainName.includes(normalizedQuery)) score += 6
            if (description.includes(normalizedQuery)) score += 4
            if (tags.some((tag) => tag.includes(normalizedQuery))) score += 8
            if (isSubsequence(normalizedQuery, title)) score += 3

            let matchedTokens = 0
            for (const token of tokens) {
              let tokenMatched = false
              if (title.includes(token)) score += 3
              if (title.includes(token)) tokenMatched = true
              if (categoryName.includes(token)) score += 2
              if (categoryName.includes(token)) tokenMatched = true
              if (domainName.includes(token)) score += 2
              if (domainName.includes(token)) tokenMatched = true
              if (tags.some((tag) => tag.includes(token))) {
                score += 3
                tokenMatched = true
              }
              if (description.includes(token)) tokenMatched = true
              if (tokenMatched) matchedTokens += 1
            }

            for (const term of expandedTerms) {
              if (!term) continue
              if (title.includes(term)) score += 4
              if (categoryName.includes(term)) score += 3
              if (domainName.includes(term)) score += 2
              if (description.includes(term)) score += 2
              if (tags.some((tag) => tag.includes(term))) score += 3
            }

            if (normalizedQuery.length >= 4) {
              const closeToken = blobTokens.some((token) => {
                if (Math.abs(token.length - normalizedQuery.length) > 2) return false
                return levenshteinDistance(token, normalizedQuery) <= 1
              })
              if (closeToken) score += 3
            }

            return { activity, score, matchedTokens, tokenCount: tokens.length }
          })
          .filter((row) => {
            if (row.score <= 0) return false
            if (row.tokenCount <= 1) return true
            // For multi-word queries, require that at least half the tokens match.
            return row.matchedTokens >= Math.ceil(row.tokenCount / 2)
          })
          .sort((a, b) => b.score - a.score)
          .map((row) => row.activity)
          .slice(0, limit)

    return NextResponse.json({ activities })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}
