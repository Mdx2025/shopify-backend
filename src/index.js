require('dotenv').config()
const express = require('express')
const cors = require('cors')
const productsRouter = require('./modules/products')
const cartRouter = require('./modules/cart')
const searchRouter = require('./modules/search')
const formsRouter = require('./modules/forms')
const blogRouter = require('./modules/blog')
const supportRouter = require('./modules/support')

const app = express()
const PORT = process.env.PORT || 3333

// Middleware
app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }))

// Routes
app.use('/api/products', productsRouter)
app.use('/api/cart', cartRouter)
app.use('/api/search', searchRouter)
app.use('/api', formsRouter)
app.use('/api/blog', blogRouter)
app.use('/api/support', supportRouter)

// Error handler
app.use((err, req, res, next) => {
  console.error('[Error]', err.message)
  res.status(500).json({
    ok: false,
    error: { code: 'SERVER_ERROR', message: err.message }
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
