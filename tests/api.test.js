const { spawn } = require('child_process')
const http = require('http')

const BASE_URL = 'http://localhost:3333'
const tests = []
let passed = 0
let failed = 0

function test(name, fn) {
  tests.push({ name, fn })
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed')
}

function assertJson(response, expected) {
  const json = JSON.parse(response)
  assert(json.ok === expected.ok, `Expected ok=${expected.ok}, got ${json.ok}`)
  return json
}

// Tests
test('Health check', async () => {
  const res = await fetch(`${BASE_URL}/health`)
  const json = await res.json()
  assert(json.status === 'ok', 'Health check failed')
})

test('Blog - list posts', async () => {
  const res = await fetch(`${BASE_URL}/api/blog`)
  const json = await res.json()
  assert(json.ok === true, 'Blog list failed')
  assert(Array.isArray(json.data.items), 'Items should be array')
})

test('Blog - get post by slug', async () => {
  const res = await fetch(`${BASE_URL}/api/blog/getting-started`)
  const json = await res.json()
  assert(json.ok === true, 'Blog post failed')
  assert(json.data.slug === 'getting-started', 'Wrong slug')
})

test('Blog - not found', async () => {
  const res = await fetch(`${BASE_URL}/api/blog/not-exist`)
  const json = await res.json()
  assert(json.ok === false, 'Should return not found')
})

test('Support - list', async () => {
  const res = await fetch(`${BASE_URL}/api/support`)
  const json = await res.json()
  assert(json.ok === true, 'Support list failed')
})

test('Support - filter by category', async () => {
  const res = await fetch(`${BASE_URL}/api/support?category=technical`)
  const json = await res.json()
  assert(json.ok === true, 'Support filter failed')
  json.data.items.forEach(item => {
    assert(item.category === 'technical', 'Wrong category')
  })
})

test('Support - search', async () => {
  const res = await fetch(`${BASE_URL}/api/support?q=password`)
  const json = await res.json()
  assert(json.ok === true, 'Support search failed')
})

test('Contact - validation errors', async () => {
  const res = await fetch(`${BASE_URL}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  })
  const json = await res.json()
  assert(json.ok === false, 'Should fail validation')
  assert(Array.isArray(json.error.details), 'Should have error details')
})

test('Contact - success', async () => {
  const res = await fetch(`${BASE_URL}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test User',
      email: 'test@test.com',
      message: 'Hello',
      consent_to_privacy: true
    })
  })
  const json = await res.json()
  assert(json.ok === true, 'Contact form failed')
})

test('Demo request - validation', async () => {
  const res = await fetch(`${BASE_URL}/api/demo-request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  })
  const json = await res.json()
  assert(json.ok === false, 'Should fail validation')
})

test('Demo request - success', async () => {
  const res = await fetch(`${BASE_URL}/api/demo-request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test User',
      email: 'test@test.com',
      company: 'Acme',
      consent_to_privacy: true
    })
  })
  const json = await res.json()
  assert(json.ok === true, 'Demo request failed')
})

test('Search - too short query', async () => {
  const res = await fetch(`${BASE_URL}/api/search?q=a`)
  const json = await res.json()
  assert(json.ok === false, 'Should fail with short query')
})

// Run tests
async function runTests() {
  console.log('🧪 Starting tests...\n')

  for (const { name, fn } of tests) {
    try {
      await fn()
      console.log(`✅ ${name}`)
      passed++
    } catch (err) {
      console.log(`❌ ${name}: ${err.message}`)
      failed++
    }
  }

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`)
  process.exit(failed > 0 ? 1 : 0)
}

// Start server and run tests
const server = spawn('node', ['src/index.js'], {
  cwd: require('path').join(__dirname, '..'),
  stdio: 'pipe'
})

server.stdout.on('data', (data) => {
  if (data.toString().includes('Server running')) {
    setTimeout(runTests, 500)
  }
})

server.stderr.on('data', (data) => {
  console.error('Server error:', data.toString())
})

process.on('exit', () => {
  server.kill()
})
