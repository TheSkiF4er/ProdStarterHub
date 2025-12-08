import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import pino from 'pino';
import pinoHttp from 'pino-http';
import { collectDefaultMetrics, register, Counter, Histogram } from 'prom-client';
import dotenv from 'dotenv';

// Load .env in development (no-op on production if file missing)
dotenv.config();

// Build-time metadata (inject via build or CI using environment variables)
const APP_NAME = process.env.APP_NAME || 'node-service-typescript';
const APP_VERSION = process.env.APP_VERSION || '0.0.0';
const APP_COMMIT = process.env.APP_COMMIT || 'unknown';
const APP_BUILD_TIME = process.env.APP_BUILD_TIME || 'unknown';

// Configuration (environment-first; sensible defaults)
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const METRICS_PORT = Number(process.env.METRICS_PORT || 9091);
const SHUTDOWN_TIMEOUT_MS = Number(process.env.SHUTDOWN_TIMEOUT_MS || 15000);
const ENABLE_METRICS = (process.env.ENABLE_METRICS || 'true') === 'true';
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000); // 1 min
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX || 100);

// Logger setup (pino)
const logger = pino({
  name: APP_NAME,
  level: process.env.LOG_LEVEL || 'info',
  base: { service: APP_NAME, version: APP_VERSION },
});
const httpLogger = pinoHttp({ logger });

// Prometheus metrics
let httpRequestCounter: Counter<string> | undefined;
let httpRequestDuration: Histogram<string> | undefined;
if (ENABLE_METRICS) {
  collectDefaultMetrics({ prefix: `${APP_NAME.replace(/[^a-z0-9_]/gi, '_')}_` });
  httpRequestCounter = new Counter({
    name: `${APP_NAME}_http_requests_total`,
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'code'],
  });
  httpRequestDuration = new Histogram({
    name: `${APP_NAME}_http_request_duration_seconds`,
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'route', 'code'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  });
}

// Readiness probe state (set to false during init/shutdown when appropriate)
let ready = false;

// Express app
const app = express();

// Middlewares
app.use(httpLogger);
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(
  rateLimit({
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: RATE_LIMIT_MAX,
    legacyHeaders: false,
    standardHeaders: true,
  })
);

// Simple metrics middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime();
  res.on('finish', () => {
    try {
      const route = (req.route && (req.route.path as string)) || req.path || 'unknown';
      const method = req.method;
      const code = String(res.statusCode);
      if (httpRequestCounter) httpRequestCounter.inc({ method, route, code }, 1);
      if (httpRequestDuration) {
        const diff = process.hrtime(start);
        const seconds = diff[0] + diff[1] / 1e9;
        httpRequestDuration.observe({ method, route, code }, seconds);
      }
    } catch (err) {
      // metrics should never break request flow
      logger.warn({ err }, 'metrics middleware failed');
    }
  });
  next();
});

// Health endpoints
app.get('/healthz', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/readyz', (_req, res) => {
  if (!ready) return res.status(503).json({ status: 'not_ready' });
  res.status(200).json({ status: 'ready' });
});

// API routes
const router = express.Router();
router.get('/ping', (_req, res) => {
  res.json({ message: 'pong', version: APP_VERSION });
});

// Example: add more routes here
app.use('/api/v1', router);

// OpenAPI / Swagger hint (integration left for implementer)
app.get('/openapi.json', (_req, res) => {
  // stub: return an OpenAPI document or a link to generated spec
  res.status(501).json({ message: 'OpenAPI generation is not enabled in the template. Add swagger generation in build.' });
});

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  logger.error({ err }, 'unhandled error');
  const status = err.status || 500;
  res.status(status).json({ error: { message: err.message || 'internal server error' } });
});

// Export app for tests
export default app;

// Server handles
let server: ReturnType<typeof app.listen> | null = null;
let metricsServer: ReturnType<typeof app.listen> | null = null;

// Start function - returns a Promise that resolves when server is listening
export async function start() {
  // perform any async initialization here (DB connections, migrations, caches)
  try {
    // Example async init placeholder
    // await initDb();

    // Mark ready only after initialization
    ready = true;

    server = app.listen(PORT, HOST, () => {
      logger.info({ host: HOST, port: PORT }, 'http server listening');
    });

    if (ENABLE_METRICS) {
      // expose metrics on a separate server to keep app security boundaries
      const metricsApp = express();
      metricsApp.get('/metrics', async (_req, res) => {
        try {
          res.set('Content-Type', register.contentType);
          res.end(await register.metrics());
        } catch (err) {
          logger.error({ err }, 'failed to collect metrics');
          res.status(500).end();
        }
      });
      metricsServer = metricsApp.listen(METRICS_PORT, HOST, () => {
        logger.info({ host: HOST, port: METRICS_PORT }, 'metrics server listening');
      });
    }
  } catch (err) {
    logger.error({ err }, 'failed to start application');
    throw err;
  }
}

// Graceful shutdown
export async function stop() {
  ready = false; // immediately mark as not ready

  const tasks: Promise<void>[] = [];
  if (server) {
    tasks.push(
      new Promise((resolve) => {
        server!.close((err) => {
          if (err) logger.error({ err }, 'error closing http server');
          else logger.info('http server closed');
          resolve();
        });
      })
    );
  }
  if (metricsServer) {
    tasks.push(
      new Promise((resolve) => {
        metricsServer!.close((err) => {
          if (err) logger.error({ err }, 'error closing metrics server');
          else logger.info('metrics server closed');
          resolve();
        });
      })
    );
  }

  // allow tasks to complete or timeout
  await Promise.race([
    Promise.all(tasks),
    new Promise((resolve) => setTimeout(resolve, SHUTDOWN_TIMEOUT_MS)),
  ]);

  // flush logs if needed (pino doesn't require explicit flush for stdio in most cases)
}

// If this module is executed directly, start the server and wire signals
if (require.main === module) {
  (async () => {
    try {
      await start();

      const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
      signals.forEach((sig) => {
        process.on(sig, async () => {
          logger.info({ sig }, 'shutdown signal received');
          try {
            await stop();
          } catch (err) {
            logger.error({ err }, 'error during shutdown');
          }
          logger.info({ commit: APP_COMMIT, build: APP_BUILD_TIME }, 'process exiting');
          process.exit(0);
        });
      });
    } catch (err) {
      logger.fatal({ err }, 'process failed to start');
      process.exit(1);
    }
  })();
}
