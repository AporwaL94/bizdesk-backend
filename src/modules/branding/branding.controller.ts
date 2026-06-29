import { Request, Response } from 'express';

export async function getAppBranding(req: Request, res: Response) {
  const app = res.locals.app;
  if (!app) {
    res.status(404).json({ message: 'Application context not found.' });
    return;
  }

  // Safely parse JSON strings
  const parseJson = (str: string | null) => {
    if (!str) return null;
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  };

  const payload = {
    id: app.id,
    name: app.name,
    slug: app.slug,
    packageName: app.packageName,
    version: app.version,
    status: app.status,
    branding: {
      logo: app.logo,
      favicon: app.favicon,
      appIcon: app.appIcon,
      splashImage: app.splashImage,
      primaryColor: app.primaryColor,
      secondaryColor: app.secondaryColor,
      accentColor: app.accentColor,
      theme: app.theme,
      darkThemeColors: parseJson(app.darkThemeColors),
      lightThemeColors: parseJson(app.lightThemeColors),
      tagline: app.tagline,
      website: app.website,
      supportEmail: app.supportEmail,
      supportPhone: app.supportPhone,
      privacyPolicy: app.privacyPolicy,
      termsUrl: app.termsUrl,
      refundPolicy: app.refundPolicy,
      socialLinks: parseJson(app.socialLinks),
      loginBackground: app.loginBackground,
      playstoreUrl: app.playstoreUrl,
      appstoreUrl: app.appstoreUrl
    },
    settings: {
      gstEnabled: app.gstEnabled,
      inventoryEnabled: app.inventoryEnabled,
      onlineSync: app.onlineSync,
      offlineMode: app.offlineMode,
      subscriptionRequired: app.subscriptionRequired,
      freeTrialDays: app.freeTrialDays,
      deviceLimit: app.deviceLimit,
      maxUsers: app.maxUsers,
      maxProducts: app.maxProducts,
      maxCustomers: app.maxCustomers,
      currency: app.currency,
      language: app.language,
      timezone: app.timezone,
      country: app.country,
      state: app.state
    }
  };

  res.json(payload);
}
