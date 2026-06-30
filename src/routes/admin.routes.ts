import { Router } from 'express';
import { requireAdminSecret } from '../middleware/admin.middleware';
import { catchAsync } from '../utils/catch-async';
import {
  analyticsOverview,
  analyticsRevenue,
  analyticsSubscriptions,
  deleteKey,
  generateKeys,
  getVendor,
  listKeys,
  listPayments,
  listVendors,
  recordPayment,
  resetVendorDevice,
  restoreVendor,
  revokeKey,
  revokeVendor,
  updateVendorPlan,
  vendorInvoices,
  vendorPayments,
  vendorProducts,
  exportVendorProducts,
  exportVendorInvoices,
  vendorCustomers,
  exportVendorCustomers,
  clearVendorSyncData,
  createKeyRequest,
  confirmKeyPayment,
  sendVendorRenewal,
  resendKeyEmail,
  triggerSyncToMobile,
  importVendorSyncData
} from '../controllers/admin.controller';

import { login, getMe } from '../controllers/admin-auth.controller';
import { startImpersonation, stopImpersonation, listImpersonations } from '../controllers/impersonation.controller';
import { listAdmins, createAdmin, updateAdmin, deleteAdmin, suspendAdmin, resetAdminPassword } from '../controllers/application-admins.controller';
import { requireAdminRole } from '../middleware/resolve-permissions.middleware';

export const adminRoutes = Router();

// 1. Unauthenticated routes
adminRoutes.post('/auth/login', catchAsync(login));

// 2. Super Admin only routes
const requireSuper = requireAdminRole(['SUPER_ADMIN']);
adminRoutes.post('/impersonate/start', requireSuper, catchAsync(startImpersonation));
adminRoutes.post('/impersonate/stop', requireSuper, catchAsync(stopImpersonation));
adminRoutes.get('/impersonate/logs', requireSuper, catchAsync(listImpersonations));

adminRoutes.get('/subadmins', requireSuper, catchAsync(listAdmins));
adminRoutes.post('/subadmins', requireSuper, catchAsync(createAdmin));
adminRoutes.put('/subadmins/:id', requireSuper, catchAsync(updateAdmin));
adminRoutes.delete('/subadmins/:id', requireSuper, catchAsync(deleteAdmin));
adminRoutes.post('/subadmins/:id/suspend', requireSuper, catchAsync(suspendAdmin));
adminRoutes.post('/subadmins/:id/reset-password', requireSuper, catchAsync(resetAdminPassword));

// 3. Authenticated routes (all admins)
const requireAdmin = requireAdminRole(['SUPER_ADMIN', 'APPLICATION_ADMIN', 'SUPPORT', 'ACCOUNT_MANAGER', 'VIEWER']);
adminRoutes.get('/auth/me', requireAdmin, catchAsync(getMe));

adminRoutes.use(requireAdmin);


adminRoutes.get('/vendors', catchAsync(listVendors));
adminRoutes.get('/vendors/:id', catchAsync(getVendor));
adminRoutes.put('/vendors/:id/plan', catchAsync(updateVendorPlan));
adminRoutes.post('/vendors/:id/revoke', catchAsync(revokeVendor));
adminRoutes.post('/vendors/:id/restore', catchAsync(restoreVendor));
adminRoutes.post('/vendors/:id/reset-device', catchAsync(resetVendorDevice));
adminRoutes.get('/vendors/:id/products', catchAsync(vendorProducts));
adminRoutes.get('/vendors/:id/products/export', catchAsync(exportVendorProducts));
adminRoutes.get('/vendors/:id/invoices', catchAsync(vendorInvoices));
adminRoutes.get('/vendors/:id/invoices/export', catchAsync(exportVendorInvoices));
adminRoutes.get('/vendors/:id/customers', catchAsync(vendorCustomers));
adminRoutes.get('/vendors/:id/customers/export', catchAsync(exportVendorCustomers));
adminRoutes.post('/vendors/:id/clear-sync', catchAsync(clearVendorSyncData));
adminRoutes.post('/vendors/:id/sync-to-mobile', catchAsync(triggerSyncToMobile));
adminRoutes.post('/vendors/:id/import-sync', catchAsync(importVendorSyncData));
adminRoutes.post('/keys/generate', catchAsync(generateKeys));
adminRoutes.post('/keys/request', catchAsync(createKeyRequest));
adminRoutes.post('/keys/:id/confirm-payment', catchAsync(confirmKeyPayment));
adminRoutes.get('/keys', catchAsync(listKeys));
adminRoutes.delete('/keys/:id', catchAsync(deleteKey));
adminRoutes.post('/keys/:id/revoke', catchAsync(revokeKey));
adminRoutes.post('/keys/:id/resend-email', catchAsync(resendKeyEmail));
adminRoutes.post('/vendors/:id/send-renewal', catchAsync(sendVendorRenewal));
adminRoutes.post('/payments', catchAsync(recordPayment));
adminRoutes.get('/payments', catchAsync(listPayments));
adminRoutes.get('/payments/vendor/:id', catchAsync(vendorPayments));
adminRoutes.get('/analytics/overview', catchAsync(analyticsOverview));
adminRoutes.get('/analytics/revenue', catchAsync(analyticsRevenue));
adminRoutes.get('/analytics/subscriptions', catchAsync(analyticsSubscriptions));
