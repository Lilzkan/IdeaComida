import { useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

import { COLORS } from '@/constants/colors';

const HEART =
  'M9 15.4C5.7 13.1 3 10.9 3 8.2 3 6.3 4.4 5 6.2 5c1.1 0 2.1.5 2.8 1.4C9.7 5.5 10.7 5 11.8 5 13.6 5 15 6.3 15 8.2c0 2.7-2.7 4.9-6 7.2Z';

const SPARKLE = 'M9 1.8l1.7 4.6 4.5 1.6-4.5 1.6L9 14.2l-1.7-4.6L2.8 8l4.5-1.6z';

type Motif = {
  key: string;
  x: number;
  y: number;
  kind: 'heart' | 'sparkle' | 'check';
  scale: number;
  color: string;
};

/**
 * Fondo decorativo: degradado crema + corazones, destellos y cuadritos
 * picnic al 15% de opacidad. No captura toques.
 */
export default function DecorBackground() {
  const { width, height } = useWindowDimensions();

  const motifs = useMemo<Motif[]>(() => {
    const list: Motif[] = [];
    const stepX = 92;
    const stepY = 104;
    const rows = Math.ceil(height / stepY) + 1;
    const cols = Math.ceil(width / stepX) + 1;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const kind = (row * 3 + col) % 3 === 0 ? 'heart' : (row + col) % 3 === 1 ? 'sparkle' : 'check';
        const jitterX = ((row * 37 + col * 19) % 23) - 11;
        const jitterY = ((row * 13 + col * 31) % 19) - 9;

        list.push({
          key: `${row}-${col}`,
          x: col * stepX + jitterX + (row % 2 === 0 ? 18 : 0),
          y: row * stepY + jitterY,
          kind,
          scale: 0.75 + ((row + col) % 4) * 0.14,
          color: kind === 'heart' ? COLORS.primary : kind === 'sparkle' ? COLORS.accent : COLORS.warning,
        });
      }
    }
    return list;
  }, [width, height]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={[COLORS.background, '#FFF3F5', COLORS.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        {motifs.map((motif) => (
          <G
            key={motif.key}
            opacity={0.15}
            transform={`translate(${motif.x}, ${motif.y}) scale(${motif.scale})`}
          >
            {motif.kind === 'heart' && <Path d={HEART} fill={motif.color} />}
            {motif.kind === 'sparkle' && <Path d={SPARKLE} fill={motif.color} />}
            {motif.kind === 'check' && (
              <>
                <Rect
                  x={1}
                  y={1}
                  width={7}
                  height={7}
                  rx={2}
                  fill="none"
                  stroke={motif.color}
                  strokeWidth={1.4}
                />
                <Rect
                  x={7}
                  y={7}
                  width={7}
                  height={7}
                  rx={2}
                  fill="none"
                  stroke={motif.color}
                  strokeWidth={1.4}
                />
                <Circle cx={12.5} cy={2.5} r={1.4} fill={motif.color} />
              </>
            )}
          </G>
        ))}
      </Svg>
    </View>
  );
}
