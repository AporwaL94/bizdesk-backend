import { Router } from 'express';
import { activate, getSubscriptionStatus, validateToken } from '../controllers/activation.controller';
import { requireVendorAuth } from '../middleware/auth.middleware';

export const activationRoutes = Router();

activationRoutes.post('/activate', activate);
activationRoutes.get('/validate', requireVendorAuth, validateToken);
activationRoutes.get('/subscription/status', requireVendorAuth, getSubscriptionStatus);
