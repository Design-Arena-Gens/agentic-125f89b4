import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import xssClean from 'xss-clean';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';
import memberRoutes from './routes/memberRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import performanceRoutes from './routes/performanceRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: '*',
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(xssClean());
  app.use(compression());
  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      limit: 100,
    }),
  );
  app.use(
    morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', {
      skip: () => process.env.NODE_ENV === 'test',
    }),
  );

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/auth', authRoutes);
  app.use('/members', memberRoutes);
  app.use('/attendance', attendanceRoutes);
  app.use('/performance', performanceRoutes);
  app.use('/dashboard', dashboardRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export type App = ReturnType<typeof createApp>;
