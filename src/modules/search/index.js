const express = require('express')
const { shopifyQuery } = require('../shopify/helpers/shopify_client')

const SEARCH_QUERY = `
  query searchProducts($query: String!, $first: Int!) {
    products(first: $first, query: $query) {
      edges { node { id handle title description priceRange { minVariantPrice { amount currencyCode } } images(first: 1) { edges { node { url altText } } } } }
    }
  }
`

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const q = req.query.q || ''
    const limit = Math.min(parseInt(req.query.limit) || 10, 50)

    if (q.length < 2) return res.status(400).json({ ok: false, error: { code: 'INVALID_QUERY', message: 'Min 2 chars' } })

    const data = await shopifyQuery(SEARCH_QUERY, { query: q, first: limit })
    const hits = data.products.edges.map(e => ({
      type: 'product',
      id: e.node.id,
      title: e.node.title,
      slug: e.node.handle,
      image: e.node.images.edges[0]?.node
    }))

    res.json({ ok: true, data: { hits, total: hits.length } })
  } catch (err) {
    res.status(500).json({ ok: false, error: { code: 'SEARCH_ERROR', message: err.message } })
  }
})

module.exports = router
