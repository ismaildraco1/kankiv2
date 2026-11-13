import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, AppState, Linking, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import {
  DayPicker,
  SegmentedControl,
  SettingRow,
  Stepper,
  TimePickerField,
  Toggle,
} from '@/components/controls';
import { GlassCard } from '@/components/GlassCard';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { sendTestNotification } from '@/services/notifications/scheduler';
import {
  getPermissionState,
  requestPermission,
  type PermissionState,
} from '@/services/notifications/setup';
import { pinAndroidWidget, syncWidgets } from '@/services/widgets/syncWidgets';
import { currentWidgetQuote } from '@/services/widgets/widgetData';
import { isExpoGo } from '@/services/widgets/widgetPlatform';
import { showInterstitial } from '@/services/ads/adService';
import { useAppStore } from '@/store/useAppStore';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, radius } from '@/theme/tokens';
import type { NotificationMode, ThemePreference, TimeOfDay } from '@/types';
import { formatTime, toMinutes } from '@/utils/schedule';

export default function SettingsScreen() {
  const t = useTheme();
  const userName = useAppStore((s) => s.userName);
  const n = useAppStore((s) => s.notification);
  const update = useAppStore((s) => s.updateNotification);
  const themePref = useAppStore((s) => s.themePreference);
  const setThemePref = useAppStore((s) => s.setThemePreference);
  const log = useAppStore((s) => s.scheduleLog);
  const [permission, setPermission] = useState<PermissionState>('undetermined');

  // Ayarlar sayfasına girince geçiş reklamı tetikle ve widget'ları tazele
  useFocusEffect(
    useCallback(() => {
      showInterstitial();
      syncWidgets().catch(() => {});
    }, [])
  );

  // İzin durumunu kullanıcı ayarlardan dönünce de tazele
  useEffect(() => {
    const refresh = () => getPermissionState().then(setPermission);
    refresh();
    const sub = AppState.addEventListener('change', (s) => s === 'active' && refresh());
    return () => sub.remove();
  }, []);

  const upcoming = useMemo(() => log.filter((e) => e.fireAt > Date.now()).length, [log]);
  const widgetPreviewQuote = useMemo(() => currentWidgetQuote(), [log]);

  const onToggleEnabled = async (value: boolean) => {
    if (value && permission !== 'granted') {
      const result = await requestPermission();
      setPermission(result);
      if (result !== 'granted') {
        Alert.alert(
          'Bildirim İzni Gerekli',
          'Sözleri vaktinde gönderebilmemiz için cihaz Ayarlarından bildirimlere izin vermelisin.',
          [
            { text: 'Vazgeç', style: 'cancel' },
            { text: 'Ayarları Aç', onPress: () => Linking.openSettings() },
          ],
        );
        return;
      }
    }
    update({ enabled: value });
  };

  const setWindow = (key: 'windowStart' | 'windowEnd', value: TimeOfDay) => {
    const next = { ...n, [key]: value };
    if (toMinutes(next.windowEnd) - toMinutes(next.windowStart) < 30) {
      Alert.alert('Geçersiz Aralık', 'Bitiş saati başlangıç saatinden en az 30 dakika sonra olmalıdır.');
      return;
    }
    update({ [key]: value });
  };

  const addFixedTime = () => {
    if (n.fixedTimes.length >= 8) return;
    const last = n.fixedTimes.at(-1) ?? { hour: 8, minute: 0 };
    const hour = (last.hour + 2) % 24;
    update({ fixedTimes: [...n.fixedTimes, { hour, minute: last.minute }] });
  };

  const disabled = !n.enabled;

  return (
    <Screen
      overline="TERCİHLER & ZAMANLAMA"
      title="Ayarlar"
      subtitle="Bildirim saatleri, sıklığı ve kişisel görünüm tercihleri."
    >
      {permission === 'denied' && (
        <PressableScale onPress={() => Linking.openSettings()} scaleTo={0.98}>
          <GlassCard style={{ borderColor: t.danger }}>
            <View style={styles.inlineWarning}>
              <Ionicons name="alert-circle" size={22} color={t.danger} />
              <View style={{ flex: 1 }}>
                <AppText variant="body" style={{ fontFamily: 'Inter_700Bold', color: t.danger }}>
                  Bildirim İzni Kapalı
                </AppText>
                <AppText variant="label" tone="muted">
                  Sözlerin telefonuna ulaşması için Ayarları Aç'a dokun.
                </AppText>
              </View>
              <Ionicons name="chevron-forward" size={16} color={t.danger} />
            </View>
          </GlassCard>
        </PressableScale>
      )}

      {/* ── 1. Ana Bildirim Anahtarı ── */}
      <View style={styles.sectionHeader}>
        <Ionicons name="notifications-outline" size={16} color={t.accent} />
        <AppText variant="overline" style={{ color: t.accent, letterSpacing: 1.6 }}>
          BİLDİRİM SİSTEMİ
        </AppText>
      </View>

      <GlassCard>
        <SettingRow
          icon="sparkles"
          title="Söz Bildirimleri"
          subtitle={
            n.enabled
              ? `${upcoming} bildirim zamanlandı`
              : 'Bildirimler kapalı · Sözler widget olarak kilit ekranında akmaya devam eder'
          }
          right={<Toggle label="Söz bildirimleri" value={n.enabled} onValueChange={onToggleEnabled} />}
          last
        />
      </GlassCard>

      {/* ── 2. Zamanlama Modu ve Detayları ── */}
      <View style={{ gap: 16 }}>
        <SegmentedControl<NotificationMode>
          value={n.mode}
          onChange={(mode) => update({ mode })}
          options={[
            { value: 'random', label: 'Rastgele Aralık', icon: 'shuffle' },
            { value: 'fixed', label: 'Sabit Saatler', icon: 'time-outline' },
          ]}
        />

        {n.mode === 'random' ? (
          <GlassCard>
            <AppText variant="label" tone="muted" style={{ marginBottom: 14 }}>
              {n.enabled
                ? 'Belirlediğin aralıkta gün içine rastgele dağıtılan bildirimler ve widget yenilemeleri yapılır.'
                : 'Belirlediğin aralıkta kilit ekranı ve ana ekran widget\'ındaki sözler otomatik yenilenir.'}
            </AppText>
            <View style={styles.inline}>
              <TimePickerField label="Başlangıç" value={n.windowStart} onChange={(v) => setWindow('windowStart', v)} />
              <View style={[styles.arrowCircle, { backgroundColor: t.glassStrong }]}>
                <Ionicons name="arrow-forward" size={14} color={t.accent} />
              </View>
              <TimePickerField label="Bitiş" value={n.windowEnd} onChange={(v) => setWindow('windowEnd', v)} />
            </View>
            <View style={{ height: 10 }} />
            <SettingRow
              icon="pulse"
              title="Günlük Sıklık"
              subtitle="Günde kaç bildirim almak istersin?"
              right={<Stepper value={n.perDay} min={1} max={12} suffix=" söz" onChange={(perDay) => update({ perDay })} />}
              last
            />
          </GlassCard>
        ) : (
          <GlassCard>
            <AppText variant="label" tone="muted" style={{ marginBottom: 14 }}>
              Her gün tam belirlediğin bu saatlerde seçili setlerden sözler gelir.
            </AppText>
            <View style={styles.timesGrid}>
              {n.fixedTimes.map((time, i) => (
                <View key={`${i}-${formatTime(time)}`} style={styles.timeCell}>
                  <TimePickerField
                    label={`Saat ${i + 1}`}
                    value={time}
                    onChange={(v) => update({ fixedTimes: n.fixedTimes.map((x, j) => (j === i ? v : x)) })}
                  />
                  {n.fixedTimes.length > 1 && (
                    <PressableScale
                      accessibilityLabel={`Saat ${i + 1} sil`}
                      onPress={() => update({ fixedTimes: n.fixedTimes.filter((_, j) => j !== i) })}
                      style={[styles.removeTimeBtn, { backgroundColor: t.danger }]}
                    >
                      <Ionicons name="close" size={12} color="#FFFFFF" />
                    </PressableScale>
                  )}
                </View>
              ))}
              {n.fixedTimes.length < 8 && (
                <PressableScale
                  onPress={addFixedTime}
                  style={[styles.timeCell, styles.addTimeCard, { borderColor: t.glassBorder }]}
                >
                  <Ionicons name="add" size={18} color={t.accent} />
                  <AppText variant="label" tone="accent" style={{ fontFamily: 'Inter_500Medium' }}>
                    Saat Ekle
                  </AppText>
                </PressableScale>
              )}
            </View>
          </GlassCard>
        )}

        {/* Aktif Günler */}
        <GlassCard>
          <AppText variant="label" tone="muted" style={{ marginBottom: 14 }}>
            Bildirim Gönderilecek Günler
          </AppText>
          <DayPicker value={n.activeDays} onChange={(activeDays) => update({ activeDays })} />
        </GlassCard>

        {/* Test Bildirimi Gönderme Butonu */}
        <PressableScale
          onPress={async () => {
            await sendTestNotification(3);
            Alert.alert(
              'Test Bildirimi Zamanlandı',
              '3 saniye içinde bir bildirim gelecek. Deneyimlemek için uygulamayı arka plana alabilirsin.',
            );
          }}
          scaleTo={0.97}
        >
          <LinearGradient
            colors={t.accentGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.testBtnGradient}
          >
            <Ionicons name="paper-plane" size={16} color="#FFFFFF" />
            <AppText
              variant="label"
              style={{ color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 14 }}
            >
              Şimdi Test Bildirimi Gönder
            </AppText>
          </LinearGradient>
        </PressableScale>
      </View>

      {/* ── 3. Kilit Ekranı ve Widget Desteği ── */}
      <View style={[styles.sectionHeader, { marginTop: 10 }]}>
        <Ionicons name="phone-portrait-outline" size={16} color={t.accent} />
        <AppText variant="overline" style={{ color: t.accent, letterSpacing: 1.6 }}>
          KİLİT EKRANI & WIDGET
        </AppText>
      </View>

      <GlassCard>
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                backgroundColor: t.accentSoft,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="lock-closed-outline" size={20} color={t.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="body" style={{ fontFamily: 'Inter_700Bold' }}>
                Kilit Ekranı & Ana Sayfa
              </AppText>
              <AppText variant="label" tone="muted">
                Bildirim istemesen bile kilit ekranında sözler akmaya devam eder.
              </AppText>
            </View>
          </View>

          {/* Canlı Widget & Kilit Ekranı Önizlemesi (Liquid Glass / Frosted Glass Tasarım) */}
          {widgetPreviewQuote && (
            <LinearGradient
              colors={['#070B19', '#0E1B38', '#151030', '#091D2C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                paddingHorizontal: 18,
                paddingVertical: 16,
                borderRadius: 24,
                borderWidth: 1,
                borderColor: 'rgba(103, 232, 249, 0.22)',
                gap: 10,
                marginTop: 2,
                shadowColor: '#38BDF8',
                shadowOpacity: 0.18,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 6 },
              }}
            >
              {/* Üst: Yüzen Parıltılı Tırnak İkonu */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <AppText
                  variant="title"
                  style={{
                    color: '#67E8F9',
                    fontSize: 22,
                    lineHeight: 24,
                    fontFamily: 'Inter_700Bold',
                    textShadowColor: 'rgba(56, 189, 248, 0.55)',
                    textShadowRadius: 8,
                    textShadowOffset: { width: 0, height: 0 },
                  }}
                >
                  ❝
                </AppText>
              </View>

              {/* Orta: Ana Söz Gövdesi */}
              <AppText
                variant="body"
                style={{
                  color: '#FFFFFF',
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: widgetPreviewQuote.text.length > 115 ? 14 : 15.5,
                  lineHeight: widgetPreviewQuote.text.length > 115 ? 20 : 22,
                  textAlign: 'left',
                }}
              >
                {widgetPreviewQuote.text}
              </AppText>

              {/* Alt Durum Satırı: Yazar İmzası & Glassmorphic Yenileme/Işıltı Kapsülü */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 2,
                }}
              >
                <AppText
                  variant="label"
                  style={{
                    color: 'rgba(226, 232, 240, 0.72)',
                    fontFamily: 'Inter_500Medium',
                    fontSize: 11.5,
                  }}
                >
                  {widgetPreviewQuote.author ? `— ${widgetPreviewQuote.author}` : ''}
                </AppText>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    paddingHorizontal: 9,
                    paddingVertical: 4,
                    borderRadius: 999,
                    backgroundColor: 'rgba(56, 189, 248, 0.14)',
                    borderWidth: 1,
                    borderColor: 'rgba(103, 232, 249, 0.25)',
                  }}
                >
                  <Ionicons name="sparkles" size={11} color="#67E8F9" />
                </View>
              </View>
            </LinearGradient>
          )}

          <View
            style={{
              padding: 12,
              borderRadius: 14,
              backgroundColor: t.scheme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
              borderWidth: 1,
              borderColor: t.glassBorder,
              gap: 8,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="bulb-outline" size={15} color={t.accent} />
              <AppText variant="label" style={{ fontFamily: 'Inter_600SemiBold', color: t.text }}>
                Nasıl Eklenir?
              </AppText>
            </View>
            <AppText variant="label" tone="muted" style={{ lineHeight: 18 }}>
              • <AppText variant="label" style={{ fontFamily: 'Inter_600SemiBold' }}>iOS Kilit Ekranı:</AppText> Kilit ekranına basılı tut → Özelleştir → Widget Ekle → Kanki seç.
            </AppText>
            <AppText variant="label" tone="muted" style={{ lineHeight: 18 }}>
              • <AppText variant="label" style={{ fontFamily: 'Inter_600SemiBold' }}>Ana Ekran:</AppText> Boş alana basılı tut → (+) Widget Ekle → Kanki seç.
            </AppText>
          </View>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
            <View style={{ flex: 1 }}>
              <PressableScale
                onPress={async () => {
                  if (isExpoGo()) {
                    Alert.alert(
                      'Expo Go Modu',
                      'Kilit ekranı ve ana sayfa widget\'ları işletim sistemi düzeyinde çalıştığı için Development Build (npx expo run:android veya run:ios) ile etkinleşir. Uygulama içi tüm söz planlaması ve bildirimleriniz ise şu an eksiksiz çalışmaktadır.',
                    );
                    return;
                  }
                  await syncWidgets();
                  Alert.alert('Widget Güncellendi', 'Kilit ekranı ve ana sayfa widget içerikleri yenilendi.');
                }}
                scaleTo={0.97}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    paddingVertical: 12,
                    borderRadius: radius.pill,
                    backgroundColor: t.accentSoft,
                    borderWidth: 1,
                    borderColor: t.glassBorder,
                  }}
                >
                  <Ionicons name="refresh" size={15} color={t.accent} />
                  <AppText variant="label" tone="accent" style={{ fontFamily: 'Inter_600SemiBold' }}>
                    Widget'ları Yenile
                  </AppText>
                </View>
              </PressableScale>
            </View>

            {/* Android tek dokunuşla ekleme */}
            <View style={{ flex: 1 }}>
              <PressableScale
                onPress={async () => {
                  if (isExpoGo()) {
                    Alert.alert(
                      'Expo Go Modu',
                      'Ana ekrana widget sabitleme özelliği Development Build ile çalışır.',
                    );
                    return;
                  }
                  const pinned = await pinAndroidWidget();
                  if (!pinned) {
                    Alert.alert(
                      'Widget Ekleme',
                      'Telefonunun ana ekranına uzun basarak Widget\'lar menüsünden Kanki\'yi ekleyebilirsin.',
                    );
                  }
                }}
                scaleTo={0.97}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    paddingVertical: 12,
                    borderRadius: radius.pill,
                    backgroundColor: t.glassStrong,
                    borderWidth: 1,
                    borderColor: t.glassBorder,
                  }}
                >
                  <Ionicons name="add-circle-outline" size={15} color={t.text} />
                  <AppText variant="label" style={{ fontFamily: 'Inter_600SemiBold' }}>
                    Ekrana Ekle
                  </AppText>
                </View>
              </PressableScale>
            </View>
          </View>
        </View>
      </GlassCard>

      {/* ── 3. Görünüm & Çoklu Tema Motoru ── */}
      <View style={[styles.sectionHeader, { marginTop: 10 }]}>
        <Ionicons name="color-palette-outline" size={16} color={t.accent} />
        <AppText variant="overline" style={{ color: t.accent, letterSpacing: 1.6 }}>
          GÖRÜNÜM & TEMA
        </AppText>
      </View>

      <View style={{ gap: 12 }}>
        {t.themes.map((themeItem) => {
          const isSelected = t.themeId === themeItem.id;
          const themeIcon =
            themeItem.id === 'oled'
              ? 'moon'
              : themeItem.id === 'vibrant'
                ? 'sparkles'
                : 'sunny';

          return (
            <PressableScale
              key={themeItem.id}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => { });
                t.setTheme(themeItem.id);
              }}
              scaleTo={0.97}
            >
              <GlassCard
                strong={isSelected}
                glowColor={isSelected ? themeItem.accent : undefined}
                style={[
                  styles.themeCard,
                  isSelected && {
                    borderColor: `${themeItem.accent}99`,
                    borderWidth: 1.5,
                  },
                ]}
              >
                <View style={styles.themeCardInner}>
                  {/* Sol: İkon + Başlık + Açıklama */}
                  <View style={{ flex: 1, gap: 5 }}>
                    <View style={styles.themeTitleRow}>
                      <View
                        style={[
                          styles.themeIconCircle,
                          {
                            backgroundColor: isSelected
                              ? `${themeItem.accent}25`
                              : t.scheme === 'dark'
                                ? 'rgba(255,255,255,0.06)'
                                : 'rgba(0,0,0,0.04)',
                          },
                        ]}
                      >
                        <Ionicons
                          name={themeIcon}
                          size={16}
                          color={isSelected ? themeItem.accent : t.textMuted}
                        />
                      </View>
                      <AppText
                        variant="title"
                        style={[
                          styles.themeName,
                          isSelected && { color: themeItem.accent },
                        ]}
                      >
                        {themeItem.name}
                      </AppText>
                    </View>

                    <AppText variant="label" tone="muted" style={styles.themeDesc}>
                      {themeItem.description}
                    </AppText>

                    {/* Renk Paleti Önizleme Damlaları */}
                    <View style={styles.paletteSwatches}>
                      {themeItem.previewColors.map((color, idx) => (
                        <View
                          key={idx}
                          style={[
                            styles.colorDot,
                            {
                              backgroundColor: color,
                              borderColor: t.glassBorder,
                            },
                          ]}
                        />
                      ))}
                      <AppText
                        variant="overline"
                        tone="faint"
                        style={{ fontSize: 9.5, letterSpacing: 0.8, marginLeft: 4 }}
                      >
                        {themeItem.scheme === 'dark' ? 'KOYU' : 'AYDINLIK'}
                      </AppText>
                    </View>
                  </View>

                  {/* Sağ: Seçim Göstergesi */}
                  <View
                    style={[
                      styles.selectionIndicator,
                      isSelected
                        ? {
                          backgroundColor: themeItem.accent,
                          borderColor: themeItem.accent,
                        }
                        : {
                          backgroundColor: t.glassStrong,
                          borderColor: t.glassBorder,
                        },
                    ]}
                  >
                    {isSelected && (
                      <Ionicons
                        name="checkmark"
                        size={14}
                        color={themeItem.scheme === 'dark' ? '#000000' : '#FFFFFF'}
                      />
                    )}
                  </View>
                </View>
              </GlassCard>
            </PressableScale>
          );
        })}
      </View>

      {/* ── 4. Hakkında & Sıfırlama ── */}
      <View style={[styles.sectionHeader, { marginTop: 10 }]}>
        <Ionicons name="information-circle-outline" size={16} color={t.textFaint} />
        <AppText variant="overline" tone="faint" style={{ letterSpacing: 1.6 }}>
          HAKKINDA
        </AppText>
      </View>

      <GlassCard>
        <SettingRow
          icon="person-outline"
          title="Hitap Şekli"
          subtitle={userName ? `Sana "${userName}" olarak hitap ediyoruz` : 'İsim belirlenmedi ("Dostum")'}
          right={
            <PressableScale
              onPress={() => router.push('/onboarding')}
              style={[styles.resetPill, { backgroundColor: t.accentSoft }]}
            >
              <AppText variant="label" tone="accent" style={{ fontFamily: 'Inter_600SemiBold' }}>
                Değiştir
              </AppText>
            </PressableScale>
          }
        />
        <SettingRow
          icon="compass-outline"
          title="Karşılama Sihirbazı"
          subtitle="İsim, atmosfer, odak temaları ve ritmi baştan başlat"
          right={
            <PressableScale
              onPress={() => router.push('/onboarding')}
              style={[styles.resetPill, { backgroundColor: t.accentSoft }]}
            >
              <AppText variant="label" tone="accent" style={{ fontFamily: 'Inter_600SemiBold' }}>
                Başlat
              </AppText>
            </PressableScale>
          }
        />
        <SettingRow icon="sparkles-outline" title="Kanki" subtitle="Sürüm 1.0.0 · Özel Seçki" />
        <SettingRow
          icon="refresh-outline"
          title="Bildirim Takvimini Yenile"
          subtitle="Tüm bekleyen bildirimleri baştan planlar"
          right={
            <PressableScale
              onPress={async () => {
                await Notifications.cancelAllScheduledNotificationsAsync();
                useAppStore.getState().replaceUpcoming([]);
                update({ ...n });
                Alert.alert('Yenilendi', 'Tüm bildirim takvimi sıfırdan düzenlendi.');
              }}
              style={[styles.resetPill, { backgroundColor: t.accentSoft }]}
            >
              <AppText variant="label" tone="accent" style={{ fontFamily: 'Inter_600SemiBold' }}>
                Yenile
              </AppText>
            </PressableScale>
          }
          last
        />
      </GlassCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  inlineWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  arrowCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeCell: {
    width: '48%',
    flexDirection: 'row',
  },
  removeTimeBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  addTimeCard: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 78,
  },
  testBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: radius.pill,
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  resetPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  themeCard: {
    borderRadius: radius.lg,
  },
  themeCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    gap: 14,
  },
  themeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  themeIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeName: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  themeDesc: {
    fontSize: 12.5,
    lineHeight: 18,
    marginTop: 2,
  },
  paletteSwatches: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
  },
  selectionIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
