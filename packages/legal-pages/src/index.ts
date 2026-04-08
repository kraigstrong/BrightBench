export type SupportPageConfig = {
  appName: string;
  supportEmail: string;
  supportIntro?: string;
};

export type PrivacyPageConfig = {
  appName: string;
  companyName?: string;
  contactEmail: string;
  dataPracticesSummary: string[];
};

export function buildDefaultSupportIntro(appName: string): string {
  return `Need help with ${appName}? Reach out and we will get back to you as soon as we can.`;
}

export function buildDefaultPrivacySummary(appName: string): string[] {
  return [
    `${appName} does not require an account to play.`,
    `${appName} should collect as little personal information as possible.`,
    'This summary should be customized per app before launch.',
  ];
}
