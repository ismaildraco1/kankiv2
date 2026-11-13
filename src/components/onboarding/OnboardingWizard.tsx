import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { GradientBackground } from '@/components/GradientBackground';
import { PressableScale } from '@/components/PressableScale';
import { CATEGORIES, DEFAULT_ENABLED_CATEGORIES } from '@/data/categories';
import { rescheduleAll } from '@/services/notifications/scheduler';
import { requestPermission } from '@/services/notifications/setup';
import { syncWidgets } from '@/services/widgets/syncWidgets';
import { useAppStore } from '@/store/useAppStore';
import { useTheme } from '@/theme/ThemeProvider';
import { radius } from '@/theme/tokens';
import type { CategoryId, NotificationMode, ThemeId } from '@/types';
import { StepCategories } from './StepCategories';
import { StepName } from './StepName';
import { StepNotifications } from './StepNotifications';
import { StepTheme } from './StepTheme';

const TOTAL_STEPS = 4;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingWizardProps {
  onComplete?: () => void;
}

/**
 * Kanki - Karşılama Sihirbazı (Onboarding Wizard)
 * 1. Adım: İsim / Hitap
 * 2. Adım: Tema Seçimi (Canlı Önizleme)
 * 3. Adım: Kategori Seçimi (Çoklu Seçim Pill Butonlar)
 * 4. Adım: Bildirim ve Zamanlama (Rastgele Akış vs Özel Saatler)
 */
export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const insets = useSafeAreaInsets();
  const t = useTheme();

  // Store hooks
  const initialName = useAppStore((s) => s.userName);
  const initialTheme = useAppStore((s) => s.themePreference);
  const initialCategories = useAppStore((s) => s.enabledCategories);
  const initialNotification = useAppStore((s) => s.notification);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  // Yerel sihirbaz form state'i
  const [currentStep, setCurrentStep] = useState(0);
  const [name, setName] = useState(initialName || '');
  const [theme, setTheme] = useState<ThemeId>(
    initialTheme === 'oled' || initialTheme === 'warm' ? initialTheme : 'vibrant',
  );
  const [categories, setCategories] = useState<CategoryId[]>(
    initialCategories.length > 0 ? initialCategories : DEFAULT_ENABLED_CATEGORIES,
  );
  const [notificationMode, setNotificationMode] = useState<NotificationMode>(
    initialNotification.mode || 'random',
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animasyon referansları (Sayfa Geçişleri İçin Yumuşak Slide + Fade)
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateTransition = (direction: 'next' | 'prev', callback: () => void) => {
    const exitOffset = direction === 'next' ? -25 : 25;
    const enterOffset = direction === 'next' ? 25 : -25;

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 140,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
      Animated.timing(slideAnim, {
        toValue: exitOffset,
        duration: 140,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
    ]).start(() => {
      callback();
      slideAnim.setValue(enterOffset);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
      ]).start();
    });
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      animateTransition('next', () => setCurrentStep((prev) => prev + 1));
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      Haptics.selectionAsync().catch(() => {});
      animateTransition('prev', () => setCurrentStep((prev) => prev - 1));
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    handleFinish();
  };

  // Kategori çoklu seçim toggle
  const handleToggleCategory = (id: CategoryId) => {
    setCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const handleSelectAllCategories = () => {
    if (categories.length === CATEGORIES.length) {
      setCategories(DEFAULT_ENABLED_CATEGORIES);
    } else {
      setCategories(CATEGORIES.map((c) => c.id));
    }
  };

  // Tema seçildiğinde anında canlı tema uygulayalım
  const handleThemeChange = (newTheme: ThemeId) => {
    setTheme(newTheme);
    t.setTheme(newTheme);
  };

  // Onboarding tamamlama ve kalıcı depolama
  const handleFinish = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    try {
      // 1. Bildirim İzni İsteyelim
      await requestPermission().catch(console.warn);

      // 2. Store ve AsyncStorage'a Kalıcı Olarak Kaydedelim
      completeOnboarding({
        userName: name,
        theme,
        categories: categories.length > 0 ? categories : DEFAULT_ENABLED_CATEGORIES,
        notificationMode,
      });

      // 3. Bildirimleri ve Widget'ları Senkronize Edelim
      await rescheduleAll().catch(console.warn);
      await syncWidgets().catch(console.warn);

      // 4. Tamamlanma Tetikleyicisi
      onComplete?.();
    } catch (err) {
      console.warn('[Onboarding] Tamamlama hatası:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isNextDisabled = currentStep === 2 && categories.length === 0;

  return (
    <View style={[styles.root, { backgroundColor: t.background[0] }]}>
      <GradientBackground />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        {/* ── Üst Çubuk: Geri, İlerleme Göstergesi ve Atla ── */}
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <View style={styles.topActionWrap}>
            {currentStep > 0 ? (
              <PressableScale
                onPress={handleBack}
                accessibilityLabel="Geri Dön"
                scaleTo={0.92}
                style={[
                  styles.navBtn,
                  { backgroundColor: t.glassStrong, borderColor: t.glassBorder },
                ]}
              >
                <Ionicons name="arrow-back" size={18} color={t.text} />
              </PressableScale>
            ) : (
              <View style={styles.navBtnPlaceholder} />
            )}
          </View>

          {/* Adım Göstergesi (Progress Bar Pills) */}
          <View style={styles.progressContainer}>
            {Array.from({ length: TOTAL_STEPS }).map((_, index) => {
              const isActive = index === currentStep;
              const isPassed = index < currentStep;

              return (
                <View
                  key={index}
                  style={[
                    styles.progressPill,
                    {
                      backgroundColor: isActive
                        ? t.accent
                        : isPassed
                        ? t.scheme === 'dark'
                          ? 'rgba(255,255,255,0.4)'
                          : 'rgba(0,0,0,0.3)'
                        : t.scheme === 'dark'
                        ? 'rgba(255,255,255,0.12)'
                        : 'rgba(0,0,0,0.1)',
                      width: isActive ? 26 : 8,
                    },
                  ]}
                />
              );
            })}
          </View>

          {/* Atla Butonu */}
          <View style={styles.topActionWrap}>
            {currentStep < TOTAL_STEPS - 1 ? (
              <PressableScale
                onPress={handleSkip}
                accessibilityLabel="Tanıtımı Atla"
                scaleTo={0.94}
                style={styles.skipBtn}
              >
                <AppText variant="label" tone="muted" style={styles.skipText}>
                  Atla
                </AppText>
              </PressableScale>
            ) : (
              <View style={styles.navBtnPlaceholder} />
            )}
          </View>
        </View>

        {/* ── Adım İçerik Alanı (Animasyonlu) ── */}
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 90 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              styles.animatedContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            {currentStep === 0 && (
              <StepName
                name={name}
                onChangeName={setName}
                onSubmit={handleNext}
              />
            )}

            {currentStep === 1 && (
              <StepTheme
                selectedTheme={theme}
                onSelectTheme={handleThemeChange}
              />
            )}

            {currentStep === 2 && (
              <StepCategories
                selectedCategories={categories}
                onToggleCategory={handleToggleCategory}
                onSelectAll={handleSelectAllCategories}
              />
            )}

            {currentStep === 3 && (
              <StepNotifications
                mode={notificationMode}
                onSelectMode={setNotificationMode}
              />
            )}
          </Animated.View>
        </ScrollView>

        {/* ── Sabit Alt Çubuk (Aksiyon Butonu) ── */}
        <View
          style={[
            styles.bottomBar,
            {
              paddingBottom: insets.bottom + 14,
              backgroundColor: t.scheme === 'dark' ? 'rgba(10, 10, 16, 0.75)' : 'rgba(255, 255, 255, 0.75)',
              borderTopColor: t.glassBorder,
            },
          ]}
        >
          <PressableScale
            onPress={handleNext}
            disabled={isNextDisabled || isSubmitting}
            scaleTo={0.97}
            style={[
              styles.primaryBtnWrapper,
              (isNextDisabled || isSubmitting) && { opacity: 0.5 },
            ]}
          >
            <LinearGradient
              colors={t.accentGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryBtnGradient}
            >
              {isSubmitting ? (
                <ActivityIndicator
                  color={t.scheme === 'dark' ? '#000000' : '#FFFFFF'}
                  size="small"
                />
              ) : (
                <>
                  <AppText
                    variant="title"
                    style={[
                      styles.btnText,
                      { color: t.scheme === 'dark' ? '#07051A' : '#FFFFFF' },
                    ]}
                  >
                    {currentStep === TOTAL_STEPS - 1
                      ? "Kanki'ye Başla ✨"
                      : 'Devam Et'}
                  </AppText>
                  <Ionicons
                    name={
                      currentStep === TOTAL_STEPS - 1
                        ? 'sparkles'
                        : 'arrow-forward'
                    }
                    size={18}
                    color={t.scheme === 'dark' ? '#07051A' : '#FFFFFF'}
                  />
                </>
              )}
            </LinearGradient>
          </PressableScale>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
    zIndex: 10,
  },
  topActionWrap: {
    width: 60,
  },
  navBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnPlaceholder: {
    width: 38,
    height: 38,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressPill: {
    height: 6,
    borderRadius: 3,
  },
  skipBtn: {
    alignItems: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  skipText: {
    fontSize: 13,
    fontFamily: 'DMSans_600SemiBold',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  animatedContainer: {
    width: '100%',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
  },
  primaryBtnWrapper: {
    width: '100%',
    borderRadius: radius.pill,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  primaryBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  btnText: {
    fontSize: 16,
    fontFamily: 'DMSans_700Bold',
  },
});
