const express = require('express')
const { shopifyMutate, buildShopifyHeaders } = require('../shopify/helpers/shopify_client')

const CART_CREATE = `mutation cartCreate($input: CartInput!) { cartCreate(input: $input) { cart { id checkoutUrl totalQuantity cost { totalAmount { amount currencyCode } } lines(first: 100) { edges { node { id quantity merchandise { ... on ProductVariant { id title price { amount currencyCode } product { id title handle } } } } } } } userErrors { field message } } }`

const CART_ADD = `mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) { cartLinesAdd(cartId: $cartId, lines: $lines) { cart { id checkoutUrl totalQuantity } userErrors { field message } } }`

const CART_UPDATE = `mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) { cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { id checkoutUrl totalQuantity } userErrors { field message } } }`

const CART_REMOVE = `mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) { cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { id } userErrors { field message } } }`

const router = express.Router()

// POST /api/cart
router.post('/', async (req, res) => {
  try {
    const items = req.body.items || []
    if (!items.length) return res.status(400).json({ ok: false, error: { code: 'EMPTY', message: 'Items required' } })

    const lines = items.map(i => ({ merchandiseId: i.variantId || i.productId, quantity: i.quantity }))
    const headers = buildShopifyHeaders(req.header('X-Forwarded-For') || req.ip())
    const data = await shopifyMutate(CART_CREATE, { input: { lines } }, headers)

    if (data.cartCreate.userErrors?.length) {
      return res.status(400).json({ ok: false, error: { code: 'CART_ERROR', message: data.cartCreate.userErrors[0].message } })
    }

    res.json({ ok: true, data: data.cartCreate.cart })
  } catch (err) {
    res.status(500).json({ ok: false, error: { code: 'CART_CREATE_ERROR', message: err.message } })
  }
})

// POST /api/cart/:cartId/items
router.post('/:cartId/items', async (req, res) => {
  try {
    const { cartId } = req.params
    const items = req.body.items || []
    const lines = items.map(i => ({ merchandiseId: i.variantId || i.productId, quantity: i.quantity }))
    const headers = buildShopifyHeaders(req.ip())
    const data = await shopifyMutate(CART_ADD, { cartId, lines }, headers)

    if (data.cartLinesAdd.userErrors?.length) {
      return res.status(400).json({ ok: false, error: { code: 'ADD_ERROR', message: data.cartLinesAdd.userErrors[0].message } })
    }

    res.json({ ok: true, data: data.cartLinesAdd.cart })
  } catch (err) {
    res.status(500).json({ ok: false, error: { code: 'ADD_ERROR', message: err.message } })
  }
})

// PATCH /api/cart/:cartId
router.patch('/:cartId', async (req, res) => {
  try {
    const { cartId } = req.params
    const items = req.body.items || []
    const lines = items.map(i => ({ id: i.lineId, quantity: i.quantity }))
    const data = await shopifyMutate(CART_UPDATE, { cartId, lines })

    if (data.cartLinesUpdate.userErrors?.length) {
      return res.status(400).json({ ok: false, error: { code: 'UPDATE_ERROR', message: data.cartLinesUpdate.userErrors[0].message } })
    }

    res.json({ ok: true, data: data.cartLinesUpdate.cart })
  } catch (err) {
    res.status(500).json({ ok: false, error: { code: 'UPDATE_ERROR', message: err.message } })
  }
})

// DELETE /api/cart/:cartId/items/:lineId
router.delete('/:cartId/items/:lineId', async (req, res) => {
  try {
    const { cartId, lineId } = req.params
    const data = await shopifyMutate(CART_REMOVE, { cartId, lineIds: [lineId] })

    if (data.cartLinesRemove.userErrors?.length) {
      return res.status(400).json({ ok: false, error: { code: 'REMOVE_ERROR', message: data.cartLinesRemove.userErrors[0].message } })
    }

    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ ok: false, error: { code: 'REMOVE_ERROR', message: err.message } })
  }
})

module.exports = router
