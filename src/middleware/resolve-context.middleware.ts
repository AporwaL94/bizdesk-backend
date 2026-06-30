import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ApplicationAdmin } from '../models';

export interface AdminContextPayload {
  adminId: string;
  role: string;
  applicationId: string | null;
}

export async function resolveContext(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.header('authorization');
  const tokenSecret = authHeader?.startsWith('Bearer ') 
    ? authHeader.slice('Bearer '.length) 
    : req.header('x-admin-secret');

  res.locals.isAdmin = false;
  res.locals.admin = null;

  if (!tokenSecret) {
    return next();
  }

  // 1. Check if it's the global Super Admin secret
  if (tokenSecret === env.adminSecret) {
    res.locals.isAdmin = true;
    res.locals.admin = {
      id: 'super-admin',
      name: 'Super Admin',
      email: 'admin@kiranadesk.com',
      role: 'SUPER_ADMIN',
      applicationId: null,
      permissions: ['*']
    };
    return next();
  }

  // 2. Otherwise, check if it's a JWT
  try {
    const payload = jwt.verify(tokenSecret, env.jwtSecret) as AdminContextPayload;
    if (payload && payload.adminId) {
      if (payload.adminId === 'super-admin') {
        res.locals.isAdmin = true;
        res.locals.admin = {
          id: 'super-admin',
          name: 'Super Admin',
          email: 'admin@kiranadesk.com',
          role: 'SUPER_ADMIN',
          applicationId: null,
          permissions: ['*']
        };
        return next();
      }

      const admin = await ApplicationAdmin.findByPk(payload.adminId);
      if (admin) {
        if (admin.status === 'suspended') {
          res.status(403).json({ message: 'Your administrator account has been suspended.' });
          return;
        }
        res.locals.isAdmin = true;
        res.locals.admin = admin;
        return next();
      }
    }
  } catch (err) {
    // Invalid JWT, let resolvePermissions middleware handle 401 later if required
  }

  next();
}
