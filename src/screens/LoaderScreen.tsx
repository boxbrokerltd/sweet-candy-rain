import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { assets } from '../assets';
import { AppShell } from '../components/AppShell';
import { CandyRainDecor } from '../components/Decor';
import { BRAND_NAME, BRAND_TAGLINE, LOADER_DURATION_MS } from '../constants/config';
import { theme } from '../constants/theme';

type Props = { onDone: () => void };

/**
 * Brand card only: no PLAY button, no chips, no tap-to-skip.
 * The hand-off is driven by the 8 s timer alone.
 */
export default function LoaderScreen({ onDone }: Props) {
  const plate = useRef(new Animated.Value(0)).current;
  const title = useRef(new Animated.Value(0)).current;
  const logoY = useRef(new Animated.Value(10)).current;
  const bar = useRef(new Animated.Value(0)).current;
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    const intro = Animated.parallel([
      Animated.spring(plate, {
        toValue: 1,
        tension: 180,
        friction: 11,
        useNativeDriver: true,
      }),
      Animated.timing(logoY, {
        toValue: 0,
        duration: 520,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(title, {
        toValue: 1,
        duration: 420,
        delay: 260,
        useNativeDriver: true,
      }),
      Animated.timing(bar, {
        toValue: 1,
        duration: LOADER_DURATION_MS,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]);
    intro.start();

    const id = setTimeout(() => doneRef.current(), LOADER_DURATION_MS);
    return () => {
      clearTimeout(id);
      intro.stop();
    };
  }, [bar, logoY, plate, title]);

  const plateScale = plate.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1] });

  return (
    <AppShell variant="loader">
      <CandyRainDecor count={14} seed={2026} opacity={0.9} />
      <View style={styles.center} pointerEvents="none">
        <Animated.View
          style={[styles.plate, { opacity: plate, transform: [{ scale: plateScale }] }]}>
          <View style={styles.plateEdge} />
          <Animated.Image
            source={assets.logo}
            style={[styles.logo, { transform: [{ translateY: logoY }] }]}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View style={{ opacity: title, alignItems: 'center' }}>
          <Text style={styles.brand}>{BRAND_NAME}</Text>
          <Text style={styles.tagline}>{BRAND_TAGLINE}</Text>
        </Animated.View>

        <View style={styles.barTrack}>
          <Animated.View style={[styles.barFillWrap, { transform: [{ scaleX: bar }] }]}>
            <LinearGradient
              colors={theme.gradients.rain as unknown as string[]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.barFill}
            />
          </Animated.View>
        </View>
        <Text style={styles.loading}>{'LOADING...'}</Text>
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  plate: {
    width: 184,
    height: 184,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 10,
  },
  plateEdge: {
    position: 'absolute',
    top: 10,
    left: 28,
    right: 28,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  logo: { width: 148, height: 148 },
  brand: {
    marginTop: 34,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 3,
    color: '#FFFFFF',
    textShadowColor: '#FF69B4',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  tagline: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 4,
    color: '#FFC7E4',
  },
  barTrack: {
    marginTop: 40,
    width: 180,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.16)',
    overflow: 'hidden',
  },
  barFillWrap: {
    width: 180,
    height: 8,
    borderRadius: 4,
    transformOrigin: 'left' as any,
    alignSelf: 'flex-start',
  },
  barFill: { width: 180, height: 8, borderRadius: 4 },
  loading: {
    marginTop: 12,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3,
    color: '#FFC7E4',
  },
});
