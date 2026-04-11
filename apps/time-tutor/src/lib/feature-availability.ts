import { Platform } from 'react-native';

import type { FeatureAvailability, FeatureId } from '@/types/features';

const WEB_PRELAUNCH_ENTITLEMENTS: Partial<Record<FeatureId, true>> = {
  'time-format-24-hour': true,
  'elapsed-time': true,
};

export function getFeatureAvailability(
  featureId: FeatureId,
  platform: string = Platform.OS,
): FeatureAvailability {
  switch (featureId) {
    case 'challenge-mode':
      return platform === 'web' && !WEB_PRELAUNCH_ENTITLEMENTS[featureId]
        ? {
            enabled: false,
            label: '1-Minute Challenge',
            reason: 'Available on the App Store',
          }
        : {
            enabled: true,
            label: '1-Minute Challenge',
          };
    case 'time-format-24-hour':
      return platform === 'web' && !WEB_PRELAUNCH_ENTITLEMENTS[featureId]
        ? {
            enabled: false,
            label: '24-hour',
            reason: 'Available in the paid mobile app',
          }
        : {
            enabled: true,
            label: '24-hour',
          };
    case 'elapsed-time':
      return platform === 'web' && !WEB_PRELAUNCH_ENTITLEMENTS[featureId]
        ? {
            enabled: false,
            label: 'Elapsed Time',
            reason: 'Available in the paid mobile app',
          }
        : {
            enabled: true,
            label: 'Elapsed Time',
          };
    default:
      return {
        enabled: false,
        label: 'Unavailable feature',
      };
  }
}
