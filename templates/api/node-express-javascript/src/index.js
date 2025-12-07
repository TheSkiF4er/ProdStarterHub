/*
ProdStarterHub - Node Express template
Production-ready `index.js` (entrypoint) for an Express.js service.

Features included:
- Configuration via environment variables (dotenv)
- Structured logging with pino
- Security middleware: helmet, rate limiting, CORS
- Compression (gzip)
- Request logging and correlation ID middleware
- Prometheus metrics endpoint (/metrics) and basic HTTP metrics
- Health endpoints: /health, /live, /ready
- OpenAPI (Swagger UI) mounting if openapi.json is present
- Graceful startup and shutdown with DB/connectivity placeholders
- Example router under /api/v1

Customize TODO sections to wire your DB, cache, auth and business logic.
*/

'use strict'

const fs = require('fs')
const path = require('path')
const http = require('http')

require('dotenv').config()
const express = require('express')
const helmet = require('helmet')
const compression = require('compression')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const pino = require('pino')
const expressPino = require('express-pino-logger')
const { v4: uuidv4 } = require('uuid')
const promClient = require('prom-client')

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------
const SERVICE_NAME = process.env.SERVICE_NAME || 'prodstarter-express'
const ENVIRONMENT = process.env.ENVIRONMENT || process.env.NODE_ENV || 'production'
const PORT = parseInt(process.env.PORT || '3000', 10)
const HOST = process.env.HOST || '0.0.0.0'
const ENABLE_SWAGGER = (process.env.SWAGGER_ENABLED || 'false').toLowerCase() === 'true'

// ---------------------------------------------------------------------------
// Logger (pino)
// ---------------------------------------------------------------------------
const logger = pino({
  name: SERVICE_NAME,
  level: process.env.LOG_LEVEL || (ENVIRONMENT === 'development' ? 'debug' : 'info'),
  redact: { paths: ['req.headers.authorization', 'req.headers.cookie', 'req.headers.cookie'], remove: true }
})
const expressLogger = expressPino({ logger })

// ---------------------------------------------------------------------------
// Prometheus metrics
// ---------------------------------------------------------------------------
const register = promClient.register
promClient.collectDefaultMetrics({ prefix: `${SERVICE_NAME.replace(/-/g, '_')}_` })

const httpRequestCounter = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
})

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request latency in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.3, 0.5, 1, 2, 5]
})

// ---------------------------------------------------------------------------
// DB / external dependency placeholder
// ---------------------------------------------------------------------------
class DBClient {
  constructor(dsn) {
    this.dsn = dsn
    this.connected = false
  }

  async connect() {
    // TODO: Replace with actual DB connect (pg, mongoose, sequelize, etc.)
    logger.info({ dsn: this.dsn }, 'db.connecting')
    await new Promise((r) => setTimeout(r, 50))
    this.connected = true
    logger.info('db.connected')
  }

  async disconnect() {
    logger.info('db.disconnecting')
    await new Promise((r) => setTimeout(r, 50))
    this.connected = false
    logger.info('db.disconnected')
  }

  async isHealthy() {
    // TODO: implement real health check
    return this.connected
  }
}

const db = new DBClient(process.env.DATABASE_DSN || null)

// ---------------------------------------------------------------------------
// Express app factory
// ---------------------------------------------------------------------------
function createApp() {
  const app = express()

  // Basic security middlewares
  app.use(helmet())
  app.use(compression())

  // CORS - in dev, allow all; in prod, expect CORS_ORIGINS env var as comma-separated
  const corsOrigins = process.env.CORS_ORIGINS
  if (corsOrigins) {
    app.use(cors({ origin: corsOrigins.split(',').map((s) => s.trim()) }))
  } else if (ENVIRONMENT === 'development') {
    app.use(cors())
  }

  // Rate limiting: sensible defaults, override via env
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '1000', 10),
    standardHeaders: true,
    legacyHeaders: false
  })
  app.use(limiter)

  // Request ID / correlation
  app.use((req, res, next) => {
    req.id = req.headers['x-request-id'] || uuidv4()
    res.setHeader('X-Request-Id', req.id)
    next()
  })

  // Pino request logger
  app.use(expressLogger)

  // Body parsing
  app.use(express.json({ limit: '1mb' }))
  app.use(express.urlencoded({ extended: true }))

  // Metrics middleware
  app.use((req, res, next) => {
    const end = httpRequestDuration.startTimer()
    const route = req.route && req.route.path ? req.route.path : req.path
    res.on('finish', () => {
      const labels = { method: req.method, route: route, status: res.statusCode }
      httpRequestCounter.inc(labels)
      end({ ...labels })
    })
    next()
  })

  // Mount API v1 router
  const apiV1 = express.Router()

  apiV1.get('/', async (req, res) => {
    res.json({ service: SERVICE_NAME, environment: ENVIRONMENT })
  })

  apiV1.get('/items/:id', async (req, res, next) => {
    try {
      if (!(await db.isHealthy())) return res.status(503).json({ error: 'database_unavailable' })
      // TODO: replace with real DB access
      const id = req.params.id
      res.json({ id, name: 'example', db: true })
    } catch (err) {
      next(err)
    }
  })

  app.use('/api/v1', apiV1)

  // Health endpoints
  app.get('/live', (req, res) => res.send('alive'))

  app.get('/ready', async (req, res) => {
    const ok = await db.isHealthy()
    if (ok) return res.send('ready')
    return res.status(503).send('not ready')
  })

  app.get('/health', async (req, res) => {
    const dbOk = await db.isHealthy()
    const status = dbOk ? 'ok' : 'fail'
    res.status(dbOk ? 200 : 503).json({ status, checks: { database: dbOk ? 'ok' : 'unhealthy' } })
  })

  // Prometheus metrics endpoint
  app.get('/metrics', async (req, res) => {
    try {
      res.set('Content-Type', register.contentType)
      res.end(await register.metrics())
    } catch (ex) {
      res.status(500).end(ex.message)
    }
  })

  // Swagger UI if openapi.json exists and enabled
  if (ENABLE_SWAGGER) {
    try {
      const swaggerUi = require('swagger-ui-express')
      const specPath = path.join(process.cwd(), 'openapi.json')
      if (fs.existsSync(specPath)) {
        const openapi = require(specPath)
        app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi))
        logger.info('swagger.enabled', { path: '/docs' })
      } else {
        logger.info('swagger.not_found', { path: specPath })
      }
    } catch (err) {
      logger.warn('swagger.setup_failed', { err: err.message })
    }
  }

  // 404 handler
  app.use((req, res) => res.status(404).json({ error: 'not_found' }))

  // Error handler
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    logger.error({ err, reqId: req.id }, 'unhandled_error')
    if (ENVIRONMENT === 'development') {
      return res.status(500).json({ error: 'internal_error', message: err.message, stack: err.stack })
    }
    return res.status(500).json({ error: 'internal_error' })
  })

  return app
}

// ---------------------------------------------------------------------------
// Server lifecycle (startup & graceful shutdown)
// ---------------------------------------------------------------------------

let server = null

async function start() {
  logger.info({ service: SERVICE_NAME, env: ENVIRONMENT }, 'startup.begin')
  try {
    // Connect to DB and other dependencies
    await db.connect()

    const app = createApp()
    server = http.createServer(app)

    server.listen(PORT, HOST, () => {
      logger.info({ host: HOST, port: PORT }, 'server.listening')
    })

    // Handle unexpected errors
    process.on('unhandledRejection', (reason) => {
      logger.error({ reason }, 'unhandledRejection')
    })

    process.on('uncaughtException', (err) => {
      logger.error({ err }, 'uncaughtException')
      // consider exiting process after logging depending on your policy
    })

    // Graceful shutdown signals
    process.on('SIGINT', shutdown)
    process.on('SIGTERM', shutdown)
  } catch (err) {
    logger.error({ err }, 'startup.failed')
    process.exit(1)
  }
}

let shuttingDown = false

async function shutdown(signal) {
  if (shuttingDown) return
  shuttingDown = true
  logger.info({ signal }, 'shutdown.begin')

  try {
    // Stop accepting new connections
    if (server) server.close(() => logger.info('server.closed'))

    // Disconnect from DB
    await db.disconnect()

    // Allow some time for connections to drain
    setTimeout(() => {
      logger.info('shutdown.complete')
      process.exit(0)
    }, parseInt(process.env.SHUTDOWN_TIMEOUT_MS || '5000', 10))
  } catch (err) {
    logger.error({ err }, 'shutdown.failed')
    process.exit(1)
  }
}

// If this file is executed directly, start the server
if (require.main === module) {
  start()
}

module.exports = { createApp, start, shutdown }
