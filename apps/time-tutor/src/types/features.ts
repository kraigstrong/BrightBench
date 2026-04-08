export type FeatureId =
  | 'challenge-mode'
  | 'time-format-24-hour'
  | 'elapsed-time';

export type FeatureAvailability = {
  enabled: boolean;
  label: string;
  reason?: string;
};
