import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { HEADER_H, HEADER_TOP } from '../constants/config';
import { theme } from '../constants/theme';

type Props = {
  title: string;
  subtitle?: string;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  solid?: boolean;
};

/**
 * ONE header for every screen (rule: no inline header markup that drifts).
 * Screens only vary leftSlot / title / rightSlot.
 */
function ScreenHeaderBase({ title, subtitle, leftSlot, rightSlot, solid }: Props) {
  return (
    <View style={[styles.wrap, solid ? styles.solid : null]} pointerEvents="box-none">
      <View style={styles.side} pointerEvents="box-none">
        {leftSlot}
      </View>
      <View style={styles.center} pointerEvents="none">
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={[styles.side, styles.sideRight]} pointerEvents="box-none">
        {rightSlot}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: HEADER_TOP,
    height: HEADER_TOP + HEADER_H,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  solid: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  side: { width: 104, justifyContent: 'center' },
  sideRight: { alignItems: 'flex-end' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
    color: theme.colors.text,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: theme.colors.textSoft,
  },
});

export const ScreenHeader = memo(ScreenHeaderBase);
export default ScreenHeader;
