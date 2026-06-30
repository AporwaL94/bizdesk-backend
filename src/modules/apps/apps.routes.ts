import { Router } from 'express';
import { catchAsync } from '../../utils/catch-async';
import {
  createApp,
  deleteApp,
  duplicateApp,
  getApp,
  listApps,
  toggleAppStatus,
  updateApp,
  uploadAppAsset
} from './apps.controller';

import { requireAdminRole } from '../../middleware/resolve-permissions.middleware';

export const appsRoutes = Router();

appsRoutes.use(requireAdminRole(['SUPER_ADMIN']));

appsRoutes.get('/', catchAsync(listApps));
appsRoutes.post('/', catchAsync(createApp));
appsRoutes.get('/:id', catchAsync(getApp));
appsRoutes.put('/:id', catchAsync(updateApp));
appsRoutes.delete('/:id', catchAsync(deleteApp));
appsRoutes.post('/:id/duplicate', catchAsync(duplicateApp));
appsRoutes.post('/:id/toggle-status', catchAsync(toggleAppStatus));
appsRoutes.post('/:id/upload', catchAsync(uploadAppAsset));
