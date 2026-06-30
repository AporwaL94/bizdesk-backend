import { Request, Response } from 'express';
import { ApplicationAdmin, App } from '../models';
import { hashPassword } from '../utils/crypto';

export async function listAdmins(req: Request, res: Response) {
  const admins = await ApplicationAdmin.findAll({
    order: [['createdAt', 'DESC']],
    include: [{ model: App, as: 'application', attributes: ['name'] }]
  });
  res.json(admins);
}

export async function createAdmin(req: Request, res: Response) {
  const { name, email, phone, password, role, applicationId, permissions } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ message: 'Name, email, and password are required.' });
    return;
  }

  const existing = await ApplicationAdmin.findOne({ where: { email: email.toLowerCase().trim() } });
  if (existing) {
    res.status(409).json({ message: 'An administrator account with this email already exists.' });
    return;
  }

  const admin = await ApplicationAdmin.create({
    name,
    email: email.toLowerCase().trim(),
    phone: phone || null,
    password, // Hook hashes this
    role: role || 'APPLICATION_ADMIN',
    applicationId: applicationId || null,
    permissions: permissions ? JSON.stringify(permissions) : null,
    status: 'active'
  } as any);

  res.status(201).json(admin);
}

export async function updateAdmin(req: Request, res: Response) {
  const id = req.params.id as string;
  const { name, email, phone, role, applicationId, permissions } = req.body;

  const admin = await ApplicationAdmin.findByPk(id);
  if (!admin) {
    res.status(404).json({ message: 'Sub-admin account not found.' });
    return;
  }

  if (email && email.toLowerCase().trim() !== admin.email) {
    const existing = await ApplicationAdmin.findOne({ where: { email: email.toLowerCase().trim() } });
    if (existing) {
      res.status(409).json({ message: 'An administrator account with this email already exists.' });
      return;
    }
    admin.email = email.toLowerCase().trim();
  }

  await admin.update({
    name: name ?? admin.name,
    phone: phone ?? admin.phone,
    role: role ?? admin.role,
    applicationId: applicationId !== undefined ? applicationId : admin.applicationId,
    permissions: permissions ? JSON.stringify(permissions) : admin.permissions
  });

  res.json(admin);
}

export async function suspendAdmin(req: Request, res: Response) {
  const id = req.params.id as string;

  const admin = await ApplicationAdmin.findByPk(id);
  if (!admin) {
    res.status(404).json({ message: 'Sub-admin account not found.' });
    return;
  }

  const newStatus = admin.status === 'active' ? 'suspended' : 'active';
  await admin.update({ status: newStatus });

  res.json(admin);
}

export async function resetAdminPassword(req: Request, res: Response) {
  const id = req.params.id as string;
  const { password } = req.body;

  if (!password) {
    res.status(400).json({ message: 'Password is required.' });
    return;
  }

  const admin = await ApplicationAdmin.findByPk(id);
  if (!admin) {
    res.status(404).json({ message: 'Sub-admin account not found.' });
    return;
  }

  await admin.update({
    password // Hook hashes this
  });

  res.json({ message: 'Password reset successful.' });
}

export async function deleteAdmin(req: Request, res: Response) {
  const id = req.params.id as string;

  const admin = await ApplicationAdmin.findByPk(id);
  if (!admin) {
    res.status(404).json({ message: 'Sub-admin account not found.' });
    return;
  }

  await admin.destroy();
  res.json({ message: 'Sub-admin account deleted successfully.' });
}
