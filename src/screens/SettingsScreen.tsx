import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../components/AppShell';
import { RoundIconButton, SecondaryButton } from '../components/Buttons';
import { ScreenHeader } from '../components/ScreenHeader';
import { SettingRow } from '../components/SettingRow';
import { ArrowLeft, Eye, Lightbulb, RotateCcw, Wind } from '../components/icons';
import { APP_VERSION } from '../constants/config';
import { theme } from '../constants/theme';
import { ProgressSnapshot, progressStore } from '../game/progressStore';

type Props = {
  progress: ProgressSnapshot;
  onBack: () => void;
  onReset: () => void;
};

export default function SettingsScreen({ progress, onBack, onReset }: Props) {
  const [armed, setArmed] = useState(false);
  const armTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (armTimer.current) clearTimeout(armTimer.current);
    };
  }, []);

  const toggleMarks = useCallback(() => {
    progressStore.setSetting('candyMarks', !progressStore.getState().settings.candyMarks);
  }, []);
  const toggleMotion = useCallback(() => {
    progressStore.setSetting('gentleMotion', !progressStore.getState().settings.gentleMotion);
  }, []);
  const toggleHint = useCallback(() => {
    progressStore.setSetting('hintPulse', !progressStore.getState().settings.hintPulse);
  }, []);

  const tapReset = useCallback(() => {
    if (armed) {
      if (armTimer.current) clearTimeout(armTimer.current);
      setArmed(false);
      progressStore.reset();
      onReset();
      return;
    }
    setArmed(true);
    armTimer.current = setTimeout(() => setArmed(false), 4000);
  }, [armed, onReset]);

  return (
    <AppShell variant="settings">
      <ScreenHeader
        title="SETTINGS"
        leftSlot={<RoundIconButton label="BACK" Icon={ArrowLeft} onPress={onBack} />}
      />

      <View style={styles.body} pointerEvents="box-none">
        <SettingRow
          title="CANDY MARKS"
          description="Shows a shape on every candy colour for easier telling apart."
          Icon={Eye}
          tint={theme.colors.primary}
          value={progress.settings.candyMarks}
          onPress={toggleMarks}
        />
        <SettingRow
          title="GENTLE MOTION"
          description="Shorter falls, no confetti, quicker screen changes."
          Icon={Wind}
          tint="#5B8FF9"
          value={progress.settings.gentleMotion}
          onPress={toggleMotion}
        />
        <SettingRow
          title="HINT PULSE"
          description="Highlights the biggest group after 6 idle seconds."
          Icon={Lightbulb}
          tint={theme.colors.reward}
          value={progress.settings.hintPulse}
          onPress={toggleHint}
        />
        <SettingRow
          title="RESET PROGRESS"
          description="Wipes stages, stars, seeds, blooms, missions and chests."
          Icon={RotateCcw}
          tint={theme.colors.danger}
          destructive
          armed={armed}
          onPress={tapReset}
        />
      </View>

      <Text style={styles.version}>
        {'VERSION ' + APP_VERSION + ' · OFFLINE · NO ACCOUNTS'}
      </Text>

      <View style={styles.footer} pointerEvents="box-none">
        <SecondaryButton label="MENU" onPress={onBack} height={48} tone={theme.colors.secondary} />
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: 16, gap: 10 },
  version: {
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: theme.colors.textMuted,
    marginBottom: 10,
  },
  footer: { paddingHorizontal: 20, paddingBottom: 22 },
});
