import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { Logger } from 'tslog';
import { prisma } from './db.js';

// Global handler for BigInt JSON serialization
(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

interface PlayResultPayload {
  id?: string;
  timestamp?: number;
  score?: number;
  targetCount?: number;
  percent?: number;
  correctWords?: string[];
  wrongWords?: string[];
  [key: string]: any;
}

const logger = new Logger({ name: 'PlayResultsLogger' });
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
// Limit JSON body size to 10kb to prevent oversized payload attacks
app.use(express.json({ limit: '10kb' }));

// Simple in-memory rate limiter for POST endpoints (max 15 requests per minute per IP)
const requestCounts = new Map<string, { count: number; resetTime: number }>();
function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 15;

  const current = requestCounts.get(ip);
  if (!current || now > current.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
    return next();
  }

  if (current.count >= maxRequests) {
    logger.warn(`⚠️ Rate limit exceeded for IP: ${ip}`);
    return res.status(429).json({ success: false, message: 'Too many requests. Please try again later.' });
  }

  current.count++;
  return next();
}

// Optional API Key authentication middleware
function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
  const secretKey = process.env.API_SECRET_KEY;
  if (!secretKey) {
    // Public mode (no key configured in .env)
    return next();
  }

  const clientKey = req.headers['x-api-key'] || req.headers['authorization'];
  if (clientKey === secretKey || clientKey === `Bearer ${secretKey}`) {
    return next();
  }

  logger.warn('⚠️ Unauthorized API access attempt');
  return res.status(401).json({ success: false, message: 'Unauthorized: Invalid or missing API Key' });
}

// Health check route
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// GET /api/results - Retrieve play results from DB
app.get('/api/results', apiKeyAuth, async (_req: Request, res: Response) => {
  try {
    const results = await prisma.playResult.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    res.json({ success: true, count: results.length, data: results });
  } catch (error: any) {
    logger.error('Failed to fetch play results from database:', error?.message || error);
    res.status(500).json({ success: false, message: 'Database error', error: error?.message });
  }
});

// POST handler function
async function handlePostResult(req: Request, res: Response) {
  const payload: PlayResultPayload = req.body;
  const { id, score: rawScore, targetCount: rawTargetCount, percent: rawPercent, timestamp: rawTimestamp, ...extraMetadata } = payload;

  const score = Number(rawScore ?? 0);
  const targetCount = Number(rawTargetCount ?? 0);
  const percent = Number(rawPercent ?? (targetCount > 0 ? Math.round((score / targetCount) * 100) : 0));
  const timestamp = rawTimestamp ? BigInt(rawTimestamp) : null;

  // Capture all additional fields (correctWords, wrongWords, settings, etc.) in metadata JSON
  const metadata = Object.keys(extraMetadata).length > 0 ? extraMetadata : null;

  logger.info('🎮 Received Play Result:', payload);

  let savedRecord = null;

  try {
    savedRecord = await prisma.playResult.create({
      data: {
        ...(id ? { id } : {}),
        score,
        targetCount,
        percent,
        timestamp,
        ...(metadata ? { metadata } : {})
      }
    });
    logger.info('💾 Play Result saved to PostgreSQL database ID:', savedRecord.id);
  } catch (dbError: any) {
    logger.warn('⚠️ Could not save result to PostgreSQL DB (DB may not be configured yet):', dbError?.message || dbError);
  }

  res.status(201).json({
    success: true,
    message: 'Play result logged successfully',
    receivedAt: new Date().toISOString(),
    dbSaved: Boolean(savedRecord),
    data: savedRecord || payload
  });
}

// Protected POST endpoints with rate limiting & API Key verification
app.post('/api/results', rateLimiter, apiKeyAuth, handlePostResult);
app.post('/results', rateLimiter, apiKeyAuth, handlePostResult);

const server = app.listen(PORT, () => {
  logger.info(`🚀 Backend server listening on http://localhost:${PORT}`);
});

server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    logger.warn(`Port ${PORT} is in use. Trying port ${Number(PORT) + 1}...`);
    app.listen(Number(PORT) + 1, () => {
      logger.info(`🚀 Backend server listening on http://localhost:${Number(PORT) + 1}`);
    });
  } else {
    logger.error('Server error:', err);
  }
});
