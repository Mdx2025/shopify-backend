const { createStorefrontApiClient } = require('@shopify/storefront-api-client')

let client = null

function initShopifyClient() {
  const storeDomain = process.env.SHOP_DOMAIN
  const accessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN
  const apiVersion = process.env.SHOPIFY_API_VERSION || '2026-01'

  if (!storeDomain || !accessToken) {
    throw new Error('SHOP_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN are required')
  }

  client = createStorefrontApiClient({
    storeDomain,
    apiVersion,
    publicAccessToken: accessToken,
  })

  return client
}

function getShopifyClient() {
  if (!client) return initShopifyClient()
  return client
}

async function shopifyQuery(query, variables = {}, customHeaders = {}) {
  const shopifyClient = getShopifyClient()
  const headers = { 'Content-Type': 'application/json', ...customHeaders }

  let lastError = null
  const maxRetries = 3
  const baseDelay = 1000

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await shopifyClient.request(query, variables, headers)
      
      if (response.errors) {
        const msg = response.errors.map(e => e.message).join(', ')
        throw new Error(`Shopify GraphQL Error: ${msg}`)
      }

      return response.data
    } catch (error) {
      lastError = error
      const shouldRetry = error.status === 429 || error.status === 430 || (error.status >= 500 && error.status < 600)
      
      if (!shouldRetry || attempt === maxRetries - 1) throw error
      
      const delay = baseDelay * Math.pow(2, attempt)
      console.log(`[Shopify] Retry ${attempt + 1}/${maxRetries} after ${delay}ms`)
      await new Promise(r => setTimeout(r, delay))
    }
  }
  throw lastError
}

function shopifyMutate(mutation, variables, customHeaders) {
  return shopifyQuery(mutation, variables, customHeaders)
}

function buildShopifyHeaders(requestIp) {
  const headers = {}
  if (requestIp) headers['Shopify-Storefront-Buyer-IP'] = requestIp
  return headers
}

module.exports = { initShopifyClient, getShopifyClient, shopifyQuery, shopifyMutate, buildShopifyHeaders }
