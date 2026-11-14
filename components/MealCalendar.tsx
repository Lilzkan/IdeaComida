import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react-native';

import BouncyPressable from './ui/BouncyPressable';
import Text from './ui/Text';
import { COLORS } from '@/constants/colors';
import { BRANDS_BY_ID, type Meal } from '@/constants/brands';
import { FONTS, RADIUS, SHADOWS } from '@/constants/theme';

const WEEK_DAYS = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'];

type MealCalendarProps = {
  meals: Meal[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
};

function dayKey(date: Date) {
  return format(date, 'yyyy-MM-dd');
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Calendario mensual cute: cada día muestra stickers de lo que comieron y
 * marca con un puntito los días en que repitieron marca en menos de 7 días.
 */
export default function MealCalendar({ meals, selectedDate, onSelectDate }: MealCalendarProps) {
  const [month, setMonth] = useState(() => startOfMonth(selectedDate));

  const mealsByDay = useMemo(() => {
    const map = new Map<string, Meal[]>();
    for (const meal of meals) {
      const date = new Date(meal.eaten_at);
      if (Number.isNaN(date.getTime())) continue;
      const key = dayKey(date);
      map.set(key, [...(map.get(key) ?? []), meal]);
    }
    return map;
  }, [meals]);

  const repeatedDays = useMemo(() => {
    const sorted = [...meals].sort(
      (a, b) => new Date(a.eaten_at).getTime() - new Date(b.eaten_at).getTime()
    );
    const lastSeen = new Map<string, number>();
    const repeated = new Set<string>();

    for (const meal of sorted) {
      const time = new Date(meal.eaten_at).getTime();
      if (Number.isNaN(time)) continue;
      const previous = lastSeen.get(meal.brand_id);
      if (previous !== undefined && time - previous <= 7 * 24 * 60 * 60 * 1000) {
        repeated.add(dayKey(new Date(meal.eaten_at)));
      }
      lastSeen.set(meal.brand_id, time);
    }
    return repeated;
  }, [meals]);

  const weeks = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start, end });
    const chunks: Date[][] = [];
    for (let index = 0; index < days.length; index += 7) {
      chunks.push(days.slice(index, index + 7));
    }
    return chunks;
  }, [month]);

  const monthLabel = capitalize(format(month, "MMMM 'de' yyyy", { locale: es }));

  return (
    <View style={[styles.card, SHADOWS.card]}>
      <View style={styles.header}>
        <BouncyPressable
          onPress={() => setMonth((current) => subMonths(current, 1))}
          haptic
          accessibilityRole="button"
          accessibilityLabel="Mes anterior"
          style={styles.navButton}
        >
          <ChevronLeft size={18} color={COLORS.primary} />
        </BouncyPressable>

        <View style={styles.monthWrap}>
          <Text style={styles.month}>{monthLabel}</Text>
          <View style={styles.monthPill}>
            <Sparkles size={11} color={COLORS.warning} />
            <Text style={styles.monthPillText}>{meals.length} recuerdos</Text>
          </View>
        </View>

        <BouncyPressable
          onPress={() => setMonth((current) => addMonths(current, 1))}
          haptic
          accessibilityRole="button"
          accessibilityLabel="Mes siguiente"
          style={styles.navButton}
        >
          <ChevronRight size={18} color={COLORS.primary} />
        </BouncyPressable>
      </View>

      <View style={styles.weekHeader}>
        {WEEK_DAYS.map((day) => (
          <Text key={day} style={styles.weekDay}>
            {day}
          </Text>
        ))}
      </View>

      {weeks.map((week) => (
        <View key={dayKey(week[0]!)} style={styles.weekRow}>
          {week.map((day) => {
            const key = dayKey(day);
            const dayMeals = mealsByDay.get(key) ?? [];
            const treats = [
              ...new Set(
                dayMeals.map((meal) => BRANDS_BY_ID[meal.brand_id]?.treat ?? '🍽️')
              ),
            ];
            const outside = !isSameMonth(day, month);
            const selected = isSameDay(day, selectedDate);
            const today = isToday(day);
            const repeated = repeatedDays.has(key);

            return (
              <BouncyPressable
                key={key}
                onPress={() => onSelectDate(day)}
                haptic
                scaleTo={0.92}
                accessibilityRole="button"
                accessibilityLabel={`${format(day, "d 'de' MMMM", { locale: es })}, ${
                  dayMeals.length
                } comidas`}
                style={[
                  styles.cell,
                  outside && styles.cellOutside,
                  today && !selected && styles.cellToday,
                  selected && styles.cellSelected,
                ]}
              >
                <Text
                  style={[
                    styles.dayNumber,
                    outside && styles.dayNumberOutside,
                    selected && styles.dayNumberSelected,
                  ]}
                >
                  {format(day, 'd')}
                </Text>

                {!outside && treats.length > 0 && (
                  <View style={styles.stickers}>
                    {treats.slice(0, 2).map((treat, index) => (
                      <Text key={`${key}-${index}`} style={styles.sticker}>
                        {treat}
                      </Text>
                    ))}
                    {treats.length > 2 && <Text style={styles.moreStickers}>+{treats.length - 2}</Text>}
                  </View>
                )}

                {!outside && repeated && <View style={styles.repeatDot} />}
              </BouncyPressable>
            );
          })}
        </View>
      ))}

      <View style={styles.legend}>
        <Text style={styles.legendText}>Toca un día para ver sus antojos ✨</Text>
        <View style={styles.legendRepeat}>
          <View style={styles.repeatDotStatic} />
          <Text style={styles.legendText}>repetición &lt; 7 días</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginTop: 6,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  monthWrap: { alignItems: 'center', gap: 3 },
  month: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.textPrimary },
  monthPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surfaceAlt,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.pill,
  },
  monthPillText: { fontSize: 10, color: COLORS.textSecondary, fontFamily: FONTS.medium },
  weekHeader: { flexDirection: 'row', marginBottom: 6 },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 10,
    color: COLORS.textSecondary,
    fontFamily: FONTS.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  weekRow: { flexDirection: 'row', gap: 3, marginBottom: 3 },
  cell: {
    flex: 1,
    minHeight: 54,
    borderRadius: RADIUS.sm,
    backgroundColor: `${COLORS.white}A6`,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingTop: 5,
    paddingBottom: 4,
    alignItems: 'center',
  },
  cellOutside: { backgroundColor: 'transparent', opacity: 0.35 },
  cellToday: { borderColor: COLORS.primarySoft },
  cellSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark,
  },
  dayNumber: {
    fontSize: 11,
    fontFamily: FONTS.semibold,
    color: COLORS.textPrimary,
  },
  dayNumberOutside: { color: COLORS.textSecondary },
  dayNumberSelected: { color: COLORS.textOnPrimary },
  stickers: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    marginTop: 1,
    flexWrap: 'wrap',
  },
  sticker: { fontSize: 13 },
  moreStickers: { fontSize: 8, color: COLORS.textSecondary, fontFamily: FONTS.bold },
  repeatDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.warning,
  },
  legend: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  legendText: { fontSize: 10, color: COLORS.textSecondary, flexShrink: 1 },
  legendRepeat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  repeatDotStatic: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.warning,
  },
});
