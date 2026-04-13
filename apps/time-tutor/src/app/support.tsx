import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@education/ui';

import { AppShell } from '@/components/app-shell';
import { BackButton, HeaderBar } from '@/components/header-bar';
import { palette, typography } from '@/design/theme';

const SUPPORT_EMAIL = 'support@timetutor.app';

export default function SupportScreen() {
  return (
    <AppShell>
      <HeaderBar
        title="Support"
        subtitle="Help for Time Tutor"
        leftAction={<BackButton onPress={() => router.replace('/')} testID="support-back-button" />}
      />

      <Card style={styles.card}>
        <Text style={styles.title}>Time Tutor Support</Text>

        <Text style={styles.sectionTitle}>About Time Tutor</Text>
        <Text style={styles.body}>
          Time Tutor helps children practice reading analog and digital time with
          simple, hands-on activities.
        </Text>

        <Text style={styles.sectionTitle}>Need help?</Text>
        <Text style={styles.body}>
          For support, bug reports, or feature requests, email:
        </Text>
        <Text selectable style={styles.email}>
          {SUPPORT_EMAIL}
        </Text>

        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <View style={styles.faqList}>
          <FaqItem
            answer="Time Tutor is designed for kids, parents, and teachers who want simple practice with analog and digital clocks."
            question="Who is Time Tutor for?"
          />
          <FaqItem
            answer="No. Time Tutor does not require an account."
            question="Do I need an account?"
          />
          <FaqItem
            answer="See our Privacy Policy for details."
            question="Does Time Tutor collect personal information?"
          />
          <FaqItem
            answer="Send us an email at support@timetutor.app."
            question="How do I report a bug or suggest a feature?"
          />
        </View>
      </Card>
    </AppShell>
  );
}

function FaqItem({
  answer,
  question,
}: {
  answer: string;
  question: string;
}) {
  return (
    <View style={styles.faqItem}>
      <Text style={styles.faqQuestion}>{question}</Text>
      <Text style={styles.faqAnswer}>{answer}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 14,
  },
  title: {
    color: palette.ink,
    fontFamily: typography.displayFamily,
    fontSize: 32,
    fontWeight: '700',
  },
  sectionTitle: {
    color: palette.ink,
    fontFamily: typography.displayFamily,
    fontSize: 24,
    fontWeight: '700',
    marginTop: 4,
  },
  body: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 18,
    lineHeight: 28,
  },
  email: {
    color: palette.coral,
    fontFamily: typography.bodyFamily,
    fontSize: 18,
    fontWeight: '700',
  },
  faqList: {
    gap: 14,
  },
  faqItem: {
    gap: 6,
  },
  faqQuestion: {
    color: palette.ink,
    fontFamily: typography.bodyFamily,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 24,
  },
  faqAnswer: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 16,
    lineHeight: 24,
  },
});
