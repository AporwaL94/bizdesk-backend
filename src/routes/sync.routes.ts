import { Router } from 'express';
import { requireVendorAuth } from '../middleware/auth.middleware';
import {
  pullSync,
  pushInvoices,
  pushProducts,
  pushShop,
  pushSync,
  syncStatus
} from '../controllers/sync.controller';

export const syncRoutes = Router();

syncRoutes.use(requireVendorAuth);
syncRoutes.post('/push', pushSync);
syncRoutes.get('/pull', pullSync);
syncRoutes.post('/push/products', pushProducts);
syncRoutes.post('/push/invoices', pushInvoices);
syncRoutes.post('/push/shop', pushShop);
syncRoutes.get('/status', syncStatus);
