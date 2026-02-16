const express = require('express')
const router = express.Router()

// Contact
router.post('/contact', (req, res) => {
  const { name, email, message, consent_to_privacy } = req.body
  const errors = []

  if (!name || name.length < 2) errors.push('Name required (min 2 chars)')
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Valid email required')
  if (!message) errors.push('Message required')
  if (!consent_to_privacy) errors.push('Privacy consent required')

  if (errors.length) return res.status(400).json({ ok: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: errors } })

  console.log('[Contact]', { name, email, message })
  res.json({ ok: true, data: { id: `contact_${Date.now()}`, message: 'Received' } })
})

// Demo request
router.post('/demo-request', (req, res) => {
  const { name, email, company, consent_to_privacy } = req.body
  const errors = []

  if (!name || name.length < 2) errors.push('Name required')
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Valid email required')
  if (!company) errors.push('Company required')
  if (!consent_to_privacy) errors.push('Privacy consent required')

  if (errors.length) return res.status(400).json({ ok: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: errors } })

  console.log('[Demo]', { name, email, company })
  res.json({ ok: true, data: { id: `demo_${Date.now()}`, message: 'Received' } })
})

module.exports = router
