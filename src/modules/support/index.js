const express = require('express')
const router = express.Router()

const articles = [
  { id: '1', slug: 'reset-password', title: 'How to Reset Your Password', excerpt: 'Step-by-step guide...', category: 'account', tags: ['password', 'reset'], updatedAt: '2024-01-15T10:00:00Z' },
  { id: '2', slug: 'billing-faq', title: 'Billing and Payments FAQ', excerpt: 'Common questions...', category: 'billing', tags: ['billing', 'payment'], updatedAt: '2024-01-10T10:00:00Z' },
  { id: '3', slug: 'api-guide', title: 'API Integration Guide', excerpt: 'Technical guide...', category: 'technical', tags: ['api', 'integration'], updatedAt: '2024-01-05T10:00:00Z' },
  { id: '4', slug: 'troubleshooting', title: 'Troubleshooting Common Errors', excerpt: 'Solutions for errors...', category: 'technical', tags: ['error', 'debugging'], updatedAt: '2024-01-01T10:00:00Z' }
]

router.get('/', (req, res) => {
  const q = (req.query.q || '').toLowerCase()
  const category = req.query.category || ''
  const limit = Math.min(parseInt(req.query.limit) || 20, 50)

  let items = articles
  if (q) items = items.filter(a => a.title.toLowerCase().includes(q) || a.tags.some(t => t.includes(q)))
  if (category) items = items.filter(a => a.category === category)

  res.json({ ok: true, data: { items: items.slice(0, limit), total: items.length } })
})

router.get('/:slug', (req, res) => {
  const article = articles.find(a => a.slug === req.params.slug)
  if (!article) return res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Article not found' } })
  res.json({ ok: true, data: article })
})

module.exports = router
