import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useState, type ReactNode } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Switch, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { radius } from '@/theme/tokens';
import type { IconName, TimeOfDay } from '@/types';
import { formatTime } from '@/utils/schedule';
import { AppText } from './AppText';
import { GlassCard } from './GlassCard';
import { PressableScale } from './PressableScale';

/* ───────────────────────── SettingRow ───────────────────────── */

export function SettingRow({
  icon,
  title,
  subtitle,
  right,
  last,
}: {
  icon: IconName;
  title: string;
  subtitle?: string;
  right?: ReactNode;
  last?: boolean;
}) {
  const t = useTheme();
  return (
    <View
      style={[
        styles.row,
        !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: t.glassBorder },
      ]}
    >
      <View style={[styles.rowIcon, { backgroundColor: t.accentSoft }]}>
        <Ionicons name={icon} size={18} color={t.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <AppText variant="body" style={{ fontFamily: 'DMSans_600SemiBold', fontSize: 15 }}>
          {title}
        </AppText>
        {subtitle && (
          <AppText variant="label" tone="muted" style={{ marginTop: 2 }}>
            {subtitle}
          </AppText>
        )}
      </View>
      {right}
    </View>
  );
}

/* ───────────────────────── Toggle ───────────────────────── */

export function Toggle({
  value,
  onValueChange,
  label,
}: {
  value: boolean;
  onValueChange: (v: boolean) => void;
  label: string;
}) {
  const t = useTheme();
  return (
    <Switch
      accessibilityLabel={label}
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: t.glassStrong, true: t.accent }}
      thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
      ios_backgroundColor={t.glassStrong}
    />
  );
}

/* ───────────────────────── SegmentedControl ───────────────────────── */

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; icon?: IconName }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const t = useTheme();
  return (
    <View style={[styles.segment, { backgroundColor: t.glass, borderColor: t.glassBorder }]}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <PressableScale
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            scaleTo={0.96}
            style={[
              styles.segmentItem,
              active && {
                backgroundColor: t.scheme === 'dark' ? 'rgba(255,255,255,0.16)' : '#FFFFFF',
                shadowColor: '#000',
                shadowOpacity: 0.15,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 },
                elevation: 3,
              },
            ]}
          >
            {o.icon && (
              <Ionicons
                name={o.icon}
                size={16}
                color={active ? t.accent : t.textMuted}
              />
            )}
            <AppText
              variant="label"
              style={{
                fontFamily: active ? 'DMSans_700Bold' : 'DMSans_500Medium',
                color: active ? t.text : t.textMuted,
              }}
            >
              {o.label}
            </AppText>
          </PressableScale>
        );
      })}
    </View>
  );
}

/* ───────────────────────── Stepper ───────────────────────── */

export function Stepper({
  value,
  min,
  max,
  onChange,
  suffix,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  const t = useTheme();
  const btn = (icon: IconName, next: number, disabled: boolean, label: string) => (
    <PressableScale
      disabled={disabled}
      onPress={() => onChange(next)}
      accessibilityLabel={label}
      style={[
        styles.stepBtn,
        {
          backgroundColor: t.glassStrong,
          borderColor: t.glassBorder,
          opacity: disabled ? 0.35 : 1,
        },
      ]}
    >
      <Ionicons name={icon} size={16} color={t.text} />
    </PressableScale>
  );

  return (
    <View style={styles.stepper}>
      {btn('remove', value - 1, value <= min, 'Azalt')}
      <View style={styles.stepDisplay}>
        <AppText variant="title" style={{ textAlign: 'center', fontSize: 20 }}>
          {value}
        </AppText>
        {suffix && (
          <AppText variant="label" tone="muted" style={{ fontSize: 11 }}>
            {suffix}
          </AppText>
        )}
      </View>
      {btn('add', value + 1, value >= max, 'Arttır')}
    </View>
  );
}

/* ───────────────────────── TimePickerField ───────────────────────── */

const toDate = (t: TimeOfDay) => {
  const d = new Date();
  d.setHours(t.hour, t.minute, 0, 0);
  return d;
};
const fromDate = (d: Date): TimeOfDay => ({ hour: d.getHours(), minute: d.getMinutes() });

export function TimePickerField({
  value,
  onChange,
  label,
}: {
  value: TimeOfDay;
  onChange: (t: TimeOfDay) => void;
  label: string;
}) {
  const t = useTheme();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(toDate(value));

  const openPicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: toDate(value),
        mode: 'time',
        is24Hour: true,
        onChange: (e, d) => e.type === 'set' && d && onChange(fromDate(d)),
      });
    } else {
      setDraft(toDate(value));
      setOpen(true);
    }
  };

  return (
    <>
      <PressableScale
        onPress={openPicker}
        accessibilityLabel={`${label}: ${formatTime(value)}`}
        style={[
          styles.timeField,
          { backgroundColor: t.glassStrong, borderColor: t.glassBorder },
        ]}
      >
        <View style={styles.timeLabelRow}>
          <Ionicons name="time-outline" size={13} color={t.accent} />
          <AppText variant="overline" style={{ color: t.accent, fontSize: 10, letterSpacing: 1.2 }}>
            {label}
          </AppText>
        </View>
        <AppText variant="title" style={styles.timeValueText}>
          {formatTime(value)}
        </AppText>
      </PressableScale>

      {Platform.OS === 'ios' && (
        <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
          <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
            <Pressable onPress={() => {}} style={{ width: '100%' }}>
              <GlassCard strong intensity={70} style={styles.sheet}>
                <AppText variant="title" style={{ textAlign: 'center' }}>
                  {label}
                </AppText>
                <DateTimePicker
                  value={draft}
                  mode="time"
                  display="spinner"
                  is24Hour
                  locale="tr-TR"
                  themeVariant={t.scheme}
                  onChange={(_, d) => d && setDraft(d)}
                />
                <PressableScale
                  onPress={() => {
                    onChange(fromDate(draft));
                    setOpen(false);
                  }}
                  style={[styles.primaryBtn, { backgroundColor: t.accent }]}
                >
                  <AppText
                    variant="label"
                    style={{
                      color: t.scheme === 'dark' ? '#1C1830' : '#FFFFFF',
                      fontFamily: 'DMSans_700Bold',
                    }}
                  >
                    Tamam
                  </AppText>
                </PressableScale>
              </GlassCard>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </>
  );
}

/* ───────────────────────── DayPicker ───────────────────────── */

const DAYS = [
  { d: 1, l: 'Pzt' },
  { d: 2, l: 'Sal' },
  { d: 3, l: 'Çar' },
  { d: 4, l: 'Per' },
  { d: 5, l: 'Cum' },
  { d: 6, l: 'Cmt' },
  { d: 0, l: 'Paz' },
];

export function DayPicker({
  value,
  onChange,
}: {
  value: number[];
  onChange: (days: number[]) => void;
}) {
  const t = useTheme();

  return (
    <View style={styles.days}>
      {DAYS.map(({ d, l }) => {
        const active = value.includes(d);
        return (
          <PressableScale
            key={d}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: active }}
            onPress={() => onChange(active ? value.filter((x) => x !== d) : [...value, d])}
            style={[
              styles.day,
              {
                borderColor: active ? t.accent : t.glassBorder,
                backgroundColor: active ? t.accent : t.glassStrong,
              },
            ]}
          >
            <AppText
              variant="label"
              style={{
                fontFamily: 'DMSans_700Bold',
                fontSize: 11,
                color: active ? '#FFFFFF' : t.textMuted,
              }}
            >
              {l}
            </AppText>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segment: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  segmentItem: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: radius.sm,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepDisplay: {
    minWidth: 46,
    alignItems: 'center',
  },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  timeField: {
    flex: 1,
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 1,
  },
  timeLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  timeValueText: {
    fontSize: 26,
    lineHeight: 32,
    marginTop: 4,
    fontFamily: 'DMSans_700Bold',
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 14,
  },
  sheet: {
    borderRadius: radius.xl,
    paddingBottom: 16,
  },
  primaryBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: radius.pill,
    marginTop: 12,
  },
  days: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  day: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
