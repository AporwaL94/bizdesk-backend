import { Router } from 'express';
import { getAppBranding } from './branding.controller';
import { catchAsync } from '../../utils/catch-async';

export const brandingRoutes = Router();

brandingRoutes.get('/branding', catchAsync(getAppBranding));
