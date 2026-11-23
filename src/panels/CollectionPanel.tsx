import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../components/AppShell';
import { RoundIconButton, SecondaryButton } from '../components/Buttons';
import { PlantPlot } from '../components/Cards';
import { ClayCard, EmptyState, Pill, ProgressBar } from '../components/Common';
import { ScreenHeader } from '../components/ScreenHeader';
import { ArrowLeft, Sprout } from '../components/icons';
import { PLANTS } from '../constants/plants';
import { theme } from '../constants/theme';
import { bloomCount, worldUnlockNote } from '../game/progression';
import { ProgressSnapshot, progressStore } from '../game/progressStore';

type Props = {
  progress: ProgressSnapshot;
  onBack: () => void;
};

export default function CollectionPanel({ progress, onBack }: Props) {
  const blooms = bloomCount(progress.bloomed);
  const empty = progress.seeds === 0 && blooms === 0;

  const plant = useCallback((id: number) => {
    progressStore.plant(id);
  }, []);

  return (
    <AppShell variant="collection">
      <ScreenHeader
        title="COLLECTION"
        leftSlot={<RoundIconButton label="BACK" Icon={ArrowLeft} onPress={onBack} />}
        rightSlot={
          <Pill Icon={Sprout} value={String(progress.seeds)} tone={theme.colors.success} />
        }
      />

      <ClayCard style={styles.head}>
        <View style={styles.headRow}>
          <Text style={styles.headTitle}>CANDY GARDEN</Text>
          <Text style={styles.headMeta}>{blooms + '/' + PLANTS.length + ' BLOOMING'}</Text>
        </View>
        <ProgressBar
          value={blooms}
          max={PLANTS.length}
          height={8}
          colors={[theme.colors.success, '#9BE7CD']}
        />
        <Text style={styles.headNote}>{worldUnlockNote()}</Text>
      </ClayCard>

      <View style={styles.body} pointerEvents="box-none">
        {empty ? (
          <EmptyState Icon={Sprout} message="NO SEEDS YET - CLEAR A STAGE TO HARVEST SEEDS" />
        ) : (
          <View style={styles.grid} pointerEvents="box-none">
            {PLANTS.map(p => (
              <PlantPlot
                key={p.id}
                plant={p}
                bloomed={progress.bloomed[p.id]}
                seeds={progress.seeds}
                onPlant={() => plant(p.id)}
              />
            ))}
          </View>
        )}
      </View>

      <View style={styles.footer} pointerEvents="box-none">
        <SecondaryButton label="MENU" onPress={onBack} height={48} tone={theme.colors.secondary} />
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  head: { marginHorizontal: 16, padding: 14, gap: 8 },
  headRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: theme.colors.text,
  },
  headMeta: { fontSize: 12, fontWeight: '800', color: theme.colors.success },
  headNote: { fontSize: 10, fontWeight: '700', letterSpacing: 0.6, color: theme.colors.textSoft },
  body: { flex: 1, paddingHorizontal: 11, paddingTop: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  footer: { paddingHorizontal: 20, paddingBottom: 22 },
});
