import { Redirect, useLocalSearchParams } from 'expo-router';
import React from 'react';

import { isPourLabConcept, POUR_LAB_CONCEPTS } from '@/features/pour-lab/pour-engine';
import { PourLabScene } from '@/features/pour-lab/pour-lab-scene';

export function generateStaticParams() {
  return POUR_LAB_CONCEPTS.map((concept) => ({ concept }));
}

export default function PourLabScreen() {
  const params = useLocalSearchParams<{ concept?: string }>();

  if (!isPourLabConcept(params.concept)) {
    return <Redirect href="/lab/pour/peek" />;
  }

  return <PourLabScene key={params.concept} initialConcept={params.concept} />;
}
