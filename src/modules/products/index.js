const express = require('express')
const { shopifyQuery } = require('../shopify/helpers/shopify_client')

const PRODUCTS_QUERY = `
  query getProducts($first: Int!, $query: String, $sortKey: ProductSortKeys, $reverse: Boolean) {
    products(first: $first, query: $query, sortKey: $sortKey, reverse: $reverse) {
      edges {
        node {
          id handle title description
          priceRange { minVariantPrice { amount currencyCode } }
          compareAtPriceRange { minVariantPrice { amount currencyCode } }
          images(first: 1) { edges { node { url altText } } }
          availableForSale tags vendor productType
        }
        cursor
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`

const PRODUCT_BY_HANDLE_QUERY = `
  query getProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id handle title description descriptionHtml
      priceRange { minVariantPrice { amount currencyCode } maxVariantPrice { amount currencyCode } }
      images(first: 10) { edges { node { url altText } } }
      availableForSale tags vendor productType variants(first: 50) {
        edges { node { id title availableForSale price { amount currencyCode } selectedOptions { name value } } }
      }
    }
  }
`

const router = express.Router()

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 24, 100)
    const query = req.query.q || ''
    const sort = req.query.sort || 'CREATED_AT'

    const data = await shopifyQuery(PRODUCTS_QUERY, {
      first: limit,
      query: query || undefined,
      sortKey: sort,
      reverse: sort === 'CREATED_AT'
    })

    const products = data.products.edges.map(e => ({
      id: e.node.id,
      handle: e.node.handle,
      title: e.node.title,
      price: e.node.priceRange.minVariantPrice,
      image: e.node.images.edges[0]?.node,
      available: e.node.availableForSale
    }))

    res.json({ ok: true, data: { items: products, pagination: { page: 1, limit, total: products.length } } })
  } catch (err) {
    res.status(500).json({ ok: false, error: { code: 'PRODUCTS_FETCH_ERROR', message: err.message } })
  }
})

// GET /api/products/:handle
router.get('/:handle', async (req, res) => {
  try {
    const { handle } = req.params
    const data = await shopifyQuery(PRODUCT_BY_HANDLE_QUERY, { handle })

    if (!data.productByHandle) {
      return res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Product not found' } })
    }

    res.json({ ok: true, data: data.productByHandle })
  } catch (err) {
    res.status(500).json({ ok: false, error: { code: 'PRODUCT_FETCH_ERROR', message: err.message } })
  }
})

module.exports = router
