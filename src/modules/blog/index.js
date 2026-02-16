const express = require('express')
const router = express.Router()

const posts = [
  { id: '1', slug: 'getting-started', title: 'Getting Started', excerpt: 'Learn how to set up...', image: { url: 'https://placehold.co/800x400', altText: 'Getting started' }, author: 'Team', publishedAt: '2024-01-15T10:00:00Z', category: 'tutorials' },
  { id: '2', slug: 'product-updates', title: 'Product Updates - Jan 2024', excerpt: 'Latest features...', image: { url: 'https://placehold.co/800x400', altText: 'Updates' }, author: 'Team', publishedAt: '2024-01-10T10:00:00Z', category: 'updates' },
  { id: '3', slug: 'api-integration', title: 'API Integration Guide', excerpt: 'Technical guide...', image: { url: 'https://placehold.co/800x400', altText: 'API' }, author: 'Engineering', publishedAt: '2024-01-05T10:00:00Z', category: 'technical' }
]

router.get('/', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 12, 50)
  const page = parseInt(req.query.page) || 1
  const start = (page - 1) * limit
  res.json({ ok: true, data: { items: posts.slice(start, start + limit), pagination: { page, limit, total: posts.length } } })
})

router.get('/:slug', (req, res) => {
  const post = posts.find(p => p.slug === req.params.slug)
  if (!post) return res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Post not found' } })
  res.json({ ok: true, data: post })
})

module.exports = router
