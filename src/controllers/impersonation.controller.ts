import { Request, Response } from 'express';
import { ImpersonationLog, App } from '../models';

export async function startImpersonation(req: Request, res: Response) {
  // Strict check: only original Super Admin can start impersonation
  const originalAdmin = res.locals.admin;
  if (!originalAdmin || originalAdmin.role !== 'SUPER_ADMIN') {
    res.status(403).json({ message: 'Only Super Admins can switch context.' });
    return;
  }

  const { applicationId, impersonatedAdminId } = req.body as { applicationId: string; impersonatedAdminId?: string };

  if (!applicationId) {
    res.status(400).json({ message: 'Target Application ID is required.' });
    return;
  }

  const app = await App.findByPk(applicationId, { bypassAppFilter: true } as any);
  if (!app) {
    res.status(404).json({ message: 'Application not found.' });
    return;
  }

  const log = await ImpersonationLog.create({
    originalAdminId: originalAdmin.id || 'super-admin',
    impersonatedAdminId: impersonatedAdminId || null,
    applicationId,
    ipAddress: req.ip || req.socket.remoteAddress || null,
    userAgent: req.headers['user-agent'] || null,
    switchedAt: new Date()
  } as any);

  res.json({
    message: `Successfully switched context to ${app.name}.`,
    logId: log.id,
    application: {
      id: app.id,
      name: app.name,
      slug: app.slug
    }
  });
}

export async function stopImpersonation(req: Request, res: Response) {
  // Strict check: only Super Admin can restore context
  const originalAdmin = res.locals.admin;
  if (!originalAdmin || originalAdmin.role !== 'SUPER_ADMIN') {
    res.status(403).json({ message: 'Only Super Admins can restore context.' });
    return;
  }

  const { logId } = req.body as { logId: string };

  if (!logId) {
    res.status(400).json({ message: 'Log ID is required.' });
    return;
  }

  const log = await ImpersonationLog.findByPk(logId);
  if (!log) {
    res.status(404).json({ message: 'Impersonation log session not found.' });
    return;
  }

  const restoredAt = new Date();
  const switchedAt = new Date(log.switchedAt);
  const duration = Math.round((restoredAt.getTime() - switchedAt.getTime()) / 1000); // duration in seconds

  await log.update({
    restoredAt,
    duration
  });

  res.json({
    message: 'Impersonation session ended. Context restored to Super Admin.',
    log
  });
}

export async function listImpersonations(req: Request, res: Response) {
  const admin = res.locals.admin;
  if (!admin || admin.role !== 'SUPER_ADMIN') {
    res.status(403).json({ message: 'Access denied.' });
    return;
  }

  const logs = await ImpersonationLog.findAll({
    order: [['switchedAt', 'DESC']],
    include: [{ model: App, as: 'application', attributes: ['name'] }]
  });

  res.json(logs);
}
