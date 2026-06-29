import { Request, Response } from 'express';
import { AppRepository } from '../../repositories/app.repository';
import fs from 'fs';
import path from 'path';

const appRepo = new AppRepository();

function saveAppFile(appSlug: string, fileType: string, base64Data: string): string {
  const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid base64 image format');
  }

  const fileBuffer = Buffer.from(matches[2], 'base64');
  const mimeType = matches[1];
  const extension = mimeType.split('/')[1] || 'png';
  
  let subfolder = 'documents';
  if (fileType === 'logo') subfolder = 'logos';
  else if (fileType === 'icon' || fileType === 'app-icon') subfolder = 'icons';
  else if (fileType === 'splash' || fileType === 'splash-image') subfolder = 'splash';
  else if (fileType === 'login-bg') subfolder = 'backgrounds';
  else if (fileType === 'favicon') subfolder = 'favicons';

  const dirPath = path.resolve('uploads', appSlug, subfolder);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const filename = `${fileType}_${Date.now()}.${extension}`;
  const filePath = path.join(dirPath, filename);
  fs.writeFileSync(filePath, fileBuffer);

  return `/uploads/${appSlug}/${subfolder}/${filename}`;
}

export async function listApps(req: Request, res: Response) {
  const apps = await appRepo.list();
  res.json(apps);
}

export async function getApp(req: Request, res: Response) {
  const id = req.params.id as string;
  const app = await appRepo.findById(id);
  if (!app) {
    res.status(404).json({ message: 'Application not found.' });
    return;
  }
  res.json(app);
}

export async function createApp(req: Request, res: Response) {
  const data = req.body;
  if (!data.id || !data.name || !data.slug) {
    res.status(400).json({ message: 'App id, name, and slug are required.' });
    return;
  }

  const existingId = await appRepo.findById(data.id);
  const existingSlug = await appRepo.findBySlug(data.slug);
  if (existingId || existingSlug) {
    res.status(409).json({ message: 'An application with this id or slug already exists.' });
    return;
  }

  const app = await appRepo.create(data);
  res.status(201).json(app);
}

export async function updateApp(req: Request, res: Response) {
  const id = req.params.id as string;
  const app = await appRepo.update(id, req.body);
  if (!app) {
    res.status(404).json({ message: 'Application not found.' });
    return;
  }
  res.json(app);
}

export async function deleteApp(req: Request, res: Response) {
  const id = req.params.id as string;
  const success = await appRepo.delete(id);
  if (!success) {
    res.status(404).json({ message: 'Application not found.' });
    return;
  }
  res.json({ message: 'Application deleted successfully.' });
}

export async function duplicateApp(req: Request, res: Response) {
  const id = req.params.id as string;
  const sourceApp = await appRepo.findById(id);
  if (!sourceApp) {
    res.status(404).json({ message: 'Source application not found.' });
    return;
  }

  const { newId, newName, newSlug } = req.body as { newId: string; newName: string; newSlug: string };
  if (!newId || !newName || !newSlug) {
    res.status(400).json({ message: 'newId, newName, and newSlug are required.' });
    return;
  }

  const existingId = await appRepo.findById(newId);
  const existingSlug = await appRepo.findBySlug(newSlug);
  if (existingId || existingSlug) {
    res.status(409).json({ message: 'An application with this id or slug already exists.' });
    return;
  }

  // Destructure to avoid using 'delete' on required/readonly properties
  const { createdAt, updatedAt, id: oldId, ...sourceData } = sourceApp.toJSON() as any;

  const duplicatedData = {
    ...sourceData,
    id: newId,
    name: newName,
    slug: newSlug,
    apiKey: `${newSlug}-api-key`,
    packageName: `com.${newSlug}.app`,
    domain: null,
    subdomain: null
  };

  const newApp = await appRepo.create(duplicatedData);
  res.status(201).json(newApp);
}

export async function toggleAppStatus(req: Request, res: Response) {
  const id = req.params.id as string;
  const app = await appRepo.findById(id);
  if (!app) {
    res.status(404).json({ message: 'Application not found.' });
    return;
  }

  const newStatus = app.status === 'active' ? 'disabled' : 'active';
  await app.update({ status: newStatus });
  res.json(app);
}

export async function uploadAppAsset(req: Request, res: Response) {
  const id = req.params.id as string;
  const app = await appRepo.findById(id);
  if (!app) {
    res.status(404).json({ message: 'Application not found.' });
    return;
  }

  const { file, type } = req.body as { file: string; type: string };
  if (!file || !type) {
    res.status(400).json({ message: 'File (base64) and type are required.' });
    return;
  }

  try {
    const fileUrl = saveAppFile(app.slug, type, file);
    const updateData: Record<string, string> = {};
    if (type === 'logo') updateData.logo = fileUrl;
    else if (type === 'favicon') updateData.favicon = fileUrl;
    else if (type === 'splash') updateData.splashImage = fileUrl;
    else if (type === 'icon') updateData.appIcon = fileUrl;
    else if (type === 'login-bg') updateData.loginBackground = fileUrl;
    else {
      res.status(400).json({ message: 'Invalid asset type. Supported types: logo, favicon, splash, icon, login-bg' });
      return;
    }

    await app.update(updateData);
    res.json({ url: fileUrl, app });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'File upload failed.' });
  }
}
