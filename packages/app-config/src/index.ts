export type EducationAppConfig = {
  androidPackage?: string;
  bundleId: string;
  displayName: string;
  iosBundleId?: string;
  supportEmail: string;
  marketingUrl?: string;
  scheme?: string;
  slug: string;
};

type BackCapableRouter<Href> = {
  back: () => void;
  canGoBack?: () => boolean;
  replace: (href: Href) => void;
};

export function buildWebExportCommand(appName: string): string {
  return `npm run web:export -w ${appName}`;
}

export function buildIosCommand(appName: string): string {
  return `npm run ios -w ${appName}`;
}

export const releaseStandards = {
  defaultEasProfiles: ['development', 'preview', 'production'] as const,
  vercelProjectNameRule: 'Use the workspace slug as the Vercel project name.',
} as const;

export function compactSlugForBundleId(slug: string): string {
  return slug.replace(/-/g, '');
}

export function buildBundleId(bundlePrefix: string, slug: string): string {
  return `${bundlePrefix}.${compactSlugForBundleId(slug)}`;
}

export function buildVercelProjectName(slug: string): string {
  return slug;
}

export function goBackOrReplace<Href>(
  router: BackCapableRouter<Href>,
  fallbackHref: Href,
): void {
  if (router.canGoBack?.()) {
    router.back();
    return;
  }

  router.replace(fallbackHref);
}
