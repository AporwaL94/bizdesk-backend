import crypto from 'crypto';

export function generateActivationKey(appId?: string) {
  const parts = Array.from({ length: 3 }, () =>
    crypto.randomBytes(2).toString('hex').toUpperCase()
  );

  let prefix = 'KRNK';
  if (appId) {
    const upper = appId.toUpperCase();
    if (upper === 'MEDIDESK') {
      prefix = 'MEDK';
    } else if (upper === 'KIRANADESK') {
      prefix = 'KRNK';
    } else if (appId.length >= 4) {
      prefix = (appId.substring(0, 3) + appId.charAt(appId.length - 1)).toUpperCase();
    } else {
      prefix = appId.toUpperCase();
    }
  }

  return `${prefix}-${parts.join('-')}`;
}
