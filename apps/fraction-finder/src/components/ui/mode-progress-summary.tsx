import React from 'react';

import { ProgressFooter, type ProgressFooterItem } from '@education/ui';
import { ProgressSummaryData } from '@/state/app-state';

type ModeProgressSummaryProps = {
  summary: ProgressSummaryData;
  emptyText?: string;
};

export function ModeProgressSummary({
  summary,
  emptyText = 'Ready for your first round.',
}: ModeProgressSummaryProps) {
  const items: ProgressFooterItem[] = summary.hasProgress
    ? summary.metrics.map((metric) => ({
        key: metric.label,
        label: metric.label,
        value: metric.value,
      }))
    : [];

  return <ProgressFooter emptyText={summary.emptyText ?? emptyText} items={items} />;
}
