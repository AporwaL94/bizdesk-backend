import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ApplicationAdmin } from '../models';
import { comparePassword } from '../utils/crypto';

export async function login(req: Request, res: Response) {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!password) {
    res.status(400).json({ message: 'Password is required.' });
    return;
  }

  // 1. Super Admin Authentication (password-only)
  if ((!email || email.trim() === '') && password === env.adminSecret) {
    const token = jwt.sign(
      { adminId: 'super-admin', role: 'SUPER_ADMIN', appId: null, applicationId: null },
      env.jwtSecret,
      { expiresIn: '30m' }
    );
    res.json({
      token,
      name: 'Super Admin',
      email: 'admin@bizdesk.com',
      role: 'SUPER_ADMIN',
      applicationId: null
    });
    return;
  }

  // 2. Sub-admin Authentication (requires email and password)
  if (!email) {
    res.status(400).json({ message: 'Email is required for sub-admin login.' });
    return;
  }

  const admin = await ApplicationAdmin.findOne({ where: { email: email.toLowerCase().trim() } });
  if (!admin || !comparePassword(password, admin.password)) {
    res.status(401).json({ message: 'Invalid email or password.' });
    return;
  }

  if (admin.status === 'suspended') {
    res.status(403).json({ message: 'This account has been suspended.' });
    return;
  }

  const token = jwt.sign(
    { adminId: admin.id, role: admin.role, appId: admin.applicationId, applicationId: admin.applicationId },
    env.jwtSecret,
    { expiresIn: '30m' }
  );

  res.json({
    token,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    applicationId: admin.applicationId
  });
}

export async function getMe(req: Request, res: Response) {
  if (!res.locals.isAdmin) {
    res.status(401).json({ message: 'Not authenticated.' });
    return;
  }

  const admin = res.locals.admin;
  res.json({
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    applicationId: admin.applicationId,
    permissions: typeof admin.permissions === 'string' ? JSON.parse(admin.permissions) : (admin.permissions || [])
  });
}
