import cors from 'cors';
import express from 'express';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { activationRoutes } from './routes/activation.routes';
import { adminRoutes } from './routes/admin.routes';
import { syncRoutes } from './routes/sync.routes';
import swaggerDocument from './swagger.json';
import { globalErrorHandler } from './middleware/error.middleware';
import { resolveApplication } from './middleware/resolve-application.middleware';
import { appsRoutes } from './modules/apps/apps.routes';
import { brandingRoutes } from './modules/branding/branding.routes';

export const app = express();

app.use(cors());
// Parse body up to 50MB to support base64 uploads
app.use(express.json({ limit: '50mb' }));

// Serve uploaded app branding files
app.use('/uploads', express.static(path.resolve('uploads')));

// Simple request logger for debugging
app.use((req, res, next) => {
  console.log(`[HTTP] ${req.method} ${req.url}`);
  next();
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'kirana-desk-backend' });
});

// App-aware routing
app.use('/api/app', resolveApplication, brandingRoutes);
app.use('/api', resolveApplication, activationRoutes);
app.use('/api/sync', resolveApplication, syncRoutes);

app.use('/admin/apps', resolveApplication, appsRoutes);
app.use('/admin', resolveApplication, adminRoutes);

// Global Error Handler Middleware
app.use(globalErrorHandler);


