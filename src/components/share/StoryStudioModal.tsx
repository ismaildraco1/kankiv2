import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import * as Sharing from 'expo-sharing';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Modal,
  PanResponder,
  ScrollView,
  Share,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';

import { AppText } from '@/components/AppText';
import { PressableScale } from '@/components/PressableScale';
import { showInterstitial } from '@/services/ads/adService';
import { useTheme } from '@/theme/ThemeProvider';
import { radius } from '@/theme/tokens';
import type {
  Quote,
  StoryCardStyle,
  StoryCustomization,
  StoryPosition,
  StoryTypography,
} from '@/types';
import { SHARE_HEIGHT, SHARE_WIDTH, ShareCard } from './ShareCard';
import {
  BG_PRESETS,
  CARD_STYLE_OPTIONS,
  DEFAULT_STORY_CUSTOMIZATION,
  POSITION_OPTIONS,
  TYPOGRAPHY_OPTIONS,
} from './storyPresets';

interface Props {
  visible: boolean;
  quote: Quote | null;
  onClose: () => void;
}

type TabType = 'bg' | 'font' | 'size' | 'position' | 'style';

export function StoryStudioModal({ visible, quote, onClose }: Props) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { width: winWidth, height: winHeight } = useWindowDimensions();

  const [activeTab, setActiveTab] = useState<TabType>('bg');
  const [customization, setCustomization] = useState<StoryCustomization>(
    DEFAULT_STORY_CUSTOMIZATION,
  );
  const [sharing, setSharing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Görünmeyen tam çözünürlüklü referans (1080x1920 yakalama için)
  const captureCardRef = useRef<any>(null);

  // Canlı önizleme ölçeklendirmesi (360x640 kartı cihaz ekranına orantılar)
  const maxPreviewHeight = winHeight * 0.40;
  const previewScale = Math.min(
    maxPreviewHeight / SHARE_HEIGHT,
    (winWidth - 56) / SHARE_WIDTH,
  );
  const scaledWidth = SHARE_WIDTH * previewScale;
  const scaledHeight = SHARE_HEIGHT * previewScale;

  // ── Sürükleme ve Dokunma Hareketi (PanResponder) ──
  const pan = useRef(
    new Animated.ValueXY({
      x: customization.offsetX ?? 0,
      y: customization.offsetY ?? 0,
    }),
  ).current;

  const currentOffset = useRef({
    x: customization.offsetX ?? 0,
    y: customization.offsetY ?? 0,
  });

  useEffect(() => {
    if (!isDragging) {
      const x = customization.offsetX ?? 0;
      const y = customization.offsetY ?? 0;
      pan.setValue({ x, y });
      currentOffset.current = { x, y };
    }
  }, [customization.offsetX, customization.offsetY, isDragging, pan]);

  // Sürükleme sınırları (canvas sınırları içinde kalması için)
  const BOUND_X = 130;
  const BOUND_Y = 210;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderGrant: () => {
          setIsDragging(true);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        },
        onPanResponderMove: (_, gestureState) => {
          const scaledDx = gestureState.dx / previewScale;
          const scaledDy = gestureState.dy / previewScale;
          const nextX = Math.max(
            -BOUND_X,
            Math.min(BOUND_X, currentOffset.current.x + scaledDx),
          );
          const nextY = Math.max(
            -BOUND_Y,
            Math.min(BOUND_Y, currentOffset.current.y + scaledDy),
          );
          pan.setValue({ x: nextX, y: nextY });
        },
        onPanResponderRelease: (_, gestureState) => {
          setIsDragging(false);
          const scaledDx = gestureState.dx / previewScale;
          const scaledDy = gestureState.dy / previewScale;
          const finalX = Math.round(
            Math.max(
              -BOUND_X,
              Math.min(BOUND_X, currentOffset.current.x + scaledDx),
            ),
          );
          const finalY = Math.round(
            Math.max(
              -BOUND_Y,
              Math.min(BOUND_Y, currentOffset.current.y + scaledDy),
            ),
          );
          currentOffset.current = { x: finalX, y: finalY };
          pan.setValue({ x: finalX, y: finalY });

          let inferredPos: StoryPosition = 'center';
          if (finalY < -70) inferredPos = 'top';
          else if (finalY > 70) inferredPos = 'bottom';

          setCustomization((prev) => ({
            ...prev,
            position: inferredPos,
            offsetX: finalX,
            offsetY: finalY,
          }));
        },
        onPanResponderTerminate: () => {
          setIsDragging(false);
          pan.setValue({
            x: currentOffset.current.x,
            y: currentOffset.current.y,
          });
        },
      }),
    [pan, previewScale],
  );

  // Galeriden görsel seçici
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false, // Sistem kırpıcısının görseli düşük çözünürlüğe sıkıştırmasını önle
        quality: 1, // Tam %100 orijinal çözünürlük
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        ).catch(() => {});
        setCustomization((prev) => ({
          ...prev,
          customImageUri: result.assets[0].uri,
        }));
      }
    } catch {
      Alert.alert('Görsel Seçilemedi', 'Galeriye erişirken bir sorun oluştu.');
    }
  };

  // Paylaşım fonksiyonu
  const onShareNow = async () => {
    if (sharing) return;
    setSharing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

    try {
      // 1080x1920 Ultra HD kartın ve görselin tam GPU render'ı için süre tanı
      await new Promise((r) => setTimeout(r, 160));

      const uri = await captureRef(captureCardRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          UTI: 'public.png',
          dialogTitle: 'Sözü Hikayende Paylaş',
        });
      } else {
        await Share.share({ message: `“${quote?.text}” — ${quote?.author}` });
      }
      // Paylaşım sonrası geçiş reklamı tetikle
      showInterstitial();
    } catch (e) {
      console.warn('[share] capture failed', e);
      if (quote) {
        await Share.share({ message: `“${quote.text}” — ${quote.author}` });
      }
    } finally {
      setSharing(false);
    }
  };

  const resetPosition = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    currentOffset.current = { x: 0, y: 0 };
    pan.setValue({ x: 0, y: 0 });
    setCustomization((prev) => ({
      ...prev,
      position: 'center',
      offsetX: 0,
      offsetY: 0,
    }));
  }, [pan]);

  if (!quote) return null;

  // Aktif sekme text rengi kontrolü (OLED beyaz vurgusunda kontrast garanti)
  const activeTabTextColor = t.id === 'oled' ? '#000000' : '#FFFFFF';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={[styles.backdrop, { backgroundColor: '#07060F' }]}>
        {/* ── 1. Üst Bar: Kapat & Paylaş Butonları ── */}
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <PressableScale
            onPress={onClose}
            accessibilityLabel="Kapat"
            style={styles.circleBtn}
          >
            <Ionicons name="close" size={20} color="#FFFFFF" />
          </PressableScale>

          <View style={{ alignItems: 'center' }}>
            <AppText
              variant="overline"
              style={{ color: t.accent, letterSpacing: 1.8 }}
            >
              HİKAYE STÜDYOSU
            </AppText>
            <AppText
              variant="label"
              style={{ color: '#FFFFFF', fontFamily: 'Inter_700Bold' }}
            >
              Tasarımı Özelleştir
            </AppText>
          </View>

          <PressableScale
            onPress={onShareNow}
            disabled={sharing}
            accessibilityLabel="Paylaş"
            style={[styles.shareHeaderBtn, { opacity: sharing ? 0.7 : 1 }]}
          >
            <LinearGradient
              colors={t.accentGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.shareHeaderGradient}
            >
              {sharing ? (
                <ActivityIndicator size="small" color={activeTabTextColor} />
              ) : (
                <>
                  <Ionicons name="sparkles" size={15} color={activeTabTextColor} />
                  <AppText
                    variant="label"
                    style={{
                      color: activeTabTextColor,
                      fontFamily: 'Inter_700Bold',
                      fontSize: 13,
                    }}
                  >
                    Paylaş
                  </AppText>
                </>
              )}
            </LinearGradient>
          </PressableScale>
        </View>

        {/* ── 2. Canlı Önizleme Sahnesi & Sürükleme Katmanı ── */}
        <View style={styles.previewStage}>
          {/* Sürükleme İpucu Rozeti */}
          <View
            style={[
              styles.dragHintBadge,
              isDragging && { borderColor: t.accent, backgroundColor: `${t.accent}33` },
            ]}
          >
            <Ionicons
              name={isDragging ? 'hand-right' : 'move'}
              size={12}
              color={isDragging ? t.accent : 'rgba(255,255,255,0.7)'}
            />
            <AppText
              variant="overline"
              style={{
                color: isDragging ? t.accent : 'rgba(255,255,255,0.7)',
                fontSize: 9.5,
                letterSpacing: 1.2,
              }}
            >
              {isDragging ? 'KONUMLANDIRILIYOR...' : 'SÖZÜ PARMAĞINLA SÜRÜKLE'}
            </AppText>
          </View>

          <View
            style={[
              styles.previewFrame,
              { width: scaledWidth, height: scaledHeight },
            ]}
            {...panResponder.panHandlers}
          >
            <View
              style={{
                width: SHARE_WIDTH,
                height: SHARE_HEIGHT,
                transform: [
                  { translateX: -(SHARE_WIDTH - scaledWidth) / 2 },
                  { translateY: -(SHARE_HEIGHT - scaledHeight) / 2 },
                  { scale: previewScale },
                ],
              }}
            >
              <ShareCard
                quote={quote}
                customization={customization}
                animatedOffset={pan}
              />
            </View>
          </View>
        </View>

        {/* ── 3. Alt Kontrol Paneli ── */}
        <View
          style={[styles.controlPanel, { paddingBottom: insets.bottom + 10 }]}
        >
          {/* 🌟 Yüksek Kontrastlı, Yatay Kaydırılabilir Sekme Çubuğu 🌟 */}
          <View style={styles.tabBarWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabBarScroll}
            >
              <TabItem
                label="Arka Plan"
                icon="color-palette-outline"
                active={activeTab === 'bg'}
                accentColor={t.accent}
                activeTextColor={activeTabTextColor}
                onPress={() => setActiveTab('bg')}
              />
              <TabItem
                label="Yazı Tipi"
                icon="text-outline"
                active={activeTab === 'font'}
                accentColor={t.accent}
                activeTextColor={activeTabTextColor}
                onPress={() => setActiveTab('font')}
              />
              <TabItem
                label="Boyut & Genişlik"
                icon="resize-outline"
                active={activeTab === 'size'}
                accentColor={t.accent}
                activeTextColor={activeTabTextColor}
                onPress={() => setActiveTab('size')}
              />
              <TabItem
                label="Konum"
                icon="move-outline"
                active={activeTab === 'position'}
                accentColor={t.accent}
                activeTextColor={activeTabTextColor}
                onPress={() => setActiveTab('position')}
              />
              <TabItem
                label="Stil & Gölge"
                icon="sparkles-outline"
                active={activeTab === 'style'}
                accentColor={t.accent}
                activeTextColor={activeTabTextColor}
                onPress={() => setActiveTab('style')}
              />
            </ScrollView>
          </View>

          {/* Sekme İçerikleri */}
          <View style={styles.tabContentArea}>
            {/* 1. ARKA PLAN SEKMESİ */}
            {activeTab === 'bg' && (
              <View style={{ gap: 10 }}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.scrollList}
                >
                  {/* Galeriden Seç Butonu */}
                  <PressableScale
                    onPress={pickImage}
                    style={styles.galleryPickBtn}
                  >
                    <LinearGradient
                      colors={['#3B82F6', '#8B5CF6']}
                      style={styles.galleryIconCircle}
                    >
                      <Ionicons name="images" size={17} color="#FFFFFF" />
                    </LinearGradient>
                    <AppText
                      variant="label"
                      style={styles.galleryBtnText}
                    >
                      Galeriden Seç
                    </AppText>
                  </PressableScale>

                  {/* Fotoğrafı Kaldır Butonu */}
                  {customization.customImageUri && (
                    <PressableScale
                      onPress={() =>
                        setCustomization((p) => ({ ...p, customImageUri: null }))
                      }
                      style={[styles.galleryPickBtn, { borderColor: t.danger }]}
                    >
                      <View
                        style={[
                          styles.galleryIconCircle,
                          { backgroundColor: t.danger },
                        ]}
                      >
                        <Ionicons name="trash" size={16} color="#FFFFFF" />
                      </View>
                      <AppText
                        variant="label"
                        style={{ color: t.danger, fontSize: 11.5 }}
                      >
                        Sıfırla
                      </AppText>
                    </PressableScale>
                  )}

                  {/* Hazır Renk Degradeleri */}
                  {BG_PRESETS.map((preset) => {
                    const isSelected =
                      !customization.customImageUri &&
                      customization.bgPreset === preset.id;

                    return (
                      <PressableScale
                        key={preset.id}
                        onPress={() =>
                          setCustomization((prev) => ({
                            ...prev,
                            bgPreset: preset.id,
                            customImageUri: null,
                          }))
                        }
                        style={[
                          styles.presetItem,
                          isSelected && {
                            borderColor: t.accent,
                            borderWidth: 2,
                            backgroundColor: 'rgba(255,255,255,0.14)',
                          },
                        ]}
                      >
                        <LinearGradient
                          colors={[...preset.gradient]}
                          style={styles.presetColorCircle}
                        />
                        <AppText
                          variant="overline"
                          style={{
                            color: isSelected ? t.accent : '#E2E8F0',
                            fontSize: 10.5,
                            fontFamily: isSelected
                              ? 'Inter_700Bold'
                              : 'Inter_500Medium',
                          }}
                        >
                          {preset.title}
                        </AppText>
                      </PressableScale>
                    );
                  })}
                </ScrollView>

                {/* Karartma Kontrolü (Fotoğraf veya parlak arka planlar için) */}
                <View style={styles.controlRow}>
                  <View style={styles.controlRowLeft}>
                    <Ionicons
                      name="contrast-outline"
                      size={15}
                      color="rgba(255,255,255,0.7)"
                    />
                    <AppText
                      variant="label"
                      style={styles.controlLabelText}
                    >
                      Arka Plan Karartma:
                    </AppText>
                  </View>
                  <View style={styles.chipRow}>
                    {[0, 0.25, 0.45, 0.65, 0.8].map((level, i) => {
                      const labels = ['%0', '%25', '%45', '%65', '%80'];
                      const active = customization.overlayDarkness === level;
                      return (
                        <PressableScale
                          key={level}
                          onPress={() =>
                            setCustomization((prev) => ({
                              ...prev,
                              overlayDarkness: level,
                            }))
                          }
                          style={[
                            styles.chipBtn,
                            active && { backgroundColor: t.accent },
                          ]}
                        >
                          <AppText
                            variant="label"
                            style={{
                              color: active
                                ? activeTabTextColor
                                : 'rgba(255,255,255,0.75)',
                              fontSize: 11.5,
                              fontFamily: active
                                ? 'Inter_700Bold'
                                : 'Inter_500Medium',
                            }}
                          >
                            {labels[i]}
                          </AppText>
                        </PressableScale>
                      );
                    })}
                  </View>
                </View>
              </View>
            )}

            {/* 2. YAZI TİPİ SEKMESİ */}
            {activeTab === 'font' && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollList}
              >
                {TYPOGRAPHY_OPTIONS.map((typo) => {
                  const active = customization.typography === typo.id;
                  return (
                    <PressableScale
                      key={typo.id}
                      onPress={() =>
                        setCustomization((prev) => ({
                          ...prev,
                          typography: typo.id,
                        }))
                      }
                      style={[
                        styles.fontCard,
                        active && {
                          borderColor: t.accent,
                          borderWidth: 2,
                          backgroundColor: `${t.accent}24`,
                        },
                      ]}
                    >
                      <AppText
                        variant="title"
                        style={{
                          fontFamily: typo.font,
                          color: active ? t.accent : '#FFFFFF',
                          fontSize: 22,
                        }}
                      >
                        Aa
                      </AppText>
                      <AppText
                        variant="label"
                        style={{
                          color: active ? t.accent : '#FFFFFF',
                          fontFamily: 'Inter_700Bold',
                          fontSize: 13,
                        }}
                      >
                        {typo.title}
                      </AppText>
                      <AppText
                        variant="overline"
                        style={{
                          color: 'rgba(255,255,255,0.6)',
                          fontSize: 9.5,
                        }}
                      >
                        {typo.sample}
                      </AppText>
                    </PressableScale>
                  );
                })}
              </ScrollView>
            )}

            {/* 3. BOYUT & GENİŞLİK SEKMESİ */}
            {activeTab === 'size' && (
              <View style={{ gap: 10 }}>
                {/* Yazı Boyutu İnce Ayarı */}
                <View style={styles.controlRow}>
                  <View style={styles.controlRowLeft}>
                    <Ionicons
                      name="text"
                      size={15}
                      color="rgba(255,255,255,0.7)"
                    />
                    <AppText
                      variant="label"
                      style={styles.controlLabelText}
                    >
                      Yazı Boyutu:
                    </AppText>
                  </View>
                  <View style={styles.chipRow}>
                    {[-6, -3, 0, 3, 6, 9].map((delta, i) => {
                      const labels = ['XS', 'S', 'Standart', 'L', 'XL', '2XL'];
                      const active = (customization.fontSizeDelta ?? 0) === delta;
                      return (
                        <PressableScale
                          key={delta}
                          onPress={() =>
                            setCustomization((prev) => ({
                              ...prev,
                              fontSizeDelta: delta,
                            }))
                          }
                          style={[
                            styles.chipBtn,
                            active && { backgroundColor: t.accent },
                          ]}
                        >
                          <AppText
                            variant="label"
                            style={{
                              color: active
                                ? activeTabTextColor
                                : 'rgba(255,255,255,0.75)',
                              fontSize: 11.5,
                              fontFamily: active
                                ? 'Inter_700Bold'
                                : 'Inter_500Medium',
                            }}
                          >
                            {labels[i]}
                          </AppText>
                        </PressableScale>
                      );
                    })}
                  </View>
                </View>

                {/* Kart Genişliği Ayarı */}
                <View style={styles.controlRow}>
                  <View style={styles.controlRowLeft}>
                    <Ionicons
                      name="tablet-portrait-outline"
                      size={15}
                      color="rgba(255,255,255,0.7)"
                    />
                    <AppText
                      variant="label"
                      style={styles.controlLabelText}
                    >
                      Kart Genişliği:
                    </AppText>
                  </View>
                  <View style={styles.chipRow}>
                    {[78, 86, 93, 100].map((widthPct) => {
                      const labels: Record<number, string> = {
                        78: 'Dar (%78)',
                        86: 'Kompakt (%86)',
                        93: 'Geniş (%93)',
                        100: 'Tam (%100)',
                      };
                      const active =
                        (customization.cardWidthPercent ?? 100) === widthPct;
                      return (
                        <PressableScale
                          key={widthPct}
                          onPress={() =>
                            setCustomization((prev) => ({
                              ...prev,
                              cardWidthPercent: widthPct,
                            }))
                          }
                          style={[
                            styles.chipBtn,
                            active && { backgroundColor: t.accent },
                          ]}
                        >
                          <AppText
                            variant="label"
                            style={{
                              color: active
                                ? activeTabTextColor
                                : 'rgba(255,255,255,0.75)',
                              fontSize: 11.5,
                              fontFamily: active
                                ? 'Inter_700Bold'
                                : 'Inter_500Medium',
                            }}
                          >
                            {labels[widthPct]}
                          </AppText>
                        </PressableScale>
                      );
                    })}
                  </View>
                </View>
              </View>
            )}

            {/* 4. KONUM SEKMESİ */}
            {activeTab === 'position' && (
              <View style={{ gap: 10 }}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.scrollList}
                >
                  {POSITION_OPTIONS.map((pos) => {
                    const active = customization.position === pos.id;
                    return (
                      <PressableScale
                        key={pos.id}
                        onPress={() => {
                          const targetOffsetY =
                            pos.id === 'top'
                              ? -140
                              : pos.id === 'bottom'
                              ? 140
                              : 0;
                          pan.setValue({ x: 0, y: targetOffsetY });
                          currentOffset.current = { x: 0, y: targetOffsetY };
                          setCustomization((prev) => ({
                            ...prev,
                            position: pos.id,
                            offsetX: 0,
                            offsetY: targetOffsetY,
                          }));
                        }}
                        style={[
                          styles.optionCard,
                          active && {
                            borderColor: t.accent,
                            borderWidth: 2,
                            backgroundColor: `${t.accent}24`,
                          },
                        ]}
                      >
                        <Ionicons
                          name={pos.icon as never}
                          size={20}
                          color={active ? t.accent : '#FFFFFF'}
                        />
                        <AppText
                          variant="label"
                          style={{
                            color: active ? t.accent : '#FFFFFF',
                            fontFamily: active
                              ? 'Inter_700Bold'
                              : 'Inter_500Medium',
                            fontSize: 12.5,
                          }}
                        >
                          {pos.title}
                        </AppText>
                      </PressableScale>
                    );
                  })}

                  {/* Konumu Sıfırla Butonu */}
                  <PressableScale
                    onPress={resetPosition}
                    style={[styles.optionCard, { borderColor: 'rgba(255,255,255,0.2)' }]}
                  >
                    <Ionicons name="refresh" size={18} color="#FFFFFF" />
                    <AppText
                      variant="label"
                      style={{
                        color: '#FFFFFF',
                        fontFamily: 'Inter_600SemiBold',
                        fontSize: 12,
                      }}
                    >
                      Ortala
                    </AppText>
                  </PressableScale>
                </ScrollView>
              </View>
            )}

            {/* 5. STİL & GÖLGE SEKMESİ */}
            {activeTab === 'style' && (
              <View style={{ gap: 10 }}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.scrollList}
                >
                  {CARD_STYLE_OPTIONS.map((styleOpt) => {
                    const active = customization.cardStyle === styleOpt.id;
                    return (
                      <PressableScale
                        key={styleOpt.id}
                        onPress={() =>
                          setCustomization((prev) => ({
                            ...prev,
                            cardStyle: styleOpt.id,
                          }))
                        }
                        style={[
                          styles.optionCard,
                          active && {
                            borderColor: t.accent,
                            borderWidth: 2,
                            backgroundColor: `${t.accent}24`,
                          },
                        ]}
                      >
                        <Ionicons
                          name={styleOpt.icon as never}
                          size={20}
                          color={active ? t.accent : '#FFFFFF'}
                        />
                        <AppText
                          variant="label"
                          style={{
                            color: active ? t.accent : '#FFFFFF',
                            fontFamily: active
                              ? 'Inter_700Bold'
                              : 'Inter_500Medium',
                            fontSize: 12.5,
                          }}
                        >
                          {styleOpt.title}
                        </AppText>
                      </PressableScale>
                    );
                  })}
                </ScrollView>

                {/* Metin Gölgesi Toggle Kontrolü */}
                <View style={styles.controlRow}>
                  <View style={styles.controlRowLeft}>
                    <Ionicons
                      name="sunny-outline"
                      size={15}
                      color="rgba(255,255,255,0.7)"
                    />
                    <AppText
                      variant="label"
                      style={styles.controlLabelText}
                    >
                      Metin Okunabilirlik Gölgesi:
                    </AppText>
                  </View>
                  <PressableScale
                    onPress={() =>
                      setCustomization((prev) => ({
                        ...prev,
                        enableTextShadow: !(prev.enableTextShadow ?? true),
                      }))
                    }
                    style={[
                      styles.shadowToggleBtn,
                      (customization.enableTextShadow ?? true) && {
                        backgroundColor: t.accent,
                      },
                    ]}
                  >
                    <Ionicons
                      name={
                        (customization.enableTextShadow ?? true)
                          ? 'checkmark-circle'
                          : 'ellipse-outline'
                      }
                      size={16}
                      color={
                        (customization.enableTextShadow ?? true)
                          ? activeTabTextColor
                          : '#FFFFFF'
                      }
                    />
                    <AppText
                      variant="label"
                      style={{
                        color: (customization.enableTextShadow ?? true)
                          ? activeTabTextColor
                          : 'rgba(255,255,255,0.75)',
                        fontSize: 12,
                        fontFamily: 'Inter_600SemiBold',
                      }}
                    >
                      {(customization.enableTextShadow ?? true)
                        ? 'Gölge Açık ✨'
                        : 'Gölge Kapalı'}
                    </AppText>
                  </PressableScale>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* ── 4. Ekran Dışı Gerçek 1080x1920 Ultra HD Yakalama Katmanı ── */}
        <View style={styles.offscreenCapture} pointerEvents="none" collapsable={false}>
          <ShareCard
            ref={captureCardRef}
            quote={quote}
            customization={customization}
            scale={3}
          />
        </View>
      </View>
    </Modal>
  );
}

/**
 * Yüksek Kontrastlı Stüdyo Sekme Butonu
 * Tema ne olursa olsun (açık/koyu) stüdyo penceresinde %100 okunur.
 */
function TabItem({
  label,
  icon,
  active,
  accentColor,
  activeTextColor,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  accentColor: string;
  activeTextColor: string;
  onPress: () => void;
}) {
  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.94}
      style={[
        styles.tabItem,
        active && { backgroundColor: accentColor },
      ]}
    >
      <Ionicons
        name={icon}
        size={15}
        color={active ? activeTextColor : 'rgba(255,255,255,0.75)'}
      />
      <AppText
        variant="label"
        style={{
          color: active ? activeTextColor : 'rgba(255,255,255,0.85)',
          fontFamily: active ? 'Inter_700Bold' : 'Inter_600SemiBold',
          fontSize: 12,
        }}
      >
        {label}
      </AppText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 8,
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  shareHeaderBtn: {
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  shareHeaderGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 15,
    height: 38,
    borderRadius: radius.pill,
  },
  previewStage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
  },
  dragHintBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    marginBottom: 8,
  },
  previewFrame: {
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    shadowColor: '#000',
    shadowOpacity: 0.65,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 12 },
    elevation: 16,
  },
  controlPanel: {
    paddingHorizontal: 14,
    gap: 10,
  },
  tabBarWrapper: {
    backgroundColor: 'rgba(24, 20, 36, 0.95)',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    padding: 3,
  },
  tabBarScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 2,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.pill,
    backgroundColor: 'transparent',
  },
  tabContentArea: {
    minHeight: 96,
    justifyContent: 'center',
    paddingVertical: 4,
  },
  scrollList: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  galleryPickBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
    height: 78,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  galleryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  galleryIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    width: 72,
    height: 78,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  presetColorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    paddingVertical: 3,
    gap: 8,
  },
  controlRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  controlLabelText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipBtn: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  shadowToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  optionCard: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    width: 96,
    height: 78,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
  },
  fontCard: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    width: 104,
    height: 78,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
  },
  offscreenCapture: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 1080,
    height: 1920,
    zIndex: -9999,
    overflow: 'hidden',
  },
});
