import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef } from 'react';
import {
  Keyboard,
  Platform,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { AppText } from '@/components/AppText';
import { GlassCard } from '@/components/GlassCard';
import { useTheme } from '@/theme/ThemeProvider';
import { radius } from '@/theme/tokens';

interface StepNameProps {
  name: string;
  onChangeName: (text: string) => void;
  onSubmit: () => void;
}

/**
 * 1. Adım: İsim / Hitap
 * - Lüks parıldayan "Fısıltı" logo rozeti
 * - "Hoş geldin! ✨ Sana nasıl hitap etmemi istersin?" başlığı
 * - Şeffaf, alt çizgili minimalist giriş alanı
 */
export function StepName({ name, onChangeName, onSubmit }: StepNameProps) {
  const t = useTheme();
  const inputRef = useRef<TextInput>(null);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* ── Üst: Lüks "Fısıltı" Logo Rozeti ── */}
        <View style={styles.logoSection}>
          <View
            style={[
              styles.logoHalo,
              {
                backgroundColor: t.scheme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                borderColor: t.glassBorder,
              },
            ]}
          >
            <LinearGradient
              colors={t.accentGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoBadge}
            >

            </LinearGradient>
          </View>

          <AppText
            variant="overline"
            style={[styles.brandOverline, { color: t.accent }]}
          >
            FISILTI
          </AppText>
        </View>

        {/* ── Karşılama ve Hitap Sorusu ── */}
        <View style={styles.textSection}>
          <AppText variant="display" style={styles.greetingTitle}>
            Hoş geldin!
          </AppText>

          <AppText variant="title" style={styles.questionText}>
            Sana nasıl hitap etmemi istersin?
          </AppText>

          <AppText variant="body" tone="muted" style={styles.descriptionText}>
            Fısıltı, her gün seninle kendi adınla konuşsun ve ruhuna dokunan sözleri sana özel kılsın.
          </AppText>
        </View>

        {/* ── Şeffaf, Alt Çizgili Minimalist Input ── */}
        <GlassCard strong intensity={30} padded={false} style={styles.inputCard}>
          <View style={styles.inputInner}>
            <Ionicons
              name="person-outline"
              size={20}
              color={name ? t.accent : t.textMuted}
              style={styles.inputIcon}
            />

            <TextInput
              ref={inputRef}
              value={name}
              onChangeText={onChangeName}
              placeholder="Adın veya sana özel bir hitap..."
              placeholderTextColor={t.textFaint}
              style={[
                styles.input,
                {
                  color: t.text,
                  borderBottomColor: name ? t.accent : t.glassBorder,
                },
              ]}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={onSubmit}
              maxLength={24}
              selectionColor={t.accent}
            />

            {name.length > 0 && (
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={t.accent}
                style={styles.checkIcon}
              />
            )}
          </View>
        </GlassCard>

        {/* Küçük Zarafet İpucu */}
        <AppText variant="label" tone="faint" style={styles.hintText}>
          {name.trim()
            ? `Harika, artık sana "${name.trim()}" diye sesleneceğiz.`
            : 'Boş bırakırsan sana "Dostum" olarak hitap edeceğiz.'}
        </AppText>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoHalo: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandOverline: {
    letterSpacing: 2.4,
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
  },
  textSection: {
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: 28,
  },
  greetingTitle: {
    fontSize: 32,
    lineHeight: 38,
    textAlign: 'center',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 20,
    lineHeight: 26,
    textAlign: 'center',
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  inputCard: {
    borderRadius: radius.lg,
    marginHorizontal: 4,
    marginBottom: 16,
  },
  inputInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    borderBottomWidth: 1.5,
  },
  checkIcon: {
    marginLeft: 10,
  },
  hintText: {
    textAlign: 'center',
    fontSize: 12.5,
    lineHeight: 18,
  },
});
