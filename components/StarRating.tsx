import { Pressable, StyleSheet, View } from 'react-native';
import { Star } from 'lucide-react-native';

import Text from './ui/Text';
import { COLORS } from '@/constants/colors';

type StarRatingProps = {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
  readOnly?: boolean;
  color?: string;
  disabledColor?: string;
  showText?: boolean;
};

const STARS = [1, 2, 3, 4, 5];

export default function StarRating({
  value = 0,
  onChange,
  size = 22,
  readOnly = false,
  color = COLORS.accent,
  disabledColor = COLORS.border,
  showText = false,
}: StarRatingProps) {
  const rounded = Math.round(value);

  return (
    <View
      style={styles.container}
      accessibilityRole="adjustable"
      accessibilityValue={{ text: `${rounded} de 5 estrellas` }}
    >
      {STARS.map((star) => {
        const active = star <= rounded;
        return (
          <Pressable
            key={star}
            onPress={() => !readOnly && onChange?.(star)}
            disabled={readOnly}
            hitSlop={4}
            accessibilityRole="button"
            accessibilityLabel={`${star} ${star === 1 ? 'estrella' : 'estrellas'}`}
            style={({ pressed }) => ({ opacity: pressed && !readOnly ? 0.7 : 1 })}
          >
            <Star
              size={size}
              color={active ? color : disabledColor}
              fill={active ? color : disabledColor}
            />
          </Pressable>
        );
      })}
      {showText && (
        <Text style={styles.text}>{rounded > 0 ? `${rounded} de 5` : 'Sin calificar'}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  text: {
    marginLeft: 6,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
