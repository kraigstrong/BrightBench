import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@education/ui';

import { AppShell } from '@/components/app-shell';
import { BackButton, HeaderBar } from '@/components/header-bar';
import { palette, typography } from '@/design/theme';

const CONTACT_EMAIL = 'support@timetutor.app';

export default function PrivacyScreen() {
  return (
    <AppShell>
      <HeaderBar
        title="Privacy"
        subtitle="How Time Tutor handles data"
        leftAction={<BackButton onPress={() => router.replace('/')} testID="privacy-back-button" />}
      />

      <Card style={styles.card}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.updatedAt}>Last updated: April 2, 2026</Text>
        <Text style={styles.body}>
          Time Tutor respects your privacy.
        </Text>
        <Text style={styles.body}>
          This Privacy Policy explains how Time Tutor handles information when you
          use our website, web app, and related applications.
        </Text>

        <PolicySection title="Information We Collect">
          <Text style={styles.body}>
            Time Tutor does not require an account, and we do not collect personal
            information through the app.
          </Text>
          <Text style={styles.body}>
            The app may store basic settings or progress locally on your device or in
            your browser so it can function properly.
          </Text>
          <Text style={styles.body}>
            If you contact us for support, we may receive the information you choose
            to include in your email and use it only to respond to your message.
          </Text>
        </PolicySection>

        <PolicySection title="Children's Privacy">
          <Text style={styles.body}>
            Time Tutor is designed for children, parents, and teachers as an
            educational tool for learning to read analog and digital clocks.
          </Text>
          <Text style={styles.body}>
            We do not knowingly collect personal information from children through the
            app.
          </Text>
          <Text style={styles.body}>
            If you believe a child has provided personal information to us, please
            contact us and we will address the issue promptly.
          </Text>
        </PolicySection>

        <PolicySection title="Website and Technical Services">
          <Text style={styles.body}>
            When you use the Time Tutor website or web app, basic technical
            information may be processed by hosting or infrastructure providers as
            part of delivering the site securely.
          </Text>
        </PolicySection>

        <PolicySection title="Data Retention">
          <Text style={styles.body}>
            Because Time Tutor does not require accounts or collect personal
            information through the app, we generally do not retain personal data from
            app usage.
          </Text>
          <Text style={styles.body}>
            If you contact us for support, we may keep that correspondence for as long
            as reasonably necessary to respond to you and maintain support records.
          </Text>
        </PolicySection>

        <PolicySection title="Your Choices">
          <Text style={styles.body}>You can stop using Time Tutor at any time.</Text>
          <Text style={styles.body}>
            For web use, you may be able to clear locally stored settings or data
            through your browser settings.
          </Text>
          <Text style={styles.body}>
            For app use, you may be able to remove locally stored data by deleting the
            app or using your device settings, depending on platform behavior.
          </Text>
        </PolicySection>

        <PolicySection title="Changes to This Policy">
          <Text style={styles.body}>
            We may update this Privacy Policy from time to time. If we make changes,
            we will post the updated version on this page and update the &ldquo;Last
            updated&rdquo; date above.
          </Text>
        </PolicySection>

        <PolicySection title="Contact">
          <Text style={styles.body}>
            If you have questions about this Privacy Policy or need support, contact us at:
          </Text>
          <Text selectable style={styles.email}>
            {CONTACT_EMAIL}
          </Text>
        </PolicySection>
      </Card>
    </AppShell>
  );
}

function PolicySection({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
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
  updatedAt: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    color: palette.ink,
    fontFamily: typography.displayFamily,
    fontSize: 24,
    fontWeight: '700',
    marginTop: 4,
  },
  sectionBody: {
    gap: 10,
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
});
