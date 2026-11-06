import { router } from 'expo-router';
import React from 'react';
import {
  Linking,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AppShell } from '@/components/app-shell';
import { BackButton, HeaderBar } from '@/components/header-bar';
import { Card } from '@education/ui';
import { APP_VERSION } from '@/config/app-info';
import { palette, typography } from '@/design/theme';
import { getFeatureAvailability } from '@/lib/feature-availability';
import { requestReviewIfDue } from '@/lib/review-request';
import { getSiteUrl, getTimeTutorWriteReviewUrl } from '@/lib/site-links';
import { useAppState } from '@/state/app-state';
import type { TimeFormat } from '@/types/time';

// The rating sheet follows the parent check rather than stacking on it: it waits
// for the check's modal to finish dismissing, then a beat more.
const REVIEW_AFTER_GATE_DELAY_MS = 500;

const timeFormatOptions: {
  description: string;
  label: string;
  value: TimeFormat;
}[] = [
  {
    description: 'Show times like 3:15.',
    label: '12-hour',
    value: '12-hour',
  },
  {
    description: 'Show times like 15:15.',
    label: '24-hour',
    value: '24-hour',
  },
];

export default function SettingsScreen() {
  const {
    isHydrated,
    setSoundEffectsEnabled,
    setTimeFormat,
    soundEffectsEnabled,
    timeFormat,
  } = useAppState();
  const timeFormat24Availability = getFeatureAvailability('time-format-24-hour');
  const [gateAnswer, setGateAnswer] = React.useState('');
  const [gateError, setGateError] = React.useState('');
  const [isGateVisible, setIsGateVisible] = React.useState(false);
  const [gatePrompt, setGatePrompt] = React.useState(() => createParentalGatePrompt());
  const [grownUpLinksUnlocked, setGrownUpLinksUnlocked] = React.useState(false);
  const isNativeIos = Platform.OS === 'ios';
  // Web and Android have no parent check; native iOS shows the links only
  // after a grown-up passes it, for the rest of this visit to Settings.
  const showGrownUpLinks = !isNativeIos || grownUpLinksUnlocked;
  const isMountedRef = React.useRef(true);
  const reviewAfterGateRef = React.useRef(false);
  const reviewTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      reviewAfterGateRef.current = false;

      if (reviewTimerRef.current) {
        clearTimeout(reviewTimerRef.current);
        reviewTimerRef.current = null;
      }
    };
  }, []);

  const openExternalLink = React.useCallback((url: string) => {
    Linking.openURL(url).catch(() => {});
  }, []);

  const closeGate = React.useCallback(() => {
    setIsGateVisible(false);
    setGateAnswer('');
    setGateError('');
  }, []);

  const openGate = React.useCallback(() => {
    setGatePrompt(createParentalGatePrompt());
    setGateAnswer('');
    setGateError('');
    setIsGateVisible(true);
  }, []);

  const submitGate = React.useCallback(() => {
    if (gateAnswer.trim() === String(gatePrompt.answer)) {
      closeGate();
      setGrownUpLinksUnlocked(true);
      reviewAfterGateRef.current = true;
      return;
    }

    setGateAnswer('');
    setGateError('Please ask a parent to try again.');
    setGatePrompt(createParentalGatePrompt());
  }, [closeGate, gateAnswer, gatePrompt.answer]);

  // iOS only: Modal's onDismiss fires once the parent check is fully gone.
  const handleGateDismiss = React.useCallback(() => {
    if (!reviewAfterGateRef.current) {
      return;
    }

    reviewAfterGateRef.current = false;

    if (reviewTimerRef.current) {
      clearTimeout(reviewTimerRef.current);
    }

    reviewTimerRef.current = setTimeout(() => {
      reviewTimerRef.current = null;
      requestReviewIfDue(() => !isMountedRef.current).catch(() => {});
    }, REVIEW_AFTER_GATE_DELAY_MS);
  }, []);

  return (
    <>
      <AppShell>
        <HeaderBar
          title="Settings"
          leftAction={<BackButton onPress={() => router.back()} testID="settings-back-button" />}
        />

        <Card style={styles.sectionCard}>
          <Text style={styles.eyebrow}>Time format</Text>
          <Text style={styles.sectionDescription}>
            Choose how digital times are displayed.
          </Text>
          <View style={styles.optionsColumn}>
            {timeFormatOptions.map((option) => {
              const isLocked =
                option.value === '24-hour' && !timeFormat24Availability.enabled;

              return (
                <SelectableOption
                  key={option.value}
                  description={option.description}
                  disabled={isLocked}
                  label={option.label}
                  onPress={() => setTimeFormat(option.value)}
                  selected={timeFormat === option.value}
                  testID={`time-format-${option.value}`}
                  trailingLabel={isLocked ? 'Locked' : undefined}
                />
              );
            })}
          </View>
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={styles.eyebrow}>Sound</Text>
          <View style={styles.toggleRow}>
            <View style={styles.toggleCopy}>
              <Text style={styles.toggleLabel}>Sound effects</Text>
              <Text style={styles.toggleDescription}>
                Play a chime for correct and incorrect answers.
              </Text>
            </View>
            <Switch
              onValueChange={setSoundEffectsEnabled}
              testID="sound-effects-toggle"
              trackColor={{ false: palette.ring, true: palette.teal }}
              value={soundEffectsEnabled}
            />
          </View>
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={styles.eyebrow}>For grown-ups</Text>
          <View style={styles.linksColumn}>
            {showGrownUpLinks ? (
              <>
                {isNativeIos ? (
                  <ExternalLinkRow
                    accessibilityLabel="Rate Time Tutor on the App Store"
                    label="Rate Time Tutor"
                    onPress={() => openExternalLink(getTimeTutorWriteReviewUrl())}
                    testID="settings-rate-link"
                  />
                ) : null}
                <ExternalLinkRow
                  accessibilityLabel="Support"
                  label="Support"
                  onPress={() => openExternalLink(getSiteUrl('/support'))}
                  testID="settings-support-link"
                />
                <ExternalLinkRow
                  accessibilityLabel="Privacy Policy"
                  label="Privacy Policy"
                  onPress={() => openExternalLink(getSiteUrl('/privacy'))}
                  testID="settings-privacy-link"
                />
              </>
            ) : (
              <Pressable
                accessibilityHint="Opens a parent check."
                accessibilityLabel="Show grown-up links"
                accessibilityRole="button"
                onPress={openGate}
                style={styles.linkRow}
                testID="settings-grown-ups-unlock">
                <Text style={styles.linkLabel}>Show grown-up links</Text>
                <Text style={styles.linkArrow}>›</Text>
              </Pressable>
            )}
          </View>
        </Card>

        <Text style={styles.footerNote}>
          {isHydrated
            ? 'Settings save automatically on this device.'
            : 'Loading saved settings...'}
        </Text>
        <Text style={styles.versionText}>Version {APP_VERSION}</Text>
      </AppShell>

      <Modal
        animationType="fade"
        onDismiss={handleGateDismiss}
        onRequestClose={closeGate}
        transparent
        visible={isGateVisible}>
        <View style={styles.gateBackdrop}>
          <View style={styles.gateCard}>
            <Text style={styles.gateTitle}>Parent Check</Text>
            <Text style={styles.gateDescription}>
              Ask a parent to answer this to see the grown-up links.
            </Text>
            <Text style={styles.gateQuestion} testID="parental-gate-question">
              {gatePrompt.prompt}
            </Text>
            <TextInput
              accessibilityLabel="Parental gate answer"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="number-pad"
              onChangeText={(text) => {
                setGateAnswer(text);
                if (gateError) {
                  setGateError('');
                }
              }}
              placeholder="Enter answer"
              placeholderTextColor={palette.inkMuted}
              style={styles.gateInput}
              testID="parental-gate-input"
              value={gateAnswer}
            />
            {gateError ? (
              <Text style={styles.gateError} testID="parental-gate-error">
                {gateError}
              </Text>
            ) : null}
            <View style={styles.gateActions}>
              <Pressable
                onPress={closeGate}
                style={styles.gateSecondaryButton}
                testID="parental-gate-cancel">
                <Text style={styles.gateSecondaryButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={submitGate}
                style={styles.gatePrimaryButton}
                testID="parental-gate-continue">
                <Text style={styles.gatePrimaryButtonText}>Continue</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

function createParentalGatePrompt() {
  const promptType = Math.floor(Math.random() * 3);

  if (promptType === 0) {
    const left = Math.floor(Math.random() * 36) + 24;
    const right = Math.floor(Math.random() * 28) + 17;

    return {
      answer: left + right,
      prompt: `What is ${left} + ${right}?`,
    };
  }

  if (promptType === 1) {
    const right = Math.floor(Math.random() * 19) + 11;
    const answer = Math.floor(Math.random() * 34) + 18;
    const left = answer + right;

    return {
      answer,
      prompt: `What is ${left} - ${right}?`,
    };
  }

  const multiplier = Math.floor(Math.random() * 6) + 3;
  const multiplicand = Math.floor(Math.random() * 5) + 4;
  const addend = Math.floor(Math.random() * 9) + 4;

  return {
    answer: multiplier * multiplicand + addend,
    prompt: `What is ${multiplier} × ${multiplicand} + ${addend}?`,
  };
}

function ExternalLinkRow({
  accessibilityLabel,
  label,
  onPress,
  testID,
}: {
  accessibilityLabel: string;
  label: string;
  onPress: () => void;
  testID: string;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="link"
      onPress={onPress}
      style={styles.linkRow}
      testID={testID}>
      <Text style={styles.linkLabel}>{label}</Text>
      <Text style={styles.linkArrow}>↗</Text>
    </Pressable>
  );
}

function SelectableOption({
  description,
  disabled = false,
  label,
  onPress,
  selected,
  testID,
  trailingLabel,
}: {
  description: string;
  disabled?: boolean;
  label: string;
  onPress: () => void;
  selected: boolean;
  testID?: string;
  trailingLabel?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.optionCard,
        selected && styles.optionCardSelected,
        disabled && styles.optionCardDisabled,
      ]}
      testID={testID}>
      <View style={styles.optionRow}>
        <View
          style={[
            styles.optionIndicator,
            selected && styles.optionIndicatorSelected,
          ]}>
          {selected ? <View style={styles.optionIndicatorDot} /> : null}
        </View>
        <View style={styles.optionCopy}>
          <View style={styles.optionTitleRow}>
            <Text
              style={[
                styles.optionLabel,
                selected && styles.optionLabelSelected,
                disabled && styles.optionLabelDisabled,
              ]}>
              {label}
            </Text>
            {trailingLabel ? (
              <View style={styles.lockedBadge}>
                <Text style={styles.lockedBadgeText}>{trailingLabel}</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.optionDescription}>{description}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    gap: 14,
  },
  eyebrow: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  sectionDescription: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 15,
    lineHeight: 22,
    marginTop: -6,
  },
  toggleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'space-between',
  },
  toggleCopy: {
    flex: 1,
    gap: 2,
  },
  toggleLabel: {
    color: palette.ink,
    fontFamily: typography.displayFamily,
    fontSize: 20,
    fontWeight: '700',
  },
  toggleDescription: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 15,
    lineHeight: 22,
  },
  optionsColumn: {
    gap: 12,
  },
  linksColumn: {
    gap: 10,
  },
  linkRow: {
    alignItems: 'center',
    backgroundColor: palette.surfaceMuted,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  linkLabel: {
    color: palette.ink,
    fontFamily: typography.bodyFamily,
    fontSize: 16,
    fontWeight: '700',
  },
  linkArrow: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 18,
    fontWeight: '700',
  },
  optionCard: {
    backgroundColor: palette.surfaceMuted,
    borderColor: 'transparent',
    borderRadius: 22,
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  optionCardSelected: {
    backgroundColor: '#FFF4E8',
    borderColor: palette.coral,
  },
  optionCardDisabled: {
    opacity: 0.7,
  },
  optionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  optionIndicator: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.ring,
    borderRadius: 999,
    borderWidth: 2,
    height: 24,
    justifyContent: 'center',
    marginTop: 2,
    width: 24,
  },
  optionIndicatorSelected: {
    borderColor: palette.coral,
  },
  optionIndicatorDot: {
    backgroundColor: palette.coral,
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  optionCopy: {
    flex: 1,
  },
  optionTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  optionLabel: {
    color: palette.ink,
    flex: 1,
    fontFamily: typography.displayFamily,
    fontSize: 20,
    fontWeight: '700',
  },
  optionLabelSelected: {
    color: palette.coral,
  },
  optionLabelDisabled: {
    color: palette.inkMuted,
  },
  optionDescription: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 4,
  },
  lockedBadge: {
    backgroundColor: palette.ring,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  lockedBadgeText: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  footerNote: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  versionText: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  gateBackdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(18, 53, 91, 0.34)',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  gateCard: {
    backgroundColor: palette.surface,
    borderRadius: 28,
    maxWidth: 420,
    paddingHorizontal: 24,
    paddingVertical: 24,
    width: '100%',
  },
  gateTitle: {
    color: palette.ink,
    fontFamily: typography.displayFamily,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  gateDescription: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 17,
    lineHeight: 24,
    marginTop: 10,
    textAlign: 'center',
  },
  gateQuestion: {
    color: palette.ink,
    fontFamily: typography.displayFamily,
    fontSize: 24,
    fontWeight: '700',
    marginTop: 20,
    textAlign: 'center',
  },
  gateInput: {
    backgroundColor: palette.surfaceMuted,
    borderColor: palette.ring,
    borderRadius: 18,
    borderWidth: 1,
    color: palette.ink,
    fontFamily: typography.bodyFamily,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
    textAlign: 'center',
  },
  gateError: {
    color: palette.danger,
    fontFamily: typography.bodyFamily,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  gateActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  gateSecondaryButton: {
    alignItems: 'center',
    backgroundColor: palette.surfaceMuted,
    borderRadius: 18,
    flex: 1,
    paddingVertical: 14,
  },
  gateSecondaryButtonText: {
    color: palette.ink,
    fontFamily: typography.bodyFamily,
    fontSize: 17,
    fontWeight: '700',
  },
  gatePrimaryButton: {
    alignItems: 'center',
    backgroundColor: palette.ink,
    borderRadius: 18,
    flex: 1,
    paddingVertical: 14,
  },
  gatePrimaryButtonText: {
    color: palette.white,
    fontFamily: typography.bodyFamily,
    fontSize: 17,
    fontWeight: '700',
  },
});
