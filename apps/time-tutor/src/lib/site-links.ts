import { Platform } from 'react-native';

const DEFAULT_SITE_ORIGIN = 'https://timetutor.app';

type SitePath = '/privacy' | '/support';
type SiteUrlOptions = {
  platform?: string;
  webOrigin?: string;
};

function getConfiguredSiteOrigin() {
  return process.env.EXPO_PUBLIC_SITE_ORIGIN || DEFAULT_SITE_ORIGIN;
}

function getWebOrigin(webOrigin?: string) {
  if (webOrigin) {
    return webOrigin;
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  return getConfiguredSiteOrigin();
}

export function getSiteUrl(path: SitePath, options: SiteUrlOptions = {}) {
  const platform = options.platform ?? Platform.OS;
  const origin =
    platform === 'web'
      ? getWebOrigin(options.webOrigin)
      : getConfiguredSiteOrigin();

  return new URL(path, origin).toString();
}
