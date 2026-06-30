import { Request, Response, NextFunction } from 'express';
import { appStorage } from './app-storage';

export async function resolveImpersonation(req: Request, res: Response, next: NextFunction) {
  const admin = res.locals.admin;
  
  res.locals.isImpersonating = false;
  res.locals.originalAdminId = null;
  res.locals.currentAdminId = null;
  res.locals.currentApplicationId = null;

  if (admin && admin.role === 'SUPER_ADMIN') {
    const impersonateAppId = (req.header('x-app-id') ?? req.header('x-impersonate-app-id')) as string | undefined;

    if (impersonateAppId && impersonateAppId !== '') {
      res.locals.isImpersonating = true;
      res.locals.originalAdminId = 'super-admin';
      res.locals.currentAdminId = 'super-admin';
      res.locals.currentApplicationId = impersonateAppId;

      // Overwrite AsyncLocalStorage store to automatically filter queries to this application
      appStorage.run({ appId: impersonateAppId }, () => {
        next();
      });
      return;
    }
  }

  next();
}
