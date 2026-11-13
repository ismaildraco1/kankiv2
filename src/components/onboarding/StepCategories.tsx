import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { GlassCard } from '@/components/GlassCard';
import { PressableScale } from '@/components/PressableScale';
import { CATEGORIES } from '@/data/categories';
import { useTheme } from '@/theme/ThemeProvider';
import { radius } from '@/theme/tokens';
import type { CategoryId } from '@/types';

interface StepCategoriesProps {
  selectedCategories: CategoryId[];
  onToggleCategory: (id: CategoryId) => void;
  onSelectAll: () => void;
}

/**
 * 3. Adım: Kategori Seçimi
 * Çoklu seçim destekli, parıltılı lüks hap (pill) butonlar ve tematik rozetler.
 */
export function StepCategories({
  selectedCategories,
  onToggleCategory,
  onSelectAll,
}: StepCategoriesProps) {
  const t = useTheme();

  const handleToggle = (id: CategoryId) => {
    Haptics.selectionAsync().catch(() => {});
    onToggleCategory(id);
  };

  const isAllSelected = selectedCategories.length === CATEGORIES.length;

  return (
    <View style={styles.container}>
      {/* ── Başlık ve Açıklama ── */}
      <View style={styles.header}>
        <AppText variant="overline" style={[styles.stepOverline, { color: t.accent }]}>
          3. ADIM • İÇERİK ODAĞI
        </AppText>

        <AppText variant="display" style={styles.title}>
          Hangi sözler ruhuna dokunsun?
        </AppText>

        <AppText variant="body" tone="muted" style={styles.subtitle}>
          İlgini çeken temaları seç. Birden fazla seçebilir veya hepsini keşfedebilirsin.
        </AppText>
      </View>

      {/* ── Hepsini Seç Hızlı Aksiyonu ── */}
      <View style={styles.quickActionRow}>
        <AppText variant="label" tone="muted" style={styles.countText}>
          {selectedCategories.length} / {CATEGORIES.length} tema seçildi
        </AppText>

        <PressableScale onPress={onSelectAll} scaleTo={0.94}>
          <View
            style={[
              styles.selectAllPill,
              {
                backgroundColor: isAllSelected ? t.accentSoft : t.glassStrong,
                borderColor: isAllSelected ? t.accent : t.glassBorder,
              },
            ]}
          >
            <Ionicons
              name={isAllSelected ? 'checkmark-done' : 'apps-outline'}
              size={13}
              color={t.accent}
            />
            <AppText
              variant="overline"
              style={[styles.selectAllText, { color: t.accent }]}
            >
              {isAllSelected ? 'HEPSİ SEÇİLDİ' : 'TÜMÜNÜ SEÇ'}
            </AppText>
          </View>
        </PressableScale>
      </View>

      {/* ── Şık Hap (Pill) ve Kart Grid ── */}
      <View style={styles.grid}>
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategories.includes(category.id);

          return (
            <PressableScale
              key={category.id}
              onPress={() => handleToggle(category.id)}
              scaleTo={0.96}
              style={styles.pillWrapper}
            >
              <GlassCard
                padded={false}
                strong={isSelected}
                intensity={isSelected ? 60 : 30}
                glowColor={isSelected ? category.gradient[0] : undefined}
                style={[
                  styles.categoryPill,
                  {
                    borderColor: isSelected ? category.gradient[0] : t.glassBorder,
                    backgroundColor: isSelected
                      ? t.scheme === 'dark'
                        ? 'rgba(255,255,255,0.07)'
                        : 'rgba(255,255,255,0.85)'
                      : t.glass,
                  },
                ]}
              >
                <View style={styles.pillContent}>
                  {/* İkon Rozeti */}
                  {isSelected ? (
                    <LinearGradient
                      colors={category.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.iconCircleActive}
                    >
                      <Ionicons name={category.icon} size={15} color="#FFFFFF" />
                    </LinearGradient>
                  ) : (
                    <View
                      style={[
                        styles.iconCircleInactive,
                        {
                          backgroundColor: t.glassStrong,
                          borderColor: t.glassBorder,
                        },
                      ]}
                    >
                      <Ionicons name={category.icon} size={15} color={t.textMuted} />
                    </View>
                  )}

                  {/* Kategori Başlığı ve Alt Metin */}
                  <View style={styles.textWrap}>
                    <AppText
                      variant="body"
                      style={[
                        styles.categoryTitle,
                        {
                          color: isSelected ? t.text : t.textMuted,
                          fontFamily: isSelected ? 'DMSans_700Bold' : 'DMSans_500Medium',
                        },
                      ]}
                    >
                      {category.title}
                    </AppText>
                    <AppText variant="label" tone="faint" numberOfLines={1} style={styles.categorySub}>
                      {category.subtitle}
                    </AppText>
                  </View>

                  {/* Seçim Onay Rozeti */}
                  <View
                    style={[
                      styles.checkCircle,
                      {
                        borderColor: isSelected ? category.gradient[0] : t.glassBorder,
                        backgroundColor: isSelected ? category.gradient[0] : 'transparent',
                      },
                    ]}
                  >
                    {isSelected && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                  </View>
                </View>
              </GlassCard>
            </PressableScale>
          );
        })}
      </View>

      {/* Validasyon / İpucu Notu */}
      <View style={styles.footerNote}>
        <Ionicons
          name="information-circle-outline"
          size={14}
          color={selectedCategories.length === 0 ? t.danger : t.textFaint}
        />
        <AppText
          variant="label"
          style={{
            color: selectedCategories.length === 0 ? t.danger : t.textFaint,
            fontSize: 12,
          }}
        >
          {selectedCategories.length === 0
            ? 'Lütfen devam etmek için en az bir tema seç.'
            : 'Kanki akışında bu temalardan sözler derlenecek.'}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  stepOverline: {
    letterSpacing: 2,
    fontSize: 10.5,
    fontFamily: 'DMSans_700Bold',
    marginBottom: 6,
  },
  title: {
    fontSize: 27,
    lineHeight: 33,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13.5,
    lineHeight: 19,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  quickActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 6,
  },
  countText: {
    fontSize: 12,
    fontFamily: 'DMSans_600SemiBold',
  },
  selectAllPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  selectAllText: {
    fontSize: 9.5,
    letterSpacing: 1.2,
  },
  grid: {
    gap: 9,
  },
  pillWrapper: {
    width: '100%',
  },
  categoryPill: {
    borderRadius: radius.md,
    borderWidth: 1.2,
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  iconCircleActive: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconCircleInactive: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textWrap: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 15,
    lineHeight: 19,
  },
  categorySub: {
    fontSize: 11.5,
    lineHeight: 15,
    marginTop: 1,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
  },
});
