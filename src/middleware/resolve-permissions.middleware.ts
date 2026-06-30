import { Request, Response, NextFunction } from 'express';

export function requireAdminRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!res.locals.isAdmin) {
      res.status(401).json({ message: 'Authentication required. Please log in as an administrator.' });
      return;
    }

    const admin = res.locals.admin;
    const role = admin?.role;

    // Super Admin bypasses all checks when not impersonating
    if (role === 'SUPER_ADMIN' && !res.locals.isImpersonating) {
      return next();
    }

    // If impersonating, the active role becomes APPLICATION_ADMIN
    const activeRole = res.locals.isImpersonating ? 'APPLICATION_ADMIN' : role;

    if (!allowedRoles.includes(activeRole)) {
      res.status(403).json({ message: 'Access denied. Insufficient administrative permissions.' });
      return;
    }

    // Security validation: Sub-admins must only access their assigned application's data
    const resolvedAppId = res.locals.appId;
    if (role !== 'SUPER_ADMIN' && admin.applicationId && admin.applicationId !== resolvedAppId) {
      res.status(403).json({ message: 'Access denied. You are not authorized to view or edit this application\'s data.' });
      return;
    }

    next();
  };
}
