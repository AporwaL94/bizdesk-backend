import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import jwt from 'jsonwebtoken';
import { App, Vendor } from '../models';
import { env } from '../config/env';
import { appStorage } from './app-storage';

export async function resolveApplication(req: Request, res: Response, next: NextFunction) {
  let appId: string | undefined = undefined;

  // 1. Resolve from headers / query params
  const appKey = (req.header('x-app-key') ?? req.query.x_app_key ?? req.header('x-app-id') ?? req.query.x_app_id) as string | undefined;
  const packageName = (req.header('x-package-name') ?? req.query.package_name) as string | undefined;
  const apiKey = (req.header('x-api-key') ?? req.query.api_key) as string | undefined;

  // 2. Resolve from JWT
  const authHeader = req.header('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null;
  let jwtAppId: string | undefined = undefined;

  if (token) {
    try {
      const payload = jwt.verify(token, env.jwtSecret) as { vendorId?: string; appId?: string };
      if (payload.appId) {
        jwtAppId = payload.appId;
      } else if (payload.vendorId) {
        // Fallback for older tokens: look up vendor without app scoping filter
        const vendor = await Vendor.findByPk(payload.vendorId, { bypassAppFilter: true } as any);
        if (vendor) {
          jwtAppId = vendor.appId;
        }
      }
    } catch (e) {
      // Allow authentication middleware to throw invalid token errors later
    }
  }

  // 3. Resolve from hostname / subdomains
  const host = req.headers.host ?? '';

  let appRecord: App | null = null;

  if (appKey) {
    appRecord = await App.findOne({
      where: {
        [Op.or]: [
          { id: appKey },
          { apiKey: appKey },
          { slug: appKey }
        ]
      }
    });
  }

  if (!appRecord && apiKey) {
    appRecord = await App.findOne({ where: { apiKey } });
  }

  if (!appRecord && packageName) {
    appRecord = await App.findOne({ where: { packageName } });
  }

  if (!appRecord && jwtAppId) {
    appRecord = await App.findByPk(jwtAppId);
  }

  if (!appRecord && host) {
    const hostname = host.split(':')[0]; // Remove port if any
    appRecord = await App.findOne({
      where: {
        [Op.or]: [
          { domain: hostname },
          { subdomain: hostname }
        ]
      }
    });
  }

  if (appRecord) {
    appId = appRecord.id;
    res.locals.app = appRecord;
    res.locals.appId = appId;
  }

  // If this is an API route (e.g. /api/*), we must identify the application
  const isApiRoute = req.baseUrl.startsWith('/api') || req.path.startsWith('/api') || req.originalUrl.startsWith('/api');
  if (isApiRoute) {
    if (!appId) {
      res.status(400).json({ message: 'Application could not be resolved. Please specify standard headers like X-App-Key or X-Package-Name.' });
      return;
    }
    if (appRecord?.status === 'disabled') {
      res.status(403).json({ message: 'This application is currently disabled.' });
      return;
    }
  }

  // Inject current appId into AsyncLocalStorage context
  if (appId) {
    appStorage.run({ appId }, () => {
      next();
    });
  } else {
    next();
  }
}
