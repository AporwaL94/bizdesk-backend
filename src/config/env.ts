import dotenv from 'dotenv';

dotenv.config();

export const env = {
  databaseUrl: process.env.DATABASE_URL ?? 'sqlite://database.sqlite',
  jwtSecret: process.env.JWT_SECRET ?? 'change-me-in-local-env',
  adminSecret: process.env.ADMIN_SECRET ?? '7772877280',
  gracePeriodDays: Number(process.env.GRACE_PERIOD_DAYS ?? 5),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  emailHost: process.env.EMAIL_HOST ?? '',
  emailPort: Number(process.env.EMAIL_PORT ?? 587),
  emailSecure: process.env.EMAIL_SECURE === 'true',
  emailUser: process.env.EMAIL_USER ?? '',
  emailPass: process.env.EMAIL_PASS ?? '',
  emailFrom: process.env.EMAIL_FROM ?? 'Kirana Desk <no-reply@kiranadesk.com>',
  adminUpiId: process.env.ADMIN_UPI_ID ?? 'kiranadesk@upi',
  resendApiKey: process.env.RESEND_API_KEY ?? ''
};
